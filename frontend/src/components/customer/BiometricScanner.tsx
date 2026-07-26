import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { healthProfileService } from '../../services';
import { runClinicalAssessment } from '../../services/medicalEngine';
import type { CombinedRiskAssessment } from '../../services/medicalEngine';
import {
  Heart, Activity, Droplets, Wind, Fingerprint,
  CheckCircle, AlertCircle, RefreshCw, Zap, Clock, Smartphone, Monitor,
  ShieldAlert
} from 'lucide-react';

type ScanPhase = 'idle' | 'holding' | 'scanning' | 'analyzing' | 'done';

interface VitalResult {
  bp: { systolic: number; diastolic: number };
  heartRate: number;
  spo2: number;
  bloodSugar: number;
}

interface BiometricScannerProps {
  onScanComplete?: () => void;
}

// ─── Simulate realistic vitals based on health conditions ─────────────────────
const simulateVitals = (diseases: string[], existing: {
  bloodPressureSystolic?: number;
  bloodSugarFasting?: number;
}): VitalResult => {
  const hasHypertension = diseases.some(d => d.toLowerCase().includes('hypertension') || d.toLowerCase().includes('bp'));
  const hasDiabetes     = diseases.some(d => d.toLowerCase().includes('diabetes'));
  const hasHeart        = diseases.some(d => d.toLowerCase().includes('heart'));
  const hasPCOS         = diseases.some(d => d.toLowerCase().includes('pcos'));

  const rand = (base: number, variance: number) =>
    Math.round(base + (Math.random() - 0.5) * 2 * variance);

  let systolicBase  = existing.bloodPressureSystolic || (hasHypertension ? 145 : 118);
  let diastolicBase = hasHypertension ? 92 : 76;

  if (!existing.bloodPressureSystolic) {
    systolicBase  = hasHypertension ? rand(145, 6) : hasHeart ? rand(132, 5) : rand(118, 5);
    diastolicBase = hasHypertension ? rand(92, 4)  : hasHeart ? rand(84, 4)  : rand(76, 4);
  } else {
    systolicBase  = rand(existing.bloodPressureSystolic, 4);
    diastolicBase = rand(diastolicBase, 3);
  }

  const heartBase = hasHeart ? rand(88, 6) : hasPCOS ? rand(82, 5) : rand(72, 6);
  const spo2 = Math.min(99, rand(97, 1));

  let sugarBase = existing.bloodSugarFasting || (hasDiabetes ? 148 : hasPCOS ? 105 : 88);
  if (!existing.bloodSugarFasting) {
    sugarBase = hasDiabetes ? rand(148, 10) : hasPCOS ? rand(105, 8) : rand(88, 6);
  } else {
    sugarBase = rand(existing.bloodSugarFasting, 5);
  }

  return {
    bp: { systolic: Math.max(90, systolicBase), diastolic: Math.max(60, diastolicBase) },
    heartRate: Math.max(55, Math.min(110, heartBase)),
    spo2: Math.max(94, spo2),
    bloodSugar: Math.max(70, sugarBase),
  };
};

// ─── Map medical engine risk level to display color ──────────────────────────
const levelColor = (level: string) => {
  switch (level) {
    case 'optimal':    return { text: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'normal':     return { text: 'text-emerald-500', bg: 'bg-emerald-500/5',  border: 'border-emerald-500/15' };
    case 'borderline': return { text: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' };
    case 'high':       return { text: 'text-orange-500',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20' };
    case 'critical':   return { text: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20' };
    default:           return { text: 'text-slate-500',   bg: 'bg-slate-100',      border: 'border-slate-200' };
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export const BiometricScanner: React.FC<BiometricScannerProps> = ({ onScanComplete }) => {
  const { healthProfile, setHealthProfile } = useApp();
  const [phase, setPhase]       = useState<ScanPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [holdProgress, setHoldProgress] = useState(0);
  const [results, setResults]   = useState<VitalResult | null>(null);
  const [assessment, setAssessment] = useState<CombinedRiskAssessment | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved]       = useState(false);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect touch device
  const isTouchDevice = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

  // Load previous results if available
  useEffect(() => {
    if (healthProfile.heartRateBpm && healthProfile.lastVitalScanAt) {
      setResults({
        bp: {
          systolic:  healthProfile.bloodPressureSystolic  || 120,
          diastolic: healthProfile.bloodPressureDiastolic || 80,
        },
        heartRate:  healthProfile.heartRateBpm || 72,
        spo2:       healthProfile.oxygenSaturation || 98,
        bloodSugar: healthProfile.bloodSugarFasting || 90,
      });
      setSaved(true);
    }
  }, []);

  const saveVitals = async (vitals: VitalResult) => {
    setIsSaving(true);
    const now = new Date().toISOString();
    try {
      await healthProfileService.update({
        bloodPressureSystolic:  vitals.bp.systolic,
        bloodPressureDiastolic: vitals.bp.diastolic,
        heartRateBpm:           vitals.heartRate,
        oxygenSaturation:       vitals.spo2,
        bloodSugarFasting:      vitals.bloodSugar,
        lastVitalScanAt:        now,
      } as any);
    } catch (_) { /* save to local state only */ }

    const updatedProfile = {
      ...healthProfile,
      bloodPressureSystolic:  vitals.bp.systolic,
      bloodPressureDiastolic: vitals.bp.diastolic,
      heartRateBpm:           vitals.heartRate,
      oxygenSaturation:       vitals.spo2,
      bloodSugarFasting:      vitals.bloodSugar,
      lastVitalScanAt:        now,
    };
    setHealthProfile((prev: any) => ({ ...prev, ...updatedProfile }));

    // Run full clinical assessment using the medical engine
    const clinicalResult = runClinicalAssessment({
      systolicBP:  vitals.bp.systolic,
      diastolicBP: vitals.bp.diastolic,
      bloodSugar:  vitals.bloodSugar,
      heartRate:   vitals.heartRate,
      spo2:        vitals.spo2,
      cholesterol: healthProfile.cholesterolTotal,
      bmi:         healthProfile.bmi,
      age:         healthProfile.age,
      gender:      healthProfile.gender as any,
      diseases:    healthProfile.diseases,
    });
    setAssessment(clinicalResult);
    setIsSaving(false);
    setSaved(true);
    onScanComplete?.();
  };

  const doScan = useCallback(() => {
    setPhase('scanning');
    setProgress(0);
    setResults(null);
    setSaved(false);

    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(intervalRef.current!);
          setPhase('analyzing');
          setTimeout(() => {
            const vitals = simulateVitals(healthProfile.diseases, {
              bloodPressureSystolic: healthProfile.bloodPressureSystolic,
              bloodSugarFasting:     healthProfile.bloodSugarFasting,
            });
            setResults(vitals);
            setPhase('done');
            saveVitals(vitals);
          }, 1200);
          return 100;
        }
        return prev + 2.5;
      });
    }, 75);
  }, [healthProfile]);

  // Mobile: Touch hold logic
  const startHold = () => {
    if (phase !== 'idle' && phase !== 'done') return;
    if (phase === 'done') { reset(); return; }
    setPhase('holding');
    setHoldProgress(0);
    holdTimerRef.current = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current!);
          doScan();
          return 100;
        }
        return prev + (100 / 30); // 3 seconds = 30 intervals of 100ms
      });
    }, 100);
  };

  const cancelHold = () => {
    if (phase === 'holding') {
      clearInterval(holdTimerRef.current!);
      setPhase('idle');
      setHoldProgress(0);
    }
  };

  // Desktop: simple click
  const startScan = () => {
    if (phase === 'done') { reset(); return; }
    if (phase !== 'idle') return;
    doScan();
  };

  const reset = () => {
    setPhase('idle');
    setProgress(0);
    setHoldProgress(0);
    setResults(null);
    setAssessment(null);
    setSaved(false);
  };


  const lastScan = healthProfile.lastVitalScanAt
    ? new Date(healthProfile.lastVitalScanAt).toLocaleString('en-IN', {
        hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short'
      })
    : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A1F16] to-slate-900 p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Wellora BioScan™</span>
            </div>
            <h3 className="text-base font-extrabold text-white font-['Outfit']">Biometric Vitals Scanner</h3>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              {isTouchDevice
                ? <><Smartphone className="w-3 h-3" /> Touch & hold the scanner button to read your vitals</>
                : <><Monitor className="w-3 h-3" /> Click the scanner button to simulate a biometric scan</>
              }
            </p>
          </div>
          {lastScan && (
            <div className="text-right">
              <p className="text-[9px] text-slate-500 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" /> Last scan
              </p>
              <p className="text-[10px] font-bold text-slate-300">{lastScan}</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Scanner Interface */}
        <div className="flex flex-col items-center gap-4">

          {/* Device type indicator */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
            isTouchDevice ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}>
            {isTouchDevice
              ? <><Smartphone className="w-3 h-3" /> Touch Screen Detected — Press & Hold</>
              : <><Monitor className="w-3 h-3" /> Desktop — Click to Scan</>
            }
          </div>

          {/* Thumb Scanner Zone — Large for touch */}
          <div className="relative flex items-center justify-center">
            {/* Pulsing rings when scanning */}
            {(phase === 'scanning' || phase === 'holding') && (
              <>
                <div className="absolute w-44 h-44 rounded-full border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute w-36 h-36 rounded-full border-2 border-emerald-500/30 animate-ping" style={{ animationDuration: '1.1s' }} />
              </>
            )}
            {phase === 'done' && (
              <div className="absolute w-40 h-40 rounded-full bg-emerald-500/10 animate-pulse" />
            )}

            {/* Main scanner button — larger on touch for easier pressing */}
            <button
              id="biometric-scanner-btn"
              onClick={isTouchDevice ? undefined : startScan}
              onTouchStart={isTouchDevice ? startHold : undefined}
              onTouchEnd={isTouchDevice ? cancelHold : undefined}
              onMouseDown={isTouchDevice ? startHold : undefined}
              onMouseUp={isTouchDevice ? cancelHold : undefined}
              onMouseLeave={isTouchDevice ? cancelHold : undefined}
              disabled={phase === 'scanning' || phase === 'analyzing'}
              className={`relative flex items-center justify-center transition-all select-none
                ${isTouchDevice ? 'w-36 h-36' : 'w-28 h-28'}
                rounded-full
                ${phase === 'idle'
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/30 hover:border-emerald-500 hover:scale-105 cursor-pointer shadow-lg shadow-emerald-900/30'
                  : phase === 'holding'
                    ? 'bg-gradient-to-br from-emerald-900 to-emerald-800 border-2 border-emerald-400 scale-105 shadow-xl shadow-emerald-500/30'
                    : phase === 'scanning'
                      ? 'bg-gradient-to-br from-emerald-900 to-emerald-800 border-2 border-emerald-500 shadow-xl shadow-emerald-500/25'
                      : phase === 'analyzing'
                        ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-500 animate-pulse'
                        : 'bg-gradient-to-br from-emerald-800 to-emerald-700 border-2 border-emerald-400 cursor-pointer hover:scale-105'}
              `}
            >
              {phase === 'done'
                ? <RefreshCw className="w-10 h-10 text-emerald-300" />
                : <Fingerprint className={`${isTouchDevice ? 'w-14 h-14' : 'w-10 h-10'} ${
                    phase === 'scanning' || phase === 'holding' ? 'text-emerald-300 animate-pulse'
                    : phase === 'analyzing' ? 'text-blue-300' : 'text-slate-400'
                  }`} />
              }

              {/* Progress ring */}
              {(phase === 'scanning' || phase === 'analyzing' || phase === 'holding') && (
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="4" />
                  <circle
                    cx="50" cy="50" r="46" fill="none"
                    stroke={phase === 'holding' ? 'rgb(251,191,36)' : 'rgb(16,185,129)'}
                    strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - (phase === 'holding' ? holdProgress : progress) / 100)}`}
                    className="transition-all duration-100"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Status text */}
          <div className="text-center">
            {phase === 'idle' && (
              <div>
                <p className="text-sm font-extrabold text-slate-700">
                  {isTouchDevice ? '👆 Press & Hold (3 seconds)' : '🖱️ Click to Start Scan'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isTouchDevice
                    ? 'Keep your finger pressed on the button until the ring fills up'
                    : 'Simulates a biometric fingerprint scan of your vitals'}
                </p>
              </div>
            )}
            {phase === 'holding' && (
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-amber-500 animate-pulse">
                  Hold... {Math.round(holdProgress)}%
                </p>
                <p className="text-[10px] text-slate-400">Keep holding for 3 seconds to complete scan</p>
              </div>
            )}
            {phase === 'scanning' && (
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-emerald-600 animate-pulse">
                  Scanning... {Math.round(progress)}%
                </p>
                <p className="text-[10px] text-slate-400">Reading PPG biometric signal...</p>
              </div>
            )}
            {phase === 'analyzing' && (
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-blue-500 animate-pulse">AI Analyzing...</p>
                <p className="text-[10px] text-slate-400">Computing vitals from biometric data</p>
              </div>
            )}
            {phase === 'done' && (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-extrabold text-emerald-600">Scan Complete!</p>
                </div>
                <p className="text-[10px] text-slate-400">
                  {saved ? '✅ Saved to your health profile' : isSaving ? '⏳ Saving...' : ''}
                </p>
                <p className="text-[10px] text-slate-400">Tap to rescan</p>
              </div>
            )}
          </div>
        </div>

        {/* Clinical Assessment Results */}
        {results && assessment && (
          <div className="space-y-4">

            {/* Summary Banner */}
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-start gap-2 ${
              assessment.overallLevel === 'critical' || assessment.overallLevel === 'high'
                ? 'bg-red-50 border-red-200 text-red-700'
                : assessment.overallLevel === 'borderline'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block">Health Score: {assessment.overallScore}/100</span>
                <span className="font-medium">{assessment.summary}</span>
              </div>
            </div>

            {/* Vital Cards */}
            <div className="grid grid-cols-2 gap-3">
              {assessment.vitals.map((v) => {
                const c = levelColor(v.level);
                return (
                  <div key={v.vital} className={`p-3.5 rounded-2xl ${c.bg} border ${c.border}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                        {v.label}
                      </span>
                    </div>
                    <p className={`text-xl font-black font-['Outfit'] ${c.text}`}>
                      {v.value}<span className="text-xs font-semibold text-slate-400 ml-1">{v.unit}</span>
                    </p>
                    <p className="text-[9px] text-slate-500 font-semibold mt-0.5">{v.vital}</p>
                    <p className="text-[9px] text-slate-400 mt-1 leading-snug">{v.context.slice(0, 80)}...</p>
                    <p className="text-[8px] text-slate-300 font-medium mt-1">{v.guideline}</p>
                  </div>
                );
              })}
            </div>

            {/* Combined Alerts */}
            {assessment.combinedAlerts.length > 0 && (
              <div className="space-y-2">
                {assessment.combinedAlerts.map((alert, i) => (
                  <div key={i} className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 ${
                    alert.urgency === 'emergency' || alert.urgency === 'urgent'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                  }`}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black">{alert.title}</p>
                      <p className="font-medium text-[10px] mt-0.5">{alert.detail.slice(0, 120)}...</p>
                      <p className="text-[9px] text-slate-400 mt-1">{alert.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Foods to Avoid */}
            {assessment.foodsToAvoid.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-[10px] font-black text-red-700 mb-2">⛔ Foods to Avoid Today</p>
                <div className="space-y-1">
                  {assessment.foodsToAvoid.slice(0, 4).map((f, i) => (
                    <p key={i} className="text-[9px] text-red-600 font-medium">• {f}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-400 leading-relaxed">
            Wellora BioScan™ simulates vitals based on your health profile conditions for demonstration. Results are indicative only. Consult your doctor for clinical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BiometricScanner;

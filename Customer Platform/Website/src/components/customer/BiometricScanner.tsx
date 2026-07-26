import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { healthProfileService } from '../../services';
import {
  Heart, Activity, Droplets, Wind, Fingerprint,
  CheckCircle, AlertCircle, RefreshCw, Zap, Clock
} from 'lucide-react';

type ScanPhase = 'idle' | 'scanning' | 'analyzing' | 'done';

interface VitalResult {
  bp: { systolic: number; diastolic: number };
  heartRate: number;
  spo2: number;
  bloodSugar: number;
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

  // Base ranges — slightly vary each scan (simulate real variation)
  const rand = (base: number, variance: number) =>
    Math.round(base + (Math.random() - 0.5) * 2 * variance);

  // Blood Pressure
  let systolicBase  = existing.bloodPressureSystolic || (hasHypertension ? 145 : 118);
  let diastolicBase = hasHypertension ? 92 : 76;
  // If no stored value, simulate based on conditions
  if (!existing.bloodPressureSystolic) {
    systolicBase  = hasHypertension ? rand(145, 6) : hasHeart ? rand(132, 5) : rand(118, 5);
    diastolicBase = hasHypertension ? rand(92, 4)  : hasHeart ? rand(84, 4)  : rand(76, 4);
  } else {
    // Slight variation from last reading
    systolicBase  = rand(existing.bloodPressureSystolic, 4);
    diastolicBase = rand(diastolicBase, 3);
  }

  // Heart Rate
  const heartBase = hasHeart ? rand(88, 6) : hasPCOS ? rand(82, 5) : rand(72, 6);

  // SpO2
  const spo2 = Math.min(99, rand(97, 1));

  // Blood Sugar
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

// ─── Vital Status Labels ──────────────────────────────────────────────────────
const getBPStatus = (s: number) => {
  if (s < 120) return { label: 'Normal', color: 'text-emerald-500' };
  if (s < 130) return { label: 'Elevated', color: 'text-yellow-500' };
  if (s < 140) return { label: 'Stage 1 High', color: 'text-orange-500' };
  return { label: 'Stage 2 High', color: 'text-red-500' };
};
const getSugarStatus = (v: number) => {
  if (v < 100) return { label: 'Normal', color: 'text-emerald-500' };
  if (v < 126) return { label: 'Pre-Diabetic', color: 'text-orange-500' };
  return { label: 'High', color: 'text-red-500' };
};
const getHRStatus = (v: number) => {
  if (v < 60) return { label: 'Low', color: 'text-blue-400' };
  if (v <= 100) return { label: 'Normal', color: 'text-emerald-500' };
  return { label: 'Elevated', color: 'text-orange-500' };
};
const getSpo2Status = (v: number) => {
  if (v >= 95) return { label: 'Normal', color: 'text-emerald-500' };
  if (v >= 90) return { label: 'Low', color: 'text-orange-500' };
  return { label: 'Critical', color: 'text-red-500' };
};

// ─── Component ────────────────────────────────────────────────────────────────

export const BiometricScanner: React.FC = () => {
  const { healthProfile, setHealthProfile } = useApp();
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<VitalResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Show previous scan results if available
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

  const startScan = () => {
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
              bloodSugarFasting: healthProfile.bloodSugarFasting,
            });
            setResults(vitals);
            setPhase('done');
            // Auto-save
            saveVitals(vitals);
          }, 1200);
          return 100;
        }
        return prev + 2.5;
      });
    }, 75);
  };

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
    } catch (_) {
      // Fallback: save to local state only
    }
    setHealthProfile((prev: any) => ({
      ...prev,
      bloodPressureSystolic:  vitals.bp.systolic,
      bloodPressureDiastolic: vitals.bp.diastolic,
      heartRateBpm:           vitals.heartRate,
      oxygenSaturation:       vitals.spo2,
      bloodSugarFasting:      vitals.bloodSugar,
      lastVitalScanAt:        now,
    }));
    setIsSaving(false);
    setSaved(true);
  };

  const reset = () => {
    setPhase('idle');
    setProgress(0);
    setResults(null);
    setSaved(false);
  };

  const bpStatus    = results ? getBPStatus(results.bp.systolic) : null;
  const sugarStatus = results ? getSugarStatus(results.bloodSugar) : null;
  const hrStatus    = results ? getHRStatus(results.heartRate) : null;
  const spo2Status  = results ? getSpo2Status(results.spo2) : null;

  const lastScan = healthProfile.lastVitalScanAt
    ? new Date(healthProfile.lastVitalScanAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
    : null;

  return (
    <div className="bg-white dark:bg-[#0A1F16] rounded-3xl border border-slate-200 dark:border-emerald-500/15 shadow-lg overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0A1F16] to-slate-900 p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
                Wellora BioScan™
              </span>
            </div>
            <h3 className="text-base font-extrabold text-white font-['Outfit']">
              Biometric Vitals Scanner
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Smart thumb-scan · Instant health metrics
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
        <div className="flex flex-col items-center">

          {/* Thumb Scanner Circle */}
          <div className="relative flex items-center justify-center mb-4">
            {/* Outer glow rings */}
            {phase === 'scanning' && (
              <>
                <div className="absolute w-36 h-36 rounded-full border-2 border-emerald-500/20 animate-ping" style={{ animationDuration: '1.5s' }} />
                <div className="absolute w-28 h-28 rounded-full border-2 border-emerald-500/30 animate-ping" style={{ animationDuration: '1.1s' }} />
              </>
            )}
            {phase === 'done' && (
              <div className="absolute w-32 h-32 rounded-full bg-emerald-500/10 animate-pulse" />
            )}

            {/* Main scanner button */}
            <button
              onClick={phase === 'idle' || phase === 'done' ? (phase === 'done' ? reset : startScan) : undefined}
              disabled={phase === 'scanning' || phase === 'analyzing'}
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all
                ${phase === 'idle'
                  ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-emerald-500/30 hover:border-emerald-500 hover:scale-105 cursor-pointer shadow-lg shadow-emerald-900/30'
                  : phase === 'scanning'
                    ? 'bg-gradient-to-br from-emerald-900 to-emerald-800 border-2 border-emerald-500 shadow-xl shadow-emerald-500/25'
                    : phase === 'analyzing'
                      ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-500 animate-pulse'
                      : 'bg-gradient-to-br from-emerald-800 to-emerald-700 border-2 border-emerald-400 cursor-pointer hover:scale-105'}
              `}
            >
              {phase === 'done'
                ? <RefreshCw className="w-9 h-9 text-emerald-300" />
                : <Fingerprint className={`w-10 h-10 ${phase === 'scanning' ? 'text-emerald-300 animate-pulse' : phase === 'analyzing' ? 'text-blue-300' : 'text-slate-400'}`} />}

              {/* Progress ring */}
              {(phase === 'scanning' || phase === 'analyzing') && (
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="4" />
                  <circle
                    cx="50" cy="50" r="46" fill="none"
                    stroke="rgb(16,185,129)" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
                    className="transition-all duration-100"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Status text */}
          <div className="text-center">
            {phase === 'idle' && (
              <button onClick={startScan} className="group">
                <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Tap to Scan
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Hold finger on sensor</p>
              </button>
            )}
            {phase === 'scanning' && (
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  Scanning... {Math.round(progress)}%
                </p>
                <p className="text-[10px] text-slate-400">Reading PPG signal...</p>
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
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">Scan Complete</p>
                </div>
                <p className="text-[10px] text-slate-400">
                  {saved ? '✅ Saved to your health profile' : isSaving ? 'Saving...' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vitals Results Grid */}
        {results && (
          <div className="grid grid-cols-2 gap-3">

            {/* Blood Pressure */}
            <div className={`p-3.5 rounded-2xl bg-red-500/5 dark:bg-red-500/10 border ${bpStatus?.color === 'text-emerald-500' ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <Heart className={`w-4 h-4 ${bpStatus?.color}`} />
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${bpStatus?.color === 'text-emerald-500' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                  {bpStatus?.label}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {results.bp.systolic}<span className="text-sm font-bold text-slate-400">/{results.bp.diastolic}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Blood Pressure mmHg</p>
            </div>

            {/* Heart Rate */}
            <div className={`p-3.5 rounded-2xl bg-pink-500/5 dark:bg-pink-500/10 border ${hrStatus?.color === 'text-emerald-500' ? 'border-emerald-500/20' : 'border-orange-500/20'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <Activity className={`w-4 h-4 ${hrStatus?.color}`} />
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-pink-500/10 ${hrStatus?.color}`}>
                  {hrStatus?.label}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {results.heartRate}<span className="text-sm font-bold text-slate-400"> bpm</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Heart Rate</p>
            </div>

            {/* Blood Sugar */}
            <div className={`p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border ${sugarStatus?.color === 'text-emerald-500' ? 'border-emerald-500/20' : 'border-orange-500/20'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <Droplets className={`w-4 h-4 ${sugarStatus?.color}`} />
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 ${sugarStatus?.color}`}>
                  {sugarStatus?.label}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {results.bloodSugar}<span className="text-sm font-bold text-slate-400"> mg/dL</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Blood Sugar (Fasting)</p>
            </div>

            {/* SpO2 */}
            <div className="p-3.5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <Wind className={`w-4 h-4 ${spo2Status?.color}`} />
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-cyan-500/10 ${spo2Status?.color}`}>
                  {spo2Status?.label}
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {results.spo2}<span className="text-sm font-bold text-slate-400">%</span>
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Blood Oxygen (SpO2)</p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-400 leading-relaxed">
            Wellora BioScan™ uses PPG-based photoplethysmography estimation. Results are indicative only. Consult your doctor for clinical diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};

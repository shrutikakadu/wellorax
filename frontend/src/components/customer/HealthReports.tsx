import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BiometricScanner } from './BiometricScanner';
import {
  Activity, Heart, Droplet, Minus, Shield, AlertTriangle,
  CheckCircle, Zap, Plus, X, ShieldAlert, Edit3,
  Save, AlertOctagon, Fingerprint, ClipboardList, RefreshCw, Info
} from 'lucide-react';

const COMMON_ALLERGIES = [
  'Peanuts', 'Lactose / Dairy', 'Gluten', 'Shellfish', 'Eggs',
  'Soy', 'Tree Nuts', 'Seafood', 'Sesame', 'Mustard'
];

const COMMON_CONDITIONS = [
  'Hypertension (High BP)', 'Diabetes (Type 2)', 'High Cholesterol',
  'PCOS / PCOD', 'Fatty Liver', 'Thyroid', 'Heart Disease',
  'Acid Reflux (GERD)', 'Kidney Care'
];

const getVitalStatus = (
  value: number | undefined,
  normalRange: [number, number],
  highThreshold: number
) => {
  if (value === undefined || value === 0)
    return { label: 'Not recorded', bg: 'bg-slate-100', text: 'text-slate-400', icon: <Minus className="w-3.5 h-3.5" />, border: 'border-slate-200' };
  if (value >= normalRange[0] && value <= normalRange[1])
    return { label: 'Normal', bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: <CheckCircle className="w-3.5 h-3.5" />, border: 'border-emerald-200' };
  if (value > highThreshold)
    return { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-600', icon: <AlertTriangle className="w-3.5 h-3.5" />, border: 'border-red-200' };
  return { label: 'Borderline', bg: 'bg-amber-500/10', text: 'text-amber-600', icon: <AlertTriangle className="w-3.5 h-3.5" />, border: 'border-amber-200' };
};

const getBMILabel = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  if (bmi < 25)   return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  if (bmi < 30)   return { label: 'Overweight', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  return { label: 'Obese', color: 'text-red-500', bg: 'bg-red-500/10' };
};

export const HealthReports: React.FC = () => {
  const { healthProfile, setHealthProfile } = useApp();

  // Conditions & Allergies editing
  const [isConditionsEditing, setIsConditionsEditing] = useState(false);
  const [selectedDiseases, setSelectedDiseases]   = useState<string[]>(healthProfile.diseases || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(healthProfile.allergies || []);
  const [customDiseaseInput, setCustomDiseaseInput] = useState('');
  const [customAllergyInput, setCustomAllergyInput] = useState('');

  // Vitals form state
  const [isVitalsEditing, setIsVitalsEditing] = useState(false);
  const [showBioScanner, setShowBioScanner]   = useState(false);
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressureSystolic:  healthProfile.bloodPressureSystolic  ?? ('' as number | ''),
    bloodPressureDiastolic: healthProfile.bloodPressureDiastolic ?? ('' as number | ''),
    bloodSugarFasting:      healthProfile.bloodSugarFasting      ?? ('' as number | ''),
    cholesterolTotal:       healthProfile.cholesterolTotal       ?? ('' as number | ''),
    heartRateBpm:           healthProfile.heartRateBpm           ?? ('' as number | ''),
    oxygenSaturation:       healthProfile.oxygenSaturation       ?? ('' as number | ''),
    weightKg:               healthProfile.weightKg               ?? ('' as number | ''),
    heightCm:               healthProfile.heightCm               ?? ('' as number | ''),
  });

  const [savedMsg, setSavedMsg] = useState('');

  const showSaved = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 4000);
  };

  // Save conditions
  const handleSaveConditions = () => {
    setHealthProfile((prev: typeof healthProfile) => ({ ...prev, diseases: selectedDiseases, allergies: selectedAllergies }));
    setIsConditionsEditing(false);
    showSaved('Health conditions & allergies saved! AI food warnings are now updated.');
  };

  // Save vitals
  const handleSaveVitals = () => {
    const bmi = vitalsForm.heightCm && vitalsForm.weightKg
      ? Math.round(((vitalsForm.weightKg as number) / Math.pow((vitalsForm.heightCm as number) / 100, 2)) * 10) / 10
      : healthProfile.bmi;

    setHealthProfile((prev: typeof healthProfile) => ({
      ...prev,
      bloodPressureSystolic:  vitalsForm.bloodPressureSystolic  !== '' ? Number(vitalsForm.bloodPressureSystolic)  : undefined,
      bloodPressureDiastolic: vitalsForm.bloodPressureDiastolic !== '' ? Number(vitalsForm.bloodPressureDiastolic) : undefined,
      bloodSugarFasting:      vitalsForm.bloodSugarFasting      !== '' ? Number(vitalsForm.bloodSugarFasting)      : undefined,
      cholesterolTotal:       vitalsForm.cholesterolTotal        !== '' ? Number(vitalsForm.cholesterolTotal)       : undefined,
      heartRateBpm:           vitalsForm.heartRateBpm           !== '' ? Number(vitalsForm.heartRateBpm)           : undefined,
      oxygenSaturation:       vitalsForm.oxygenSaturation       !== '' ? Number(vitalsForm.oxygenSaturation)       : undefined,
      weightKg:               vitalsForm.weightKg               !== '' ? Number(vitalsForm.weightKg)               : prev.weightKg,
      heightCm:               vitalsForm.heightCm               !== '' ? Number(vitalsForm.heightCm)               : prev.heightCm,
      bmi,
      lastVitalScanAt: new Date().toISOString(),
    }));
    setIsVitalsEditing(false);
    showSaved('Vitals saved! Your health score and food safety warnings will update automatically.');
  };

  // BMI computation
  const bmi = vitalsForm.heightCm && vitalsForm.weightKg
    ? Math.round(((vitalsForm.weightKg as number) / Math.pow((vitalsForm.heightCm as number) / 100, 2)) * 10) / 10
    : healthProfile.bmi;

  const bmiInfo = getBMILabel(bmi || 0);

  // Health score computation
  const healthScore = healthProfile.healthScore;

  const scoreColor = healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (healthScore / 100) * circumference;

  const vitals = [
    { label: 'Systolic BP',    value: healthProfile.bloodPressureSystolic,  unit: 'mmHg',  status: getVitalStatus(healthProfile.bloodPressureSystolic,  [90, 120], 140), icon: <Heart className="w-5 h-5" />,    color: 'from-rose-500 to-pink-500' },
    { label: 'Diastolic BP',   value: healthProfile.bloodPressureDiastolic, unit: 'mmHg',  status: getVitalStatus(healthProfile.bloodPressureDiastolic, [60, 80],  90),  icon: <Heart className="w-5 h-5" />,    color: 'from-pink-500 to-fuchsia-500' },
    { label: 'Fasting Sugar',  value: healthProfile.bloodSugarFasting,      unit: 'mg/dL', status: getVitalStatus(healthProfile.bloodSugarFasting,      [70, 100], 126), icon: <Droplet className="w-5 h-5" />,  color: 'from-amber-500 to-orange-500' },
    { label: 'Cholesterol',    value: healthProfile.cholesterolTotal,        unit: 'mg/dL', status: getVitalStatus(healthProfile.cholesterolTotal,        [0, 200],  240), icon: <Activity className="w-5 h-5" />, color: 'from-yellow-500 to-amber-500' },
    { label: 'Heart Rate',     value: healthProfile.heartRateBpm,            unit: 'bpm',   status: getVitalStatus(healthProfile.heartRateBpm,            [60, 100], 100), icon: <Zap className="w-5 h-5" />,      color: 'from-emerald-500 to-teal-500' },
    { label: 'SpO2',           value: healthProfile.oxygenSaturation,        unit: '%',     status: getVitalStatus(healthProfile.oxygenSaturation,        [95, 100], 100), icon: <Activity className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
  ];

  const hasAnyVital = vitals.some(v => v.value !== undefined && v.value > 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5" /> Clinical Health Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit']">
            Your Health Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your vitals manually or use the biometric scanner. All data stays private and updates your AI food recommendations instantly.
          </p>
        </div>
        {healthProfile.lastVitalScanAt && (
          <div className="text-[10px] text-slate-400 font-medium bg-slate-100 px-3 py-1.5 rounded-xl">
            Last updated: {new Date(healthProfile.lastVitalScanAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Success toast */}
      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {savedMsg}</span>
          <button onClick={() => setSavedMsg('')}>✕</button>
        </div>
      )}

      {/* ── SECTION 1: OVERVIEW CARDS (Score, BMI, Conditions) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Health Score Ring */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Overall Health Score</h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="10"
                strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
                className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-slate-900 font-['Outfit'] block leading-none">{healthScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">Out of 100</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {!hasAnyVital ? 'Add vitals below to get your accurate score.' :
             healthScore >= 80 ? '🎉 Excellent health! Keep up the great work.' :
             healthScore >= 60 ? '⚠️ Good, but some vitals need attention.' :
             '🚨 Health needs improvement. Consult a doctor.'}
          </p>
        </div>

        {/* BMI Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Body Mass Index (BMI)</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${bmiInfo.bg} ${bmiInfo.color}`}>{bmiInfo.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-['Outfit']">{bmi || '—'}</span>
            {bmi ? <span className="text-xs text-slate-400 font-medium">kg/m²</span> : null}
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-500"   style={{ width: '18.5%' }} />
            <div className="h-full bg-emerald-500" style={{ width: '25%' }} />
            <div className="h-full bg-amber-500"  style={{ width: '25%' }} />
            <div className="h-full bg-red-500"    style={{ width: '31.5%' }} />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-slate-400">
            <span>Under</span><span>Normal</span><span>Over</span><span>Obese</span>
          </div>
          {!bmi && (
            <p className="text-[11px] text-slate-400">Enter height & weight in the Vitals form to calculate BMI.</p>
          )}
        </div>

        {/* Medical Conditions Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Your Active Conditions</h3>
            <button onClick={() => setIsConditionsEditing(true)} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="space-y-2">
            {healthProfile.diseases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {healthProfile.diseases.map(d => (
                  <span key={d} className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-xs font-bold border border-rose-500/20">
                    🏥 {d}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No conditions added yet.</p>
            )}

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Allergies</span>
              {healthProfile.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {healthProfile.allergies.map(a => (
                    <span key={a} className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">No allergies recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: CONDITIONS & ALLERGIES FORM ── */}
      {isConditionsEditing && (
        <div className="p-6 rounded-3xl bg-white border-2 border-emerald-500/30 shadow-xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-500" /> Update Health Conditions & Allergies
              </h2>
              <p className="text-xs text-slate-500">These update your AI food safety warnings in the Marketplace.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveConditions}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wide transition-all shadow-lg flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" /> Save & Update AI
              </button>
              <button onClick={() => setIsConditionsEditing(false)} className="p-2.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Conditions */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-500" /> Medical Conditions
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map(cond => {
                  const isSelected = selectedDiseases.includes(cond);
                  return (
                    <button
                      key={cond} type="button"
                      onClick={() => setSelectedDiseases(prev => prev.includes(cond) ? prev.filter(d => d !== cond) : [...prev, cond])}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        isSelected ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-rose-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{cond}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text" placeholder="Add custom condition..."
                  value={customDiseaseInput} onChange={e => setCustomDiseaseInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (customDiseaseInput.trim()) { setSelectedDiseases(prev => [...prev, customDiseaseInput.trim()]); setCustomDiseaseInput(''); }}}}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => { if (customDiseaseInput.trim()) { setSelectedDiseases(prev => [...prev, customDiseaseInput.trim()]); setCustomDiseaseInput(''); }}}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all"
                >Add</button>
              </div>
            </div>

            {/* Food Allergies */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Food Allergies & Intolerances
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map(allergy => {
                  const isSelected = selectedAllergies.includes(allergy);
                  return (
                    <button
                      key={allergy} type="button"
                      onClick={() => setSelectedAllergies(prev => prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy])}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        isSelected ? 'bg-amber-500 text-white border-amber-500 shadow-md' : 'bg-slate-100 text-slate-600 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {isSelected ? '⚠️ ' : '+ '}{allergy}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-1">
                <input
                  type="text" placeholder="Add custom allergy..."
                  value={customAllergyInput} onChange={e => setCustomAllergyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (customAllergyInput.trim()) { setSelectedAllergies(prev => [...prev, customAllergyInput.trim()]); setCustomAllergyInput(''); }}}}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => { if (customAllergyInput.trim()) { setSelectedAllergies(prev => [...prev, customAllergyInput.trim()]); setCustomAllergyInput(''); }}}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all"
                >Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3: VITALS ENTRY ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900 font-['Outfit']">Biometric Vital Signs</h2>
          </div>
          <div className="flex gap-2">
            <button
              id="health-scan-biometric-btn"
              onClick={() => setShowBioScanner(!showBioScanner)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all"
            >
              <Fingerprint className="w-4 h-4" />
              {showBioScanner ? 'Hide Scanner' : 'Scan Vitals (Biometric)'}
            </button>
            <button
              id="health-manual-entry-btn"
              onClick={() => setIsVitalsEditing(!isVitalsEditing)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              {isVitalsEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {isVitalsEditing ? 'Cancel' : 'Enter Manually'}
            </button>
          </div>
        </div>

        {/* Biometric Scanner */}
        {showBioScanner && (
          <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-600" /> BioScan™ Vital Check
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Touch the scanner button to simulate a biometric scan. Vitals will auto-populate your health profile.</p>
              </div>
              <button onClick={() => setShowBioScanner(false)} className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <BiometricScanner onScanComplete={() => { setShowBioScanner(false); showSaved('Vitals scanned! Your health score has been updated.'); }} />
          </div>
        )}

        {/* Manual Vitals Entry Form */}
        {isVitalsEditing && (
          <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-6 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" /> Manual Vitals Entry
              </h3>
              <button
                id="health-save-vitals-btn"
                onClick={handleSaveVitals}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wide shadow-md flex items-center gap-1.5 transition-all"
              >
                <Save className="w-4 h-4" /> Save Vitals
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Systolic BP (Top)',      field: 'bloodPressureSystolic',  unit: 'mmHg', placeholder: 'e.g. 120', hint: 'Normal: 90-120 mmHg', color: 'rose' },
                { label: 'Diastolic BP (Bottom)',  field: 'bloodPressureDiastolic', unit: 'mmHg', placeholder: 'e.g. 80',  hint: 'Normal: 60-80 mmHg', color: 'pink' },
                { label: 'Fasting Blood Sugar',    field: 'bloodSugarFasting',      unit: 'mg/dL',placeholder: 'e.g. 90',  hint: 'Normal: 70-100 mg/dL', color: 'amber' },
                { label: 'Total Cholesterol',      field: 'cholesterolTotal',        unit: 'mg/dL',placeholder: 'e.g. 180', hint: 'Normal: <200 mg/dL', color: 'yellow' },
                { label: 'Heart Rate',             field: 'heartRateBpm',           unit: 'bpm',  placeholder: 'e.g. 72',  hint: 'Normal: 60-100 bpm', color: 'emerald' },
                { label: 'Oxygen Saturation (SpO2)',field:'oxygenSaturation',        unit: '%',    placeholder: 'e.g. 98',  hint: 'Normal: 95-100%', color: 'blue' },
                { label: 'Current Weight',         field: 'weightKg',               unit: 'kg',   placeholder: 'e.g. 65',  hint: 'Used to calculate BMI', color: 'violet' },
                { label: 'Height',                 field: 'heightCm',               unit: 'cm',   placeholder: 'e.g. 165', hint: 'Used to calculate BMI', color: 'cyan' },
              ].map(({ label, field, unit, placeholder, hint, color }) => (
                <div key={field}>
                  <label className={`text-[10px] font-extrabold text-${color}-600 uppercase tracking-wider mb-1.5 block`}>
                    {label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`vitals-${field}-input`}
                      type="number"
                      placeholder={placeholder}
                      value={(vitalsForm as any)[field]}
                      onChange={e => setVitalsForm(prev => ({ ...prev, [field]: e.target.value === '' ? '' : Number(e.target.value) }))}
                      className={`flex-1 px-3 py-2.5 rounded-xl border border-${color}-200 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-${color}-500/20`}
                    />
                    <span className="text-[10px] font-bold text-slate-400 w-10 shrink-0 text-right">{unit}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {hint}
                  </p>
                </div>
              ))}
            </div>

            {/* Live BMI preview */}
            {vitalsForm.heightCm && vitalsForm.weightKg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800">
                📊 Calculated BMI: <span className="text-emerald-700 font-black">{bmi}</span> kg/m² — {bmiInfo.label}
              </div>
            )}
          </div>
        )}

        {/* Vitals Display Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vitals.map((v) => (
            <div key={v.label} className={`p-4 rounded-2xl bg-white border ${v.status.border} shadow-md space-y-2`}>
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${v.color} text-white flex items-center justify-center`}>
                  {v.icon}
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status.bg} ${v.status.text}`}>
                  {v.status.icon}
                  {v.status.label}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{v.label}</p>
                {v.value !== undefined && v.value > 0 ? (
                  <p className="text-xl font-black text-slate-900 font-['Outfit'] mt-0.5">
                    {v.value}
                    <span className="text-xs font-semibold text-slate-400 ml-1">{v.unit}</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Not recorded — tap "Enter Manually" or "Scan Vitals"</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt if no vitals */}
        {!hasAnyVital && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-700">No vitals recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Add your vitals using the biometric scanner (touch-screen fingerprint on mobile) or enter them manually above.
              Once added, your health score, food warnings, and AI recommendations will all update automatically.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowBioScanner(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center gap-2"
              >
                <Fingerprint className="w-4 h-4" /> Use Biometric Scanner
              </button>
              <button
                onClick={() => setIsVitalsEditing(true)}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Enter Manually
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Foods to avoid based on conditions */}
      {healthProfile.diseases.length > 0 && (
        <div className="p-5 rounded-3xl bg-rose-500/5 border border-rose-500/20 space-y-3">
          <h4 className="text-sm font-extrabold text-rose-700 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-500" /> AI Food Safety Warning — Avoid These Foods
          </h4>
          <p className="text-xs text-slate-600 font-medium">
            Based on your health conditions. These are flagged automatically when you browse the Marketplace.
          </p>
          <div className="flex flex-wrap gap-2">
            {healthProfile.diseases.some(d => d.toLowerCase().includes('hypertension') || d.toLowerCase().includes('bp')) && (
              ['High Sodium Foods', 'Processed Meat', 'Canned Salty Foods', 'Pickles & Soy Sauce'].map(item => (
                <span key={item} className="px-3 py-1 rounded-full bg-white border border-rose-500/30 text-rose-600 text-xs font-bold">⛔ {item}</span>
              ))
            )}
            {healthProfile.diseases.some(d => d.toLowerCase().includes('diabetes')) && (
              ['White Sugar', 'Fruit Juices & Sodas', 'White Bread & Maida', 'Deep Fried Snacks'].map(item => (
                <span key={item} className="px-3 py-1 rounded-full bg-white border border-rose-500/30 text-rose-600 text-xs font-bold">⛔ {item}</span>
              ))
            )}
            {healthProfile.diseases.some(d => d.toLowerCase().includes('heart')) && (
              ['Trans Fats', 'Hydrogenated Oils', 'Organ Meats', 'Fried Foods'].map(item => (
                <span key={item} className="px-3 py-1 rounded-full bg-white border border-rose-500/30 text-rose-600 text-xs font-bold">⛔ {item}</span>
              ))
            )}
          </div>
          <p className="text-[10px] text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3" /> These warnings appear automatically in the Marketplace when you click on a food item.
          </p>
        </div>
      )}

    </div>
  );
};

export default HealthReports;

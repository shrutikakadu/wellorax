import React, { useState } from 'react';
import { 
  Stethoscope, 
  Sparkles, 
  CheckCircle2, 
  Send
} from 'lucide-react';
import { INITIAL_HEALTH_PROFILE } from '../../data/mockData';

export const DoctorDashboard: React.FC = () => {
  const [selectedPatient] = useState(INITIAL_HEALTH_PROFILE);
  const [customNotes, setCustomNotes] = useState('');
  const [isPrescriptionSent, setIsPrescriptionSent] = useState(false);

  const handleSendPrescription = () => {
    if (!customNotes.trim()) return;
    setIsPrescriptionSent(true);
    setTimeout(() => {
      setIsPrescriptionSent(false);
      setCustomNotes('');
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Clinical Endocrinology & Dietetics Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Dr. Kavita Subramanian • Telehealth Suite
          </h1>
          <p className="text-sm text-slate-400">
            Patient roster, real-time continuous glucose monitor logs, and AI protocol generation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            3 Appointments Scheduled Today
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Roster Left */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white font-['Outfit']">
            Today's Telehealth Patient Queue
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{INITIAL_HEALTH_PROFILE.name}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-black text-[10px]">NEXT 4:30 PM</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Condition: {INITIAL_HEALTH_PROFILE.diseases.join(', ')} • Target: {INITIAL_HEALTH_PROFILE.fitnessGoal}
              </p>
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                AI Telemetry Match: 98.4% Compliance
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2 opacity-75">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Rohan Kapoor</span>
                <span className="text-slate-400 text-[10px]">6:00 PM</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">Condition: Type-2 Diabetes</p>
            </div>
          </div>
        </div>

        {/* AI Diet Protocol Builder Right */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white font-['Outfit']">
                AI Clinical Diet Plan Generator
              </h3>
              <p className="text-xs text-slate-400">Prescribing protocol for {selectedPatient.name}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs">
              PCOS Protocol #402
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4" /> AI Automated Recommendations for Patient:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 font-medium">
              <li>Cap net carb intake at 22g per meal (Glycemic Index &lt; 30).</li>
              <li>Prioritize Omega-3 fatty acids (Avocado & Wild Salmon).</li>
              <li>Integrate 250ml water intake every 2 hours.</li>
            </ul>
          </div>

          {/* Doctor Custom Prescription Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase">
              Add Custom Medical Instructions / Dietary Amendments
            </label>
            <textarea
              rows={4}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Include 10g additional flaxseed fiber at breakfast. Monitor fasting blood glucose daily."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {isPrescriptionSent && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Dietary Protocol & Prescription synced directly to patient's Wellora App!</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSendPrescription}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Issue Clinical Diet Plan</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

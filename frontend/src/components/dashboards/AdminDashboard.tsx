import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  DollarSign, 
  TrendingUp, 
  Cpu
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Wellora Executive Command Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Admin & AI Monitoring Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Global health telemetry, restaurant quality control, platform revenue, and neural model accuracy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> AI Engine: Nominal (98.4%)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Monthly Platform GMV</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">₹1.42 Cr</div>
          <div className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24.8% vs last month
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Active Subscribers</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">14,820</div>
          <div className="text-xs text-blue-500 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +1,240 new this week
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Certified Kitchens</span>
            <Utensils className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">542</div>
          <div className="text-xs text-slate-500">18 pending audit</div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">AI Model Accuracy</span>
            <Cpu className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">98.4%</div>
          <div className="text-xs text-emerald-500 font-bold">Zero insulin breach alerts</div>
        </div>

      </div>

      {/* Users & AI Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Patients & User Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
            Recent User Health Profiles
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Fitness Goal</th>
                  <th className="p-3">Conditions</th>
                  <th className="p-3">Health Score</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Dr. Ananya Sharma</td>
                  <td className="p-3">PCOS Relief</td>
                  <td className="p-3">PCOS, Insulin Sensitivity</td>
                  <td className="p-3 font-extrabold text-emerald-500">92 / 100</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">Optimal</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Rohan Kapoor</td>
                  <td className="p-3">Diabetes Control</td>
                  <td className="p-3">Type-2 Diabetes</td>
                  <td className="p-3 font-extrabold text-blue-500">88 / 100</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">Stable</span></td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-slate-900 dark:text-white">Priya Sundaram</td>
                  <td className="p-3">Muscle Gain</td>
                  <td className="p-3">High Protein Target</td>
                  <td className="p-3 font-extrabold text-emerald-500">95 / 100</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">Optimal</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Monitoring Log */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm font-['Outfit'] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Real-Time AI Telemetry</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Live Logs</span>
          </div>

          <div className="space-y-3 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
              <div className="text-emerald-400 font-bold">[10:45:12] Glycemic Check</div>
              <div className="text-slate-300">Verified Salmon Power Bowl GI index = 28 (Pass).</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
              <div className="text-blue-400 font-bold">[10:42:08] PCOS Allergen Guard</div>
              <div className="text-slate-300">Blocked high fructose syrup substitute for User #NF-98421.</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-1">
              <div className="text-purple-400 font-bold">[10:38:50] Telehealth Brief</div>
              <div className="text-slate-300">Generated clinical diet summary for Dr. Kavita.</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

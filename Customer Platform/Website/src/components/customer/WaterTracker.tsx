import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Droplet,
  Plus,
  Minus,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  Zap,
} from 'lucide-react';

const tips = [
  {
    title: 'Morning Hydration',
    desc: 'Drink a glass of water immediately after waking up to kickstart your metabolism and rehydrate your body.',
    icon: Zap,
  },
  {
    title: 'Set Reminders',
    desc: 'Set hourly reminders on your phone to sip water throughout the day. Consistency is the key to staying hydrated.',
    icon: Clock,
  },
  {
    title: 'Track Before Meals',
    desc: 'Drinking water 30 minutes before meals aids digestion and helps control portion sizes naturally.',
    icon: Target,
  },
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WaterTracker: React.FC = () => {
  const { healthProfile } = useApp();
  const [glasses, setGlasses] = useState(0);
  const [weeklyData] = useState<number[]>([6, 8, 5, 7, 8, 6, 7]);

  const goal = Math.ceil((healthProfile.waterIntakeLiters || 2.5) * 4);
  const percentage = Math.min((glasses / goal) * 100, 100);
  const totalMl = glasses * 250;
  const lastDrinkTime = glasses > 0 ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - percentage / 100);

  const addGlass = () => setGlasses(prev => Math.min(prev + 1, goal));
  const add500ml = () => setGlasses(prev => Math.min(prev + 2, goal));
  const add1L = () => setGlasses(prev => Math.min(prev + 4, goal));
  const undoGlass = () => setGlasses(prev => Math.max(prev - 1, 0));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <Droplet className="w-3.5 h-3.5" />
            <span>Water Tracker</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Stay Hydrated
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track your daily water intake and maintain optimal hydration levels.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-500/20">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase">Daily Goal</div>
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-['Outfit']">
              {(goal * 250 / 1000).toFixed(1)}L
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        <div className="lg:col-span-3 p-8 rounded-3xl bg-white dark:bg-[#0A1F16] border border-slate-200 dark:border-emerald-500/15 shadow-lg space-y-6">
          <div className="flex flex-col items-center">

            <div className="relative flex items-center justify-center mb-6">
              <svg width="240" height="240" viewBox="0 0 120 120" className="-rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(16,185,129,0.1)" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#waterGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500 ease-out"
                />
                <defs>
                  <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Droplet className={`w-8 h-8 mb-1 ${percentage >= 100 ? 'text-emerald-500' : 'text-emerald-400/70'}`} />
                <span className="text-4xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  {glasses}
                </span>
                <span className="text-xs text-slate-400 font-semibold">of {goal} glasses</span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {percentage >= 100
                ? 'Goal reached! Great job staying hydrated!'
                : `${(goal - glasses) * 250}ml remaining to hit your goal`}
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {Array.from({ length: goal }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
                  i < glasses
                    ? 'bg-emerald-500/20 border border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50'
                }`}
              >
                <Droplet
                  className={`w-5 h-5 ${
                    i < glasses ? 'text-emerald-500 fill-emerald-500' : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={addGlass}
              disabled={glasses >= goal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              +1 Glass (250ml)
            </button>
            <button
              onClick={add500ml}
              disabled={glasses >= goal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-white font-bold text-sm hover:bg-cyan-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              +500ml
            </button>
            <button
              onClick={add1L}
              disabled={glasses >= goal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              +1 Liter
            </button>
            <button
              onClick={undoGlass}
              disabled={glasses === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus className="w-4 h-4" />
              Undo
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0A1F16] border border-slate-200 dark:border-emerald-500/15 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">Today's Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                <Droplet className="w-4 h-4 text-emerald-500 mb-1.5" />
                <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  {totalMl}<span className="text-sm font-bold text-slate-400">ml</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Total Intake Today</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20">
                <Target className="w-4 h-4 text-cyan-500 mb-1.5" />
                <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  {Math.round(percentage)}<span className="text-sm font-bold text-slate-400">%</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Percentage Complete</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="w-4 h-4 text-blue-500 mb-1.5" />
                <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  7<span className="text-sm font-bold text-slate-400"> days</span>
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Current Streak</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20">
                <Clock className="w-4 h-4 text-purple-500 mb-1.5" />
                <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
                  {lastDrinkTime}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Last Drink Time</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#0A1F16] border border-slate-200 dark:border-emerald-500/15 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">Weekly Overview</h3>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> This Week
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 items-end h-32 pt-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              {weeklyData.map((val, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end group">
                  <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {val * 250}ml
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-110"
                    style={{ height: `${(val / Math.max(...weeklyData)) * 100}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-500 transition-colors">
                    {dayLabels[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="p-8 rounded-3xl bg-white dark:bg-[#0A1F16] border border-slate-200 dark:border-emerald-500/15 shadow-lg space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Hydration Tips</h2>
          <p className="text-xs text-slate-500 mt-1">Expert-backed advice to optimize your water intake</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, idx) => {
            const Icon = tip.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-3 hover:border-emerald-500/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{tip.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {percentage >= 100 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/30">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
            Amazing! You've reached your daily hydration goal. Keep up the great work!
          </p>
        </div>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Flame,
  Activity,
  Droplets,
  Award,
  TrendingUp,
  Heart,
  Plus,
  Info
} from 'lucide-react';

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const NutritionDashboard: React.FC = () => {
  const { healthProfile, dailyIntake, addWater, cart, ordersHistory } = useApp();

  // Get current day of week index (Monday = 0, Sunday = 6)
  const todayIdx = (new Date().getDay() + 6) % 7;

  // Real-time daily totals from AppContext
  const consumedCalories = dailyIntake.calories;
  const consumedProtein  = dailyIntake.protein;
  const consumedCarbs    = dailyIntake.carbs;
  const consumedFat      = dailyIntake.fat;
  const consumedWater    = dailyIntake.water;

  const calTarget     = healthProfile.dailyCalorieTarget || 2000;
  const proteinTarget = healthProfile.dailyProteinTarget || 100;
  const waterTarget   = healthProfile.waterIntakeLiters  || 2.5;

  const calPercentage     = Math.min(100, Math.round((consumedCalories / calTarget) * 100));
  const proteinPercentage = Math.min(100, Math.round((consumedProtein / proteinTarget) * 100));
  const waterPercentage   = Math.min(100, Math.round((consumedWater / waterTarget) * 100));

  // Dynamic Weekly Chart — Starts at 0 for unrecorded days
  const weeklyData = dayLabels.map((label, idx) => {
    if (idx === todayIdx) {
      return { label, calories: consumedCalories, protein: consumedProtein };
    }
    return { label, calories: 0, protein: 0 };
  });

  const maxCal = Math.max(...weeklyData.map(d => d.calories), calTarget, 1);
  const maxPro = Math.max(...weeklyData.map(d => d.protein), proteinTarget, 1);

  // Recent logged meals from orders history or active cart
  const activeLogs = ordersHistory.flatMap(o => o.items).map(item => ({
    name: item.meal.name,
    calories: item.meal.macros.calories * item.quantity,
    protein: item.meal.macros.protein * item.quantity,
    time: 'Today',
    image: item.meal.image,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Nutrition Analytics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            Nutrition & Macro Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track calories, macros, and hydration in real time. Updates automatically with every order.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg">
            {calPercentage}%
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Daily Goal Progress</div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              {consumedCalories} / {calTarget} kcal
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 CORE METRIC CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Calories Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0A1F16] border border-slate-200 dark:border-emerald-500/15 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500">
              {calPercentage}% of Goal
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Calories Consumed</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] mt-1">
              {consumedCalories} <span className="text-xs font-bold text-slate-400">/ {calTarget} kcal</span>
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${calPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {Math.max(0, calTarget - consumedCalories)} kcal remaining today
          </p>
        </div>

        {/* Protein Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0A1F16] border border-slate-200 dark:border-emerald-500/15 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500">
              {proteinPercentage}% of Goal
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Protein Target</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] mt-1">
              {consumedProtein}g <span className="text-xs font-bold text-slate-400">/ {proteinTarget}g</span>
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${proteinPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {Math.max(0, proteinTarget - consumedProtein)}g protein remaining today
          </p>
        </div>

        {/* Water Hydration Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0A1F16] border border-slate-200 dark:border-emerald-500/15 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <button
              onClick={() => addWater(0.25)}
              className="px-3 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition-colors flex items-center gap-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> +250ml
            </button>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Water Hydration</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] mt-1">
              {consumedWater.toFixed(1)}L <span className="text-xs font-bold text-slate-400">/ {waterTarget.toFixed(1)}L</span>
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${waterPercentage}%` }} />
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {Math.max(0, +(waterTarget - consumedWater).toFixed(1))}L remaining today
          </p>
        </div>

      </div>

      {/* ── CHARTS SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Weekly Calorie Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit']">Weekly Calorie Trend</h3>
              <p className="text-xs text-slate-400">Live intake by day of week</p>
            </div>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Real-time
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-48 pt-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            {weeklyData.map((d, idx) => {
              const isToday = idx === todayIdx;
              const barHeightPct = d.calories > 0 ? Math.max(12, Math.round((d.calories / maxCal) * 100)) : 4;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[9px] font-extrabold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.calories} kcal
                  </span>
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isToday
                        ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-md shadow-orange-500/20'
                        : d.calories > 0
                          ? 'bg-gradient-to-t from-slate-600 to-slate-400'
                          : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                  <span className={`text-[10px] font-extrabold ${isToday ? 'text-orange-500' : 'text-slate-400'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 text-center font-medium">
            Today is <strong className="text-slate-700 dark:text-slate-200">{dayLabels[todayIdx]}</strong>. Bars fill up live as you order meals.
          </p>
        </div>

        {/* Macro Ratio Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit']">Macronutrient Ratio</h3>
              <p className="text-xs text-slate-400">Protein vs Carbs vs Fat</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Protein</span>
                <span>{consumedProtein}g</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${proteinPercentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Carbohydrates</span>
                <span>{consumedCarbs}g</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((consumedCarbs / 250) * 100))}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span>Fats</span>
                <span>{consumedFat}g</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((consumedFat / 65) * 100))}%` }} />
              </div>
            </div>
          </div>

          {/* Today's Orders Logged */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Today's Logged Meals ({activeLogs.length})</span>
            {activeLogs.length > 0 ? (
              <div className="space-y-2">
                {activeLogs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={log.image} alt={log.name} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{log.name}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">+{log.calories} kcal</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No meals ordered yet today. Order from Marketplace to auto-log macros.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default NutritionDashboard;

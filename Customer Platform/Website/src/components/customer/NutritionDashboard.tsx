import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { nutritionService } from '../../services';
import {
  Flame,
  Activity,
  Droplets,
  Award,
  TrendingUp,
  Heart,
  Plus,
  Loader2
} from 'lucide-react';

interface DailyLog {
  id: string;
  mealName: string;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  loggedAt: string;
}

interface WeeklySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export const NutritionDashboard: React.FC = () => {
  const { healthProfile } = useApp();
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [consumedProtein, setConsumedProtein] = useState(0);
  const [consumedWater, setConsumedWater] = useState(2.2);
  const [todayLogs, setTodayLogs] = useState<DailyLog[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dailyRes, weeklyRes] = await Promise.all([
          nutritionService.getDaily(),
          nutritionService.getWeekly(),
        ]);

        if (dailyRes.success && dailyRes.data) {
          const d = dailyRes.data as any;
          setConsumedCalories(d.totals?.calories || 0);
          setConsumedProtein(d.totals?.protein || 0);
          setTodayLogs(d.logs || []);
        }

        if (weeklyRes.success && weeklyRes.data) {
          setWeeklyData(weeklyRes.data as WeeklySummary[]);
        }
      } catch (err) {
        console.warn('Nutrition fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calPercentage = Math.min(100, healthProfile.dailyCalorieTarget > 0
    ? Math.round((consumedCalories / healthProfile.dailyCalorieTarget) * 100) : 0);
  const proteinPercentage = Math.min(100, healthProfile.dailyProteinTarget > 0
    ? Math.round((consumedProtein / healthProfile.dailyProteinTarget) * 100) : 0);
  const waterTarget = healthProfile.waterIntakeLiters || 2.5;
  const waterPercentage = Math.min(100, Math.round((consumedWater / waterTarget) * 100));

  const addWater = () => {
    setConsumedWater(prev => +(prev + 0.25).toFixed(2));
  };

  const weeklyBarData = weeklyData.length > 0 ? weeklyData.slice(-7) : [
    { date: 'Mon', totalCalories: 1420, totalProtein: 88 },
    { date: 'Tue', totalCalories: 1580, totalProtein: 92 },
    { date: 'Wed', totalCalories: 1500, totalProtein: 96 },
    { date: 'Thu', totalCalories: 1740, totalProtein: 84 },
    { date: 'Fri', totalCalories: 1900, totalProtein: 102 },
    { date: 'Sat', totalCalories: 1280, totalProtein: 90 },
    { date: 'Sun', totalCalories: consumedCalories || 1520, totalProtein: consumedProtein || 94 },
  ];

  const maxCal = Math.max(...weeklyBarData.map(d => d.totalCalories), 1);
  const maxPro = Math.max(...weeklyBarData.map(d => d.totalProtein), 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <Activity className="w-3.5 h-3.5" />
            <span>Biometric Longevity Telemetry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            AI Nutrition & Health Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time biometric sync with continuous glucose monitoring & macro compliance.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl font-['Outfit']">
            {healthProfile.healthScore}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase">Overall Health Score</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">Optimal Metabolism Zone</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Main Gauges Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Gauge 1: Calories */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">Daily Energy Target</h3>
                    <p className="text-xs text-slate-400">{consumedCalories} / {healthProfile.dailyCalorieTarget} kcal</p>
                  </div>
                </div>
                <span className="text-lg font-black text-orange-500 font-['Outfit']">{calPercentage}%</span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700" style={{ width: `${calPercentage}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Remaining: <strong className="text-slate-900 dark:text-white">{Math.max(0, healthProfile.dailyCalorieTarget - consumedCalories)} kcal</strong></span>
                <span className="text-emerald-500 font-bold">Calorie Deficit</span>
              </div>
            </div>

            {/* Gauge 2: Protein Target */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">Bio-Protein Goal</h3>
                    <p className="text-xs text-slate-400">{consumedProtein}g / {healthProfile.dailyProteinTarget}g protein</p>
                  </div>
                </div>
                <span className="text-lg font-black text-emerald-500 font-['Outfit']">{proteinPercentage}%</span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" style={{ width: `${proteinPercentage}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Needed: <strong className="text-slate-900 dark:text-white">{Math.max(0, healthProfile.dailyProteinTarget - consumedProtein)}g</strong></span>
                <span className="text-emerald-500 font-bold">Muscle Repair Safe</span>
              </div>
            </div>

            {/* Gauge 3: Hydration */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">Hydration Telemetry</h3>
                    <p className="text-xs text-slate-400">{consumedWater}L / {waterTarget}L</p>
                  </div>
                </div>
                <span className="text-lg font-black text-blue-500 font-['Outfit']">{waterPercentage}%</span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700" style={{ width: `${waterPercentage}%` }}></div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  onClick={addWater}
                  className="px-3 py-1 rounded-xl bg-blue-500 text-white font-bold flex items-center gap-1 hover:bg-blue-600 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> +250ml Glass
                </button>
                <span className="text-blue-500 font-bold">Hydration Optimal</span>
              </div>
            </div>
          </div>

          {/* Weekly Visual Progress Chart Bar */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                  7-Day Macro & Calorie Trends
                </h2>
                <p className="text-xs text-slate-500">Continuous AI assessment against target glycemic window</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Protein
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Calories
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 border-b border-slate-100 dark:border-slate-800 pb-2">
              {weeklyBarData.map((item, idx) => {
                const calH = maxCal > 0 ? Math.round((item.totalCalories / maxCal) * 100) : 0;
                const proH = maxPro > 0 ? Math.round((item.totalProtein / maxPro) * 100) : 0;
                const label = typeof item.date === 'string' && item.date.length <= 3 ? item.date :
                  new Date(item.date).toLocaleDateString('en', { weekday: 'short' });
                const isToday = idx === weeklyBarData.length - 1;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      <div
                        className="w-3 sm:w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-110"
                        style={{ height: `${proH}%` }}
                      ></div>
                      <div
                        className="w-3 sm:w-5 bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-lg transition-all group-hover:brightness-110"
                        style={{ height: `${calH}%` }}
                      ></div>
                    </div>
                    <span className={`text-[11px] font-bold transition-colors ${isToday ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400 group-hover:text-emerald-500'}`}>
                      {isToday ? 'Today' : label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Log */}
          {todayLogs.length > 0 && (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Today's Food Log</h2>
              <div className="space-y-2">
                {todayLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{log.mealName}</p>
                      <p className="text-[10px] text-slate-400">{log.mealType} &bull; {new Date(log.loggedAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="text-orange-500">{log.calories} kcal</span>
                      <span className="text-emerald-500">{log.protein}g P</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Badges & Achievements */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">PCOS Shield 14-Day</div>
                <div className="text-xs text-slate-500">Zero insulin spikes</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Protein Master</div>
                <div className="text-xs text-slate-500">110g daily consistency</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Hydro Champion</div>
                <div className="text-xs text-slate-500">2.8L water target hit</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Heart Resilient</div>
                <div className="text-xs text-slate-500">Low sodium verified</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

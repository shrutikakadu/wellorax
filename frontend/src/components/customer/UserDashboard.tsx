import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BiometricScanner } from './BiometricScanner';
import { NotificationPopover } from '../common/NotificationPopover';
import {
  Search, Star, Plus, Flame, Activity, Sparkles,
  Heart, Check, Bell, MessageSquare,
  ShieldCheck, Zap, UserCheck, ArrowRight, FileText,
  Droplet, X, UtensilsCrossed, Stethoscope, ShoppingCart, Calendar,
  TrendingUp, Award, Clock, Leaf, ChevronRight
} from 'lucide-react';

interface Mission {
  id: string;
  label: string;
  xp: number;
  completed: boolean;
}

const INITIAL_MISSIONS: Mission[] = [
  { id: 'water',   label: 'Drink target water today', xp: 20, completed: false },
  { id: 'protein', label: 'Eat High Protein Lunch',   xp: 30, completed: false },
  { id: 'log',     label: 'Log your vitals today',    xp: 25, completed: false },
  { id: 'steps',   label: 'Walk 8000 Steps',          xp: 20, completed: false },
];


export const UserDashboard: React.FC = () => {
  const {
    healthProfile,
    addToCart,
    addGroceryToCart,
    setCurrentView,
    setIsAIModalOpen,
    currentUser,
    openProfileModal,
    dailyIntake,
    meals,
    setSearchQuery,
    cart,
  } = useApp();

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);

  // Dynamic computations
  const hasHealthProfile = !!(healthProfile.age && healthProfile.age > 0 && healthProfile.heightCm > 0 && healthProfile.weightKg > 0);
  const hasVitals = !!(healthProfile.bloodPressureSystolic || healthProfile.bloodSugarFasting || healthProfile.heartRateBpm);
  const computedHealthScore = hasHealthProfile ? healthProfile.healthScore : null;

  const calorieTarget = healthProfile.dailyCalorieTarget || 2000;
  const proteinTarget = healthProfile.dailyProteinTarget || 100;
  const waterTarget   = healthProfile.waterIntakeLiters  || 2.5;

  const caloriesConsumed = dailyIntake.calories;
  const caloriesLeft     = Math.max(0, calorieTarget - caloriesConsumed);
  const proteinConsumed  = dailyIntake.protein;
  const proteinLeft      = Math.max(0, proteinTarget - proteinConsumed);
  const waterConsumed    = dailyIntake.water;

  const caloriePct = Math.min(100, Math.round((caloriesConsumed / calorieTarget) * 100));
  const proteinPct = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100));
  const waterPct   = Math.min(100, Math.round((waterConsumed / waterTarget) * 100));

  // Total macros for donut chart
  const totalCarbs = dailyIntake.carbs;
  const totalFat   = dailyIntake.fat;
  const totalProt  = dailyIntake.protein;
  const totalCal   = dailyIntake.calories;
  const macroTotal = totalCarbs + totalFat + totalProt || 1;
  const carbPct    = Math.round((totalCarbs / macroTotal) * 100);
  const fatPct     = Math.round((totalFat  / macroTotal) * 100);
  const protPct    = Math.round((totalProt / macroTotal) * 100);

  const toggleMission = (id: string) => {
    setMissions(prev => prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m)));
  };

  const handleOrderGrocery = (item: { id: string; name: string; price: number; image: string; tag: string }) => {
    addGroceryToCart({
      id: item.id, name: item.name, price: item.price, image: item.image,
      unit: '1 pack', rating: 4.8, isOrganic: true, nutritionTag: item.tag, category: 'Protein'
    });
  };

  const foodCategories = [
    { name: 'High Protein', emoji: '💪', count: '45+ meals', view: 'marketplace', filter: 'High Protein' },
    { name: 'Diabetic Care', emoji: '🩸', count: '30+ meals', view: 'marketplace', filter: 'Diabetic Friendly' },
    { name: 'PCOS Safe', emoji: '🌸', count: '25+ meals', view: 'marketplace', filter: 'PCOS Safe' },
    { name: 'Keto & Low Carb', emoji: '🥑', count: '38+ meals', view: 'marketplace', filter: 'Keto' },
    { name: 'Heart Healthy', emoji: '❤️', count: '40+ meals', view: 'marketplace', filter: 'Heart Healthy' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F5] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 pb-20 font-sans">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-6">

        {/* ── 1. APP HERO FOOD BANNER ── */}
        <div className="relative rounded-[2.2rem] overflow-hidden bg-gradient-to-r from-[#033A2B] via-[#084D3B] to-[#0A261D] text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-25 hidden md:block overflow-hidden pointer-events-none">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900"
              alt="Healthy Gourmet Dish"
              className="w-full h-full object-cover scale-110"
            />
          </div>

          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-black border border-emerald-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Clinical Food & Health App</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight leading-tight">
              Eat Healthy. Live Stronger, <span className="text-emerald-400">{currentUser?.name?.split(' ')[0] || healthProfile.name || 'User'}!</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed">
              {computedHealthScore !== null
                ? `Clinical Health Score: ${computedHealthScore}/100. Every meal is analyzed for your vitals, glycemic index & macros.`
                : 'Complete your health profile to unlock personalized clinical meal recommendations and automated health safety warnings.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCurrentView('marketplace')}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4" /> Order Healthy Food
              </button>
              <button
                onClick={() => setCurrentView('health-reports')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4 text-emerald-300" /> Scan Bio Vitals
              </button>
            </div>
          </div>
        </div>

        {/* Biometric Scanner Modal Popup */}
        {showScannerModal && (
          <div className="bg-white dark:bg-[#0B1F1A] rounded-[2.2rem] p-6 border border-emerald-200 dark:border-emerald-500/20 shadow-xl relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" /> BioScan™ — Vital Check
              </h3>
              <button onClick={() => setShowScannerModal(false)} className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1">
                <X className="w-4 h-4" /> Close
              </button>
            </div>
            <BiometricScanner />
          </div>
        )}

        {/* ── 2. NEW USER PROFILE PROMPT ── */}
        {!hasHealthProfile && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-100/50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-500/30 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <UserCheck className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit']">Complete Your Profile</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-md">
                  Add your age, height, weight, and health conditions to unlock personalized clinical health scores, AI food safety warnings, and live dashboard tracking.
                </p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                id="dashboard-complete-profile-btn"
                onClick={() => openProfileModal('vitals')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
              >
                Add Health Info <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                id="dashboard-health-reports-btn"
                onClick={() => setCurrentView('health-reports')}
                className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Health Reports
              </button>
            </div>
          </div>
        )}

        {/* ── 3. APP FOOD CATEGORIES BAR (Zomato/Swiggy Style) ── */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-500" /> Explore Clinical Food Categories
            </h3>
            <button
              onClick={() => setCurrentView('marketplace')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {foodCategories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSearchQuery(cat.filter);
                  setCurrentView('marketplace');
                }}
                className="p-4 rounded-[1.5rem] bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all text-left group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.emoji}</div>
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-emerald-500 transition-colors">{cat.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{cat.count}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. LIVE HEALTH & MACRO STAT CARDS ── */}
        {hasHealthProfile && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Health Score */}
            <div className="bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-emerald-500/20" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Health Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">{computedHealthScore ?? '—'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">/100</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] font-bold ${
                  (computedHealthScore ?? 0) >= 80 ? 'text-emerald-600' :
                  (computedHealthScore ?? 0) >= 60 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {(computedHealthScore ?? 0) >= 80 ? 'Excellent' : (computedHealthScore ?? 0) >= 60 ? 'Good' : 'Needs Work'}
                </span>
                <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${computedHealthScore ?? 0}%` }} />
                </div>
              </div>
            </div>

            {/* Calories Left */}
            <div className="bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                  <Flame className="w-4 h-4 fill-orange-500/20" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Calories Left</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">{caloriesLeft.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 font-medium">kcal</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400 font-medium">of {calorieTarget.toLocaleString()} kcal</span>
                <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${caloriePct}%` }} />
                </div>
              </div>
            </div>

            {/* Protein Left */}
            <div className="bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-amber-500/20" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Protein Left</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">{proteinLeft}g</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400 font-medium">of {proteinTarget}g</span>
                <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${proteinPct}%` }} />
                </div>
              </div>
            </div>

            {/* Water Intake */}
            <div className="bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Water Intake</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">{waterConsumed.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">L</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400 font-medium">of {waterTarget}L</span>
                <div className="w-14 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${waterPct}%` }} />
                </div>
              </div>
            </div>

            {/* BMI */}
            <div className="bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">BMI</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">{healthProfile.bmi || '—'}</span>
                    {healthProfile.bmi ? <span className="text-[10px] text-slate-400 font-medium">kg/m²</span> : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[10px] font-bold ${
                  healthProfile.bmi < 18.5 ? 'text-blue-500' :
                  healthProfile.bmi < 25 ? 'text-emerald-600' :
                  healthProfile.bmi < 30 ? 'text-amber-500' : 'text-red-500'
                }`}>
                  {!healthProfile.bmi ? 'Not set' :
                   healthProfile.bmi < 18.5 ? 'Underweight' :
                   healthProfile.bmi < 25 ? 'Normal' :
                   healthProfile.bmi < 30 ? 'Overweight' : 'Obese'}
                </span>
              </div>
            </div>

            {/* Vitals Status */}
            <div className="bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500 block">Vitals</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
                      {hasVitals ? healthProfile.bloodPressureSystolic || '—' : '—'}
                    </span>
                    {hasVitals && healthProfile.bloodPressureSystolic ? <span className="text-[10px] text-slate-400 font-medium">mmHg</span> : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                {hasVitals ? (
                  <span className={`text-[10px] font-bold ${
                    (healthProfile.bloodPressureSystolic || 120) < 120 ? 'text-emerald-600' :
                    (healthProfile.bloodPressureSystolic || 120) < 140 ? 'text-amber-500' : 'text-red-500'
                  }`}>
                    {(healthProfile.bloodPressureSystolic || 120) < 120 ? 'Normal BP' :
                     (healthProfile.bloodPressureSystolic || 120) < 140 ? 'Elevated BP' : 'High BP'}
                  </span>
                ) : (
                  <button
                    onClick={() => setCurrentView('health-reports')}
                    className="text-[10px] font-bold text-emerald-600 hover:underline"
                  >
                    Scan vitals →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. MAIN FOOD & HEALTH DISCOVERY GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Top AI Meal Match (Col 7) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-[2.2rem] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" /> Recommended for Your Vitals
                  </div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">Clinical AI Meal Match</h3>
                </div>
                <button
                  onClick={() => setCurrentView('marketplace')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Explore All →
                </button>
              </div>

              {meals.length > 0 ? (
                <div className="flex flex-col sm:flex-row gap-5 items-stretch">
                  <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden shrink-0 relative group shadow-md">
                    <img
                      src={meals[0].image}
                      alt={meals[0].name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-md">
                      {meals[0].aiMatchScore}% Bio-Match
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight font-['Outfit']">{meals[0].name}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{meals[0].restaurantName}</p>

                      <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl my-3 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Calories</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{meals[0].macros.calories} kcal</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Protein</span>
                          <span className="text-xs font-black text-blue-600 dark:text-blue-400">{meals[0].macros.protein}g</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Glycemic Index</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{meals[0].macros.glycemicIndex || 'GI 28'}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
                        {meals[0].aiExplanation || 'Clinically optimized for your health profile conditions and macro targets.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">₹{meals[0].price}</span>
                      <button
                        id="dashboard-add-recommendation-btn"
                        onClick={() => addToCart(meals[0])}
                        className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-slate-400 text-xs">
                  Loading recommendations...
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Macro Split Donut (Col 5) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-[2.2rem] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">Daily Macro Split</h3>
                <button
                  onClick={() => setCurrentView('nutrition-dashboard')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Analytics →
                </button>
              </div>

              {/* Donut Chart */}
              <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
                {totalCal > 0 ? (
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="3.8" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F97316" strokeWidth="3.8" strokeDasharray={`${carbPct}, 100`} />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EAB308" strokeWidth="3.8" strokeDasharray={`${protPct}, 100`} strokeDashoffset={`${-carbPct}`} />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22C55E" strokeWidth="3.8" strokeDasharray={`${fatPct}, 100`} strokeDashoffset={`${-(carbPct + protPct)}`} />
                  </svg>
                ) : (
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#F1F5F9" strokeWidth="3.8" />
                  </svg>
                )}
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white block leading-none font-['Outfit']">{totalCal}</span>
                  <span className="text-[10px] font-bold text-slate-400 block mt-1">kcal eaten</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl">
                <div>
                  <span className="flex items-center justify-center gap-1 text-orange-500 font-bold"><span className="w-2 h-2 rounded-full bg-orange-500" /> Carbs</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5 block">{totalCarbs}g</span>
                </div>
                <div>
                  <span className="flex items-center justify-center gap-1 text-amber-500 font-bold"><span className="w-2 h-2 rounded-full bg-amber-500" /> Protein</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5 block">{totalProt}g</span>
                </div>
                <div>
                  <span className="flex items-center justify-center gap-1 text-green-500 font-bold"><span className="w-2 h-2 rounded-full bg-green-500" /> Fats</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs mt-0.5 block">{totalFat}g</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-medium mt-3">
              Updates in real-time as you order meals or log water.
            </p>
          </div>
        </div>

        {/* ── 6. MISSIONS & SMART GROCERY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Daily Missions */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-[2.2rem] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">Daily Health Check-in</h3>
                  <p className="text-xs text-slate-400 font-medium">Earn FitCoins & health streak rewards</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/40">
                  {missions.filter(m => m.completed).length}/{missions.length} completed
                </span>
              </div>

              <div className="space-y-2.5">
                {missions.map(mission => (
                  <div
                    key={mission.id}
                    onClick={() => toggleMission(mission.id)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                        mission.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                        {mission.completed && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs font-bold truncate ${
                        mission.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {mission.label}
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">+{mission.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Earned Rewards</span>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40 px-3 py-1 rounded-full flex items-center gap-1">
                +{missions.filter(m => m.completed).reduce((sum, m) => sum + m.xp, 0)} XP
                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              </span>
            </div>
          </div>

          {/* Smart Grocery Quick Corner */}
          <div className="lg:col-span-6 bg-white dark:bg-[#0B1F1A] border border-slate-200/80 dark:border-emerald-500/15 rounded-[2.2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white font-['Outfit']">Smart Grocery Store</h3>
                <p className="text-xs text-slate-400 font-medium">Organic ingredients & superfoods</p>
              </div>
              <button
                onClick={() => setCurrentView('smart-grocery')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Shop Store →
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2.5">
              {[
                { id: 'g1', name: 'Eggs', qty: '12 pcs', price: 90, tag: 'High Protein', image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=150' },
                { id: 'g2', name: 'Spinach', qty: '250g', price: 40, tag: 'Iron Rich', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150' },
                { id: 'g3', name: 'Chicken', qty: '500g', price: 240, tag: 'Lean Protein', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=150' },
                { id: 'g4', name: 'Oats', qty: '1 kg', price: 180, tag: 'High Fiber', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=150' },
                { id: 'g5', name: 'Almonds', qty: '200g', price: 220, tag: 'Healthy Fats', image: 'https://images.unsplash.com/photo-1508061252227-14902b0b2975?w=150' },
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOrderGrocery(item)}
                  className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-emerald-400 rounded-2xl p-2 text-center transition-all cursor-pointer group hover:scale-[1.03]"
                >
                  <div className="w-11 h-11 rounded-xl overflow-hidden mx-auto mb-1 border border-slate-200/60 dark:border-slate-700">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h5 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h5>
                  <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">₹{item.price}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Notification Popover */}
      <NotificationPopover
        isOpen={showNotificationsPopover}
        onClose={() => setShowNotificationsPopover(false)}
      />
    </div>
  );
};

export default UserDashboard;

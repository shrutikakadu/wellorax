import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BiometricScanner } from './BiometricScanner';
import {
  Search, Star, Plus, Flame, Activity, Sparkles,
  Heart, Check, Camera, Bell, MessageSquare, Send,
  ShieldCheck, Zap
} from 'lucide-react';

interface Mission {
  id: string;
  label: string;
  xp: number;
  completed: boolean;
}

const INITIAL_MISSIONS: Mission[] = [
  { id: 'water', label: 'Drink 3L Water', xp: 20, completed: true },
  { id: 'protein', label: 'Eat High Protein Lunch', xp: 30, completed: false },
  { id: 'steps', label: 'Walk 8000 Steps', xp: 20, completed: false },
  { id: 'fruits', label: 'Eat 2 Fruits', xp: 20, completed: false },
];

export const UserDashboard: React.FC = () => {
  const {
    healthProfile,
    addToCart,
    setCurrentView,
    setIsAIModalOpen,
    currentUser,
    openProfileModal,
    addGroceryToCart,
  } = useApp();

  const [dashboardSearch, setDashboardSearch] = useState('');
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [chatInput, setChatInput] = useState('');

  const toggleMission = (id: string) => {
    setMissions(prev =>
      prev.map(m => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAddRecommendation = () => {
    addToCart({
      id: 'rec-bowl-1',
      name: 'Grilled Chicken Quinoa Bowl',
      restaurantId: 'r-green-bites',
      restaurantName: 'Green Bites',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      price: 299,
      rating: 4.8,
      reviewCount: 220,
      prepTime: '15 min',
      macros: { calories: 450, protein: 35, carbs: 40, fat: 12, fiber: 8, sugar: 2, glycemicIndex: 32 },
      categories: ['High Protein', 'Heart Healthy'],
      aiMatchScore: 95,
      healthRiskScore: 'Low',
      aiExplanation: 'Perfect high protein, low sugar meal matching your targets.',
      ingredients: ['Chicken Breast', 'Quinoa', 'Broccoli', 'Avocado'],
      preparation: 'Freshly prepared by certified culinary partners.',
      isNutritionVerified: true,
      dietaryBadges: ['High Protein', 'Rich in Fiber']
    });
  };

  const handleOrderGrocery = (item: { id: string; name: string; price: number; image: string; tag: string }) => {
    addGroceryToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      unit: '1 pack',
      rating: 4.8,
      isOrganic: true,
      nutritionTag: item.tag,
      category: 'Protein'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-12 font-sans">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 space-y-6 pt-5">

        {/* ── HEADER SECTION ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight flex items-center gap-2">
              Good Morning, {currentUser?.name?.split(' ')[0] || healthProfile.name || 'Himanshu'}! 👋
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              You're doing great! 92% health score • Keep it up!
            </p>
          </div>

          {/* Search and Action Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-80 md:flex-none">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search for meals, restaurants, recipes..."
                value={dashboardSearch}
                onChange={e => setDashboardSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-sm transition-all font-medium"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">⌘K</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* AI Coach Message Quick Trigger */}
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* Profile Pill */}
            <button
              onClick={() => openProfileModal('account')}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                {currentUser?.name?.[0] || 'H'}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-800 block leading-none">{currentUser?.name?.split(' ')[0] || 'Himanshu'}</span>
                <span className="text-[9px] text-slate-400 font-medium">Premium User</span>
              </div>
            </button>
          </div>
        </div>

        {/* Biometric Scanner modal popup */}
        {showScannerModal && (
          <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-xl relative animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                🔬 BioScan™ Camera Vital Check
              </h3>
              <button
                onClick={() => setShowScannerModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Close ✕
              </button>
            </div>
            <BiometricScanner />
          </div>
        )}

        {/* ── ROW 1: HEALTH METRIC TOP STAT CARDS (6 Cards Horizontal) ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Health Score */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-emerald-500/20" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Health Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900">92</span>
                  <span className="text-[10px] text-slate-400 font-medium">/100</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] font-bold text-emerald-600">Excellent</span>
              <svg className="w-14 h-5 text-emerald-500" viewBox="0 0 50 15" fill="none">
                <path d="M2 12 Q 15 14, 25 8 T 48 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Card 2: Calories Left */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-orange-500/20" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Calories Left</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900">780</span>
                  <span className="text-[10px] text-slate-400 font-medium">kcal</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-slate-400 font-medium">of 2000 kcal</span>
              <svg className="w-14 h-5 text-orange-400" viewBox="0 0 50 15" fill="none">
                <path d="M2 10 Q 12 14, 25 6 T 48 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Card 3: Protein Left */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Zap className="w-4 h-4 fill-amber-500/20" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Protein Left</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900">52</span>
                  <span className="text-[10px] text-slate-400 font-medium">g</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-slate-400 font-medium">of 104 g</span>
              <svg className="w-14 h-5 text-amber-400" viewBox="0 0 50 15" fill="none">
                <path d="M2 8 Q 15 4, 30 11 T 48 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Card 4: Water Intake */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Water Intake</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900">2.1</span>
                  <span className="text-[10px] text-slate-400 font-medium">L</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-slate-400 font-medium">of 3 L</span>
              <svg className="w-14 h-5 text-blue-400" viewBox="0 0 50 15" fill="none">
                <path d="M2 12 Q 12 5, 25 10 T 48 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Card 5: Steps Today */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Steps Today</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900">6,842</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-slate-400 font-medium">Goal: 8,000</span>
              <svg className="w-14 h-5 text-green-500" viewBox="0 0 50 15" fill="none">
                <path d="M2 13 Q 15 10, 30 5 T 48 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Card 6: Sleep */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Sleep</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-extrabold text-slate-900">7h 20m</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] font-bold text-purple-600">Good</span>
              <svg className="w-14 h-5 text-purple-400" viewBox="0 0 50 15" fill="none">
                <path d="M2 9 Q 12 4, 25 8 T 48 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── ROW 2: MAIN WORKSPACE GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Today's Meal Timeline (Col 3) */}
          <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900">Today's Meal Timeline</h3>
                <button
                  onClick={() => setCurrentView('meal-planner')}
                  className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                >
                  View Plan &rarr;
                </button>
              </div>

              <div className="space-y-4">
                {/* Breakfast */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 shrink-0 mt-1" />
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">Breakfast</span>
                      <span className="text-[10px] font-medium text-slate-400">8:00 AM</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">Oats Pancake with Fruits</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">450 kcal</span>
                      <Check className="w-3.5 h-3.5 text-white bg-emerald-500 rounded-full p-0.5" />
                    </div>
                  </div>
                </div>

                {/* Lunch */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-50 shrink-0 mt-1" />
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">Lunch</span>
                      <span className="text-[10px] font-medium text-slate-400">1:00 PM</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">Quinoa Salad Bowl</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">650 kcal</span>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 bg-amber-100" />
                    </div>
                  </div>
                </div>

                {/* Dinner */}
                <div className="flex items-start gap-3 relative">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-100 shrink-0 mt-1" />
                  <div className="min-w-0 flex-1 border-b border-slate-100 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">Dinner</span>
                      <span className="text-[10px] font-medium text-slate-400">7:30 PM</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">Grilled Chicken with Veggies</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">550 kcal</span>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                    </div>
                  </div>
                </div>

                {/* Snacks */}
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-100 shrink-0 mt-1" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">Snacks</span>
                      <span className="text-[10px] font-medium text-slate-400">10:30 AM</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5">Greek Yogurt with Nuts</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">250 kcal</span>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Intake Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <span className="text-slate-600">Total Intake</span>
                <span className="text-slate-900">1350 <span className="text-slate-400 font-medium">/ 2000 kcal</span></span>
                <span className="text-emerald-600 font-extrabold">67%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '67%' }} />
              </div>
            </div>
          </div>

          {/* AI Recommendation for You (Col 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">AI Recommendation for You</h3>
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-700"
                >
                  Why this meal? &rarr;
                </button>
              </div>

              {/* Recommendation Card Content */}
              <div className="flex gap-4 items-stretch mb-4">
                <div className="w-36 h-36 rounded-2xl overflow-hidden shrink-0 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
                    alt="Grilled Chicken Quinoa Bowl"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                    95<span className="text-[8px] font-medium">/100</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                      Grilled Chicken Quinoa Bowl
                    </h4>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> High Protein
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Low Sugar
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Good for Heart
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Rich in Fiber
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Matches your goals
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Confidence meter */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                <span>Confidence</span>
                <span className="text-emerald-600 font-extrabold">96%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96%' }} />
              </div>

              <button
                onClick={handleAddRecommendation}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add to Meal Plan / Order
              </button>
            </div>
          </div>

          {/* Nutrition Overview Donut Chart (Col 2.5) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-extrabold text-slate-900">Nutrition Overview</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">This Week ▾</span>
              </div>

              {/* Donut Graphic */}
              <div className="relative w-36 h-36 mx-auto my-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background track */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F1F5F9"
                    strokeWidth="3.8"
                  />
                  {/* Carbs 40% */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="3.8"
                    strokeDasharray="40, 100"
                  />
                  {/* Protein 30% */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#EAB308"
                    strokeWidth="3.8"
                    strokeDasharray="30, 100"
                    strokeDashoffset="-40"
                  />
                  {/* Fats 20% */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="3.8"
                    strokeDasharray="20, 100"
                    strokeDashoffset="-70"
                  />
                  {/* Fiber 10% */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3.8"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-90"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-base font-black text-slate-900 block leading-none">1,350</span>
                  <span className="text-[9px] font-bold text-slate-400 block mt-0.5">kcal Consumed</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-[11px] font-medium text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> Carbs</span>
                  <span className="font-bold text-slate-800">40% (135g)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Protein</span>
                  <span className="font-bold text-slate-800">30% (101g)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /> Fats</span>
                  <span className="font-bold text-slate-800">20% (30g)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Fiber</span>
                  <span className="font-bold text-slate-800">10% (25g)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('nutrition-dashboard')}
              className="text-[11px] font-bold text-emerald-600 hover:underline mt-3 text-center block w-full"
            >
              Go to Nutrition Dashboard &rarr;
            </button>
          </div>

          {/* AI Health Coach Chat Widget (Col 3) */}
          <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> AI Health Coach
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Your personal AI nutritionist</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              {/* Chat bubble */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-2 mb-3">
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Good job! You're on track with your nutrition goals. 🎯
                </p>
                <p className="text-[11px] text-slate-500 leading-snug">
                  ▾ Try adding more protein to your dinner for better results.
                </p>
              </div>
            </div>

            {/* Quick Ask Input */}
            <div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && chatInput.trim()) {
                      setIsAIModalOpen(true);
                    }
                  }}
                  className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
                />
                <button
                  onClick={() => setIsAIModalOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

              {/* Food Scanner Quick Card */}
              <div className="mt-4 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">Food Scanner</h4>
                  <p className="text-[9px] text-slate-500 font-medium">Scan food and get instant info</p>
                  <button
                    onClick={() => setShowScannerModal(true)}
                    className="mt-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" /> Scan Now
                  </button>
                </div>
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-emerald-200">
                  <img
                    src="https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150"
                    alt="Scan food"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ROW 3: SECONDARY METRICS GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* AI Health Forecast (Col 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">AI Health Forecast</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Based on your current habits</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">30 Days ▾</span>
              </div>

              {/* Metric indicators */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Weight</span>
                  <span className="text-xs font-extrabold text-emerald-600 block">-1.8 kg</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Energy</span>
                  <span className="text-xs font-extrabold text-emerald-600 block">+18 %</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Protein</span>
                  <span className="text-xs font-extrabold text-emerald-600 block">+14 %</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 block">Health Score</span>
                  <span className="text-xs font-extrabold text-emerald-600 block">95<span className="text-[8px] text-slate-400">/100</span></span>
                </div>
              </div>

              {/* Trend Chart */}
              <div className="relative h-28 w-full mt-2">
                <svg className="w-full h-full" viewBox="0 0 300 80" fill="none">
                  <path
                    d="M 0,60 Q 75,50 150,30 T 300,10"
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0,60 Q 75,50 150,30 T 300,10 L 300,80 L 0,80 Z"
                    fill="url(#emeraldGradient)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16A34A" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                  </defs>
                  <circle cx="300" cy="10" r="4" fill="#16A34A" />
                </svg>
              </div>

              <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1 mt-1">
                <span>Today</span>
                <span>7 Days</span>
                <span>15 Days</span>
                <span>30 Days</span>
              </div>
            </div>
          </div>

          {/* Daily Mission (Col 3) */}
          <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Daily Mission</h3>
                <span className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer">View All &rarr;</span>
              </div>

              <div className="space-y-2.5">
                {missions.map(mission => (
                  <div
                    key={mission.id}
                    onClick={() => toggleMission(mission.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        mission.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                      }`}>
                        {mission.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span className={`text-xs font-medium truncate ${
                        mission.completed ? 'line-through text-slate-400' : 'text-slate-700'
                      }`}>
                        {mission.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 shrink-0">+{mission.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-3">
              <span className="text-xs font-bold text-slate-600">Total Reward</span>
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                +50 XP <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              </span>
            </div>
          </div>

          {/* Weekly Health Report (Col 2.5) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Weekly Health Report</h3>
                <span className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer">View Full Report</span>
              </div>

              {/* Grades Row */}
              <div className="grid grid-cols-4 gap-1.5 my-3 text-center">
                <div>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-black text-xs mx-auto">
                    A+
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">Protein</span>
                </div>
                <div>
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-black text-xs mx-auto">
                    A
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">Water</span>
                </div>
                <div>
                  <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-500 border border-orange-200 flex items-center justify-center font-black text-xs mx-auto">
                    B
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">Sleep</span>
                </div>
                <div>
                  <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-black text-xs mx-auto">
                    C+
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">Veggies</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-600">Overall Health Score</span>
                <span className="text-slate-900">95 <span className="text-slate-400 text-[10px]">/100</span></span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
          </div>

          {/* Achievements (Col 2.5) */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Achievements</h3>
                <span className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer">View All &rarr;</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    7
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-900 leading-tight">7 Day Healthy Streak</h5>
                    <p className="text-[9px] text-slate-400 font-medium">Keep it up!</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    🏆
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Protein Master</h5>
                    <p className="text-[9px] text-slate-400 font-medium">Achieved 100g protein</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    💧
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Hydration Hero</h5>
                    <p className="text-[9px] text-slate-400 font-medium">Drank 3L water in a day</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-green-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                    🥗
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-900 leading-tight">Healthy Eater</h5>
                    <p className="text-[9px] text-slate-400 font-medium">50 healthy meals ordered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── ROW 4: GROCERY & RESTAURANT DISCOVERY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Smart Grocery List (Col 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Smart Grocery List</h3>
                <p className="text-[10px] text-slate-400 font-medium">Based on your meal plan</p>
              </div>
              <button
                onClick={() => setCurrentView('smart-grocery')}
                className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
              >
                Order All &rarr;
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'g1', name: 'Eggs', qty: '12 pcs', price: 90, tag: 'High Protein', image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=150' },
                { id: 'g2', name: 'Spinach', qty: '250g', price: 40, tag: 'Iron Rich', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=150' },
                { id: 'g3', name: 'Chicken Breast', qty: '500g', price: 240, tag: 'Lean Protein', image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=150' },
                { id: 'g4', name: 'Oats', qty: '1 kg', price: 180, tag: 'High Fiber', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=150' },
                { id: 'g5', name: 'Almonds', qty: '200g', price: 220, tag: 'Healthy Fats', image: 'https://images.unsplash.com/photo-1508061252227-14902b0b2975?w=150' },
              ].map(item => (
                <div
                  key={item.id}
                  onClick={() => handleOrderGrocery(item)}
                  className="bg-slate-50 border border-slate-100 hover:border-emerald-300 rounded-2xl p-2 text-center transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden mx-auto mb-1 border border-slate-200/60">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <h5 className="text-[10px] font-bold text-slate-800 truncate">{item.name}</h5>
                  <span className="text-[8px] text-slate-400 block font-medium">{item.qty}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Healthy Restaurants (Col 5) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Top Healthy Restaurants</h3>
                <p className="text-[10px] text-slate-400 font-medium">Near You</p>
              </div>
              <button
                onClick={() => setCurrentView('marketplace')}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                View All &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Green Bites', tags: 'Healthy • Organic', time: '20-30 min', match: '97% Match', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200' },
                { name: 'FitFuel Kitchen', tags: 'High Protein', time: '20-30 min', match: '95% Match', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200' },
                { name: 'Salad Stop', tags: 'Low Carb • Healthy', time: '20-30 min', match: '94% Match', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200' },
                { name: 'Lean Bowl', tags: 'High Protein', time: '20-30 min', match: '93% Match', img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200' },
              ].map((rest, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentView('marketplace')}
                  className="p-2 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-300 transition-all cursor-pointer flex gap-2.5 items-center"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/60">
                    <img src={rest.img} alt={rest.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-slate-900 truncate">{rest.name}</h5>
                    <p className="text-[9px] text-slate-400 font-medium truncate">{rest.tags}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] text-slate-400 font-medium">{rest.time}</span>
                      <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-50 px-1 rounded">
                        {rest.match}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders (Col 3) */}
          <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Recent Orders</h3>
              <button
                onClick={() => setCurrentView('my-orders')}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                View All &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Grilled Chicken Bowl', place: 'Green Bites', time: 'Today, 1:30 PM', price: '₹299', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100' },
                { name: 'Quinoa Salad', place: 'Salad Stop', time: 'Today, 12:15 PM', price: '₹249', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100' },
                { name: 'Protein Smoothie', place: 'FitFuel Kitchen', time: 'Yesterday, 8:30 AM', price: '₹199', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=100' },
              ].map((order, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                      <img src={order.img} alt={order.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate leading-tight">{order.name}</span>
                      <span className="text-[9px] text-slate-400 block">{order.place} • {order.time}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-slate-900 block">{order.price}</span>
                    <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">Delivered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDashboard;

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Meal } from '../../types';
import {
  Search, Star, Clock, Plus, Minus, ShieldCheck, Leaf,
  Bike, SlidersHorizontal, X, Sparkles,
  AlertTriangle, ShieldAlert, Eye, EyeOff
} from 'lucide-react';
import { AIFoodWarningModal, analyzeFoodRisk } from './AIFoodWarningModal';
import type { FoodRiskWarning } from './AIFoodWarningModal';

// ─── Food Category Chips (Zomato-Style) ───────────────────────────────────────

interface FoodCategory {
  id: string;
  label: string;
  emoji: string;
  filterKeywords: string[];
}

const FOOD_CATEGORIES: FoodCategory[] = [
  { id: 'all',       label: 'All Foods',    emoji: '🌟', filterKeywords: [] },
  { id: 'healthy',   label: 'Healthy Bowls',emoji: '🥗', filterKeywords: ['healthy', 'salad', 'bowl', 'pcos', 'diabetic', 'low gi', 'keto', 'vegan'] },
  { id: 'pizza',     label: 'Pizza',        emoji: '🍕', filterKeywords: ['pizza', 'italian', 'flatbread'] },
  { id: 'burger',    label: 'Burgers',      emoji: '🍔', filterKeywords: ['burger', 'sandwich', 'wrap', 'falafel'] },
  { id: 'biryani',   label: 'Biryani',      emoji: '🍛', filterKeywords: ['biryani', 'rice', 'pilaf', 'pulao', 'thali'] },
  { id: 'chinese',   label: 'Chinese',      emoji: '🥡', filterKeywords: ['noodles', 'chinese', 'stir fry', 'fried rice', 'dumpling', 'momos'] },
  { id: 'soup',      label: 'Soups',        emoji: '🍲', filterKeywords: ['soup', 'stew', 'broth', 'lentil'] },
  { id: 'protein',   label: 'High Protein', emoji: '💪', filterKeywords: ['protein', 'paneer', 'egg', 'chicken', 'salmon', 'tofu'] },
  { id: 'breakfast', label: 'Breakfast',    emoji: '🌅', filterKeywords: ['breakfast', 'oats', 'smoothie', 'toast', 'scramble', 'pancake'] },
  { id: 'keto',      label: 'Keto',         emoji: '🥑', filterKeywords: ['keto', 'low carb', 'cauliflower', 'avocado', 'fat bomb'] },
  { id: 'drinks',    label: 'Juices & Shakes', emoji: '🥤', filterKeywords: ['juice', 'smoothie', 'shake', 'drink', 'milk', 'lassi'] },
  { id: 'snacks',    label: 'Snacks',       emoji: '🍘', filterKeywords: ['snack', 'energy ball', 'chia', 'pudding', 'bar'] },
  { id: 'dessert',   label: 'Desserts',     emoji: '🍰', filterKeywords: ['cake', 'dessert', 'sweet', 'ice cream', 'kheer', 'gulab'] },
];

// Food App Offer Banners
const FOOD_OFFERS = [
  { id: '1', title: '50% OFF Health Bowls', desc: 'Code: NUTRI50 · On all PCOS & Diabetic safe meals', bg: 'from-[#034B36] to-emerald-800', tag: 'HEALTH SPECIAL', filterCategory: 'healthy' },
  { id: '2', title: 'Guilt-Free Low GI Pizzas', desc: 'Zero blood sugar spike · Made with almond & cauliflower crust', bg: 'from-amber-600 to-orange-700', tag: 'NEW CRAVING', filterCategory: 'pizza' },
  { id: '3', title: '15-Min Express Delivery', desc: 'Hot & fresh from certified clinical kitchens near you', bg: 'from-blue-700 to-indigo-900', tag: 'SUPERFAST', sortBy: 'prep-time' as SortOption },
];

// ─── Sort Options ─────────────────────────────────────────────────────────────
type SortOption = 'ai-match' | 'rating' | 'price-low' | 'price-high' | 'prep-time';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'ai-match',    label: 'AI Health Match Score' },
  { value: 'rating',      label: 'Top Rated Dishes' },
  { value: 'price-low',   label: 'Price: Low to High' },
  { value: 'price-high',  label: 'Price: High to Low' },
  { value: 'prep-time',   label: 'Fastest Delivery' },
];

// ─── Meal Card Component ──────────────────────────────────────────────────────
interface MealCardProps {
  meal: Meal;
  qty: number;
  onAdd: () => void;
  onRemove: () => void;
  onDetail: () => void;
  healthRisk: FoodRiskWarning | null;
}

const MealCard: React.FC<MealCardProps> = ({ meal, qty, onAdd, onRemove, onDetail, healthRisk }) => {
  const isRisky = !!healthRisk;
  const isBlock = healthRisk?.level === 'block';

  return (
    <div className={`group bg-white dark:bg-[#0D1F17] rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${isBlock ? 'border-red-500/50 dark:border-red-500/40 ring-1 ring-red-500/20' : isRisky ? 'border-orange-400/50 ring-1 ring-orange-400/20' : 'border-slate-200 dark:border-emerald-500/10'}`}>
      
      <div>
        {/* Image & Badges */}
        <div className="relative h-52 overflow-hidden cursor-pointer" onClick={onDetail}>
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            {meal.isNutritionVerified && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-black text-emerald-800 shadow-md">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Clinical Verified
              </span>
            )}
            {meal.aiMatchScore >= 90 && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-[10px] font-black text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" /> {meal.aiMatchScore}% Bio-Match
              </span>
            )}
          </div>

          {/* Top Right Unhealthy Warning Badge */}
          {isRisky && (
            <div className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-black shadow-xl animate-pulse
              ${isBlock ? 'bg-red-600 text-white border border-white/30' : 'bg-orange-500 text-white border border-white/30'}`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isBlock ? 'UNHEALTHY FOR YOU' : 'HEALTH CAUTION'}</span>
            </div>
          )}

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <p className="font-extrabold text-xs text-emerald-300 drop-shadow">{meal.restaurantName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-center gap-1 bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-black">
                  <Star className="w-3 h-3 fill-slate-950" /> {meal.rating}
                </div>
                <span className="text-[10px] text-slate-200">({meal.reviewCount}+ orders)</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/10">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>{meal.prepTime}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3">
          
          {/* Name & Veg Tag */}
          <div className="flex items-start gap-2">
            <div className={`mt-1 w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${meal.isVeg !== false ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'border-red-600 bg-red-50 dark:bg-red-950/40'}`}>
              <div className={`w-2 h-2 rounded-full ${meal.isVeg !== false ? 'bg-emerald-600' : 'bg-red-600'}`} />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-['Outfit']" onClick={onDetail}>
              {meal.name}
            </h3>
          </div>

          {/* HEALTH WARNING NOTIFICATION STRIP ON CARD */}
          {isRisky && (
            <div className={`p-2.5 rounded-xl border text-[11px] font-bold flex items-start gap-2 ${isBlock ? 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300' : 'bg-orange-500/10 border-orange-500/25 text-orange-700 dark:text-orange-300'}`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block uppercase tracking-wider text-[9px]">{healthRisk.reason}</span>
                <span className="text-[10px] leading-tight font-semibold block mt-0.5">{healthRisk.detail.slice(0, 85)}...</span>
              </div>
            </div>
          )}

          {/* Macros Bar */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl text-center text-[10px]">
            <div>
              <span className="text-slate-400 font-semibold block">Calories</span>
              <span className="font-black text-slate-900 dark:text-white">{meal.macros.calories} kcal</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Protein</span>
              <span className="font-black text-blue-600 dark:text-blue-400">{meal.macros.protein}g</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Glycemic Index</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">{meal.macros.glycemicIndex || 'GI 32'}</span>
            </div>
          </div>

          {/* Dietary Badges */}
          <div className="flex flex-wrap gap-1">
            {meal.dietaryBadges.slice(0, 3).map(b => (
              <span key={b} className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/15">
                {b}
              </span>
            ))}
          </div>

        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-2 flex items-center justify-between">
        <div>
          <span className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">₹{meal.price}</span>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
            <Bike className="w-3 h-3" />
            <span>Free Express Delivery</span>
          </div>
        </div>

        {qty === 0 ? (
          <button
            onClick={onAdd}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-2xl font-extrabold text-xs transition-all hover:scale-105 shadow-md ${
              isBlock
                ? 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20'
                : isRisky
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isRisky && <AlertTriangle className="w-3.5 h-3.5" />}
            <Plus className="w-4 h-4" />
            <span>{isBlock ? 'Warning' : 'ADD'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-2xl p-1 shadow-md">
            <button onClick={onRemove} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-black px-1">{qty}</span>
            <button onClick={onAdd} className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Marketplace Component ───────────────────────────────────────────────

export const Marketplace: React.FC = () => {
  const {
    searchQuery, setSearchQuery,
    setSelectedMealForDetail,
    addToCart, removeFromCart, cart,
    setIsCartOpen,
    healthProfile,
    meals,
    isLoadingMeals,
  } = useApp();

  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('ai-match');
  const [vegOnly, setVegOnly] = useState(false);
  const [hideUnhealthy, setHideUnhealthy] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Warning modal & toast state
  const [pendingMeal, setPendingMeal] = useState<Meal | null>(null);
  const [activeWarning, setActiveWarning] = useState<FoodRiskWarning | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const getCartQty = (mealId: string) => cart.find(i => i.meal.id === mealId)?.quantity || 0;
  const totalCartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const totalCartPrice = cart.reduce((s, i) => s + i.meal.price * i.quantity, 0);

  // Active Category object
  const activeCategory = FOOD_CATEGORIES.find(c => c.id === activeCategoryId) || FOOD_CATEGORIES[0];

  // Compute risks for all meals based on user's health profile & vitals
  const mealRisks = useMemo(() => {
    const map = new Map<string, FoodRiskWarning | null>();
    meals.forEach(meal => {
      map.set(meal.id, analyzeFoodRisk(meal, healthProfile.diseases, {
        bloodPressureSystolic:  healthProfile.bloodPressureSystolic,
        bloodPressureDiastolic: healthProfile.bloodPressureDiastolic,
        bloodSugarFasting:      healthProfile.bloodSugarFasting,
        cholesterolTotal:       healthProfile.cholesterolTotal,
        heartRateBpm:           healthProfile.heartRateBpm,
      }));
    });
    return map;
  }, [meals, healthProfile]);

  // Filtered & Sorted meals
  const filteredAndSorted = useMemo(() => {
    let result = [...meals];

    // Category filter
    if (activeCategory.filterKeywords.length > 0) {
      result = result.filter(meal => {
        const haystack = `${meal.name} ${meal.restaurantName} ${meal.dietaryBadges.join(' ')} ${meal.categories.join(' ')} ${meal.aiExplanation}`.toLowerCase();
        return activeCategory.filterKeywords.some(kw => haystack.includes(kw));
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(meal =>
        meal.name.toLowerCase().includes(q) ||
        meal.restaurantName.toLowerCase().includes(q) ||
        meal.dietaryBadges.some(b => b.toLowerCase().includes(q)) ||
        meal.categories.some(c => c.toLowerCase().includes(q)) ||
        meal.ingredients.some(i => i.toLowerCase().includes(q)) ||
        meal.aiExplanation.toLowerCase().includes(q)
      );
    }

    // Veg filter
    if (vegOnly) {
      result = result.filter(meal => meal.isVeg !== false);
    }

    // Hide Unhealthy filter
    if (hideUnhealthy) {
      result = result.filter(meal => !mealRisks.get(meal.id));
    }

    // Sort
    switch (sortBy) {
      case 'rating':     result.sort((a, b) => b.rating - a.rating); break;
      case 'price-low':  result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'prep-time':  result.sort((a, b) => parseInt(a.prepTime) - parseInt(b.prepTime)); break;
      default:           result.sort((a, b) => b.aiMatchScore - a.aiMatchScore); break;
    }

    return result;
  }, [meals, activeCategoryId, searchQuery, vegOnly, hideUnhealthy, sortBy, mealRisks]);

  // Healthy alternatives for warning modal
  const getAlternatives = (blockedMeal: Meal): Meal[] =>
    meals
      .filter(m => m.id !== blockedMeal.id && !mealRisks.get(m.id))
      .sort((a, b) => b.aiMatchScore - a.aiMatchScore)
      .slice(0, 3);

  // Handle Add to Cart
  const handleAddToCart = (meal: Meal) => {
    const risk = mealRisks.get(meal.id);
    if (risk) {
      setPendingMeal(meal);
      setActiveWarning(risk);
      setToastMessage(`⚠️ HEALTH NOTIFICATION: ${meal.name} is flagged for ${risk.reason}`);
      setTimeout(() => setToastMessage(null), 5000);
    } else {
      addToCart(meal);
    }
  };

  const handleWarningProceed = () => {
    if (pendingMeal) addToCart(pendingMeal);
    setPendingMeal(null);
    setActiveWarning(null);
  };

  const handleWarningCancel = () => {
    setPendingMeal(null);
    setActiveWarning(null);
  };

  const handleSelectAlternative = (meal: Meal) => {
    setPendingMeal(null);
    setActiveWarning(null);
    addToCart(meal);
  };

  const handleOfferClick = (offer: typeof FOOD_OFFERS[number]) => {
    if (offer.filterCategory) {
      setActiveCategoryId(offer.filterCategory);
    }
    if (offer.sortBy) {
      setSortBy(offer.sortBy);
      setShowFilters(true);
    }
    // Scroll to items
    setTimeout(() => {
      document.querySelector('[class*="FOOD_ITEMS_GRID"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const totalRiskyCount = Array.from(mealRisks.values()).filter(Boolean).length;
  const userHasHealthDetails = !!(healthProfile.bloodPressureSystolic || healthProfile.bloodSugarFasting || healthProfile.diseases.length > 0);

  return (
    <div className="min-h-screen bg-[#F4F7F5] dark:bg-[#07130F] pb-24">

      {/* ── TOP REAL-TIME HEALTH NOTIFICATION TOAST BANNER ── */}
      {toastMessage && (
        <div className="sticky top-16 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-xl animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── SEARCH & FILTER HEADER BAR ── */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-[#091F17]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-emerald-500/10 px-4 lg:px-6 py-4 space-y-3 shadow-sm">
        
        {/* Search Row */}
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes, restaurants, healthy bowls, pizza..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pure Veg Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-4 py-3 rounded-2xl border text-xs font-extrabold transition-all shrink-0 ${vegOnly ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
          >
            <Leaf className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Pure Veg</span>
          </button>

          {/* Hide Unhealthy Switch */}
          {userHasHealthDetails && (
            <button
              onClick={() => setHideUnhealthy(!hideUnhealthy)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-extrabold transition-all shrink-0 ${hideUnhealthy ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/20'}`}
            >
              {hideUnhealthy ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden md:inline">{hideUnhealthy ? 'Showing Safe Only' : 'Hide Unhealthy for Me'}</span>
            </button>
          )}

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}
          >
            <SlidersHorizontal className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="max-w-7xl mx-auto pt-2 pb-1 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Sort Dishes:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-2 focus:outline-none"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-emerald-600 dark:text-emerald-400">{filteredAndSorted.length}</strong> items
            </p>
          </div>
        )}

        {/* Zomato-Style Category Chips */}
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {FOOD_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap text-xs font-extrabold transition-all shrink-0 ${
                activeCategoryId === cat.id
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="text-base">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-8">

        {/* PROMO OFFER BANNERS (Zomato/Swiggy Style) */}
        {activeCategoryId === 'all' && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FOOD_OFFERS.map(offer => (
              <div key={offer.id} className={`p-5 rounded-3xl bg-gradient-to-r ${offer.bg} text-white shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden group cursor-pointer`} onClick={() => handleOfferClick(offer)}>
                <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-28 h-28 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-[9px] font-black tracking-wider uppercase border border-white/20">
                    {offer.tag}
                  </span>
                  <h4 className="text-lg font-black mt-2 font-['Outfit']">{offer.title}</h4>
                  <p className="text-xs text-white/80 mt-1 font-medium">{offer.desc}</p>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-xs font-extrabold text-white transition-colors w-fit">
                  Order Now <span className="text-amber-300">→</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* HEALTH GUARD NOTIFICATION BANNER */}
        {userHasHealthDetails && totalRiskyCount > 0 && (
          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  AI Health Guard Active • {healthProfile.diseases.join(', ') || 'Vitals Logged'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Wellora AI flagged <strong>{totalRiskyCount} items</strong> in the menu that conflict with your blood pressure/glycemic limits. Look for the ⚠️ warning badges.
                </p>
              </div>
            </div>

            <button
              onClick={() => setHideUnhealthy(!hideUnhealthy)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all ${hideUnhealthy ? 'bg-emerald-600 text-white' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
            >
              {hideUnhealthy ? 'Show All Foods' : 'Hide Unhealthy Foods (1-Click)'}
            </button>
          </div>
        )}

        {/* SECTION TITLE */}
        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">
              {activeCategory.emoji} {activeCategory.label}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {filteredAndSorted.length} items available · Certified Clinical Kitchens
            </p>
          </div>
        </div>

        {/* FOOD ITEMS GRID */}
        {isLoadingMeals ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#0D1F17] rounded-3xl border border-slate-200 dark:border-slate-800 h-80 animate-pulse" />
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#0D1F17] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <div className="text-5xl">🥗</div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">No items found</h3>
            <p className="text-xs text-slate-400">Try clearing filters or switching food categories.</p>
            <button onClick={() => { setActiveCategoryId('all'); setSearchQuery(''); setHideUnhealthy(false); }} className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs">
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSorted.map(meal => (
              <MealCard
                key={meal.id}
                meal={meal}
                qty={getCartQty(meal.id)}
                onAdd={() => handleAddToCart(meal)}
                onRemove={() => removeFromCart(meal.id)}
                onDetail={() => setSelectedMealForDetail(meal)}
                healthRisk={mealRisks.get(meal.id) ?? null}
              />
            ))}
          </div>
        )}
      </div>

      {/* STICKY CART BAR */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-40">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between px-6 py-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 text-white shadow-2xl shadow-emerald-600/40 hover:scale-[1.01] transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-2xl bg-white/20 flex items-center justify-center font-black text-sm">{totalCartCount}</span>
                <span className="font-extrabold text-sm">{totalCartCount} item{totalCartCount > 1 ? 's' : ''} added to cart</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-black text-base">₹{totalCartPrice}</span>
                <span className="px-3 py-1.5 rounded-xl bg-white/20 text-xs font-black uppercase tracking-wider">View Cart →</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* AI FOOD WARNING MODAL */}
      {activeWarning && pendingMeal && (
        <AIFoodWarningModal
          warning={activeWarning}
          meal={pendingMeal}
          alternatives={getAlternatives(pendingMeal)}
          onProceed={handleWarningProceed}
          onCancel={handleWarningCancel}
          onSelectAlternative={handleSelectAlternative}
        />
      )}
    </div>
  );
};

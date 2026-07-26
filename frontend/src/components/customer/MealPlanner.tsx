import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { mealPlansService } from '../../services';
import {
  Calendar as CalendarIcon,
  RotateCw,
  ShoppingCart,
  Loader2
} from 'lucide-react';

interface MealSlot {
  slotId: string;
  dayOfWeek: number;
  mealType: string;
  meal: {
    id: string;
    name: string;
    imageUrl: string;
    calories: number;
    protein: number;
  } | null;
  customName?: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function adaptSlot(s: any): MealSlot {
  return {
    slotId: s.id,
    dayOfWeek: s.dayOfWeek,
    mealType: s.mealType,
    meal: s.meal ? {
      id: s.meal.id,
      name: s.meal.name,
      imageUrl: s.meal.imageUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      calories: s.meal.calories || 0,
      protein: s.meal.protein || 0,
    } : null,
    customName: s.customName,
  };
}

import { MOCK_MEALS } from '../../data/mockData';

const DEFAULT_WEEKLY_PLAN: Record<number, Record<string, MealSlot>> = {};
for (let d = 0; d < 7; d++) {
  DEFAULT_WEEKLY_PLAN[d] = {
    Breakfast: { slotId: `d${d}-b`, dayOfWeek: d, mealType: 'Breakfast', meal: { id: MOCK_MEALS[0].id, name: MOCK_MEALS[0].name, imageUrl: MOCK_MEALS[0].image, calories: MOCK_MEALS[0].macros.calories, protein: MOCK_MEALS[0].macros.protein } },
    Lunch:     { slotId: `d${d}-l`, dayOfWeek: d, mealType: 'Lunch',     meal: { id: MOCK_MEALS[1].id, name: MOCK_MEALS[1].name, imageUrl: MOCK_MEALS[1].image, calories: MOCK_MEALS[1].macros.calories, protein: MOCK_MEALS[1].macros.protein } },
    Dinner:    { slotId: `d${d}-d`, dayOfWeek: d, mealType: 'Dinner',    meal: { id: MOCK_MEALS[2].id, name: MOCK_MEALS[2].name, imageUrl: MOCK_MEALS[2].image, calories: MOCK_MEALS[2].macros.calories, protein: MOCK_MEALS[2].macros.protein } },
    Snack:     { slotId: `d${d}-s`, dayOfWeek: d, mealType: 'Snack',     meal: { id: MOCK_MEALS[3].id, name: MOCK_MEALS[3].name, imageUrl: MOCK_MEALS[3].image, calories: MOCK_MEALS[3].macros.calories, protein: MOCK_MEALS[3].macros.protein } },
  };
}

export const MealPlanner: React.FC = () => {
  const { setCurrentView, healthProfile } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<Record<number, Record<string, MealSlot>>>(DEFAULT_WEEKLY_PLAN);

  const fetchPlan = async () => {
    try {
      const res = await mealPlansService.getWeekly();
      if (res.success && res.data) {
        const plan = res.data as any;
        const slots: MealSlot[] = (plan.slots || []).map(adaptSlot);
        if (slots.length > 0) {
          const grouped: Record<number, Record<string, MealSlot>> = {};
          for (let d = 0; d < 7; d++) grouped[d] = {};
          slots.forEach(s => {
            if (grouped[s.dayOfWeek]) grouped[s.dayOfWeek][s.mealType] = s;
          });
          setWeeklyPlan(grouped);
        }
      }
    } catch (err) {
      console.warn('Meal plan fetch failed, using default plan:', err);
    }
  };

  useEffect(() => { fetchPlan(); }, []);

  const handleRegenerate = async () => {
    try {
      setIsGenerating(true);
      await mealPlansService.generate();
      await fetchPlan();
    } catch (err) {
      console.warn('Generate failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const dayTotals = (dayIdx: number) => {
    const daySlots = weeklyPlan[dayIdx] || {};
    let cal = 0, pro = 0;
    Object.values(daySlots).forEach(s => {
      if (s.meal) { cal += s.meal.calories; pro += s.meal.protein; }
    });
    return { cal, pro };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Top Planner Bar */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Autonomous Weekly Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
            AI Weekly Meal Planner
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Auto-tuned for {healthProfile.name} ({healthProfile.fitnessGoal} &bull; {healthProfile.dailyCalorieTarget} kcal).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
          >
            <RotateCw className={`w-4 h-4 text-emerald-500 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Week'}</span>
          </button>

          <button
            onClick={() => setCurrentView('smart-grocery')}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Export to Smart Grocery</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        /* Days Calendar Cards */
        <div className="space-y-6">
          {DAYS.map((day, dayIdx) => {
            const totals = dayTotals(dayIdx);
            const daySlots = weeklyPlan[dayIdx] || {};
            return (
              <div
                key={dayIdx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all space-y-4"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">{day}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <span>Calories: <strong className="text-orange-500">{totals.cal} kcal</strong></span>
                    <span>Protein: <strong className="text-emerald-500">{totals.pro}g</strong></span>
                  </div>
                </div>

                {/* 4 Meals Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MEAL_TYPES.map((mt, mtIdx) => {
                    const slot = daySlots[mt];
                    const meal = slot?.meal;
                    const times = ['8:00 AM', '1:00 PM', '7:30 PM', '4:30 PM'];
                    return (
                      <div key={mt} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 space-y-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
                          <span>{mt === 'Snack' ? 'Evening Snack' : mt}</span>
                          <span>{times[mtIdx]}</span>
                        </div>
                        {meal ? (
                          <div className="flex items-center gap-3">
                            <img src={meal.imageUrl} alt={meal.name} className="w-14 h-14 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{meal.name}</h4>
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{meal.calories} kcal &bull; {meal.protein}g P</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 opacity-50">
                            <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                              +
                            </div>
                            <p className="text-[10px] text-slate-400">No meal assigned</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

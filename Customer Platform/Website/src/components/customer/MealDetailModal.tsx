import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Star,
  Plus
} from 'lucide-react';

export const MealDetailModal: React.FC = () => {
  const { selectedMealForDetail, setSelectedMealForDetail, addToCart } = useApp();

  if (!selectedMealForDetail) return null;

  const meal = selectedMealForDetail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedMealForDetail(null)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Image Hero Banner */}
        <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden shadow-lg">
          <img
            src={meal.image}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-black shadow-md flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>{meal.aiMatchScore}% Clinical Match</span>
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">{meal.restaurantName}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] mt-1">{meal.name}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-300 mt-2">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-emerald-400" /> Prep: {meal.prepTime}</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {meal.rating} ({meal.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Explainable AI (XAI) Recommendation Card */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-100 space-y-2">
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>NutriMind™ Clinical Recommendation Breakdown</span>
          </div>
          <p className="text-xs leading-relaxed font-medium">
            {meal.aiExplanation}
          </p>
          <div className="pt-2 flex items-center gap-4 text-[11px] font-bold text-slate-600 dark:text-slate-300 border-t border-emerald-500/10">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> PCOS Safe
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero Allergen Trigger
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Glycemic Index {meal.macros.glycemicIndex}
            </span>
          </div>
        </div>

        {/* Macro Gauge Counters */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
            Nutritional Macro Breakdown
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Calories</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-1">{meal.macros.calories}</div>
              <div className="text-[9px] text-slate-400">kcal</div>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Protein</div>
              <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-1">{meal.macros.protein}g</div>
              <div className="text-[9px] text-emerald-500">Bioavailable</div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">Net Carbs</div>
              <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-1">{meal.macros.carbs}g</div>
              <div className="text-[9px] text-blue-500">Complex</div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">Healthy Fat</div>
              <div className="text-base font-black text-amber-600 dark:text-amber-400 mt-1">{meal.macros.fat}g</div>
              <div className="text-[9px] text-amber-500">Omega-3</div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase">Fiber</div>
              <div className="text-base font-black text-purple-600 dark:text-purple-400 mt-1">{meal.macros.fiber}g</div>
              <div className="text-[9px] text-purple-500">Soluble</div>
            </div>

            <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800">
              <div className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold uppercase">Sugar</div>
              <div className="text-base font-black text-pink-600 dark:text-pink-400 mt-1">{meal.macros.sugar}g</div>
              <div className="text-[9px] text-pink-500">Natural</div>
            </div>
          </div>
        </div>

        {/* Ingredients & Healthy Alternative */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Verified Ingredients</h4>
            <div className="flex flex-wrap gap-1.5">
              {meal.ingredients.map((ing, i) => (
                <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {meal.healthyAlternative && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> AI Recommended Upgrade:
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                {meal.healthyAlternative}
              </p>
            </div>
          )}
        </div>

        {/* Footer Price & Add to Cart */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Price</span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">₹{meal.price}</div>
          </div>

          <button
            onClick={() => {
              addToCart(meal);
              setSelectedMealForDetail(null);
            }}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add to Healthy Cart</span>
          </button>
        </div>

      </div>
    </div>
  );
};

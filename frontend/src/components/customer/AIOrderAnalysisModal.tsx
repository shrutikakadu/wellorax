import React from 'react';
import { useApp } from '../../context/AppContext';
import type { Meal } from '../../types';
import {
  Sparkles, AlertTriangle, CheckCircle,
  ArrowRight, X, Bot, RefreshCw
} from 'lucide-react';
import { analyzeFoodRisk } from './AIFoodWarningModal';

interface AIOrderAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOrder: () => void;
}

export const AIOrderAnalysisModal: React.FC<AIOrderAnalysisModalProps> = ({
  isOpen,
  onClose,
  onConfirmOrder,
}) => {
  const { cart, healthProfile, meals, addToCart, removeFromCart } = useApp();

  if (!isOpen || cart.length === 0) return null;

  // Calculate order totals
  const totalCalories = cart.reduce((s, i) => s + i.meal.macros.calories * i.quantity, 0);
  const totalProtein  = cart.reduce((s, i) => s + i.meal.macros.protein * i.quantity, 0);
  const totalCarbs    = cart.reduce((s, i) => s + i.meal.macros.carbs * i.quantity, 0);
  const maxGI         = Math.max(...cart.map(i => i.meal.macros.glycemicIndex || 35));

  // Check health risks across all items in cart
  const cartRisks = cart.map(i => ({
    meal: i.meal,
    risk: analyzeFoodRisk(i.meal, healthProfile.diseases, {
      bloodPressureSystolic:  healthProfile.bloodPressureSystolic,
      bloodPressureDiastolic: healthProfile.bloodPressureDiastolic,
      bloodSugarFasting:      healthProfile.bloodSugarFasting,
      cholesterolTotal:       healthProfile.cholesterolTotal,
      heartRateBpm:           healthProfile.heartRateBpm,
    }),
  })).filter(r => r.risk !== null);

  const hasHighRisk = cartRisks.some(r => r.risk?.level === 'block');
  const hasCaution  = cartRisks.some(r => r.risk?.level === 'caution');

  // Overall Bio-Match Score
  let bioMatchScore = 95;
  if (hasHighRisk) bioMatchScore = 58;
  else if (hasCaution) bioMatchScore = 78;

  // Find top healthy alternative
  const recommendedAlternative = meals.find(m =>
    !cart.some(i => i.meal.id === m.id) &&
    m.aiMatchScore >= 92 &&
    !analyzeFoodRisk(m, healthProfile.diseases, {
      bloodPressureSystolic:  healthProfile.bloodPressureSystolic,
      bloodSugarFasting:      healthProfile.bloodSugarFasting,
    })
  );

  const handleSwapAlternative = (alt: Meal) => {
    if (cart.length > 0) {
      removeFromCart(cart[0].meal.id);
    }
    addToCart(alt);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0D1F17] rounded-3xl shadow-2xl border border-slate-200 dark:border-emerald-500/20 overflow-hidden">
        
        {/* Top Gradient Header */}
        <div className={`p-5 text-white relative overflow-hidden ${
          hasHighRisk
            ? 'bg-gradient-to-r from-red-600 to-orange-600'
            : hasCaution
              ? 'bg-gradient-to-r from-amber-600 to-orange-600'
              : 'bg-gradient-to-r from-[#034B36] via-emerald-800 to-teal-900'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 animate-bounce" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Wellora Clinical Analysis</span>
                <h3 className="text-lg font-black font-['Outfit']">Is this order good for your health?</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Bio-Match Score Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Order Bio-Match Rating</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                {hasHighRisk ? '⚠️ Unhealthy for your conditions' : hasCaution ? '⚡ Moderate Health Match' : '🟢 Excellent Bio-Match Choice!'}
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-2xl font-black text-lg font-['Outfit'] text-white ${
              hasHighRisk ? 'bg-red-600' : hasCaution ? 'bg-amber-500' : 'bg-emerald-600'
            }`}>
              {bioMatchScore}%
            </div>
          </div>

          {/* AI Clinical Summary */}
          <div className="space-y-2">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Clinical Macro Impact</p>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <span className="text-[10px] font-semibold text-slate-400 block">Calories</span>
                <span className="font-black text-orange-600 dark:text-orange-400">{totalCalories} kcal</span>
              </div>
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <span className="text-[10px] font-semibold text-slate-400 block">Protein</span>
                <span className="font-black text-blue-600 dark:text-blue-400">{totalProtein}g</span>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] font-semibold text-slate-400 block">Carbs</span>
                <span className="font-black text-amber-600 dark:text-amber-400">{totalCarbs}g</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] font-semibold text-slate-400 block">Max GI</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">{maxGI}</span>
              </div>
            </div>
          </div>

          {/* Detailed Health Warnings if present */}
          {cartRisks.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-black text-red-500 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Health Guard Alerts Detected ({cartRisks.length})
              </p>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {cartRisks.map(({ meal, risk }) => (
                  <div key={meal.id} className="p-3 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs text-red-700 dark:text-red-300">
                    <p className="font-bold flex items-center gap-1.5">
                      <span>🚫 {meal.name}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-red-600 text-white ml-auto">{risk?.reason}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">{risk?.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong>Wellora Verified:</strong> This meal order aligns with your daily target of {healthProfile.dailyCalorieTarget} kcal and fits your {healthProfile.fitnessGoal} profile!
              </p>
            </div>
          )}

          {/* AI Recommended Swap if available */}
          {recommendedAlternative && (hasHighRisk || hasCaution) && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Recommended AI Health Swap
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  {recommendedAlternative.aiMatchScore}% Match
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{recommendedAlternative.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{recommendedAlternative.macros.calories} kcal • {recommendedAlternative.macros.protein}g protein • Low GI</p>
                </div>
                <button
                  onClick={() => handleSwapAlternative(recommendedAlternative)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold shrink-0 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Swap Dish
                </button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Modify Order
            </button>
            <button
              onClick={() => { onClose(); onConfirmOrder(); }}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>{hasHighRisk ? 'Proceed Anyway' : 'Looks Good! Place Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

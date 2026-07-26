import React from 'react';
import type { Meal } from '../../types';
import { getMealRiskFromVitals } from '../../services/medicalEngine';
import {
  AlertTriangle, X, ShieldAlert, Heart, Droplets, Flame,
  ArrowRight, CheckCircle, Info
} from 'lucide-react';

// ─── AI Food Risk Analysis ────────────────────────────────────────────────────

export interface FoodRiskWarning {
  level: 'block' | 'caution';
  reason: string;
  detail: string;
  metric: string;         // e.g. "BP: 148/96 mmHg"
  icon: React.ElementType;
  color: string;
}

/**
 * Analyzes a meal against the user's health profile vitals and diseases.
 * Returns a warning if the meal poses a health risk.
 */
export const analyzeFoodRisk = (
  meal: Meal,
  diseases: string[],
  vitals: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    bloodSugarFasting?: number;
    cholesterolTotal?: number;
    heartRateBpm?: number;
  }
): FoodRiskWarning | null => {
  const name = meal.name.toLowerCase();
  const tags = meal.dietaryBadges?.join(' ').toLowerCase() || '';
  const macros = meal.macros;

  // ─── Run medical engine risk assessment ─────────────────────────────────────
  const risk = getMealRiskFromVitals({
    systolicBP:  vitals.bloodPressureSystolic,
    diastolicBP: vitals.bloodPressureDiastolic,
    bloodSugar:  vitals.bloodSugarFasting,
    cholesterol: vitals.cholesterolTotal,
    heartRate:   vitals.heartRateBpm,
    diseases,
  });

  // Detect food type from name/tags
  const isPizza    = name.includes('pizza');
  const isBurger   = name.includes('burger') || name.includes('sandwich');
  const isFried    = name.includes('fried') || name.includes('fry') || name.includes('crispy') || tags.includes('fried');
  const isSweet    = name.includes('cake') || name.includes('sweet') || name.includes('dessert') || name.includes('ice cream') || name.includes('kheer') || name.includes('gulab');
  const isHighSalt = macros.calories > 400 && (isPizza || isBurger || isFried);
  const isHighGI   = !tags.includes('low gi') && !tags.includes('low-gi') && macros.carbs > 45;
  const isHighFat  = macros.fat > 25;
  const isCaffeine = name.includes('coffee') || name.includes('espresso') || name.includes('energy drink');

  // ─── BP-based warnings (AHA/ACC 2018 thresholds via engine) ─────────────────
  if (risk.highBP && (isPizza || isBurger || isHighSalt || isFried)) {
    const s = vitals.bloodPressureSystolic!;
    const d = vitals.bloodPressureDiastolic;
    return {
      level: risk.critBP ? 'block' : 'caution',
      reason: risk.critBP ? 'Stage 2 Hypertension Alert' : 'Elevated Blood Pressure Alert',
      detail: `${risk.details.bp ? `Your BP is ${risk.details.bp}. ` : ''}${meal.name} is high in sodium (~900–1200mg), which directly raises blood pressure. ${
        risk.critBP
          ? 'AHA/ACC 2018: Stage 2 HT (≥140 mmHg) — sodium restriction is critical. Avoid this food today.'
          : 'AHA/ACC 2018: Even Stage 1 HT (130–139) is worsened by high-sodium meals.'
      }`,
      metric: risk.details.bp ? `Scanned BP: ${risk.details.bp}` : `Disease: Hypertension (from your health profile)`,
      icon: Heart,
      color: 'red',
    };
  }

  // ─── Blood sugar / Diabetes warnings (ADA 2024 thresholds) ──────────────────
  if (risk.highSugar && (isSweet || isHighGI)) {
    const bs = vitals.bloodSugarFasting;
    return {
      level: risk.critSugar ? 'block' : 'caution',
      reason: risk.critSugar ? 'Diabetic Range Blood Sugar' : 'Pre-Diabetic Sugar Alert',
      detail: `${risk.details.sugar ? `Your fasting glucose is ${risk.details.sugar}. ` : ''}${meal.name} has a high Glycemic Index (GI ${macros.glycemicIndex ?? '~65+'}), causing rapid glucose spike. ${
        risk.critSugar
          ? 'ADA 2024: At ≥126 mg/dL fasting, high-GI foods cause dangerous glucose excursions.'
          : 'ADA 2024: Pre-diabetic range (100–125 mg/dL) — high-GI foods worsen insulin resistance.'
      }`,
      metric: risk.details.sugar ? `Fasting Glucose: ${risk.details.sugar}` : 'Condition: Diabetes (from your health profile)',
      icon: Droplets,
      color: 'blue',
    };
  }

  // ─── Cholesterol / Heart disease (ACC/AHA 2019 + NCEP ATP III) ───────────────
  const hasHeartDisease = diseases.some(d => d.toLowerCase().includes('heart') || d.toLowerCase().includes('cardiac'));
  if ((risk.highChol || hasHeartDisease) && (isFried || isHighFat)) {
    return {
      level: hasHeartDisease ? 'block' : 'caution',
      detail: `${risk.details.chol ? `Your total cholesterol is ${risk.details.chol}. ` : ''}${meal.name} contains ${macros.fat}g fat. ${
        hasHeartDisease
          ? 'With heart disease, ACC/AHA 2019 recommends high-intensity statin therapy and dietary fat restriction.'
          : 'NCEP ATP III: Cholesterol ≥200 mg/dL — saturated/trans fat intake must be reduced.'
      }`,
      reason: hasHeartDisease ? 'Heart Disease Diet Conflict' : 'High Cholesterol Caution',
      metric: risk.details.chol || 'Condition: Heart Disease',
      icon: Heart,
      color: 'red',
    };
  }

  // ─── PCOS — insulin resistance (PCOS Society of India 2022) ─────────────────
  const hasPCOS = diseases.some(d => d.toLowerCase().includes('pcos'));
  if (hasPCOS && isHighGI) {
    return {
      level: 'caution',
      reason: 'PCOS Insulin Response Alert',
      detail: `High-GI foods trigger insulin spikes that worsen PCOS hormonal imbalance (PCOS Society of India 2022). GI of ~${macros.glycemicIndex ?? '55+'} is above the recommended limit of 40 for PCOS management.`,
      metric: 'Condition: PCOS (from your health profile)',
      icon: Flame,
      color: 'orange',
    };
  }

  // ─── Kidney Disease (KDIGO 2021) ─────────────────────────────────────────────
  const hasKidney = diseases.some(d => d.toLowerCase().includes('kidney') || d.toLowerCase().includes('ckd'));
  if (hasKidney && isHighSalt) {
    return {
      level: 'caution',
      reason: 'Kidney Disease Sodium Alert',
      detail: `KDIGO 2021: CKD requires strict sodium restriction (<2.3g/day). High-sodium foods increase fluid retention, raise BP, and accelerate kidney function decline.`,
      metric: 'Condition: CKD/Kidney Disease (from your health profile)',
      icon: Heart,
      color: 'purple',
    };
  }

  // ─── Tachycardia + Caffeine ──────────────────────────────────────────────────
  const hrHigh = (vitals.heartRateBpm || 0) >= 100;
  if (hrHigh && isCaffeine) {
    return {
      level: 'caution',
      reason: 'Elevated Heart Rate + Caffeine',
      detail: `Your resting heart rate is ${vitals.heartRateBpm} bpm (above normal). Caffeine increases HR by 5–15 bpm (AHA). Avoid caffeine-containing foods/drinks until HR normalizes.`,
      metric: `Heart Rate: ${vitals.heartRateBpm} bpm (AHA normal: 60–100 bpm)`,
      icon: Flame,
      color: 'orange',
    };
  }

  return null; // No risk detected
};

// ─── Warning Modal Component ──────────────────────────────────────────────────

interface AIFoodWarningModalProps {
  warning: FoodRiskWarning;
  meal: Meal;
  alternatives: Meal[];
  onProceed: () => void;
  onCancel: () => void;
  onSelectAlternative: (meal: Meal) => void;
}

const colorMap = {
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-600 dark:text-red-400',    icon: 'text-red-500',    btn: 'bg-red-600 hover:bg-red-500' },
  blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-600 dark:text-blue-400',   icon: 'text-blue-500',   btn: 'bg-blue-600 hover:bg-blue-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-600 dark:text-orange-400', icon: 'text-orange-500', btn: 'bg-orange-600 hover:bg-orange-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-500', btn: 'bg-purple-600 hover:bg-purple-500' },
};

export const AIFoodWarningModal: React.FC<AIFoodWarningModalProps> = ({
  warning, meal, alternatives, onProceed, onCancel, onSelectAlternative
}) => {
  const c = colorMap[warning.color as keyof typeof colorMap] || colorMap.red;
  const Icon = warning.icon;
  const isBlock = warning.level === 'block';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg bg-white dark:bg-[#0D1F17] rounded-3xl shadow-2xl border border-slate-200 dark:border-red-500/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Top colored bar */}
        <div className={`h-1.5 w-full ${isBlock ? 'bg-gradient-to-r from-red-500 via-red-400 to-orange-400' : 'bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400'}`} />

        <div className="p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl ${c.bg} ${c.border} border-2 flex items-center justify-center shrink-0`}>
              {isBlock
                ? <ShieldAlert className={`w-7 h-7 ${c.icon}`} />
                : <AlertTriangle className={`w-7 h-7 ${c.icon}`} />}
            </div>
            <div>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${c.bg} ${c.text} ${c.border} border mb-1.5`}>
                {isBlock ? '🚫 AI Health Block' : '⚠️ AI Health Caution'}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
                {warning.reason}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Wellora AI detected a conflict with your health profile
              </p>
            </div>
            <button
              onClick={onCancel}
              className="ml-auto p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Meal being blocked */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <img src={meal.image} alt={meal.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{meal.name}</p>
              <p className="text-[10px] text-slate-500">{meal.restaurantName}</p>
            </div>
            <div className={`ml-auto px-2 py-1 rounded-lg ${c.bg} ${c.text} text-[10px] font-black shrink-0`}>
              {isBlock ? 'Not Safe' : 'Caution'}
            </div>
          </div>

          {/* Warning Detail */}
          <div className={`p-4 rounded-2xl ${c.bg} ${c.border} border`}>
            <div className="flex items-start gap-2">
              <Icon className={`w-4 h-4 ${c.icon} shrink-0 mt-0.5`} />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{warning.detail}</p>
            </div>
            <div className={`mt-3 pt-3 border-t ${c.border} flex items-center gap-2`}>
              <Info className={`w-3.5 h-3.5 ${c.icon}`} />
              <span className={`text-[11px] font-bold ${c.text}`}>{warning.metric}</span>
            </div>
          </div>

          {/* Healthy Alternatives */}
          {alternatives.length > 0 && (
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2.5">
                ✅ AI-Recommended Alternatives
              </p>
              <div className="space-y-2">
                {alternatives.slice(0, 3).map(alt => (
                  <button
                    key={alt.id}
                    onClick={() => onSelectAlternative(alt)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/60 hover:bg-emerald-500/10 transition-all text-left group"
                  >
                    <img src={alt.image} alt={alt.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-emerald-100 truncate">{alt.name}</p>
                      <p className="text-[10px] text-slate-400">{alt.macros.calories} kcal · {alt.macros.protein}g protein · GI {alt.macros.glycemicIndex ?? '~30'}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1">
                      <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                        {alt.aiMatchScore}% Match
                      </span>
                      <ArrowRight className="w-3 h-3 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Choose Alternative</span>
            </button>
            {!isBlock && (
              <button
                onClick={onProceed}
                className="px-5 py-3 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                Proceed Anyway
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

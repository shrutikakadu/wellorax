import React from 'react';
import { 
  Bot, 
  Flame, 
  ShieldCheck, 
  Camera, 
  Watch, 
  ShoppingCart, 
  Sparkles
} from 'lucide-react';

export const FeatureSection: React.FC = () => {
  const features = [
    {
      title: "Disease-Aware AI Engine",
      desc: "Automatically filters out allergens, high GI sugars, and triggers for PCOS, Type-2 Diabetes, Thyroid, and Hypertension.",
      icon: ShieldCheck,
      badge: "Clinical Accuracy",
    },
    {
      title: "Explainable AI (XAI)",
      desc: "Every meal comes with a breakdown explaining exactly why it was chosen for your body and how it affects blood glucose.",
      icon: Bot,
      badge: "Transparent AI",
    },
    {
      title: "Calorie & Macro Prediction",
      desc: "Computer vision and nutritional breakdown accurately estimate calories, bioavailable protein, net carbs, and dietary fiber.",
      icon: Flame,
      badge: "98% Precision",
    },
    {
      title: "Food Image Recognition",
      desc: "Snap a photo of your home meal or restaurant plate to receive instant macro logging and health score analysis.",
      icon: Camera,
      badge: "Instant Scan",
    },
    {
      title: "Wearable Sync (CGM & Apple Health)",
      desc: "Continuous Glucose Monitor (Abbott FreeStyle / Dexcom) integration to map meal intake directly against real glucose spikes.",
      icon: Watch,
      badge: "Live Telemetry",
    },
    {
      title: "Smart Organic Grocery",
      desc: "One-click export of meal plan ingredients directly to an express organic grocery cart with personalized substitutes.",
      icon: ShoppingCart,
      badge: "Auto-Shopping",
    },
  ];

  return (
    <section className="py-24 relative bg-slate-900 text-white overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Powered by NutriMind™ Deep Neural Engine
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Outfit']">
            Autonomous Health & Nutrition Features
          </h2>
          <p className="text-slate-400 text-base">
            Not just delivery — an intelligent health operating system designed around your longevity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const IconComp = feat.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-3xl bg-slate-800/60 border border-slate-700/60 hover:border-emerald-500/60 hover:bg-slate-800/90 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg shadow-emerald-500/10">
                      <IconComp className="w-7 h-7" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-700 text-slate-300 border border-slate-600">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 font-['Outfit']">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Integrated into Wellora Ecosystem</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

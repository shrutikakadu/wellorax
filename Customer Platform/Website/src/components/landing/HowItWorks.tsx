import React from 'react';
import { UserCheck, Cpu, Sparkles, Utensils, Activity } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Create Health Profile",
      desc: "Input age, weight, medical history (PCOS, Diabetes, Thyroid), allergies, and target fitness goals.",
      icon: UserCheck,
      color: "from-emerald-500 to-teal-500",
    },
    {
      num: "02",
      title: "AI Understands Your Body",
      desc: "Wellora computes glycemic index limits, macro ratios, and allergy safety scores in real-time.",
      icon: Cpu,
      color: "from-blue-500 to-indigo-500",
    },
    {
      num: "03",
      title: "AI Recommends Meals",
      desc: "Scans certified restaurants nearby to match meals scored strictly for your biological needs.",
      icon: Sparkles,
      color: "from-amber-500 to-orange-500",
    },
    {
      num: "04",
      title: "Order & Enjoy",
      desc: "Freshly prepared by nutrition-verified kitchens and delivered express in eco-friendly thermals.",
      icon: Utensils,
      color: "from-purple-500 to-pink-500",
    },
    {
      num: "05",
      title: "Track Nutrition & Glucose",
      desc: "Logs calories, macros, hydration and syncs seamlessly with wearable continuous glucose monitors.",
      icon: Activity,
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <section className="py-20 relative bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            5-Step Clinical Precision Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
            How Wellora Works
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            From deep biological profiling to door-step delivery in under 30 minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, idx) => {
            const IconComp = step.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-['Outfit']">
                      {step.num}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-['Outfit']">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Step {idx + 1} of 5</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles, ArrowRight, Activity, ShieldCheck, Flame, Heart, Bot,
  ChevronDown, Star, Zap, Leaf
} from 'lucide-react';

const HEADLINE_ROTATIONS = [
  { text: 'PCOS Relief', color: 'from-pink-500 to-rose-400' },
  { text: 'Diabetes Control', color: 'from-blue-500 to-cyan-400' },
  { text: 'Weight Loss', color: 'from-emerald-500 to-teal-400' },
  { text: 'Muscle Gain', color: 'from-orange-500 to-amber-400' },
  { text: 'Heart Health', color: 'from-red-500 to-pink-400' },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, text: 'Clinical Grade AI', color: 'text-emerald-500' },
  { icon: Activity, text: 'Real-Time GI Guard', color: 'text-blue-500' },
  { icon: Star, text: '4.9★ by 10K+ Users', color: 'text-amber-500' },
  { icon: Zap, text: '98.4% Macro Precision', color: 'text-purple-500' },
];

export const HeroSection: React.FC = () => {
  const {
    setIsAIModalOpen,
    setIsAuthModalOpen,
    setAuthModalDefaultMode,
    isAuthenticated,
    setCurrentView,
  } = useApp();
  const [rotationIdx, setRotationIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setRotationIdx(i => (i + 1) % HEADLINE_ROTATIONS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const currentHeadline = HEADLINE_ROTATIONS[rotationIdx];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setAuthModalDefaultMode('signup');
      setIsAuthModalOpen(true);
    }
  };

  const handleSignIn = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setAuthModalDefaultMode('login');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <section className="relative pt-10 pb-24 overflow-hidden">
      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-500/15 via-teal-400/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-amber-400/10 via-orange-300/5 to-transparent rounded-full blur-3xl" />
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:60px_60px] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* ── LEFT: Hero Text ── */}
          <div className="lg:col-span-6 space-y-8 text-center lg:text-left">

            {/* Top Pill */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-500/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>India's First AI Clinical Nutrition Delivery Ecosystem</span>
            </div>

            {/* Main Headline with animated rotation */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.05] font-['Outfit']">
                Every Meal.
                <br />
                <span className={`bg-gradient-to-r ${currentHeadline.color} bg-clip-text text-transparent transition-all duration-700`}>
                  {currentHeadline.text}.
                </span>
                <br />
                <span className="text-slate-700 dark:text-slate-300">Delivered.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed pt-2">
                Wellora reads your medical history, glycemic index limits, and clinical macro targets to curate, prepare, and deliver perfectly matched meals — from India's certified nutrition kitchens.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                id="hero-get-started-btn"
                onClick={handleGetStarted}
                className="group px-8 py-4 rounded-2xl bg-[#034B36] hover:bg-emerald-800 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
              >
                <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                id="hero-signin-btn"
                onClick={handleSignIn}
                className="px-7 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-extrabold text-sm border border-slate-200 dark:border-slate-800 shadow-md hover:border-emerald-500/60 hover:shadow-lg transition-all flex items-center gap-3"
              >
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>{isAuthenticated ? 'Open Dashboard' : 'Sign In to Dashboard'}</span>
              </button>

              <button
                onClick={() => setIsAIModalOpen(true)}
                className="px-6 py-4 rounded-2xl bg-blue-500/10 text-blue-700 dark:text-blue-400 font-extrabold text-sm border border-blue-500/30 hover:border-blue-500/60 transition-all flex items-center gap-2"
              >
                <Bot className="w-4 h-4 animate-bounce" />
                <span>Try Wellora AI</span>
              </button>
            </div>

            {/* Trust Badges strip */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-2">
              {TRUST_BADGES.map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Floating Meal Card ── */}
          <div className="lg:col-span-6 relative flex justify-center">
            <div className="relative w-full max-w-lg">

              {/* Main floating glass card */}
              <div className="relative p-5 rounded-3xl bg-white/80 dark:bg-[#091F17]/90 backdrop-blur-xl border border-white/60 dark:border-emerald-500/20 shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Live AI Match • PCOS Relief</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-700 text-amber-400 border border-emerald-600/50">
                    98% Bio-Match
                  </span>
                </div>

                {/* Meal Image */}
                <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg group mb-5">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                    alt="AI Matched Healthy Bowl"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

                  {/* Floating pills */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[11px] font-bold shadow-md animate-bounce">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>460 kcal</span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-[11px] font-bold shadow-md">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    <span>38g Protein</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="font-black text-base font-['Outfit']">Avocado & Salmon Power Bowl</p>
                    <p className="text-xs text-slate-300 mt-0.5">Verde Botanical Kitchen • Ready in 18 min</p>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '3s' }} />
                    <p className="leading-snug text-[11px]">
                      <strong className="text-emerald-700 dark:text-emerald-400">Wellora AI says:</strong> Lowers insulin spike by 42%. Safe for PCOS, lactose sensitivity & inflammatory response markers.
                    </p>
                  </div>
                </div>

                {/* Macro bar */}
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  {[['460', 'kcal', 'text-orange-500'], ['38g', 'Protein', 'text-blue-500'], ['12g', 'Carbs', 'text-amber-500'], ['28g', 'Fat', 'text-emerald-500']].map(([v, l, c]) => (
                    <div key={l} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-2">
                      <div className={`text-sm font-black ${c} font-['Outfit']`}>{v}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating widget — health score */}
              <div className="absolute -bottom-4 -left-8 hidden sm:flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/20 shadow-2xl animate-bounce" style={{ animationDuration: '3.5s' }}>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">AI Health Score</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">92 / 100</div>
                </div>
              </div>

              {/* Floating widget — veg badge */}
              <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 shadow-xl animate-bounce" style={{ animationDuration: '2.8s' }}>
                <Leaf className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-slate-700 dark:text-emerald-400">100% Organic</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── IMPACT STATS BAR ── */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
          {[
            { val: '100K+', label: 'Healthy Meals Delivered', color: 'text-emerald-600 dark:text-emerald-400' },
            { val: '10K+', label: 'Active Subscribers', color: 'text-blue-600 dark:text-blue-400' },
            { val: '500+', label: 'Certified Kitchens', color: 'text-amber-500' },
            { val: '98.4%', label: 'AI Macro Precision', color: 'text-orange-500' },
          ].map(({ val, label, color }) => (
            <div key={label} className="text-center py-8 px-4 bg-white dark:bg-[#091F17] space-y-1">
              <div className={`text-3xl sm:text-4xl font-extrabold font-['Outfit'] ${color}`}>{val}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="flex flex-col items-center mt-12 gap-2 text-slate-400 text-xs font-semibold animate-bounce">
          <span>Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </div>

      </div>
    </section>
  );
};

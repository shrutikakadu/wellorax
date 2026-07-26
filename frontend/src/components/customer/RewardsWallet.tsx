import React from 'react';

import {
  Award, Wallet, Gift, Star, Coins, TrendingUp, History,
  ArrowUpRight, ArrowDownRight, Sparkles, Crown, Shield, Zap,
  ShoppingBag, Utensils
} from 'lucide-react';

const transactions = [
  { type: 'earn' as const, desc: 'Order #2048 - 12% Cashback', amount: '+₹64', time: '2 hours ago' },
  { type: 'earn' as const, desc: 'Daily Check-in Reward', amount: '+₹5', time: '5 hours ago' },
  { type: 'spend' as const, desc: 'Redeemed for Free Delivery', amount: '-₹50', time: 'Yesterday' },
  { type: 'earn' as const, desc: 'Refer Friend - Aarav M.', amount: '+₹50', time: '2 days ago' },
  { type: 'spend' as const, desc: 'Redeemed for Exclusive Meal', amount: '-₹120', time: '3 days ago' },
  { type: 'earn' as const, desc: 'Order #2035 - 8% Cashback', amount: '+₹42', time: '4 days ago' },
];

const tierBenefits = [
  { icon: ShoppingBag, label: 'Free Delivery' },
  { icon: Coins, label: '12% Cashback' },
  { icon: Shield, label: 'Priority Support' },
  { icon: Utensils, label: 'Exclusive Meals' },
  { icon: TrendingUp, label: 'Weekly Insights' },
];

const earnWays = [
  { icon: ShoppingBag, title: 'Place Orders', desc: 'Earn points per order', color: 'emerald' },
  { icon: Zap, title: 'Daily Check-in', desc: '50 points daily', color: 'amber' },
  { icon: Gift, title: 'Refer Friends', desc: '500 points per referral', color: 'violet' },
  { icon: Star, title: 'Complete Health Profile', desc: '200 points', color: 'sky' },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500' },
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500' },
  sky: { bg: 'bg-sky-500/10', text: 'text-sky-500' },
};

export const RewardsWallet: React.FC = () => {

  const totalPoints = 4280;
  const tierThreshold = 5000;
  const tierProgress = (totalPoints / tierThreshold) * 100;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (tierProgress / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <Wallet className="w-3.5 h-3.5" />
          Wallet & Rewards
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
          NutriCash & <span className="text-emerald-500">Rewards</span>
        </h1>
        <p className="text-xs text-slate-400">Track your balance, earn points, and unlock exclusive tier benefits.</p>
      </div>

      {/* Wallet + Rewards Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Wallet Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">NutriCash Balance</p>
                  <p className="text-xs text-emerald-200">Available to spend</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold">ACTIVE</div>
            </div>
            <p className="text-4xl font-black font-['Outfit'] mb-6">₹2,450</p>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 rounded-xl bg-white text-emerald-600 text-xs font-bold hover:bg-emerald-50 transition-colors">
                Add Money
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-colors border border-white/20">
                Transfer
              </button>
              <button className="flex items-center justify-center w-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20">
                <History className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Reward Points Card */}
        <div className="rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Reward Points</p>
                <p className="text-[10px] text-slate-400">1 point = ₹0.10</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">{totalPoints.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-500 font-bold">≈ ₹{(totalPoints * 0.1).toFixed(0)} value</p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="relative w-[130px] h-[130px] shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200 dark:text-slate-700" />
                <circle
                  cx="65" cy="65" r={radius} fill="none" stroke="url(#tierGradient)" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="tierGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Crown className="w-5 h-5 text-amber-500 mb-1" />
                <p className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">{tierProgress.toFixed(0)}%</p>
                <p className="text-[9px] text-slate-400 font-semibold">to Gold</p>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Silver</span>
                  <span className="text-[10px] font-bold text-amber-500">Gold</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-slate-400 to-amber-400 transition-all duration-1000" style={{ width: `${tierProgress}%` }} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-amber-500">{tierThreshold - totalPoints}</span> more points to unlock Gold tier
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Earn 720 points to reach Gold
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Status */}
      <div className="rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Crown className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">Tier Status</h2>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-300 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Silver Member</p>
                <p className="text-[11px] text-slate-400">Current Tier</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ArrowUpRight className="w-4 h-4 text-amber-500" />
              Next Tier: <span className="font-bold text-amber-500">Gold</span> at 5,000 points
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{totalPoints.toLocaleString()} pts</span>
                <span className="text-[10px] font-bold text-amber-500">{tierThreshold.toLocaleString()} pts</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-slate-400 to-amber-400 transition-all duration-1000" style={{ width: `${tierProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="w-full sm:w-px sm:h-32 bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Your Benefits</p>
            <div className="space-y-2.5">
              {tierBenefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.label} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{b.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">Recent Transactions</h2>
          </div>
          <button className="text-[11px] font-bold text-emerald-500 hover:text-emerald-600 transition-colors">View All</button>
        </div>
        <div className="space-y-3">
          {transactions.map((tx, i) => {
            const isEarn = tx.type === 'earn';
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isEarn ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {isEarn ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{tx.desc}</p>
                  <p className="text-[10px] text-slate-400">{tx.time}</p>
                </div>
                <p className={`text-sm font-black font-['Outfit'] shrink-0 ${isEarn ? 'text-emerald-500' : 'text-red-500'}`}>
                  {tx.amount}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How to Earn */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">How to Earn Points</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {earnWays.map((way) => {
            const Icon = way.icon;
            const c = colorMap[way.color];
            return (
              <div key={way.title} className="p-4 rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{way.title}</h4>
                <p className="text-[11px] text-slate-400">{way.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
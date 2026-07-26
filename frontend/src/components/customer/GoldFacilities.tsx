import React from 'react';
import {
  Crown, CheckCircle, Truck, Percent, Headphones,
  ShieldCheck, Gift, Clock, Phone, Utensils, Sparkles
} from 'lucide-react';

const plans = [
  {
    name: 'Silver',
    price: '₹299',
    period: '/month',
    color: 'from-slate-400 to-slate-300',
    border: 'border-slate-300',
    badge: 'bg-slate-400',
    features: [
      'Free delivery on orders above ₹499',
      '5% NutriCash back on every order',
      'Priority customer support',
      'Monthly health report summary',
    ],
  },
  {
    name: 'Gold',
    price: '₹599',
    period: '/month',
    color: 'from-amber-500 to-yellow-400',
    border: 'border-amber-400',
    badge: 'bg-amber-500',
    popular: true,
    features: [
      'Free delivery on all orders',
      '12% NutriCash back on every order',
      'AI Dietitian priority consultations',
      'Exclusive gold-only meals & discounts',
      'Weekly personalized health insights',
      'Early access to new restaurants',
    ],
  },
  {
    name: 'Platinum',
    price: '₹999',
    period: '/month',
    color: 'from-violet-500 to-purple-400',
    border: 'border-violet-400',
    badge: 'bg-violet-500',
    features: [
      'Free express delivery (under 20 min)',
      '20% NutriCash back on every order',
      'Unlimited 1-on-1 doctor consultations',
      'Personal nutritionist assigned',
      'Priority lab test bookings',
      'VIP access to all partner clinics',
      'Quarterly full body health checkup',
    ],
  },
];

const benefits = [
  { icon: Truck, title: 'Free Delivery', desc: 'No delivery charges on any order, any time.' },
  { icon: Percent, title: 'NutriCash Rewards', desc: 'Earn cashback on every meal you order.' },
  { icon: Headphones, title: 'Priority Support', desc: 'Skip the queue — talk to a human instantly.' },
  { icon: ShieldCheck, title: 'AI Health Verified', desc: 'Every gold meal is double-checked by our AI.' },
  { icon: Clock, title: 'Express Delivery', desc: 'Get your meals delivered in under 20 minutes.' },
  { icon: Phone, title: 'Doctor On Call', desc: 'Free telehealth consultations with top doctors.' },
  { icon: Gift, title: 'Exclusive Offers', desc: 'Gold-only discounts and surprise gifts.' },
  { icon: Utensils, title: 'Premium Meals', desc: 'Access to chef-crafted gold member meals.' },
];

export const GoldFacilities: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-16">

      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
          <Crown className="w-4 h-4" />
          Gold Facilities
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit']">
          Unlock Premium Health <span className="text-amber-500">Membership</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Upgrade to Silver, Gold, or Platinum and enjoy exclusive benefits — free delivery, NutriCash rewards, AI-verified meals, and personal doctor consultations.
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl border-2 ${plan.border} bg-white dark:bg-[#0B1F1A] p-6 flex flex-col ${
              plan.popular ? 'shadow-xl shadow-amber-500/10 scale-[1.03] z-10' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </div>
            )}
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
              <span className="text-xs text-slate-400 font-semibold">{plan.period}</span>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}
            >
              Upgrade to {plan.name}
            </button>
          </div>
        ))}
      </div>

      {/* Benefits Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Gold Member <span className="text-amber-500">Benefits</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Everything you get with a premium membership</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="p-4 rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{b.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
        <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] mb-2">
          Ready to Go Premium?
        </h3>
        <p className="text-xs text-slate-400 mb-4 max-w-md mx-auto">
          Join thousands of health-conscious users who trust Wellora Gold for personalized nutrition and premium delivery.
        </p>
        <button className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors">
          Upgrade Now
        </button>
      </div>
    </div>
  );
};

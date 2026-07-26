import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Shield, Award, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight font-['Outfit']">
                WELLORA <span className="text-emerald-500">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Every Meal. Personalized for Your Health.
              Combining AI nutrition modeling, clinical disease-aware recommendations, food delivery, doctor telehealth, and smart grocery into one seamless ecosystem.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" /> HIPAA & Clinical Grade AI
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Award className="w-3.5 h-3.5" /> ISO 27001 Certified
              </span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Ecosystem Hub</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentView('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Healthy Marketplace
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('nutrition-dashboard')} className="hover:text-emerald-400 transition-colors">
                  AI Nutrition Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('meal-planner')} className="hover:text-emerald-400 transition-colors">
                  Automated Meal Planner
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('smart-grocery')} className="hover:text-emerald-400 transition-colors">
                  Smart Organic Grocery
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('doctor-consultation')} className="hover:text-emerald-400 transition-colors">
                  Doctor Telehealth
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Medical Conditions & Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Disease Care</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#pcos" className="hover:text-emerald-400 transition-colors">PCOS & Insulin Management</a></li>
              <li><a href="#diabetes" className="hover:text-emerald-400 transition-colors">Type-2 Diabetes Control</a></li>
              <li><a href="#heart" className="hover:text-emerald-400 transition-colors">Heart Healthy & Low Lipid</a></li>
              <li><a href="#thyroid" className="hover:text-emerald-400 transition-colors">Thyroid Care Diets</a></li>
              <li><a href="#keto" className="hover:text-emerald-400 transition-colors">High Protein Gym Meals</a></li>
            </ul>
          </div>

          {/* Col 4: Partner Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Enterprise Portals</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentView('admin-dashboard')} className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                  Admin Platform <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('restaurant-dashboard')} className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                  Restaurant Kitchen Hub <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('doctor-dashboard')} className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                  Doctor & Dietitian Portal <ArrowUpRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Wellora Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300">Terms of Service</a>
            <a href="#security" className="hover:text-slate-300">Security & Compliance</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

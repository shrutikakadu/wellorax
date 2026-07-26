import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User, Bell, Target, Moon, Shield, Fingerprint, LogOut, Trash2,
  ChevronRight, Save, Check, Lock, Eye, ShieldAlert,
  Smartphone, Activity, Download
} from 'lucide-react';

type SettingsTab = 'account' | 'notifications' | 'goals' | 'appearance' | 'privacy' | 'security';

interface SettingsTabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ElementType;
  desc: string;
}

const tabs: SettingsTabConfig[] = [
  { id: 'account',       label: 'Account',        icon: User,         desc: 'Personal info & profile' },
  { id: 'notifications', label: 'Notifications',  icon: Bell,         desc: 'Alerts, reminders, push settings' },
  { id: 'goals',         label: 'Health Goals',   icon: Target,       desc: 'Calorie, protein & water targets' },
  { id: 'appearance',    label: 'Appearance',     icon: Moon,         desc: 'Theme & display options' },
  { id: 'privacy',       label: 'Privacy',        icon: Shield,       desc: 'Data sharing & visibility' },
  { id: 'security',      label: 'Security',       icon: Fingerprint,  desc: 'Password & biometric lock' },
];

const Toggle: React.FC<{ checked: boolean; onChange: () => void; id?: string }> = ({ checked, onChange, id }) => (
  <button
    type="button"
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsPage: React.FC = () => {
  const { currentUser, healthProfile, setHealthProfile, isDarkMode, setIsDarkMode, logout } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [savedMsg, setSavedMsg] = useState('');
  const [isPwaInstallable, setIsPwaInstallable] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // Listen for PWA installable event fired from main.tsx
  useEffect(() => {
    const handler = () => setIsPwaInstallable(true);
    window.addEventListener('wellora-pwa-installable', handler);
    // Check if already installable on mount
    if ((window as any).__wellora_pwa_install) setIsPwaInstallable(true);
    return () => window.removeEventListener('wellora-pwa-installable', handler);
  }, []);

  const handleInstallApp = async () => {
    const fn = (window as any).__wellora_pwa_install;
    if (!fn) return;
    const accepted = await fn();
    if (accepted) {
      setIsPwaInstallable(false);
      setPwaInstalled(true);
      showSaved('Wellora AI app installed on your home screen! 🎉');
    }
  };

  // Account editing state
  const [accountForm, setAccountForm] = useState({
    name: currentUser?.name || healthProfile.name || 'User',
    email: currentUser?.email || 'user@wellora.ai',
    phone: '+91 98765 43210',
    dietPreference: healthProfile.dietaryPreference || 'Vegetarian',
  });

  // Health Goals form state
  const [goalForm, setGoalForm] = useState({
    dailyCalorieTarget: healthProfile.dailyCalorieTarget || 2000,
    dailyProteinTarget: healthProfile.dailyProteinTarget || 100,
    dailyCarbsTarget:   healthProfile.dailyCarbTarget    || 220,
    dailyFatTarget:     healthProfile.dailyFatTarget     || 65,
    waterIntakeLiters:  healthProfile.waterIntakeLiters  || 2.5,
    fitnessGoal:        healthProfile.fitnessGoal        || 'Weight Loss',
  });

  // Notifications toggles
  const [notifState, setNotifState] = useState({
    mealReminders:  true,
    vitalsAlerts:   true,
    waterReminders: true,
    orderUpdates:   true,
    weeklyReport:   true,
    promotions:     false,
  });

  // Privacy toggles
  const [privacyState, setPrivacyState] = useState({
    shareHealthData: false,
    analyticsOptIn:  true,
    personalizedAds: false,
    locationAccess:  true,
  });

  // Security
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const showSaved = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const handleSaveAccount = () => {
    setHealthProfile(prev => ({
      ...prev,
      name: accountForm.name,
      dietaryPreference: accountForm.dietPreference,
    }));
    showSaved('Account profile updated successfully!');
  };

  const handleSaveGoals = () => {
    setHealthProfile(prev => ({
      ...prev,
      dailyCalorieTarget: Number(goalForm.dailyCalorieTarget),
      dailyProteinTarget: Number(goalForm.dailyProteinTarget),
      dailyCarbTarget:    Number(goalForm.dailyCarbsTarget),
      dailyFatTarget:     Number(goalForm.dailyFatTarget),
      waterIntakeLiters:  Number(goalForm.waterIntakeLiters),
      fitnessGoal:        goalForm.fitnessGoal as any,
    }));
    showSaved('Health goals updated!');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07130F] text-slate-800 dark:text-slate-100 pb-16 font-sans">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 pt-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight">Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your account, preferences, theme, and health goals</p>
        </div>

        {/* Success Toast */}
        {savedMsg && (
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm font-bold animate-pulse">
            <Check className="w-4 h-4" /> {savedMsg}
          </div>
        )}

        {/* PWA Install App Banner — shows when browser detects app is installable */}
        {(isPwaInstallable || pwaInstalled) && (
          <div className={`flex items-center gap-4 p-4 rounded-2xl border shadow-sm transition-all ${
            pwaInstalled
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/30'
          }`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
              pwaInstalled ? 'bg-emerald-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
            }`}>
              {pwaInstalled ? <Check className="w-6 h-6 text-white" /> : <Download className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {pwaInstalled ? '✅ App Installed!' : '📱 Install Wellora App'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {pwaInstalled
                  ? 'Wellora is now on your home screen — tap icon to launch!'
                  : 'Add to home screen for a native app experience with offline support'}
              </p>
            </div>
            {!pwaInstalled && (
              <button
                id="pwa-install-btn"
                onClick={handleInstallApp}
                className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Install
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#0B1F1A] rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-sm overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`settings-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0 transition-all text-left ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>{tab.label}</p>
                      <p className="text-[10px] text-slate-400 truncate">{tab.desc}</p>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ml-auto shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`} />
                  </button>
                );
              })}
            </div>

            {/* Danger Zone */}
            <div className="mt-4 bg-white dark:bg-[#0B1F1A] rounded-2xl border border-red-200/60 dark:border-red-900/40 shadow-sm p-4 space-y-2">
              <p className="text-[10px] font-black text-red-500 uppercase tracking-wider mb-2">Danger Zone</p>
              <button
                id="settings-logout-btn"
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
              <button
                id="settings-delete-account-btn"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>

          {/* Right Content Panel */}
          <div className="lg:col-span-9">

            {/* ── 1. ACCOUNT TAB ── */}
            {activeTab === 'account' && (
              <div className="bg-white dark:bg-[#0B1F1A] rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">Account Information</h2>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shrink-0 shadow-md">
                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">{currentUser?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email || 'user@wellora.ai'}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/20">
                      {currentUser?.role || 'Customer'} Plan
                    </span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Full Name</label>
                    <input
                      id="settings-name-input"
                      type="text"
                      value={accountForm.name}
                      onChange={e => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Email Address</label>
                    <input
                      id="settings-email-input"
                      type="email"
                      value={accountForm.email}
                      onChange={e => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Phone Number</label>
                    <input
                      id="settings-phone-input"
                      type="text"
                      value={accountForm.phone}
                      onChange={e => setAccountForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">Diet Preference</label>
                    <select
                      id="settings-diet-select"
                      value={accountForm.dietPreference}
                      onChange={e => setAccountForm(prev => ({ ...prev, dietPreference: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                    >
                      {['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Keto', 'High Protein'].map(d => (
                        <option key={d} value={d} className="bg-white dark:bg-[#0B1F1A] text-slate-900 dark:text-white">{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    id="settings-account-save-btn"
                    onClick={handleSaveAccount}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" /> Save Account Details
                  </button>
                </div>
              </div>
            )}

            {/* ── 2. NOTIFICATIONS TAB ── */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-[#0B1F1A] rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">Notification Preferences</h2>
                <div className="space-y-3">
                  {([
                    { key: 'mealReminders',  label: 'Meal & Medication Reminders', desc: 'Timely prompts for breakfast, lunch, dinner', icon: Bell },
                    { key: 'vitalsAlerts',   label: 'Biometric Health Alerts',     desc: 'Warnings when scanned BP or sugar is out of range', icon: ShieldAlert },
                    { key: 'waterReminders', label: 'Water Hydration Reminders',   desc: 'Hourly prompts to reach your daily water goal', icon: Bell },
                    { key: 'orderUpdates',   label: 'Order Delivery Tracking',     desc: 'Real-time delivery progress updates', icon: Bell },
                    { key: 'weeklyReport',   label: 'Weekly Health Summary',       desc: 'Weekly email digest of your health progress', icon: Bell },
                    { key: 'promotions',     label: 'Promotions & Offers',         desc: 'Special deals on clinical meal subscriptions', icon: Bell },
                  ] as const).map(({ key, label, desc, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                      </div>
                      <Toggle
                        id={`settings-notif-${key}`}
                        checked={(notifState as any)[key]}
                        onChange={() => setNotifState(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 3. HEALTH GOALS TAB ── */}
            {activeTab === 'goals' && (
              <div className="bg-white dark:bg-[#0B1F1A] rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit'] font-['Outfit']">Daily Nutrition & Health Targets</h2>
                  <button
                    id="settings-save-goals-btn"
                    onClick={handleSaveGoals}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wide shadow-md flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save Targets
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1 block">Daily Calorie Goal (kcal)</label>
                    <input
                      id="settings-calorie-target-input"
                      type="number"
                      value={goalForm.dailyCalorieTarget}
                      onChange={e => setGoalForm(prev => ({ ...prev, dailyCalorieTarget: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 block">Daily Protein Target (g)</label>
                    <input
                      id="settings-protein-target-input"
                      type="number"
                      value={goalForm.dailyProteinTarget}
                      onChange={e => setGoalForm(prev => ({ ...prev, dailyProteinTarget: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 block">Daily Carbs Target (g)</label>
                    <input
                      id="settings-carbs-target-input"
                      type="number"
                      value={goalForm.dailyCarbsTarget}
                      onChange={e => setGoalForm(prev => ({ ...prev, dailyCarbsTarget: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 block">Daily Fat Target (g)</label>
                    <input
                      id="settings-fat-target-input"
                      type="number"
                      value={goalForm.dailyFatTarget}
                      onChange={e => setGoalForm(prev => ({ ...prev, dailyFatTarget: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1 block">Water Goal (Liters)</label>
                    <input
                      id="settings-water-target-input"
                      type="number"
                      step="0.1"
                      value={goalForm.waterIntakeLiters}
                      onChange={e => setGoalForm(prev => ({ ...prev, waterIntakeLiters: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1 block">Primary Fitness Goal</label>
                    <select
                      id="settings-fitness-goal-select"
                      value={goalForm.fitnessGoal}
                      onChange={e => setGoalForm(prev => ({ ...prev, fitnessGoal: e.target.value as any }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      {['Weight Loss', 'Muscle Gain', 'Diabetes Control', 'Hypertension Management', 'PCOS Care', 'General Wellness'].map(g => (
                        <option key={g} value={g} className="bg-white dark:bg-[#0B1F1A] text-slate-900 dark:text-white">{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── 4. APPEARANCE TAB (DARK MODE TOGGLE) ── */}
            {activeTab === 'appearance' && (
              <div className="bg-white dark:bg-[#0B1F1A] rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">Appearance & Display Mode</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize your visual experience across Wellora AI</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-700 text-amber-400 flex items-center justify-center shadow-sm">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Reduce eye strain with dark background and vibrant green accents</p>
                    </div>
                  </div>
                  <Toggle
                    id="settings-dark-mode-toggle"
                    checked={isDarkMode}
                    onChange={() => setIsDarkMode((prev: boolean) => !prev)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {['Light', 'Dark'].map(theme => {
                    const isSelected = (theme === 'Dark' && isDarkMode) || (theme === 'Light' && !isDarkMode);
                    return (
                      <button
                        key={theme}
                        id={`settings-theme-${theme.toLowerCase()}`}
                        className={`p-5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                        onClick={() => {
                          if (theme === 'Dark') setIsDarkMode(true);
                          else if (theme === 'Light') setIsDarkMode(false);
                        }}
                      >
                        <div className="text-2xl mb-2">{theme === 'Light' ? '☀️' : '🌙'}</div>
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">{theme} Theme</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {theme === 'Light' ? 'Clean bright background' : 'Sleek dark background'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 5. PRIVACY TAB ── */}
            {activeTab === 'privacy' && (
              <div className="bg-white dark:bg-[#0B1F1A] rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-sm p-6 space-y-5">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">Privacy & Data Sharing</h2>
                <div className="space-y-3">
                  {([
                    { key: 'shareHealthData', label: 'Share Anonymized Health Data', desc: 'Help improve AI clinical recommendations', icon: Shield },
                    { key: 'analyticsOptIn',  label: 'Usage Analytics',            desc: 'Share anonymous app usage telemetry', icon: Activity },
                    { key: 'personalizedAds', label: 'Personalized Meal Offers',    desc: 'Receive tailored discount offers', icon: Eye },
                    { key: 'locationAccess',  label: 'Location Access',            desc: 'Used for discovering local healthy restaurants', icon: Smartphone },
                  ] as const).map(({ key, label, desc, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{label}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                      </div>
                      <Toggle
                        id={`settings-privacy-${key}`}
                        checked={(privacyState as any)[key]}
                        onChange={() => setPrivacyState(prev => ({ ...prev, [key]: !(prev as any)[key] }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── 6. SECURITY TAB ── */}
            {activeTab === 'security' && (
              <div className="bg-white dark:bg-[#0B1F1A] rounded-2xl border border-slate-200/80 dark:border-emerald-500/15 shadow-sm p-6 space-y-6">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit']">Security & Authentication</h2>

                {/* Biometric Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Biometric Touch Unlock</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Use fingerprint or FaceID to unlock health records</p>
                    </div>
                  </div>
                  <Toggle
                    id="settings-biometric-toggle"
                    checked={biometricEnabled}
                    onChange={() => setBiometricEnabled(prev => !prev)}
                  />
                </div>

                {/* Password Change */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Password & Security</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Update your login password</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold"
                    >
                      {showPasswordForm ? 'Cancel' : 'Change Password'}
                    </button>
                  </div>

                  {showPasswordForm && (
                    <div className="pt-3 space-y-3 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Current Password</label>
                        <input
                          type="password"
                          value={passwords.current}
                          onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">New Password</label>
                        <input
                          type="password"
                          value={passwords.next}
                          onChange={e => setPasswords(prev => ({ ...prev, next: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <button
                        onClick={() => { setShowPasswordForm(false); showSaved('Password changed!'); }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wide shadow-md"
                      >
                        Update Password
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

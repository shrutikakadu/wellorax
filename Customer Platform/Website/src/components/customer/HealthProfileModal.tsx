import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X, User, Check, MapPin, Phone, Mail, CreditCard,
  Utensils, Activity, Plus
} from 'lucide-react';

export const HealthProfileModal: React.FC = () => {
  const {
    isProfileModalOpen, setIsProfileModalOpen,
    healthProfile, setHealthProfile,
    currentUser, setCurrentUser,
    profileModalTab,
  } = useApp();

  // Tab State: 'account' for Food App user details, 'vitals' for clinical medical data
  const [activeTab, setActiveTab] = useState<'account' | 'vitals'>('account');

  // Account / Food App Details state
  const [accountForm, setAccountForm] = useState({
    name: currentUser?.name || healthProfile.name || 'Himanshu Gulhane',
    email: currentUser?.email || 'himanshu@wellora.ai',
    phone: currentUser?.phone || '+91 98765 43210',
    dietaryPreference: currentUser?.dietaryPreference || 'Non-Vegetarian',
    homeAddress: 'Flat 402, Green Towers, Tech District, City - 500081',
    workAddress: 'Floor 5, Innovation Hub, Cyber Park, City - 500084',
    upiId: 'himanshu@okicici',
    nutriCash: currentUser?.nutriCashBalance || 850,
    preferredCuisines: ['Italian 🍕', 'Healthy Bowls 🥗', 'High Protein 💪'],
    spiceLevel: 'Medium 🔥',
  });

  // Health / Clinical Vitals form state
  const [vitalsForm, setVitalsForm] = useState({
    ...healthProfile,
    bloodPressureSystolic:  healthProfile.bloodPressureSystolic  || '',
    bloodPressureDiastolic: healthProfile.bloodPressureDiastolic || '',
    bloodSugarFasting:      healthProfile.bloodSugarFasting      || '',
    cholesterolTotal:       healthProfile.cholesterolTotal       || '',
    heartRateBpm:           healthProfile.heartRateBpm           || '',
  });

  // Sync tab from AppContext when modal opens
  useEffect(() => {
    if (isProfileModalOpen) {
      setActiveTab(profileModalTab || 'account');
      setAccountForm({
        name: currentUser?.name || healthProfile.name || 'Himanshu Gulhane',
        email: currentUser?.email || 'himanshu@wellora.ai',
        phone: currentUser?.phone || '+91 98765 43210',
        dietaryPreference: currentUser?.dietaryPreference || 'Non-Vegetarian',
        homeAddress: 'Flat 402, Green Towers, Tech District, City - 500081',
        workAddress: 'Floor 5, Innovation Hub, Cyber Park, City - 500084',
        upiId: 'himanshu@okicici',
        nutriCash: currentUser?.nutriCashBalance || 850,
        preferredCuisines: ['Italian 🍕', 'Healthy Bowls 🥗', 'High Protein 💪'],
        spiceLevel: 'Medium 🔥',
      });
      setVitalsForm({
        ...healthProfile,
        bloodPressureSystolic:  healthProfile.bloodPressureSystolic  || '',
        bloodPressureDiastolic: healthProfile.bloodPressureDiastolic || '',
        bloodSugarFasting:      healthProfile.bloodSugarFasting      || '',
        cholesterolTotal:       healthProfile.cholesterolTotal       || '',
        heartRateBpm:           healthProfile.heartRateBpm           || '',
      });
    }
  }, [isProfileModalOpen, profileModalTab, currentUser, healthProfile]);

  if (!isProfileModalOpen) return null;

  const diseaseOptions = [
    'PCOS',
    'Type-2 Diabetes',
    'Hypertension',
    'Thyroid (Hypo/Hyper)',
    'Kidney Disease',
    'Mild Insulin Sensitivity',
    'Gluten Intolerance'
  ];

  const toggleDisease = (d: string) => {
    setVitalsForm(prev => {
      const exists = prev.diseases.includes(d);
      return {
        ...prev,
        diseases: exists ? prev.diseases.filter(item => item !== d) : [...prev.diseases, d]
      };
    });
  };

  const handleSaveVitals = () => {
    setHealthProfile({
      ...vitalsForm,
      name: accountForm.name,
      bloodPressureSystolic:  vitalsForm.bloodPressureSystolic  ? Number(vitalsForm.bloodPressureSystolic)  : undefined,
      bloodPressureDiastolic: vitalsForm.bloodPressureDiastolic ? Number(vitalsForm.bloodPressureDiastolic) : undefined,
      bloodSugarFasting:      vitalsForm.bloodSugarFasting      ? Number(vitalsForm.bloodSugarFasting)      : undefined,
      cholesterolTotal:       vitalsForm.cholesterolTotal       ? Number(vitalsForm.cholesterolTotal)       : undefined,
      heartRateBpm:           vitalsForm.heartRateBpm           ? Number(vitalsForm.heartRateBpm)           : undefined,
    });
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: accountForm.name,
        email: accountForm.email,
        phone: accountForm.phone,
      });
    }
    setIsProfileModalOpen(false);
  };

  const handleSaveAccountDetails = () => {
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: accountForm.name,
        email: accountForm.email,
        phone: accountForm.phone,
      });
    }
    setHealthProfile(prev => ({ ...prev, name: accountForm.name }));
    setIsProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">

        {/* Close Button */}
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  User & Health Profile
                </h2>
                <p className="text-xs text-slate-400">
                  Manage food app account settings, delivery addresses & clinical health vitals
                </p>
              </div>
            </div>
          </div>

          {/* TAB TOGGLE SWITCH */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'account'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile & Addresses</span>
            </button>

            <button
              onClick={() => setActiveTab('vitals')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                activeTab === 'vitals'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Medical & Health Vitals</span>
            </button>
          </div>
        </div>

        {/* ── TAB 1: USER ACCOUNT & FOOD APP PROFILE DETAILS ── */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Quick VIP Status Card */}
            <div className="bg-gradient-to-r from-[#034B36] to-[#0A3025] text-white p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 font-bold text-xl">
                  👑
                </div>
                <div>
                  <p className="text-xs font-black text-amber-300 uppercase tracking-wider">NutriPass VIP Member</p>
                  <p className="text-sm font-extrabold text-white">{accountForm.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-300 block font-bold">NutriCash Wallet</span>
                <span className="text-base font-black text-amber-300">₹{accountForm.nutriCash}</span>
              </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-500" /> Account Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={e => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={accountForm.phone}
                      onChange={e => setAccountForm({ ...accountForm, phone: e.target.value })}
                      className="w-full mt-1 pl-9 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={accountForm.email}
                      onChange={e => setAccountForm({ ...accountForm, email: e.target.value })}
                      className="w-full mt-1 pl-9 pr-3 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-500" /> Saved Delivery Addresses
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Address
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {/* Home Address */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-500/30 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      🏠
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">Home</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black">DEFAULT</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                        {accountForm.homeAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Work Address */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      🏢
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">Work</span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">
                        {accountForm.workAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods & Food Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-500" /> Default Payment Method
                </h4>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  UPI ID: <span className="text-emerald-600 dark:text-emerald-400">{accountForm.upiId}</span>
                </p>
                <p className="text-[10px] text-slate-400">⚡ 1-Click Express Checkout enabled</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-500" /> Food Preferences
                </h4>
                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                    {accountForm.dietaryPreference}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    Spice: {accountForm.spiceLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Banner to switch to vitals */}
            <button
              onClick={() => setActiveTab('vitals')}
              className="w-full p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                <span>Need to update Blood Pressure, Sugar, or Weight vitals?</span>
              </div>
              <span className="text-[10px] underline">Open Vitals Form →</span>
            </button>

            {/* Save Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={handleSaveAccountDetails}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25"
              >
                Save Profile Details
              </button>
            </div>

          </div>
        )}

        {/* ── TAB 2: CLINICAL MEDICAL & HEALTH VITALS (Existing Form Preserved) ── */}
        {activeTab === 'vitals' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <Activity className="w-3.5 h-3.5" />
                <span>Clinical Biological Profile</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                Health & Medical Vitals Manager
              </h3>
              <p className="text-xs text-slate-500">
                Wellora recalculates glycemic indexes and macro targets immediately upon updating metrics.
              </p>
            </div>

            <div className="space-y-4">

              {/* Basic Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Age</label>
                  <input
                    type="number"
                    value={vitalsForm.age}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, age: Number(e.target.value) })}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Height (cm)</label>
                  <input
                    type="number"
                    value={vitalsForm.heightCm}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, heightCm: Number(e.target.value) })}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    value={vitalsForm.weightKg}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, weightKg: Number(e.target.value) })}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Target (kg)</label>
                  <input
                    type="number"
                    value={vitalsForm.targetWeightKg}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, targetWeightKg: Number(e.target.value) })}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Fitness Goal & Calorie Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Primary Fitness Goal</label>
                  <select
                    value={vitalsForm.fitnessGoal}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, fitnessGoal: e.target.value as any })}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="PCOS Relief">PCOS Relief & Insulin Control</option>
                    <option value="Diabetes Control">Type-2 Diabetes Control</option>
                    <option value="Weight Loss">Weight Loss & Fat Reduction</option>
                    <option value="Muscle Gain">Muscle Building & Athletic</option>
                    <option value="Heart Health">Heart Health & Low Lipid</option>
                    <option value="General Wellness">General Wellness</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Daily Calorie Target (kcal)</label>
                  <input
                    type="number"
                    value={vitalsForm.dailyCalorieTarget}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, dailyCalorieTarget: Number(e.target.value) })}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Medical Conditions Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-2">
                  Medical Conditions & Disease History
                </label>
                <div className="flex flex-wrap gap-2">
                  {diseaseOptions.map((d) => {
                    const selected = vitalsForm.diseases.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDisease(d)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          selected
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5" />}
                        <span>{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── VITALS SECTION ── */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-2">Health Vitals</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                  💡 These vitals power the <strong>AI Food Guard</strong> — when your BP or sugar is high, Wellora AI will warn you before adding unsafe foods to cart. You can also use the BioScan™ thumb scanner on the dashboard.
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">BP Systolic (mmHg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 120"
                      value={vitalsForm.bloodPressureSystolic}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressureSystolic: e.target.value as any })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">BP Diastolic (mmHg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 80"
                      value={vitalsForm.bloodPressureDiastolic}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressureDiastolic: e.target.value as any })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Blood Sugar (mg/dL)</label>
                    <input
                      type="number"
                      placeholder="Fasting, e.g. 92"
                      value={vitalsForm.bloodSugarFasting}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, bloodSugarFasting: e.target.value as any })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Cholesterol (mg/dL)</label>
                    <input
                      type="number"
                      placeholder="Total, e.g. 185"
                      value={vitalsForm.cholesterolTotal}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, cholesterolTotal: e.target.value as any })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 72"
                      value={vitalsForm.heartRateBpm}
                      onChange={(e) => setVitalsForm({ ...vitalsForm, heartRateBpm: e.target.value as any })}
                      className="w-full mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVitals}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25"
              >
                Save Vitals Profile
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

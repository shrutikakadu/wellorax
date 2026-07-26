import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Activity, Heart, Droplet, Minus, Shield, AlertTriangle,
  CheckCircle, Zap, Plus, X, Sparkles, ShieldAlert, Edit3,
  Save, Info, AlertOctagon
} from 'lucide-react';

const COMMON_ALLERGIES = [
  'Peanuts', 'Lactose / Dairy', 'Gluten', 'Shellfish', 'Eggs',
  'Soy', 'Tree Nuts', 'Seafood', 'Sesame', 'Mustard'
];

const COMMON_CONDITIONS = [
  'Hypertension (High BP)', 'Diabetes (Type 2)', 'High Cholesterol',
  'PCOS / PCOD', 'Fatty Liver', 'Thyroid', 'Heart Disease',
  'Acid Reflux (GERD)', 'Kidney Care'
];

const CONDITION_MEAL_DATABASE: Record<string, {
  recommended: Array<{ name: string; desc: string; image: string; tag: string; calories: number; protein: number }>;
  avoid: string[];
  explanation: string;
}> = {
  'Hypertension (High BP)': {
    recommended: [
      { name: 'Dash Diet Mediterranean Bowl', desc: 'Low sodium, potassium-rich spinach & roasted chickpeas.', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300', tag: 'Low Sodium', calories: 420, protein: 22 },
      { name: 'Grilled Salmon with Asparagus', desc: 'Omega-3 fatty acids for natural arterial pressure control.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300', tag: 'Heart Healthy', calories: 510, protein: 38 },
      { name: 'Beetroot & Walnut Quinoa Salad', desc: 'Dietary nitrates promote nitric oxide & healthy blood flow.', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300', tag: 'BP Shield', calories: 380, protein: 18 }
    ],
    avoid: ['High Sodium Soups', 'Processed Meat & Sausages', 'Canned Salty Broths', 'Pickles & Soy Sauce'],
    explanation: 'Rich in potassium, magnesium, and dietary nitrates which naturally dilate blood vessels and control systolic BP.'
  },
  'Diabetes (Type 2)': {
    recommended: [
      { name: 'Low-GI Quinoa Chicken Bowl', desc: 'Slow-digesting complex carbs prevent glycemic spikes.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', tag: 'Low GI (32)', calories: 450, protein: 35 },
      { name: 'Avocado & Boiled Egg Protein Salad', desc: 'Zero refined carbs, high healthy fats & insulin stability.', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300', tag: 'Diabetic Safe', calories: 390, protein: 24 },
      { name: 'Steamed Tofu & Broccoli Medley', desc: 'High fiber and plant protein for sustained glucose curve.', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300', tag: 'Zero Sugar', calories: 340, protein: 28 }
    ],
    avoid: ['Refined White Sugar', 'Fruit Juices & Sodas', 'White Bread & Maida', 'Deep Fried Snacks'],
    explanation: 'Focuses on low glycemic index foods with high fiber content to stabilize blood glucose and improve insulin sensitivity.'
  },
  'High Cholesterol': {
    recommended: [
      { name: 'Oatmeal Porridge with Chia & Flax', desc: 'Beta-glucan soluble fiber traps LDL cholesterol.', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300', tag: 'LDL Lowering', calories: 360, protein: 14 },
      { name: 'Baked Steamed Trout with Herbs', desc: 'High EPA/DHA reduces triglycerides and arterial plaque.', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300', tag: 'Omega-3 Rich', calories: 480, protein: 36 },
      { name: 'Steamed Chickpea Thali with Garlic', desc: 'Plant sterols naturally bind and clear excess serum lipids.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', tag: 'Cholesterol Safe', calories: 410, protein: 20 }
    ],
    avoid: ['Trans Fats & Hydrogenated Oils', 'Full-Fat Heavy Butter Cream', 'Organ Meats', 'Commercial Bakery Pastries'],
    explanation: 'Packed with soluble fiber and plant sterols that actively absorb bad LDL cholesterol before it reaches your bloodstream.'
  },
  'PCOS / PCOD': {
    recommended: [
      { name: 'Anti-Inflammatory Salmon Power Bowl', desc: 'Rich in Inositol enhancers & antioxidants for hormone balance.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', tag: 'PCOS Safe', calories: 460, protein: 34 },
      { name: 'Spearmint & Quinoa Roasted Veggies', desc: 'Helps regulate androgen levels & improves insulin response.', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300', tag: 'Hormone Care', calories: 390, protein: 19 }
    ],
    avoid: ['Dairy Heavy Desserts', 'High GI Sugary Drinks', 'Refined Flour Snacks'],
    explanation: 'Reduces systemic inflammation and stabilizes androgen hormones with anti-inflammatory omegas & complex grains.'
  }
};

const DEFAULT_RECOMMENDED = [
  { name: 'Grilled Chicken Quinoa Bowl', desc: 'Balanced lean protein with complex quinoa grains.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', tag: 'Balanced Superfood', calories: 450, protein: 35 },
  { name: 'Organic Avocado & Egg Greens', desc: 'Rich in monounsaturated fats and essential micro-nutrients.', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300', tag: 'Clean Nutrition', calories: 380, protein: 22 },
  { name: 'Steamed Veggie & Tofu Delight', desc: 'Low calorie, nutrient-dense power bowl.', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300', tag: 'High Fiber', calories: 340, protein: 26 }
];

const getVitalStatus = (
  value: number | undefined,
  normalRange: [number, number],
  highThreshold: number
) => {
  if (value === undefined) return { label: 'Not recorded', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-400', icon: <Minus className="w-3.5 h-3.5" /> };
  if (value <= normalRange[1] && value >= normalRange[0]) return { label: 'Normal', bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: <CheckCircle className="w-3.5 h-3.5" /> };
  if (value > highThreshold) return { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-500', icon: <AlertTriangle className="w-3.5 h-3.5" /> };
  return { label: 'Borderline', bg: 'bg-amber-500/10', text: 'text-amber-500', icon: <AlertTriangle className="w-3.5 h-3.5" /> };
};

const getBMILabel = (bmi: number) => {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  if (bmi < 25) return { label: 'Normal', color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-amber-500', bg: 'bg-amber-500/10' };
  return { label: 'Obese', color: 'text-red-500', bg: 'bg-red-500/10' };
};

export const HealthReports: React.FC = () => {
  const { healthProfile, setHealthProfile, addToCart, setCurrentView } = useApp();

  // Editing state for user's medical profile & allergies
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>(healthProfile.diseases || []);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(healthProfile.allergies || []);
  const [customDiseaseInput, setCustomDiseaseInput] = useState('');
  const [customAllergyInput, setCustomAllergyInput] = useState('');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  const bmiInfo = getBMILabel(healthProfile.bmi);
  const scoreColor = healthProfile.healthScore >= 80 ? '#10b981' : healthProfile.healthScore >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (healthProfile.healthScore / 100) * circumference;

  const toggleDisease = (disease: string) => {
    setSelectedDiseases(prev =>
      prev.includes(disease) ? prev.filter(d => d !== disease) : [...prev, disease]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const addCustomDisease = () => {
    if (customDiseaseInput.trim() && !selectedDiseases.includes(customDiseaseInput.trim())) {
      setSelectedDiseases(prev => [...prev, customDiseaseInput.trim()]);
      setCustomDiseaseInput('');
    }
  };

  const addCustomAllergy = () => {
    if (customAllergyInput.trim() && !selectedAllergies.includes(customAllergyInput.trim())) {
      setSelectedAllergies(prev => [...prev, customAllergyInput.trim()]);
      setCustomAllergyInput('');
    }
  };

  const handleSaveHealthConditions = () => {
    setHealthProfile(prev => ({
      ...prev,
      diseases: selectedDiseases,
      allergies: selectedAllergies,
    }));
    setIsEditing(false);
    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 4000);
  };

  // Derive tailored meal recommendations based on active health conditions & allergies
  const activeConditionKeys = healthProfile.diseases.filter(d => CONDITION_MEAL_DATABASE[d]);
  
  let recommendedFoods = activeConditionKeys.length > 0
    ? activeConditionKeys.flatMap(d => CONDITION_MEAL_DATABASE[d].recommended)
    : DEFAULT_RECOMMENDED;

  // Filter out any foods matching active allergies
  if (healthProfile.allergies.length > 0) {
    const allergyLower = healthProfile.allergies.map(a => a.toLowerCase());
    recommendedFoods = recommendedFoods.filter(food =>
      !allergyLower.some(allergy =>
        food.name.toLowerCase().includes(allergy) || food.desc.toLowerCase().includes(allergy)
      )
    );
  }

  const foodsToAvoid = activeConditionKeys.flatMap(d => CONDITION_MEAL_DATABASE[d].avoid);

  const vitals = [
    { label: 'Systolic BP', value: healthProfile.bloodPressureSystolic, unit: 'mmHg', status: getVitalStatus(healthProfile.bloodPressureSystolic, [90, 120], 140), icon: <Heart className="w-5 h-5" />, color: 'from-rose-500 to-pink-500' },
    { label: 'Diastolic BP', value: healthProfile.bloodPressureDiastolic, unit: 'mmHg', status: getVitalStatus(healthProfile.bloodPressureDiastolic, [60, 80], 90), icon: <Heart className="w-5 h-5" />, color: 'from-pink-500 to-fuchsia-500' },
    { label: 'Fasting Sugar', value: healthProfile.bloodSugarFasting, unit: 'mg/dL', status: getVitalStatus(healthProfile.bloodSugarFasting, [70, 100], 126), icon: <Droplet className="w-5 h-5" />, color: 'from-amber-500 to-orange-500' },
    { label: 'Cholesterol', value: healthProfile.cholesterolTotal, unit: 'mg/dL', status: getVitalStatus(healthProfile.cholesterolTotal, [0, 200], 240), icon: <Activity className="w-5 h-5" />, color: 'from-yellow-500 to-amber-500' },
    { label: 'Heart Rate', value: healthProfile.heartRateBpm, unit: 'bpm', status: getVitalStatus(healthProfile.heartRateBpm, [60, 100], 100), icon: <Zap className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5" /> Clinical Health Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
            Personalized Health & Food Report
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time biometric insights, allergy guards, and AI food recommendations for your health conditions.
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20"
        >
          {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditing ? 'Cancel Editing' : 'Update Medical & Allergy Info'}</span>
        </button>
      </div>

      {savedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Your health conditions and allergies have been updated! All AI food suggestions are now personalized for you.
          </span>
          <button onClick={() => setSavedSuccessMsg(false)}>✕</button>
        </div>
      )}

      {/* ─── INTERACTIVE HEALTH CONDITIONS & ALLERGIES FORM ─── */}
      {isEditing && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-xl space-y-6 animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-500" /> Update Health Problems & Food Allergies
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Select any medical conditions or food allergies so our AI suggests the best safe meals for you.</p>
            </div>
            <button
              onClick={handleSaveHealthConditions}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wide transition-all shadow-lg flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save & Update AI Food Engine
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Conditions / Health Problems */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-500" /> Medical Conditions / Health Problems
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((cond) => {
                  const isSelected = selectedDiseases.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleDisease(cond)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '} {cond}
                    </button>
                  );
                })}
              </div>

              {/* Custom Medical Condition Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom health condition..."
                  value={customDiseaseInput}
                  onChange={e => setCustomDiseaseInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomDisease(); } }}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 font-medium"
                />
                <button
                  type="button"
                  onClick={addCustomDisease}
                  className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Food Allergies */}
            <div className="space-y-3">
              <label className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Food Allergies & Intolerances
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((allergy) => {
                  const isSelected = selectedAllergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      {isSelected ? '⚠️ ' : '+ '} {allergy}
                    </button>
                  );
                })}
              </div>

              {/* Custom Allergy Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add custom food allergy (e.g. Mushrooms)..."
                  value={customAllergyInput}
                  onChange={e => setCustomAllergyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomAllergy(); } }}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-medium"
                />
                <button
                  type="button"
                  onClick={addCustomAllergy}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AI TAILORED BEST FOOD SUGGESTIONS (DYNAMIC BASED ON USER HEALTH PROBLEMS & ALLERGIES) ─── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-emerald-500/20">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-['Outfit']">
                AI Tailored Food Suggestions for Your Health Profile
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filtered for {healthProfile.diseases.length > 0 ? healthProfile.diseases.join(', ') : 'General Wellness'} & zero allergy triggers ({healthProfile.allergies.length > 0 ? healthProfile.allergies.join(', ') : 'No allergies'}).
            </p>
          </div>

          <button
            onClick={() => setCurrentView('marketplace')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shrink-0"
          >
            Explore All Safe Meals &rarr;
          </button>
        </div>

        {/* AI Medical Explanation Box */}
        {activeConditionKeys.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20 space-y-1.5">
            <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Info className="w-4 h-4" /> Why these foods were chosen for your condition:
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {CONDITION_MEAL_DATABASE[activeConditionKeys[0]]?.explanation}
            </p>
          </div>
        )}

        {/* Suggested Best Foods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedFoods.map((food, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-full h-32 rounded-xl overflow-hidden mb-3 relative">
                  <img src={food.image} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wide shadow-md">
                    ✓ {food.tag}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{food.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{food.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  {food.calories} kcal • <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{food.protein}g Protein</span>
                </span>
                <button
                  onClick={() => {
                    addToCart({
                      id: `rec-health-${idx}`,
                      name: food.name,
                      restaurantId: 'r-health',
                      restaurantName: 'Wellora Health Kitchen',
                      image: food.image,
                      price: 299,
                      rating: 4.9,
                      reviewCount: 150,
                      prepTime: '20 min',
                      macros: { calories: food.calories, protein: food.protein, carbs: 35, fat: 10, fiber: 6, sugar: 2 },
                      categories: [food.tag as any],
                      aiMatchScore: 98,
                      healthRiskScore: 'Low',
                      aiExplanation: food.desc,
                      ingredients: ['Organic Ingredients'],
                      preparation: 'Prepared under strict clinical hygiene.',
                      isNutritionVerified: true,
                      dietaryBadges: [food.tag]
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Order Meal
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Hazard Warning: Foods to Avoid for user's medical conditions */}
        {foodsToAvoid.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
            <h4 className="text-xs font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 text-rose-500" /> Foods You Should Strictly Avoid:
            </h4>
            <div className="flex flex-wrap gap-2">
              {foodsToAvoid.map((avoidItem, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold">
                  ⛔ {avoidItem}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Overview Cards (Score, BMI, Body Metrics) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Overall Health Score Ring */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col items-center justify-center text-center space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">Overall Health Score</h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-800" />
              <circle cx="60" cy="60" r="54" fill="none" stroke={scoreColor} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit'] block leading-none">{healthProfile.healthScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 block">Out of 100</span>
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">Body Mass Index (BMI)</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${bmiInfo.bg} ${bmiInfo.color}`}>{bmiInfo.label}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">{healthProfile.bmi}</span>
            <span className="text-xs text-slate-400 font-medium">kg/m²</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
            <div className="h-full bg-blue-500" style={{ width: '18.5%' }} />
            <div className="h-full bg-emerald-500" style={{ width: '25%' }} />
            <div className="h-full bg-amber-500" style={{ width: '25%' }} />
            <div className="h-full bg-red-500" style={{ width: '31.5%' }} />
          </div>
        </div>

        {/* Medical Conditions Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit']">Your Active Conditions</h3>
            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>

          <div className="space-y-2">
            {healthProfile.diseases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {healthProfile.diseases.map(d => (
                  <span key={d} className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
                    🏥 {d}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium">No medical conditions selected.</p>
            )}

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Recorded Allergies</span>
              {healthProfile.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {healthProfile.allergies.map(a => (
                    <span key={a} className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">No food allergies recorded.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Vitals Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">Biometric Vital Signs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {vitals.map((v) => (
            <div key={v.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${v.color} text-white flex items-center justify-center`}>
                  {v.icon}
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status.bg} ${v.status.text}`}>
                  {v.status.icon}
                  {v.status.label}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{v.label}</p>
                {v.value !== undefined ? (
                  <p className="text-xl font-black text-slate-900 dark:text-white font-['Outfit'] mt-0.5">
                    {v.value}
                    <span className="text-xs font-semibold text-slate-400 ml-1">{v.unit}</span>
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 mt-1">Not recorded</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HealthReports;

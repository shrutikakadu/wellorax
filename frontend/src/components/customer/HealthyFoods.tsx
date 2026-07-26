import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Meal } from '../../types';
import {
  Leaf, Flame, ShoppingCart, Star, CheckCircle,
  Heart, Shield, Zap, Salad
} from 'lucide-react';

const HEALTHY_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌿' },
  { id: 'superfood', label: 'Superfoods', emoji: '🥦' },
  { id: 'protein', label: 'High Protein', emoji: '💪' },
  { id: 'detox', label: 'Detox', emoji: '🍋' },
  { id: 'smoothie', label: 'Smoothies', emoji: '🥤' },
  { id: 'salad', label: 'Salads', emoji: '🥗' },
  { id: 'organic', label: 'Organic', emoji: '🌱' },
];

const healthyMeals: (Meal & { healthTag: string; tags: string[] })[] = [
  {
    id: 'hf-1', name: 'Quinoa Buddha Bowl', restaurantId: 'r1', restaurantName: 'The Green Fork',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
    price: 349, rating: 4.8, reviewCount: 234, prepTime: '15 min',
    macros: { calories: 420, protein: 18, carbs: 52, fat: 14, fiber: 9, sugar: 6 },
    categories: ['Vegan', 'High Protein'], aiMatchScore: 96, healthRiskScore: 'Low',
    aiExplanation: 'Rich in plant protein and fiber.', healthyAlternative: undefined,
    ingredients: ['Quinoa', 'Avocado', 'Chickpeas', 'Kale', 'Tahini'],
    preparation: 'Cooked quinoa with roasted vegetables and tahini dressing.',
    isNutritionVerified: true, isVeg: true, aiHealthTag: 'Superfood', dietaryBadges: ['Vegan', 'Gluten-Free'],
    healthTag: 'Superfood', tags: ['superfood', 'salad', 'protein'],
  },
  {
    id: 'hf-2', name: 'Grilled Salmon & Greens', restaurantId: 'r2', restaurantName: 'Omega Kitchen',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    price: 499, rating: 4.9, reviewCount: 187, prepTime: '20 min',
    macros: { calories: 480, protein: 38, carbs: 12, fat: 28, fiber: 4, sugar: 2 },
    categories: ['High Protein', 'Heart Healthy'], aiMatchScore: 94, healthRiskScore: 'Low',
    aiExplanation: 'Omega-3 rich, excellent for heart health.', healthyAlternative: undefined,
    ingredients: ['Atlantic Salmon', 'Mixed Greens', 'Olive Oil', 'Lemon'],
    preparation: 'Pan-seared salmon with a fresh garden salad.',
    isNutritionVerified: true, isVeg: false, aiHealthTag: 'Heart Healthy', dietaryBadges: ['Keto', 'Gluten-Free'],
    healthTag: 'High Protein', tags: ['protein', 'superfood'],
  },
  {
    id: 'hf-3', name: 'Green Detox Smoothie', restaurantId: 'r3', restaurantName: 'Juice & Pulse',
    image: 'https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=400',
    price: 199, rating: 4.7, reviewCount: 412, prepTime: '5 min',
    macros: { calories: 180, protein: 6, carbs: 32, fat: 3, fiber: 7, sugar: 18 },
    categories: ['Vegan', 'Weight Loss'], aiMatchScore: 92, healthRiskScore: 'Low',
    aiExplanation: 'Packed with antioxidants and detoxifying greens.', healthyAlternative: undefined,
    ingredients: ['Spinach', 'Apple', 'Ginger', 'Lemon', 'Chia Seeds'],
    preparation: 'Freshly blended with cold-pressed technique.',
    isNutritionVerified: true, isVeg: true, aiHealthTag: 'Detox', dietaryBadges: ['Vegan', 'Raw'],
    healthTag: 'Detox', tags: ['detox', 'smoothie', 'organic'],
  },
  {
    id: 'hf-4', name: 'Avocado Protein Toast', restaurantId: 'r4', restaurantName: 'Sprout & Co',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    price: 279, rating: 4.6, reviewCount: 301, prepTime: '10 min',
    macros: { calories: 380, protein: 22, carbs: 34, fat: 18, fiber: 8, sugar: 3 },
    categories: ['Vegetarian', 'High Protein'], aiMatchScore: 90, healthRiskScore: 'Low',
    aiExplanation: 'Balanced macros with healthy fats and complex carbs.', healthyAlternative: undefined,
    ingredients: ['Sourdough', 'Avocado', 'Eggs', 'Cherry Tomatoes', 'Chili Flakes'],
    preparation: 'Toasted sourdough topped with mashed avocado and poached eggs.',
    isNutritionVerified: true, isVeg: true, aiHealthTag: 'Balanced', dietaryBadges: ['Vegetarian'],
    healthTag: 'High Protein', tags: ['protein', 'superfood'],
  },
  {
    id: 'hf-5', name: 'Organic Acai Bowl', restaurantId: 'r3', restaurantName: 'Juice & Pulse',
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400',
    price: 329, rating: 4.8, reviewCount: 198, prepTime: '8 min',
    macros: { calories: 340, protein: 10, carbs: 56, fat: 10, fiber: 6, sugar: 24 },
    categories: ['Vegan', 'Weight Gain'], aiMatchScore: 88, healthRiskScore: 'Low',
    aiExplanation: 'Antioxidant-rich superfood bowl.', healthyAlternative: undefined,
    ingredients: ['Acai', 'Banana', 'Granola', 'Blueberries', 'Coconut'],
    preparation: 'Frozen acai blended and topped with fresh fruits.',
    isNutritionVerified: true, isVeg: true, aiHealthTag: 'Superfood', dietaryBadges: ['Vegan', 'Organic'],
    healthTag: 'Superfood', tags: ['superfood', 'smoothie', 'organic'],
  },
  {
    id: 'hf-6', name: 'Chickpea Power Salad', restaurantId: 'r1', restaurantName: 'The Green Fork',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    price: 289, rating: 4.5, reviewCount: 156, prepTime: '12 min',
    macros: { calories: 360, protein: 20, carbs: 44, fat: 12, fiber: 11, sugar: 5 },
    categories: ['Vegan', 'High Protein'], aiMatchScore: 91, healthRiskScore: 'Low',
    aiExplanation: 'High fiber plant protein with anti-inflammatory ingredients.', healthyAlternative: undefined,
    ingredients: ['Chickpeas', 'Cucumber', 'Pomegranate', 'Mint', 'Olive Oil'],
    preparation: 'Tossed with lemon-herb vinaigrette.',
    isNutritionVerified: true, isVeg: true, aiHealthTag: 'Anti-Inflammatory', dietaryBadges: ['Vegan', 'Gluten-Free'],
    healthTag: 'High Protein', tags: ['protein', 'salad', 'organic'],
  },
];

export const HealthyFoods: React.FC = () => {
  const { addToCart, removeFromCart, cart } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? healthyMeals
    : healthyMeals.filter(m => m.tags.includes(activeCategory));

  const getCartQty = (mealId: string) => cart.find(i => i.meal.id === mealId)?.quantity || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold">
          <Leaf className="w-3.5 h-3.5" />
          Healthy Foods
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
          Clean Eating, <span className="text-green-500">Curated for You</span>
        </h1>
        <p className="text-xs text-slate-400 max-w-lg">
          AI-verified healthy meals packed with nutrients. Every dish is clinically analyzed for your health profile.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Shield, label: 'AI Verified', value: '100%', color: 'emerald' },
          { icon: Flame, label: 'Avg Calories', value: '360 kcal', color: 'orange' },
          { icon: Zap, label: 'Avg Protein', value: '19g', color: 'blue' },
          { icon: Heart, label: 'Health Score', value: '9.2/10', color: 'rose' },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10">
            <s.icon className={`w-4 h-4 text-${s.color}-500 mb-1.5`} />
            <p className="text-xs font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-[10px] text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {HEALTHY_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat.id
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                : 'bg-white dark:bg-[#0B1F1A] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-emerald-500/10 hover:border-green-500/40'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Meal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(meal => {
          const qty = getCartQty(meal.id);
          return (
            <div
              key={meal.id}
              className="rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-44 overflow-hidden">
                <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-black uppercase tracking-wider">
                    {meal.healthTag}
                  </span>
                  {meal.isNutritionVerified && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/90 text-white text-[10px] font-black flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <button className="p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{meal.name}</h3>
                    <p className="text-[10px] text-slate-400">{meal.restaurantName}</p>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-amber-500/10">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{meal.rating}</span>
                  </div>
                </div>

                {/* Macros */}
                <div className="flex gap-2">
                  {[
                    { label: 'Cal', val: meal.macros.calories, color: 'orange' },
                    { label: 'Pro', val: `${meal.macros.protein}g`, color: 'blue' },
                    { label: 'Carb', val: `${meal.macros.carbs}g`, color: 'emerald' },
                  ].map(m => (
                    <div key={m.label} className={`flex-1 text-center py-1 rounded-lg bg-${m.color}-500/5`}>
                      <p className={`text-[10px] font-black text-${m.color}-500`}>{m.val}</p>
                      <p className="text-[9px] text-slate-400">{m.label}</p>
                    </div>
                  ))}
                </div>

                {/* Ingredients */}
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {meal.ingredients.join(' · ')}
                </p>

                {/* Price + Add */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-black text-slate-900 dark:text-white">₹{meal.price}</span>
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(meal)}
                      className="px-3 py-1.5 rounded-xl bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-2 py-1 rounded-xl bg-green-500/10 border border-green-500/30">
                      <button onClick={() => removeFromCart(meal.id)} className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold">-</button>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 min-w-[16px] text-center">{qty}</span>
                      <button onClick={() => addToCart(meal)} className="w-6 h-6 rounded-lg bg-green-500 text-white flex items-center justify-center text-xs font-bold">+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="text-center py-12 space-y-2">
          <Salad className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
          <p className="text-sm font-bold text-slate-900 dark:text-white">No meals in this category</p>
          <p className="text-xs text-slate-400">Try a different category above.</p>
        </div>
      )}
    </div>
  );
};

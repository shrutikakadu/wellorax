export type PlatformView = 
  | 'landing'
  | 'dashboard'
  | 'marketplace'
  | 'nutrition-dashboard'
  | 'meal-planner'
  | 'smart-grocery'
  | 'doctor-consultation'
  | 'admin-dashboard'
  | 'restaurant-dashboard'
  | 'doctor-dashboard'
  | 'gold-facilities'
  | 'my-orders'
  | 'healthy-foods'
  | 'health-reports'
  | 'workouts'
  | 'water-tracker'
  | 'favorites'
  | 'rewards'
  | 'wallet';

export type CategoryFilter = 
  | 'All'
  | 'Weight Loss'
  | 'Weight Gain'
  | 'Gym Meals'
  | 'High Protein'
  | 'Diabetes Friendly'
  | 'Heart Healthy'
  | 'Kidney Friendly'
  | 'PCOS'
  | 'PCOS Safe'
  | 'Thyroid'
  | 'Pregnancy'
  | 'Kids Nutrition'
  | 'Senior Citizen'
  | 'Vegan'
  | 'Vegetarian'
  | 'Low Carb'
  | 'Keto'
  | 'Organic'
  | 'Pizza'
  | 'Italian'
  | 'Comfort Food'
  | 'Low GI'
  | 'Low Sodium'
  | 'Burgers'
  | 'American'
  | 'Cheat Meal'
  | 'Breakfast'
  | 'Post-Workout'
  | 'Ayurvedic'
  | 'Detox'
  | 'Gut Health'
  | 'Chinese'
  | 'Indo-Chinese'
  | 'Noodles'
  | 'Steamed'
  | 'Low Fat'
  | 'Light'
  | 'Seafood'
  | 'Spicy'
  | 'Plant-Based'
  | 'Whole Wheat'
  | 'Balanced'
  | 'Indian Fusion';

export interface NutritionMacros {
  calories: number;
  protein: number; // in grams
  carbs: number;   // in grams
  fat: number;     // in grams
  fiber: number;   // in grams
  sugar: number;   // in grams
  glycemicIndex?: number;
}

export interface Meal {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  prepTime: string;
  macros: NutritionMacros;
  categories: CategoryFilter[];
  aiMatchScore: number;
  healthRiskScore: 'Low' | 'Moderate' | 'High';
  aiExplanation: string;
  healthyAlternative?: string;
  ingredients: string[];
  preparation: string;
  isNutritionVerified: boolean;
  isVeg?: boolean;
  aiHealthTag?: string;
  dietaryBadges: string[];
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string[];
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  distance: string;
  priceForTwo: number;
  isNutritionVerified: boolean;
  aiHealthyScore: number;
  featuredMealId: string;
  discountOffer?: string;
  offers?: string[];
}

export interface HealthProfile {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  bmi: number;
  diseases: string[];
  allergies: string[];
  fitnessGoal: 'Weight Loss' | 'Muscle Gain' | 'Diabetes Control' | 'Heart Health' | 'PCOS Relief' | 'General Wellness';
  activityLevel: 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
  preferredCuisine: string[];
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  dailyCarbTarget: number;
  dailyFatTarget: number;
  waterIntakeLiters: number;
  healthScore: number;
  // Vitals — entered manually or via biometric scanner
  bloodPressureSystolic?: number;   // e.g. 120 (normal) | 140+ (high)
  bloodPressureDiastolic?: number;  // e.g. 80 (normal) | 90+ (high)
  bloodSugarFasting?: number;       // mg/dL — 70-100 normal, 100-125 pre-diabetic, 126+ diabetic
  cholesterolTotal?: number;        // mg/dL — <200 normal, 200-239 borderline, 240+ high
  heartRateBpm?: number;            // bpm — 60-100 normal
  oxygenSaturation?: number;        // % — 95-100 normal
  lastVitalScanAt?: string;         // ISO timestamp of last biometric scan
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  consultationFee: number;
  image: string;
  availableToday: boolean;
  nextSlot: string;
  aiMatchReason: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: 'Vegetables' | 'Fruits' | 'Protein' | 'Organic Dairy' | 'Supplements' | 'Healthy Snacks' | 'Pizza';
  price: number;
  unit: string;
  image: string;
  rating: number;
  isOrganic: boolean;
  nutritionTag: string;
}

export interface CartItem {
  meal: Meal;
  quantity: number;
  customizations?: string[];
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'AI Verified' | 'Kitchen Preparing' | 'Driver En Route' | 'Delivered';
  etaMinutes: number;
  otpCode: string;
  deliveryPartner: {
    name: string;
    phone: string;
    rating: number;
    image: string;
  };
  restaurantName: string;
  deliveryAddress: string;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  mealRecommendation?: Meal;
  healthInsight?: string;
  voiceAudioUrl?: string;
}

export interface UserAddress {
  id: string;
  label: 'Home' | 'Work' | 'Gym' | 'Other';
  addressLine: string;
  city: string;
  pincode: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  addresses?: UserAddress[];
  defaultAddress?: string;
  preferredPayment?: string;
  dietaryPreference?: 'Vegetarian' | 'Non-Vegetarian' | 'Vegan' | 'Eggetarian';
  nutriCashBalance?: number;
}


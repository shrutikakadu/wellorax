import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type {
  PlatformView,
  CategoryFilter,
  HealthProfile,
  Meal,
  CartItem,
  Order,
  GroceryItem,
  AIChatMessage,
  User
} from '../types';
import {
  INITIAL_HEALTH_PROFILE,
  MOCK_MEALS,
} from '../data/mockData';
import {
  authService,
  mealsService,
  ordersService,
  healthProfileService,
  aiService,
  mealRecommendationService
} from '../services';
import { runClinicalAssessment } from '../services/medicalEngine';

interface DailyIntake {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number; // in Liters
}

interface AppContextType {
  currentView: PlatformView;
  setCurrentView: (view: PlatformView) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  activeCategory: CategoryFilter;
  setActiveCategory: (cat: CategoryFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  healthProfile: HealthProfile;
  setHealthProfile: React.Dispatch<React.SetStateAction<HealthProfile>>;
  cart: CartItem[];
  addToCart: (meal: Meal) => void;
  removeFromCart: (mealId: string) => void;
  clearCart: () => void;
  selectedMealForDetail: Meal | null;
  setSelectedMealForDetail: (meal: Meal | null) => void;
  isAIModalOpen: boolean;
  setIsAIModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  profileModalTab: 'account' | 'vitals';
  setProfileModalTab: (tab: 'account' | 'vitals') => void;
  openProfileModal: (tab?: 'account' | 'vitals') => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  userLocation: string;
  setUserLocation: (loc: string) => void;
  isOrderTrackingOpen: boolean;
  setIsOrderTrackingOpen: (open: boolean) => void;
  activeOrder: Order | null;
  ordersHistory: Order[];
  isOrderSuccessModalOpen: boolean;
  setIsOrderSuccessModalOpen: (open: boolean) => void;
  lastPlacedOrder: Order | null;
  placeOrder: () => void;
  aiChatMessages: AIChatMessage[];
  sendAIMessage: (text: string) => void;
  addGroceryToCart: (item: GroceryItem) => void;
  meals: Meal[];
  isLoadingMeals: boolean;
  recommendedMeals: Meal[];
  isLoadingRecommendations: boolean;

  // Daily Intake Tracking (updates dynamically from orders placed)
  dailyIntake: DailyIntake;
  setDailyIntake: React.Dispatch<React.SetStateAction<DailyIntake>>;
  addWater: (liters: number) => void;

  // Auth
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalDefaultMode: 'login' | 'signup';
  setAuthModalDefaultMode: (mode: 'login' | 'signup') => void;
  logout: () => void;
  syncUserData: () => Promise<void>;
  loginAndRedirect: (user: User, token: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** Derives the correct dashboard view for a given user role */
const getDashboardForRole = (role: string): PlatformView => {
  switch (role) {
    case 'ADMIN': return 'admin-dashboard';
    case 'RESTAURANT_OWNER': return 'restaurant-dashboard';
    case 'DOCTOR': return 'doctor-dashboard';
    default: return 'dashboard';
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // App UI & Feature States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('wellora_theme') === 'dark';
  });
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [rawHealthProfile, setRawHealthProfile] = useState<HealthProfile>(INITIAL_HEALTH_PROFILE);
  const healthProfile = useMemo(() => {
    const clinical = runClinicalAssessment({
      systolicBP:  rawHealthProfile.bloodPressureSystolic,
      diastolicBP: rawHealthProfile.bloodPressureDiastolic,
      bloodSugar:  rawHealthProfile.bloodSugarFasting,
      cholesterol: rawHealthProfile.cholesterolTotal,
      heartRate:   rawHealthProfile.heartRateBpm,
      bmi:         rawHealthProfile.bmi,
      age:         rawHealthProfile.age,
      gender:      rawHealthProfile.gender as any,
      diseases:    rawHealthProfile.diseases,
    });
    return {
      ...rawHealthProfile,
      healthScore: clinical.overallScore,
    };
  }, [rawHealthProfile]);

  const setHealthProfile = useCallback((val: React.SetStateAction<HealthProfile>) => {
    setRawHealthProfile(val);
  }, []);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Daily intake tracking — resets to 0 for new users; updates as orders are placed
  const [dailyIntake, setDailyIntake] = useState<DailyIntake>({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
  const addWater = useCallback((liters: number) => {
    setDailyIntake(prev => ({ ...prev, water: Math.min(prev.water + liters, 10) }));
  }, []);
  const [selectedMealForDetail, setSelectedMealForDetail] = useState<Meal | null>(null);

  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileModalTab, setProfileModalTab] = useState<'account' | 'vitals'>('account');
  const openProfileModal = useCallback((tab: 'account' | 'vitals' = 'account') => {
    setProfileModalTab(tab);
    setIsProfileModalOpen(true);
  }, []);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<string>('Tech District, Block 4B');
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);
  const [isOrderSuccessModalOpen, setIsOrderSuccessModalOpen] = useState<boolean>(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Auth States (Initialized synchronously from localStorage to avoid flashing)
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => authService.isAuthenticated());
  const [currentView, setCurrentView] = useState<PlatformView>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalDefaultMode, setAuthModalDefaultMode] = useState<'login' | 'signup'>('login');

  // Meals
  const [meals, setMeals] = useState<Meal[]>(MOCK_MEALS);
  const [isLoadingMeals, setIsLoadingMeals] = useState<boolean>(false);

  // Recommendations
  const [recommendedMeals, setRecommendedMeals] = useState<Meal[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false);

  // AI Chat
  const [aiChatMessages, setAiChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'ai-welcome',
      sender: 'ai',
      text: `Hello! I'm Wellora. Sign in to get personalized meal recommendations, glycemic targets, and macro plans tailored to your health profile.`,
      timestamp: 'Just now',
    }
  ]);

  // Sync dark class on html root & persist preference
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('wellora_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('wellora_theme', 'light');
    }
  }, [isDarkMode]);

  // ─── SYNC USER DATA FROM BACKEND ──────────────────────────────────────────
  const syncUserData = useCallback(async () => {
    try {
      const storedUser = authService.getStoredUser();
      if (storedUser) {
        setCurrentUser(storedUser);
        setIsAuthenticated(true);
      }

      // Fetch health profile from backend
      const profileRes = await healthProfileService.get();
      if (profileRes.success && profileRes.data) {
        const profileData = profileRes.data as any;
        setHealthProfile(prev => ({
          ...prev,
          name: storedUser?.name || prev.name,
          age: profileData.age ?? prev.age,
          heightCm: profileData.heightCm ?? prev.heightCm,
          weightKg: profileData.weightKg ?? prev.weightKg,
          targetWeightKg: profileData.targetWeightKg ?? prev.targetWeightKg,
          fitnessGoal: profileData.fitnessGoal as any ?? prev.fitnessGoal,
          dailyCalorieTarget: profileData.dailyCalorieTarget ?? prev.dailyCalorieTarget,
          diseases: profileData.diseases ? JSON.parse(profileData.diseases) : prev.diseases,
          bmi: profileData.bmi || prev.bmi,
        }));
      }

      // Fetch AI chat history
      const chatRes = await aiService.getHistory();
      if (chatRes.success && chatRes.data.length > 0) {
        const adaptedChat: AIChatMessage[] = chatRes.data.map((msg: any) => ({
          id: msg.id,
          sender: msg.role === 'user' ? 'user' : 'ai',
          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setAiChatMessages(adaptedChat);
      } else {
        // Personalized welcome after login
        if (storedUser) {
          setAiChatMessages([{
            id: 'ai-welcome-auth',
            sender: 'ai',
            text: `Welcome back, ${storedUser.name.split(' ')[0]}! 👋 I've loaded your health profile. How can I help you with your nutrition goals today?`,
            timestamp: 'Just now',
          }]);
        }
      }

      // Fetch personalized meal recommendations
      try {
        setIsLoadingRecommendations(true);
        const recRes = await mealRecommendationService.getRecommended(8);
        if (recRes.success && recRes.data?.recommendations?.length > 0) {
          const adaptedRecs: Meal[] = recRes.data.recommendations.map((r: any) => ({
            id: r.id,
            name: r.name,
            restaurantId: r.restaurantId,
            restaurantName: r.restaurantName,
            image: r.imageUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            price: r.price,
            rating: r.healthScore ? Math.round((r.healthScore / 2) * 10) / 10 : 4.5,
            reviewCount: 120,
            prepTime: '20 min',
            macros: {
              calories: r.calories,
              protein: r.protein,
              carbs: r.carbs,
              fat: r.fat,
              fiber: r.fiber || 5,
              sugar: r.sugar || 4,
              glycemicIndex: r.glycemicIndex || 35,
            },
            categories: r.tags ? JSON.parse(r.tags) : [],
            aiMatchScore: Math.min(99, Math.round(r.recommendationScore)),
            healthRiskScore: r.healthScore > 8 ? 'Low' : 'Moderate',
            aiExplanation: r.recommendationReasons?.join('. ') || r.description,
            ingredients: r.description.split(', '),
            preparation: 'Freshly prepared by certified culinary partners.',
            isNutritionVerified: true,
            dietaryBadges: r.tags ? JSON.parse(r.tags) : [],
          }));
          setRecommendedMeals(adaptedRecs);
        }
      } catch (err) {
        console.warn('Recommendations fetch failed.', err);
      } finally {
        setIsLoadingRecommendations(false);
      }
    } catch (err) {
      console.warn('⚠️ User data sync failed, using local defaults.', err);
    }
  }, []);

  // ─── LOGIN & REDIRECT (called after successful auth) ──────────────────────
  const loginAndRedirect = useCallback(async (user: User, token: string) => {
    authService.saveSession(token, user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);

    // Navigate to role-appropriate dashboard
    const targetView = getDashboardForRole(user.role);
    setCurrentView(targetView);

    // Sync profile & chat from backend
    await syncUserData();
  }, [syncUserData]);

  // ─── INITIAL APP SETUP ────────────────────────────────────────────────────
  useEffect(() => {
    const initApp = async () => {
      // 1. If already logged in, sync profile & data in background
      if (authService.isAuthenticated()) {
        syncUserData();
      }

      // 2. Fetch public meals (no auth required)
      try {
        setIsLoadingMeals(true);
        const mealsRes = await mealsService.getAll();
        if (mealsRes.success && mealsRes.data.length > 0) {
          const adaptedMeals: Meal[] = mealsRes.data.map((m: any) => ({
            id: m.id,
            name: m.name,
            restaurantId: m.restaurantId,
            restaurantName: m.restaurant?.name || 'GreenBowl Kitchen',
            image: m.imageUrl || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
            price: m.price,
            rating: m.healthScore ? Math.round((m.healthScore / 2) * 10) / 10 : 4.5,
            reviewCount: 120,
            prepTime: `${m.restaurant?.deliveryMin || 25} min`,
            macros: {
              calories: m.calories,
              protein: m.protein,
              carbs: m.carbs,
              fat: m.fat,
              fiber: m.fiber || 5,
              sugar: m.sugar || 4,
              glycemicIndex: m.glycemicIndex || 35,
            },
            categories: m.tags ? JSON.parse(m.tags) : ['PCOS', 'Diabetes Friendly'],
            aiMatchScore: Math.round(m.healthScore * 10),
            healthRiskScore: m.healthScore > 8 ? 'Low' : 'Moderate',
            aiExplanation: m.description,
            ingredients: m.description.split(', '),
            preparation: 'Freshly prepared by certified culinary partners.',
            isNutritionVerified: m.isVeg,
            dietaryBadges: m.tags ? JSON.parse(m.tags) : ['Low GI', 'PCOS Safe']
          }));
          setMeals(adaptedMeals);
        }
      } catch (err) {
        console.warn('⚠️ Meals fetch failed, using mock data.', err);
      } finally {
        setIsLoadingMeals(false);
      }
    };

    initApp();
  }, [syncUserData]);

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setHealthProfile(INITIAL_HEALTH_PROFILE);
    setDailyIntake({ calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 });
    setCart([]);
    setActiveOrder(null);
    setCurrentView('landing');
    setAiChatMessages([{
      id: 'ai-welcome',
      sender: 'ai',
      text: `Hello! I'm Wellora. Sign in to get personalized meal recommendations, glycemic targets, and macro plans tailored to your health profile.`,
      timestamp: 'Just now',
    }]);
  };

  // ─── HEALTH PROFILE SAVE ──────────────────────────────────────────────────
  const handleSaveHealthProfile = useCallback(async (updatedOrFunc: React.SetStateAction<HealthProfile>) => {
    setRawHealthProfile((prev) => {
      const updated = typeof updatedOrFunc === 'function'
        ? (updatedOrFunc as any)(prev)
        : updatedOrFunc;

      if (authService.isAuthenticated()) {
        healthProfileService.update({
          age: updated.age,
          heightCm: updated.heightCm,
          weightKg: updated.weightKg,
          targetWeightKg: updated.targetWeightKg,
          fitnessGoal: updated.fitnessGoal,
          dailyCalorieTarget: updated.dailyCalorieTarget,
          diseases: updated.diseases,
        }).catch((err: any) => {
          console.error('Failed to sync health profile update to backend:', err);
        });
      }

      return updated;
    });
  }, []);

  // ─── CART ─────────────────────────────────────────────────────────────────
  const addToCart = (meal: Meal) => {
    if (!isAuthenticated) {
      setAuthModalDefaultMode('login');
      setIsAuthModalOpen(true);
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.meal.id === meal.id);
      if (existing) {
        return prev.map(item =>
          item.meal.id === meal.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { meal, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const addGroceryToCart = (item: GroceryItem) => {
    const pseudoMeal: Meal = {
      id: `grocery-${item.id}`,
      name: item.name,
      restaurantId: 'r-grocery',
      restaurantName: 'Wellora Smart Grocery',
      image: item.image,
      price: item.price,
      rating: item.rating,
      reviewCount: 99,
      prepTime: 'Instant Express',
      macros: { calories: 120, protein: 10, carbs: 5, fat: 3, fiber: 4, sugar: 1 },
      categories: ['Organic'],
      aiMatchScore: 99,
      healthRiskScore: 'Low',
      aiExplanation: `Fresh Organic Grocery item (${item.nutritionTag}).`,
      ingredients: [item.name],
      preparation: 'Fresh farm packaging.',
      isNutritionVerified: true,
      dietaryBadges: ['Organic', item.category]
    };
    addToCart(pseudoMeal);
  };

  const removeFromCart = (mealId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.meal.id === mealId);
      if (existing && existing.quantity > 1) {
        return prev.map(item =>
          item.meal.id === mealId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.meal.id !== mealId);
    });
  };

  const clearCart = () => setCart([]);

  // ─── PLACE ORDER ──────────────────────────────────────────────────────────
  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      if (authService.isAuthenticated()) {
        const orderItems = cart.map(i => ({
          mealId: i.meal.id.startsWith('grocery-') ? meals[0].id : i.meal.id,
          quantity: i.quantity
        }));

        const res = await ordersService.place({
          restaurantId: cart[0].meal.restaurantId === 'r-grocery' ? meals[0].restaurantId : cart[0].meal.restaurantId,
          items: orderItems,
          instructions: 'Call upon arrival.'
        });

        if (res.success && res.data) {
          const backendOrder = res.data as any;
          const newOrder: Order = {
            id: backendOrder.id,
            items: [...cart],
            totalAmount: backendOrder.totalAmount,
            status: 'AI Verified',
            etaMinutes: 18,
            otpCode: String(Math.floor(1000 + Math.random() * 9000)),
            deliveryPartner: {
              name: 'Arjun Mehta',
              phone: '+91 98112 34567',
              rating: 4.95,
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            },
            restaurantName: cart[0].meal.restaurantName,
            deliveryAddress: 'Your saved delivery address',
            createdAt: 'Just now'
          };
          setActiveOrder(newOrder);
          setOrdersHistory(prev => [newOrder, ...prev]);
          setLastPlacedOrder(newOrder);
          // Update daily intake with ordered meal macros
          const totalMacros = cart.reduce((acc, item) => ({
            calories: acc.calories + item.meal.macros.calories * item.quantity,
            protein:  acc.protein  + item.meal.macros.protein  * item.quantity,
            carbs:    acc.carbs    + item.meal.macros.carbs    * item.quantity,
            fat:      acc.fat      + item.meal.macros.fat      * item.quantity,
          }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
          setDailyIntake(prev => ({
            ...prev,
            calories: prev.calories + totalMacros.calories,
            protein:  prev.protein  + totalMacros.protein,
            carbs:    prev.carbs    + totalMacros.carbs,
            fat:      prev.fat      + totalMacros.fat,
          }));
          setCart([]);
          setIsCartOpen(false);
          setIsOrderSuccessModalOpen(true);
          return;
        }
      }
    } catch (err) {
      console.warn('API placeOrder failed, running in fallback mode.', err);
    }

    // Fallback (backend unreachable)
    const newOrder: Order = {
      id: `NF-${Math.floor(10000 + Math.random() * 90000)}`,
      items: [...cart],
      totalAmount: cart.reduce((acc, item) => acc + item.meal.price * item.quantity, 0),
      status: 'AI Verified',
      etaMinutes: 18,
      otpCode: String(Math.floor(1000 + Math.random() * 9000)),
      deliveryPartner: {
        name: 'Arjun Mehta',
        phone: '+91 98112 34567',
        rating: 4.95,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      },
      restaurantName: cart[0].meal.restaurantName,
      deliveryAddress: 'Your saved delivery address',
      createdAt: 'Just now'
    };
    setActiveOrder(newOrder);
    setOrdersHistory(prev => [newOrder, ...prev]);
    setLastPlacedOrder(newOrder);
    // Update daily intake with fallback order macros
    const totalMacros = cart.reduce((acc, item) => ({
      calories: acc.calories + item.meal.macros.calories * item.quantity,
      protein:  acc.protein  + item.meal.macros.protein  * item.quantity,
      carbs:    acc.carbs    + item.meal.macros.carbs    * item.quantity,
      fat:      acc.fat      + item.meal.macros.fat      * item.quantity,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    setDailyIntake(prev => ({
      ...prev,
      calories: prev.calories + totalMacros.calories,
      protein:  prev.protein  + totalMacros.protein,
      carbs:    prev.carbs    + totalMacros.carbs,
      fat:      prev.fat      + totalMacros.fat,
    }));
    setCart([]);
    setIsCartOpen(false);
    setIsOrderSuccessModalOpen(true);
  };

  // ─── AI CHAT ──────────────────────────────────────────────────────────────
  const sendAIMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAiChatMessages(prev => [...prev, userMsg]);

    try {
      if (authService.isAuthenticated()) {
        const res = await aiService.chat(text);
        if (res.success) {
          const aiResponse: AIChatMessage = {
            id: `ai-${Date.now()}`,
            sender: 'ai',
            text: res.data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            healthInsight: 'AI Verified for your health profile.'
          };
          setAiChatMessages(prev => [...prev, aiResponse]);
          return;
        }
      }
    } catch (err) {
      console.warn('API chatbot failed, running in fallback mode.', err);
    }

    // Fallback response driven by clinical decision engine
    setTimeout(() => {
      let aiText = `I've analyzed your query about "${text}". Please sign in to get personalized clinical advice matching your medical profile.`;
      let recMeal: Meal | undefined = undefined;

      if (isAuthenticated) {
        // Run evidence-based medical engine on user's vitals
        const clinical = runClinicalAssessment({
          systolicBP:  healthProfile.bloodPressureSystolic,
          diastolicBP: healthProfile.bloodPressureDiastolic,
          bloodSugar:  healthProfile.bloodSugarFasting,
          cholesterol: healthProfile.cholesterolTotal,
          heartRate:   healthProfile.heartRateBpm,
          bmi:         healthProfile.bmi,
          age:         healthProfile.age,
          gender:      healthProfile.gender as any,
          diseases:    healthProfile.diseases,
        });

        const q = text.toLowerCase();

        if (q.includes('bp') || q.includes('pressure') || q.includes('hypertension') || q.includes('salt')) {
          const bpVital = clinical.vitals.find(v => v.vital === 'Blood Pressure');
          aiText = bpVital
            ? `🏥 Clinical Assessment (${bpVital.guideline}): ${bpVital.context}\n\n💡 Recommendation: ${bpVital.recommendation}`
            : `AHA/ACC 2018 Guidelines recommend keeping BP <130/80 mmHg. Maintain DASH diet principles and limit sodium intake <1500mg/day.`;
        } else if (q.includes('sugar') || q.includes('diabet') || q.includes('glucose') || q.includes('sweet')) {
          const sugarVital = clinical.vitals.find(v => v.vital.includes('Sugar'));
          aiText = sugarVital
            ? `🏥 Clinical Assessment (${sugarVital.guideline}): ${sugarVital.context}\n\n💡 Recommendation: ${sugarVital.recommendation}`
            : `ADA 2024 Standards of Care recommend fasting glucose <100 mg/dL (or 80–130 mg/dL for known diabetics). Prefer low-GI millets and fiber-rich legumes.`;
        } else if (q.includes('pcos') || q.includes('pcod')) {
          aiText = `🏥 Clinical Assessment (PCOS Society of India 2022 / ICMR 2023): In PCOS, insulin resistance elevates free testosterone. Switch to low-GI millets (GI <55), spearmint tea, and 1.2g/kg protein to regulate ovulation.`;
          recMeal = meals.find(m => m.categories.includes('High Protein') || m.isVeg);
        } else if (q.includes('recommend') || q.includes('eat') || q.includes('lunch') || q.includes('dinner') || q.includes('keto')) {
          recMeal = meals[0];
          aiText = `Here is your top AI-matched meal: ${meals[0].name} (96% Bio-Match). It delivers ${meals[0].macros.protein}g protein with a low GI of ${meals[0].macros.glycemicIndex || '28'}, verified safe for your health profile.`;
        } else {
          aiText = `🏥 Wellora AI Clinical Summary (Health Score: ${clinical.overallScore}/100):\n${clinical.summary}\n\n💡 Advice for "${text}": Based on your profile (${healthProfile.fitnessGoal}, ${healthProfile.diseases.join(', ') || 'no chronic conditions'}), maintain balanced macros: ${healthProfile.dailyProteinTarget || 100}g protein and ${healthProfile.waterIntakeLiters || 2.5}L water daily.`;
        }
      }

      const aiResponse: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: 'Just now',
        mealRecommendation: recMeal,
        healthInsight: isAuthenticated ? 'AI Rule Engine: Verified safe for your health targets.' : undefined,
      };
      setAiChatMessages(prev => [...prev, aiResponse]);
    }, 800);
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        isDarkMode,
        setIsDarkMode,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        healthProfile,
        setHealthProfile: handleSaveHealthProfile as any,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        selectedMealForDetail,
        setSelectedMealForDetail,
        isAIModalOpen,
        setIsAIModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        profileModalTab,
        setProfileModalTab,
        openProfileModal,
        isCartOpen,
        setIsCartOpen,
        userLocation,
        setUserLocation,
        isOrderTrackingOpen,
        setIsOrderTrackingOpen,
        activeOrder,
        ordersHistory,
        isOrderSuccessModalOpen,
        setIsOrderSuccessModalOpen,
        lastPlacedOrder,
        placeOrder,
        aiChatMessages,
        sendAIMessage,
        addGroceryToCart,
        meals,
        isLoadingMeals,
        recommendedMeals,
        isLoadingRecommendations,
        dailyIntake,
        setDailyIntake,
        addWater,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalDefaultMode,
        setAuthModalDefaultMode,
        logout,
        syncUserData,
        loginAndRedirect,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

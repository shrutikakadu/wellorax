import api from './api';
export { authService } from './auth.service';

export const mealsService = {
  getAll: (params?: { category?: string; tag?: string; search?: string; isVeg?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.tag) query.set('tag', params.tag);
    if (params?.search) query.set('search', params.search);
    if (params?.isVeg !== undefined) query.set('isVeg', String(params.isVeg));
    return api.get<{ success: boolean; data: unknown[] }>(`/meals?${query}`);
  },

  getById: (id: string) =>
    api.get<{ success: boolean; data: unknown }>(`/meals/${id}`),

  getRestaurants: () =>
    api.get<{ success: boolean; data: unknown[] }>('/meals/restaurants/list'),

  getRestaurantById: (id: string) =>
    api.get<{ success: boolean; data: unknown }>(`/meals/restaurants/${id}`),
};

export const ordersService = {
  place: (payload: { restaurantId: string; items: { mealId: string; quantity: number }[]; instructions?: string }) =>
    api.post<{ success: boolean; data: unknown }>('/orders', payload),

  getAll: () =>
    api.get<{ success: boolean; data: unknown[] }>('/orders'),

  getById: (id: string) =>
    api.get<{ success: boolean; data: unknown }>(`/orders/${id}`),

  updateStatus: (id: string, status: string, message: string) =>
    api.patch(`/orders/${id}/status`, { status, message }),
};

export const nutritionService = {
  getDaily: (date?: string) =>
    api.get<{ success: boolean; data: unknown }>(`/nutrition/daily${date ? `?date=${date}` : ''}`),

  getWeekly: () =>
    api.get<{ success: boolean; data: unknown[] }>('/nutrition/weekly'),

  log: (payload: { mealName: string; mealType: string; calories: number; protein: number; carbs: number; fat: number; fiber?: number; mealId?: string }) =>
    api.post('/nutrition/log', payload),

  deleteLog: (id: string) =>
    api.delete(`/nutrition/log/${id}`),
};

export const healthProfileService = {
  get: () =>
    api.get<{ success: boolean; data: unknown }>('/health-profile'),

  update: (payload: {
    age?: number; heightCm?: number; weightKg?: number; targetWeightKg?: number;
    fitnessGoal?: string; dailyCalorieTarget?: number; diseases?: string[];
  }) =>
    api.put('/health-profile', payload),
};

export const groceryService = {
  getProducts: (params?: { category?: string; search?: string; healthTag?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.healthTag) query.set('healthTag', params.healthTag);
    return api.get<{ success: boolean; data: unknown[] }>(`/grocery/products?${query}`);
  },

  placeOrder: (items: { productId: string; quantity: number }[]) =>
    api.post('/grocery/orders', { items }),

  getOrders: () =>
    api.get<{ success: boolean; data: unknown[] }>('/grocery/orders'),
};

export const doctorsService = {
  getAll: (specialty?: string) =>
    api.get<{ success: boolean; data: unknown[] }>(`/doctors${specialty ? `?specialty=${specialty}` : ''}`),

  getById: (id: string) =>
    api.get<{ success: boolean; data: unknown }>(`/doctors/${id}`),

  bookAppointment: (payload: { doctorId: string; type: string; scheduledAt: string; notes?: string }) =>
    api.post('/doctors/appointments', payload),

  getMyAppointments: () =>
    api.get<{ success: boolean; data: unknown[] }>('/doctors/appointments/mine'),
};

export const aiService = {
  chat: (message: string) =>
    api.post<{ success: boolean; data: { reply: string; messageId: string } }>('/ai/chat', { message }),

  getHistory: () =>
    api.get<{ success: boolean; data: unknown[] }>('/ai/history'),

  clearHistory: () =>
    api.delete('/ai/history'),
};

export const mealPlansService = {
  getWeekly: () =>
    api.get<{ success: boolean; data: unknown }>('/meal-plans/weekly'),

  generate: () =>
    api.post('/meal-plans/generate', {}),

  swapSlot: (slotId: string, mealId: string) =>
    api.patch(`/meal-plans/slots/${slotId}`, { mealId }),
};

export const mealRecommendationService = {
  getRecommended: (limit?: number) =>
    api.get<{ success: boolean; data: { recommendations: unknown[]; profileUsed: unknown; totalMealsScored: number } }>(
      `/meals/recommended${limit ? `?limit=${limit}` : ''}`
    ),

  getQuickSuggestions: () =>
    api.get<{ success: boolean; data: unknown[] }>('/meals/recommended/quick'),
};

export const paymentService = {
  createRazorpayOrder: (amount: number, orderId?: string) =>
    api.post<{ success: boolean; data: { id: string; amount: number; currency: string; keyId: string } }>('/payments/create-razorpay-order', { amount, orderId }),

  verifyRazorpayPayment: (payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; orderId?: string }) =>
    api.post<{ success: boolean; message: string }>('/payments/verify-razorpay-payment', payload),
};

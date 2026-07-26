import React, { useState, useEffect } from 'react';
import {
  Plus,
  ChefHat,
  Loader2
} from 'lucide-react';
import { ordersService } from '../../services';

interface RestaurantOrder {
  id: string;
  mealName: string;
  qty: number;
  customer: string;
  status: string;
  time: string;
  diet: string;
}

function adaptOrder(o: any): RestaurantOrder {
  const items = o.items || [];
  const firstItem = items[0];
  return {
    id: o.id,
    mealName: firstItem?.meal?.name || 'Unknown Meal',
    qty: items.reduce((s: number, i: any) => s + (i.quantity || 1), 0),
    customer: o.user?.name || 'Customer',
    status: mapStatus(o.status),
    time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    diet: firstItem?.meal?.isVeg ? 'Vegetarian' : 'Non-Veg',
  };
}

function mapStatus(s: string): string {
  const map: Record<string, string> = {
    'PLACED': 'AI Verified',
    'CONFIRMED': 'AI Verified',
    'PREPARING': 'In Kitchen',
    'READY': 'In Kitchen',
    'OUT_FOR_DELIVERY': 'Out for Delivery',
    'DELIVERED': 'Delivered',
  };
  return map[s] || 'AI Verified';
}

function statusNext(s: string): string {
  const map: Record<string, string> = {
    'AI Verified': 'In Kitchen',
    'In Kitchen': 'Out for Delivery',
  };
  return map[s] || s;
}

export const RestaurantDashboard: React.FC = () => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await ordersService.getAll();
        if (res.success && res.data) {
          setOrders((res.data as any[]).map(adaptOrder));
        }
      } catch (err) {
        console.warn('Orders fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, nextStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    try {
      const apiStatus = nextStatus === 'In Kitchen' ? 'PREPARING' :
        nextStatus === 'Out for Delivery' ? 'OUT_FOR_DELIVERY' : 'CONFIRMED';
      await ordersService.updateStatus(orderId, apiStatus, `Status updated to ${nextStatus}`);
    } catch (err) {
      console.warn('Status update failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Top Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Certified Kitchen Operations Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-['Outfit']">
            Verde Botanical Kitchen &bull; Kitchen Hub
          </h1>
          <p className="text-sm text-emerald-100">
            Real-time AI macro compliance validation & kitchen workflow management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-3 rounded-2xl bg-white text-emerald-900 font-extrabold text-xs shadow-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Recipe to AI Lab
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        /* Orders Kanban Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Col 1: AI Verified / New */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> AI Verified Orders
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-extrabold text-xs">
                {orders.filter(o => o.status === 'AI Verified').length}
              </span>
            </div>

            <div className="space-y-3">
              {orders.filter(o => o.status === 'AI Verified').map(o => (
                <div key={o.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-900 dark:text-white">{o.id.slice(-8)}</span>
                    <span className="text-slate-400">{o.time}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {o.qty}x {o.mealName}
                  </div>
                  <div className="text-[10px] text-slate-500">{o.customer}</div>
                  <div className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    {o.diet}
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, statusNext(o.status))}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Start Cooking
                  </button>
                </div>
              ))}
              {orders.filter(o => o.status === 'AI Verified').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No new orders</p>
              )}
            </div>
          </div>

          {/* Col 2: In Kitchen Cooking */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span> In Kitchen Cooking
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-extrabold text-xs">
                {orders.filter(o => o.status === 'In Kitchen').length}
              </span>
            </div>

            <div className="space-y-3">
              {orders.filter(o => o.status === 'In Kitchen').map(o => (
                <div key={o.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-900 dark:text-white">{o.id.slice(-8)}</span>
                    <span className="text-slate-400">{o.time}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {o.qty}x {o.mealName}
                  </div>
                  <div className="text-[10px] text-slate-500">{o.customer}</div>
                  <div className="p-2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-medium">
                    Sous-vide woodfire grill step 2/3 active.
                  </div>
                  <button
                    onClick={() => updateStatus(o.id, statusNext(o.status))}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    Handover to Driver
                  </button>
                </div>
              ))}
              {orders.filter(o => o.status === 'In Kitchen').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No orders cooking</p>
              )}
            </div>
          </div>

          {/* Col 3: Out for Delivery */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Dispatched & Delivered
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold text-xs">
                {orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Delivered').length}
              </span>
            </div>

            <div className="space-y-3">
              {orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Delivered').map(o => (
                <div key={o.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 opacity-75">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-900 dark:text-white">{o.id.slice(-8)}</span>
                    <span className="text-emerald-500">{o.status === 'Delivered' ? 'Delivered' : 'En Route'}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {o.qty}x {o.mealName}
                  </div>
                </div>
              ))}
              {orders.filter(o => o.status === 'Out for Delivery' || o.status === 'Delivered').length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No dispatched orders</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

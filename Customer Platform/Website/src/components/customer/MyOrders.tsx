import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag, Package, Truck, CheckCircle2, Clock,
  Eye, RotateCcw
} from 'lucide-react';

const pastOrders = [
  {
    id: 'ORD-2048',
    items: 'Grilled Salmon Bowl, Detox Green Juice',
    total: 647,
    status: 'Delivered',
    date: 'Jul 23, 2026',
    restaurant: 'The Green Fork',
  },
  {
    id: 'ORD-2035',
    items: 'Keto Butter Chicken, Cauliflower Rice',
    total: 529,
    status: 'Delivered',
    date: 'Jul 21, 2026',
    restaurant: 'LowCarb Kitchen',
  },
  {
    id: 'ORD-2019',
    items: 'Ayurvedic Kitchari Thali',
    total: 385,
    status: 'Delivered',
    date: 'Jul 18, 2026',
    restaurant: 'Sattvic Meals',
  },
];

const statusColors: Record<string, string> = {
  Delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'In Progress': 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  Cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const statusIcons: Record<string, React.FC<{ className?: string }>> = {
  Delivered: CheckCircle2,
  'In Progress': Truck,
  Cancelled: Clock,
};

export const MyOrders: React.FC = () => {
  const { activeOrder, ordersHistory, setIsOrderTrackingOpen } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
          <ShoppingBag className="w-3.5 h-3.5" />
          Order History
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
          My Orders
        </h1>
        <p className="text-xs text-slate-400">Track, review, and reorder your past meals.</p>
      </div>

      {/* Active Order (if any) */}
      {activeOrder && (
        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Active Order</span>
            </div>
            <button
              onClick={() => setIsOrderTrackingOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" /> Track Live
            </button>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Order #{activeOrder.id}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeOrder.items.map(i => i.meal.name).join(', ')}
              </p>
              <p className="text-[11px] text-slate-400">{activeOrder.restaurantName}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-slate-900 dark:text-white">₹{activeOrder.totalAmount}</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                <Truck className="w-3 h-3" /> {activeOrder.status}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Placed Orders + Past Orders */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">All Orders</h2>
        <div className="space-y-3">

          {/* Newly Placed Orders */}
          {ordersHistory.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0B1F1A] border border-emerald-500/30 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">#{order.id}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Placed
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {order.items.map(i => `${i.quantity}x ${i.meal.name}`).join(', ')}
                    </p>
                    <p className="text-[10px] text-slate-400">{order.restaurantName} · {order.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-black text-slate-900 dark:text-white">₹{order.totalAmount}</span>
                  <button
                    onClick={() => setIsOrderTrackingOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Track
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pre-populated Past Orders */}
          {pastOrders.map((order) => {
            const StatusIcon = statusIcons[order.status] || CheckCircle2;
            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#0B1F1A] border border-slate-200/60 dark:border-emerald-500/10 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{order.id}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[order.status]}`}>
                          <StatusIcon className="w-3 h-3" /> {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{order.items}</p>
                      <p className="text-[10px] text-slate-400">{order.restaurant} · {order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-slate-900 dark:text-white">₹{order.total}</span>
                    <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {!activeOrder && pastOrders.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No orders yet</h3>
          <p className="text-xs text-slate-400">Your order history will appear here.</p>
        </div>
      )}
    </div>
  );
};

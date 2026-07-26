import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, Star, Sparkles, X, ArrowRight, Heart, Truck } from 'lucide-react';

export const OrderSuccessModal: React.FC = () => {
  const {
    isOrderSuccessModalOpen,
    setIsOrderSuccessModalOpen,
    lastPlacedOrder,
    setCurrentView,
    setIsOrderTrackingOpen,
  } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [rated, setRated] = useState<boolean>(false);

  if (!isOrderSuccessModalOpen || !lastPlacedOrder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-fadeIn"
        onClick={() => setIsOrderSuccessModalOpen(false)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-emerald-100 z-10 animate-scaleUp text-slate-800 font-sans">
        
        {/* Close Button */}
        <button
          onClick={() => setIsOrderSuccessModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Check Icon Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-500" /> Order Placed Successfully!
            </span>
            <h2 className="text-2xl font-black text-slate-900 font-['Outfit'] mt-1">
              Thank You! 🎉
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Your order <span className="font-bold text-slate-800">#{lastPlacedOrder.id}</span> has been confirmed & saved in My Orders.
            </p>
          </div>
        </div>

        {/* Order Details Summary Card */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-200/60 pb-2">
            <span>Restaurant / Kitchen</span>
            <span className="text-emerald-700">{lastPlacedOrder.restaurantName}</span>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {lastPlacedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-medium text-slate-600">
                <span className="truncate pr-2">{item.quantity}x {item.meal.name}</span>
                <span className="font-bold text-slate-800 shrink-0">₹{item.meal.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-extrabold text-slate-900 pt-2 border-t border-slate-200/60">
            <span>Total Paid</span>
            <span className="text-base text-emerald-600 font-black">₹{lastPlacedOrder.totalAmount}</span>
          </div>
        </div>

        {/* 5-Star Rating Feedback Section */}
        <div className="text-center bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-3.5 space-y-2 mb-5">
          <p className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> How was your ordering experience?
          </p>

          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setRated(true);
                }}
                className="p-1 hover:scale-125 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? 'fill-amber-400 text-amber-400 shadow-sm'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {rated ? (
            <p className="text-[10px] font-bold text-emerald-600 animate-fadeIn">
              ✓ Thanks for rating {rating} Stars!
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 font-medium">Tap stars to leave quick feedback</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              setIsOrderSuccessModalOpen(false);
              setIsOrderTrackingOpen(true);
            }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <Truck className="w-4 h-4" /> Track Live Order Status
          </button>

          <button
            onClick={() => {
              setIsOrderSuccessModalOpen(false);
              setCurrentView('my-orders');
            }}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Go to My Orders <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

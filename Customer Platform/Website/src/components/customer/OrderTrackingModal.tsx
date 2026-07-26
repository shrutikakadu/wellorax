import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  MapPin, 
  Phone, 
  Star, 
  CheckCircle2, 
  Navigation,
  Key
} from 'lucide-react';

export const OrderTrackingModal: React.FC = () => {
  const { isOrderTrackingOpen, setIsOrderTrackingOpen, activeOrder } = useApp();

  if (!isOrderTrackingOpen || !activeOrder) return null;

  const order = activeOrder;

  const timelineSteps = [
    { label: 'Order Confirmed', time: '10:42 AM', done: true },
    { label: 'AI Clinical Verification', time: '10:43 AM', done: true },
    { label: 'Kitchen Preparing Meal', time: '10:45 AM', done: true },
    { label: 'Driver Picked Up & En Route', time: '10:52 AM', done: true },
    { label: 'Delivered at Doorstep', time: 'Estimated 11:06 AM', done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        
        {/* Close */}
        <button
          onClick={() => setIsOrderTrackingOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold border border-orange-500/20">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              <span>Live Order Tracking</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Order #{order.id}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold">ETA</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">
              {order.etaMinutes} mins
            </div>
          </div>
        </div>

        {/* Simulated Map View Canvas */}
        <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-inner flex items-center justify-center">
          {/* Stylized Simulated Map Grid Graphic */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
          
          {/* Simulated Route Path Line */}
          <svg className="absolute inset-0 w-full h-full stroke-emerald-500 stroke-[3] fill-none" strokeDasharray="6 6">
            <path d="M 120 180 Q 250 80 480 140" />
          </svg>

          {/* Restaurant Marker */}
          <div className="absolute top-16 left-24 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg animate-bounce">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded mt-1 backdrop-blur-md">
              {order.restaurantName}
            </span>
          </div>

          {/* Delivery Driver Animated Marker */}
          <div className="absolute top-24 left-1/2 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl ring-4 ring-emerald-500/30 animate-pulse">
              <Navigation className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white bg-emerald-700 px-2 py-0.5 rounded mt-1">
              Driver Vikram (En Route)
            </span>
          </div>

          {/* Customer Delivery Location Marker */}
          <div className="absolute bottom-12 right-28 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded mt-1 backdrop-blur-md">
              Your Location
            </span>
          </div>
        </div>

        {/* OTP Box & Delivery Partner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Delivery OTP Box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Key className="w-4 h-4" /> Delivery OTP Code:
              </span>
              <p className="text-[11px] text-slate-500">Show to driver upon arrival</p>
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-widest bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-emerald-500/30 shadow-sm">
              {order.otpCode}
            </div>
          </div>

          {/* Driver Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={order.deliveryPartner.image} alt={order.deliveryPartner.name} className="w-11 h-11 rounded-full object-cover" />
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">{order.deliveryPartner.name}</h4>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {order.deliveryPartner.rating} Delivery Partner
                </p>
              </div>
            </div>
            <a
              href={`tel:${order.deliveryPartner.phone}`}
              className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-500 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Timeline Progress */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase">Order Progress Timeline</h4>
          <div className="space-y-3">
            {timelineSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 ${
                  step.done ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className={`font-semibold flex-1 ${step.done ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {step.label}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{step.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

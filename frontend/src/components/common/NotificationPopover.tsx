import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell, X, ShieldAlert, Heart, Droplet, ShoppingBag,
  Award, CheckCircle, ArrowRight, Zap, Info
} from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'health' | 'order' | 'water' | 'reward';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionView?: string;
}

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ isOpen, onClose }) => {
  const {
    healthProfile,
    activeOrder,
    dailyIntake,
    setCurrentView,
    openProfileModal
  } = useApp();

  if (!isOpen) return null;

  // Dynamically generate notifications based on user context
  const notifications: NotificationItem[] = [];

  // Active Order notification
  if (activeOrder) {
    notifications.push({
      id: 'active-order',
      type: 'order',
      title: `Order #${activeOrder.id.slice(-6)} In Progress`,
      message: `Your food is being prepared. ETA: ${activeOrder.etaMinutes} minutes.`,
      time: 'Just now',
      isRead: false,
      actionView: 'my-orders',
    });
  }

  // Health / Vitals alerts
  if (healthProfile.bloodPressureSystolic && healthProfile.bloodPressureSystolic >= 140) {
    notifications.push({
      id: 'high-bp-alert',
      type: 'health',
      title: '⚠️ High BP Flagged (Stage 2)',
      message: `Scanned BP is ${healthProfile.bloodPressureSystolic} mmHg. Sodium-heavy foods are blocked in the Marketplace.`,
      time: '10m ago',
      isRead: false,
      actionView: 'health-reports',
    });
  } else if (healthProfile.bloodSugarFasting && healthProfile.bloodSugarFasting >= 126) {
    notifications.push({
      id: 'high-sugar-alert',
      type: 'health',
      title: '⚠️ Diabetic Sugar Level',
      message: `Fasting glucose is ${healthProfile.bloodSugarFasting} mg/dL. High-GI sweets and refined carbs are restricted.`,
      time: '15m ago',
      isRead: false,
      actionView: 'health-reports',
    });
  } else if (!healthProfile.lastVitalScanAt) {
    notifications.push({
      id: 'scan-vitals-prompt',
      type: 'health',
      title: '🩺 Record Your Vitals',
      message: 'Scan your vitals using BioScan™ or enter them manually to update your AI health score.',
      time: '1h ago',
      isRead: false,
      actionView: 'health-reports',
    });
  }

  // Water Tracker prompt
  if (dailyIntake.water < 2) {
    notifications.push({
      id: 'water-reminder',
      type: 'water',
      title: '💧 Stay Hydrated',
      message: `You've logged ${dailyIntake.water}L today. Target is 2.5L. Log a glass of water!`,
      time: '2h ago',
      isRead: true,
      actionView: 'water-tracker',
    });
  }

  // Daily Rewards prompt
  notifications.push({
    id: 'daily-reward-prompt',
    type: 'reward',
    title: '🎁 FitCoins Ready to Claim',
    message: 'Complete your daily health check-in to claim 50 FitCoins & streak bonus!',
    time: '3h ago',
    isRead: true,
    actionView: 'rewards',
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleAction = (item: NotificationItem) => {
    if (item.actionView) {
      if (item.actionView === 'vitals') {
        openProfileModal('vitals');
      } else {
        setCurrentView(item.actionView as any);
      }
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-xs" onClick={onClose} />

      {/* Popover */}
      <div className="fixed top-16 right-4 sm:right-10 z-50 w-80 sm:w-96 bg-white dark:bg-[#0D261C] rounded-3xl border border-slate-200 dark:border-emerald-500/20 shadow-2xl overflow-hidden font-sans animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-[#0A1F16] to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold font-['Outfit']">Notifications</h3>
              <p className="text-[10px] text-slate-400">{unreadCount > 0 ? `${unreadCount} new alerts` : 'All caught up'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-2.5">
          {notifications.map(item => {
            const getIcon = () => {
              switch (item.type) {
                case 'health': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
                case 'order':  return <ShoppingBag className="w-4 h-4 text-emerald-500" />;
                case 'water':  return <Droplet className="w-4 h-4 text-blue-500" />;
                case 'reward': return <Award className="w-4 h-4 text-amber-500" />;
              }
            };

            const getBg = () => {
              switch (item.type) {
                case 'health': return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40';
                case 'order':  return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40';
                case 'water':  return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40';
                case 'reward': return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40';
              }
            };

            return (
              <div
                key={item.id}
                onClick={() => handleAction(item)}
                className={`p-3 rounded-2xl border ${getBg()} transition-all hover:scale-[1.01] cursor-pointer flex items-start gap-3 relative`}
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs shrink-0">
                  {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate font-['Outfit']">{item.title}</h4>
                    <span className="text-[9px] font-semibold text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-snug">{item.message}</p>
                </div>

                {!item.isRead && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={() => { setCurrentView('health-reports'); onClose(); }}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            View All Health Reports <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationPopover;

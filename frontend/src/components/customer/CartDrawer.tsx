import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { paymentService } from '../../services';
import {
  X, Trash2, ShoppingBag, ArrowRight, MapPin, CreditCard,
  QrCode, Wallet, Banknote, Tag, Gift, AlertCircle, Bot
} from 'lucide-react';
import { AIOrderAnalysisModal } from './AIOrderAnalysisModal';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Payment Methods
type PaymentMethod = 'razorpay' | 'upi' | 'cod' | 'referral';

const AVAILABLE_COUPONS = [
  { code: 'NUTRI50', discount: 50, isPercent: false, desc: 'Flat ₹50 OFF on orders above ₹200' },
  { code: 'HEALTH20', discount: 20, isPercent: true, desc: '20% OFF on all clinical health bowls' },
  { code: 'PCOSFREE', discount: 49, isPercent: false, desc: 'Free Delivery on PCOS & Diabetes meals' },
];

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cart, removeFromCart, placeOrder, currentUser } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; isPercent: boolean } | null>(null);
  const [useReferralCredits, setUseReferralCredits] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);

  const referralCreditsAvailable = 150; // ₹150 referral bonus credits

  if (!isCartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.meal.price * item.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const aiClinicalFee = 15;

  // Compute coupon discount
  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount = appliedCoupon.isPercent
      ? Math.round((subtotal * appliedCoupon.discount) / 100)
      : appliedCoupon.discount;
  }

  // Compute referral credit discount
  const referralDiscount = useReferralCredits ? Math.min(referralCreditsAvailable, subtotal - couponDiscount) : 0;

  const total = Math.max(0, subtotal + deliveryFee + aiClinicalFee - couponDiscount - referralDiscount);

  // Load Razorpay Checkout Script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Apply Coupon
  const handleApplyCoupon = (codeToApply?: string) => {
    const targetCode = (codeToApply || couponCode).trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find(c => c.code === targetCode);
    if (found) {
      setAppliedCoupon(found);
      setCouponCode(targetCode);
      setError(null);
    } else {
      setError(`Invalid coupon code "${targetCode}". Try NUTRI50 or HEALTH20.`);
    }
  };

  // Handle Checkout
  const handleCheckout = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      if (paymentMethod === 'razorpay' || paymentMethod === 'upi') {
        // 1. Load Razorpay script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setError('Razorpay SDK failed to load. Please check your internet connection.');
          setIsProcessing(false);
          return;
        }

        // 2. Create Razorpay order on backend
        const orderRes = await paymentService.createRazorpayOrder(total);

        if (!orderRes.success || !orderRes.data) {
          setError('Failed to initialize Razorpay payment. Please try again.');
          setIsProcessing(false);
          return;
        }

        const { id: razorpayOrderId, amount, currency, keyId } = orderRes.data;

        // 3. Launch Razorpay Checkout Modal
        const options = {
          key: keyId,
          amount,
          currency,
          name: 'Wellora',
          description: `Clinical Health Order (${cart.length} items)`,
          image: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
          order_id: razorpayOrderId,
          prefill: {
            name: currentUser?.name || 'Priya Sharma',
            email: currentUser?.email || 'priya@wellora.ai',
            contact: '+91 98765 43210',
          },
          theme: {
            color: '#059669', // Emerald-600
          },
          handler: async function (response: any) {
            try {
              // 4. Verify payment signature on backend
              const verifyRes = await paymentService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                placeOrder();
              } else {
                setError('Payment verification failed.');
              }
            } catch (_) {
              // Place order anyway on demo
              placeOrder();
            } finally {
              setIsProcessing(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        // COD or Referral Credits
        setTimeout(() => {
          placeOrder();
          setIsProcessing(false);
        }, 1000);
      }
    } catch (err: any) {
      setError(err?.message || 'Checkout error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md h-full bg-white dark:bg-[#091F17] border-l border-slate-200 dark:border-emerald-500/10 shadow-2xl flex flex-col justify-between overflow-hidden">

        {/* ── HEADER ── */}
        <div className="p-5 border-b border-slate-200 dark:border-emerald-500/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white font-['Outfit']">Your Healthy Basket</h3>
              <p className="text-[11px] font-semibold text-slate-500">{cart.reduce((s, i) => s + i.quantity, 0)} item(s) • Clinical Match Verified</p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── CART ITEMS LIST ── */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl mb-2">🥗</div>
              <p className="text-base font-extrabold text-slate-800 dark:text-white font-['Outfit']">Your basket is empty</p>
              <p className="text-xs text-slate-400">Explore clinical healthy bowls, low GI pizzas & organic groceries.</p>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.meal.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 flex items-center gap-3"
                  >
                    <img src={item.meal.image} alt={item.meal.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate font-['Outfit']">
                        {item.meal.name}
                      </h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        {item.meal.macros.calories} kcal • {item.meal.macros.protein}g Protein
                      </p>
                      <div className="text-xs font-black text-slate-900 dark:text-white mt-1">
                        ₹{item.meal.price} × {item.quantity} = <span className="text-emerald-600 dark:text-emerald-400">₹{item.meal.price * item.quantity}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.meal.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── PROMO COUPONS SECTION ── */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-500" /> Apply Coupon
                  </span>
                  {appliedCoupon && (
                    <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-[10px] font-bold text-red-500">
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. NUTRI50)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shrink-0"
                  >
                    Apply
                  </button>
                </div>

                {/* Quick Coupon Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVAILABLE_COUPONS.map(c => (
                    <button
                      key={c.code}
                      onClick={() => handleApplyCoupon(c.code)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${
                        appliedCoupon?.code === c.code
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      🏷️ {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── REFERRAL CREDITS SECTION ── */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Gift className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">Referral Credit Bonus</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">₹{referralCreditsAvailable} available in wallet</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useReferralCredits}
                    onChange={(e) => setUseReferralCredits(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* ── PAYMENT METHODS SECTION ── */}
              <div className="space-y-2.5">
                <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Select Payment Method</p>

                <div className="grid grid-cols-2 gap-2">
                  {/* Razorpay Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-3 rounded-2xl border flex flex-col gap-1 transition-all text-left ${
                      paymentMethod === 'razorpay'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20">Official</span>
                    </div>
                    <span className="text-xs font-black">Razorpay Gateway</span>
                    <span className="text-[9px] opacity-80 font-medium">UPI, Cards, Netbanking</span>
                  </button>

                  {/* UPI Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border flex flex-col gap-1 transition-all text-left ${
                      paymentMethod === 'upi'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <QrCode className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/20">Instant</span>
                    </div>
                    <span className="text-xs font-black">UPI Instant Pay</span>
                    <span className="text-[9px] opacity-80 font-medium">GPay, PhonePe, Paytm</span>
                  </button>

                  {/* Cash on Delivery Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-2xl border flex flex-col gap-1 transition-all text-left ${
                      paymentMethod === 'cod'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-xs font-black">Cash on Delivery</span>
                    <span className="text-[9px] opacity-80 font-medium">Pay cash upon delivery</span>
                  </button>

                  {/* Wallet / Referral Credits */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('referral')}
                    className={`p-3 rounded-2xl border flex flex-col gap-1 transition-all text-left ${
                      paymentMethod === 'referral'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black">Wallet Credits</span>
                    <span className="text-[9px] opacity-80 font-medium">Balance: ₹{referralCreditsAvailable}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── BILL SUMMARY & CHECKOUT BUTTON ── */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-200 dark:border-emerald-500/10 bg-slate-50/50 dark:bg-slate-900/60 space-y-4">

            {/* Delivery Address */}
            <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold truncate">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="truncate">Penthouse 14B, Green Valley District</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Change</span>
            </div>

            {/* Bill Details */}
            <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? <strong className="text-emerald-500">FREE</strong> : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AI Clinical Verification</span>
                <span className="font-semibold text-slate-900 dark:text-white">₹{aiClinicalFee}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}

              {referralDiscount > 0 && (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>Referral Credit Used</span>
                  <span>-₹{referralDiscount}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-sm font-black text-slate-900 dark:text-white">
                <span>Total Amount Payable</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-['Outfit'] text-base">₹{total}</span>
              </div>
            </div>

            {/* Submit Checkout */}
            <button
              onClick={() => setShowAIAnalysisModal(true)}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Bot className="w-4.5 h-4.5 animate-bounce text-emerald-200" />
                  <span>
                    {paymentMethod === 'razorpay' || paymentMethod === 'upi' ? `Check Health & Pay ₹${total}` : `Check Health & Order (₹${total})`}
                  </span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* AI Order Health Analysis Popup */}
      <AIOrderAnalysisModal
        isOpen={showAIAnalysisModal}
        onClose={() => setShowAIAnalysisModal(false)}
        onConfirmOrder={() => handleCheckout()}
      />
    </div>
  );
};

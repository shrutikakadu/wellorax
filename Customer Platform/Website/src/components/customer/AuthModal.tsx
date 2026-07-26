import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services';
import {
  X, Lock, Mail, User, Phone, AlertCircle, Sparkles, Eye, EyeOff,
  ArrowRight, CheckCircle2, ShieldCheck
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalDefaultMode,
    loginAndRedirect,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>(authModalDefaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mobile OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [_generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Sync mode when parent changes default
  useEffect(() => {
    setMode(authModalDefaultMode);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setOtpSent(false);
    setOtpVerified(false);
    setGeneratedOtp(null);
    setOtpInput('');
  }, [authModalDefaultMode, isAuthModalOpen]);

  // Resend timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  if (!isAuthModalOpen) return null;

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit phone number first.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setIsSendingOtp(true);

    try {
      const res = await authService.sendOtp(phone);
      if (res.success && res.data) {
        setOtpSent(true);
        setGeneratedOtp(res.data.otp);
        setSuccessMsg(`OTP sent to ${phone}. Enter code below.`);
        setResendTimer(30);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setIsVerifyingOtp(true);

    try {
      const res = await authService.verifyOtp(phone, otpInput);
      if (res.success) {
        setOtpVerified(true);
        setSuccessMsg('✅ Mobile number verified successfully!');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Require OTP verification for signup if phone number is provided
    if (mode === 'signup' && phone && !otpVerified) {
      setError('Please send and verify the OTP for your phone number before registering.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await authService.login({ email, password });
        if (res.success) {
          await loginAndRedirect(res.data.user, res.data.token);
        } else {
          setError('Invalid email or password.');
        }
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        const res = await authService.register({ name, email, password, phone });
        if (res.success) {
          await loginAndRedirect(res.data.user, res.data.token);
        } else {
          setError('Registration failed. Please try again.');
        }
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Something went wrong. Please check backend server.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setOtpSent(false);
    setOtpVerified(false);
    setGeneratedOtp(null);
    setOtpInput('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-white dark:bg-[#091F17] rounded-3xl shadow-2xl border border-slate-200 dark:border-emerald-500/20 overflow-hidden max-h-[92vh] flex flex-col">

        {/* Decorative top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-400 shrink-0" />

        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto">

          {/* Close Button */}
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 dark:bg-emerald-950/50 text-slate-400 dark:text-emerald-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                {mode === 'login' ? 'Welcome Back!' : 'Join Wellora'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {mode === 'login'
                  ? 'Sign in to access your clinical health dashboard'
                  : 'Create account with phone OTP verification'}
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60 gap-1">
            <button
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Mobile Number & Real OTP Section */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Mobile Number (OTP Verified)</span>
                  {otpVerified && (
                    <span className="text-emerald-500 flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      disabled={otpVerified}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-75"
                    />
                  </div>
                  {!otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || resendTimer > 0}
                      className="px-3.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white dark:disabled:text-slate-500 font-extrabold text-xs shrink-0 transition-all shadow-sm"
                    >
                      {isSendingOtp ? 'Sending...' : resendTimer > 0 ? `${resendTimer}s` : 'Send OTP'}
                    </button>
                  )}
                </div>

                {/* OTP Verification Input Box */}
                {otpSent && !otpVerified && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 text-center">
                      📱 SMS sent to mobile number. Enter the 6-digit OTP code received on your device:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-center font-mono font-black text-sm tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || otpInput.length !== 6}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs shrink-0 transition-all shadow-md"
                      >
                        {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (mode === 'signup' && phone.length > 0 && !otpVerified)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Account hint for login */}
          {mode === 'login' && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 text-center mb-1">
                🧪 Demo Account
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-500 text-center">
                Email: <code className="font-mono">priya@wellora.ai</code><br />
                Password: <code className="font-mono">password123</code>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

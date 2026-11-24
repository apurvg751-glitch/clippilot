'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  Star,
  Shield,
  ShieldCheck,
  QrCode,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  LogOut,
  Eye,
  EyeOff,
  KeyRound,
  Store,
  RefreshCw,
  Sun,
  Moon,
  Download,
  Trash2,
  CreditCard,
  Calendar,
  Copy,
  Check,
  Zap,
  Printer,
  Sparkles,
  Loader2,
  BarChart3,
  X,
} from 'lucide-react';
import { getStandTheme, downloadDesignedStand } from '@/lib/standGenerator';
import StarLoadingScreen from '@/components/common/StarLoadingScreen';
import { formatWeeklyRoiReport } from '@/lib/whatsapp';

interface TenantShop {
  id: string;
  name: string;
  slug: string;
  category: string;
  city?: string;
  owner_name: string;
  owner_phone: string;
  google_review_url: string;
  subscription_status: string;
  total_scans?: number;
  positive_redirects?: number;
  scans_count?: number;
  rating_avg?: number;
  reviews_gained?: number;
  complaints_blocked?: number;
}

interface TenantFeedback {
  id: string;
  business_id?: string;
  business_slug?: string;
  rating: number;
  customer_name: string;
  customer_contact: string;
  complaint_text: string;
  status: string;
  created_at: string;
}

function PortalInner() {
  const searchParams = useSearchParams();
  const initialShop = searchParams.get('shop') || '';
  const initialTab = searchParams.get('tab') || '';

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Fresh blank login fields - prefilled from URL or session if available
  const [identifier, setIdentifier] = useState<string>(initialShop);
  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Authenticated State
  const [authenticatedShop, setAuthenticatedShop] = useState<TenantShop | null>(null);
  const [activePin, setActivePin] = useState<string>('');
  const [feedbacks, setFeedbacks] = useState<TenantFeedback[]>([]);
  const [activeTab, setActiveTab] = useState<'complaints' | 'stand' | 'details' | 'payment'>(
    initialTab === 'payment' ? 'payment' : initialTab === 'stand' ? 'stand' : 'complaints'
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [paymentQrDataUrl, setPaymentQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // PIN Update Modal State
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState<boolean>(false);
  const [pinChangeCurrent, setPinChangeCurrent] = useState<string>('');
  const [pinChangeNew, setPinChangeNew] = useState<string>('');
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);
  const [isSubmittingPinChange, setIsSubmittingPinChange] = useState<boolean>(false);

  // 1-Tap WhatsApp "Send Review Request" State
  const [customerReviewPhone, setCustomerReviewPhone] = useState<string>('');
  const [reviewRequestToast, setReviewRequestToast] = useState<string | null>(null);

  // Weekly ROI Report State
  const [weeklyReportToast, setWeeklyReportToast] = useState<string | null>(null);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState<boolean>(false);
  const [portalReportLang, setPortalReportLang] = useState<'hinglish' | 'english'>('hinglish');

  // Personalized Whole Stand Download State
  const [isDownloadingStand, setIsDownloadingStand] = useState<boolean>(false);

  const isLight = theme === 'light';

  const handleDownloadWholeStand = async () => {
    if (!authenticatedShop || !qrDataUrl) return;
    setIsDownloadingStand(true);
    try {
      await downloadDesignedStand({
        shopName: authenticatedShop.name,
        category: authenticatedShop.category,
        city: authenticatedShop.city,
        slug: authenticatedShop.slug,
        qrDataUrl,
      });
    } catch (err) {
      console.error('Failed to download stand:', err);
    } finally {
      setIsDownloadingStand(false);
    }
  };

  const handleCopyUpiId = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText('9315745798@fam');
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  // Attempt auto-login from active session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSlug = sessionStorage.getItem('repuboost_tenant_slug');
      const savedPin = sessionStorage.getItem('repuboost_tenant_pin');
      if (savedSlug && savedPin && !authenticatedShop) {
        setIdentifier(savedSlug);
        setPin(savedPin);
        fetchTenantData(savedSlug, savedPin);
      } else if (initialShop && !identifier) {
        setIdentifier(initialShop);
      }
    }
  }, [initialShop]);

  // Generate Stand QR and UPI Payment QR code when authenticated shop loads
  useEffect(() => {
    if (!authenticatedShop) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://clippilot-rust.vercel.app';
    const targetUrl = `${origin}/r/${authenticatedShop.slug}`;
    QRCode.toDataURL(targetUrl, { width: 500, margin: 2 })
      .then(setQrDataUrl)
      .catch(console.error);

    const shopClean = authenticatedShop.name.replace(/[^a-zA-Z0-9]/g, '') || authenticatedShop.slug;
    const upiUri = `upi://pay?pa=9315745798@fam&pn=RepuBoost&am=899&tn=${encodeURIComponent(shopClean)}_Retainer&cu=INR`;
    QRCode.toDataURL(upiUri, { width: 500, margin: 2 })
      .then(setPaymentQrDataUrl)
      .catch(console.error);
  }, [authenticatedShop]);

  const fetchTenantData = async (shopSlug: string, accessPin: string) => {
    setIsLoading(true);
    setAuthError(null);
    const startTime = Date.now();
    try {
      const res = await fetch(`/api/portal?shop=${encodeURIComponent(shopSlug)}&pin=${encodeURIComponent(accessPin)}`);
      const data = await res.json();

      if (data.success && data.shop) {
        setAuthenticatedShop(data.shop);
        setActivePin(accessPin);
        setFeedbacks(data.feedback || []);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('repuboost_tenant_slug', data.shop.slug);
          sessionStorage.setItem('repuboost_tenant_pin', accessPin);
        }
      } else {
        setAuthError(data.error || 'Failed to authenticate');
        setAuthenticatedShop(null);
      }
    } catch (err) {
      setAuthError('Connection error. Please try again.');
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 650 - elapsed);
      setTimeout(() => {
        setIsLoading(false);
      }, remaining);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !pin.trim()) {
      setAuthError('Please enter both Business ID and PIN');
      return;
    }
    fetchTenantData(identifier.trim(), pin.trim());
  };

  const handleLogout = () => {
    setAuthenticatedShop(null);
    setActivePin('');
    setPin('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('repuboost_tenant_slug');
      sessionStorage.removeItem('repuboost_tenant_pin');
    }
  };

  const handleResolveFeedback = async (feedbackId: string, currentStatus: string) => {
    if (!authenticatedShop) return;
    const newStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';

    // Optimistic update
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, status: newStatus } : f))
    );

    try {
      await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve_complaint',
          shop_slug: authenticatedShop.slug,
          pin: activePin,
          feedback_id: feedbackId,
          new_status: newStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to update complaint:', err);
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!authenticatedShop) return;
    if (!confirm('Are you sure you want to permanently delete this complaint message?')) return;

    // Optimistic delete
    setFeedbacks((prev) => prev.filter((f) => f.id !== feedbackId));

    try {
      await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_complaint',
          shop_slug: authenticatedShop.slug,
          pin: activePin,
          feedback_id: feedbackId,
        }),
      });
    } catch (err) {
      console.error('Failed to delete complaint:', err);
    }
  };

  const handleUpdateStorePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticatedShop) return;
    const cleanNewPin = pinChangeNew.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(cleanNewPin)) {
      setPinChangeError('PIN must be 4 to 12 letters/numbers with no spaces or symbols.');
      return;
    }
    setIsSubmittingPinChange(true);
    setPinChangeError(null);
    setPinChangeSuccess(null);

    try {
      const res = await fetch('/api/update-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: authenticatedShop.slug,
          current_pin: pinChangeCurrent.trim().toUpperCase() || activePin,
          new_pin: cleanNewPin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActivePin(cleanNewPin);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('repuboost_tenant_pin', cleanNewPin);
        }
        setPinChangeSuccess(`Store PIN updated to ${cleanNewPin} successfully!`);
        setTimeout(() => {
          setIsChangePinModalOpen(false);
          setPinChangeSuccess(null);
          setPinChangeNew('');
        }, 1800);
      } else {
        setPinChangeError(data.error || 'Failed to update PIN.');
      }
    } catch {
      setPinChangeError('Network error updating PIN.');
    } finally {
      setIsSubmittingPinChange(false);
    }
  };

  const handleSendReviewRequest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authenticatedShop) return;

    const raw = customerReviewPhone.trim().replace(/\D/g, '');
    const cleanNumber = raw.length > 10 ? raw.slice(-10) : raw;

    if (cleanNumber.length !== 10) {
      setReviewRequestToast('Please enter a valid 10-digit mobile number.');
      setTimeout(() => setReviewRequestToast(null), 3000);
      return;
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://clippilot-rust.vercel.app';
    const reviewLink = `${origin}/r/${authenticatedShop.slug}`;
    const message = `Namaste! Thank you for visiting today. We’d love to hear your feedback. Please take 5 seconds to rate your visit here: ${reviewLink}`;

    const waUrl = `https://wa.me/91${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    setReviewRequestToast(`Opening WhatsApp review request for +91 ${cleanNumber}!`);
    setCustomerReviewPhone('');
    setTimeout(() => setReviewRequestToast(null), 4000);
  };

  const handleCopyWeeklyReport = (lang: 'hinglish' | 'english' = portalReportLang) => {
    if (!authenticatedShop) return;
    const scans = authenticatedShop.total_scans ?? authenticatedShop.scans_count ?? 0;
    const reviews = authenticatedShop.positive_redirects ?? authenticatedShop.reviews_gained ?? 0;
    const complaints = Math.max(authenticatedShop.complaints_blocked ?? 0, feedbacks.length);
    const rating = authenticatedShop.rating_avg ?? 4.9;

    const report = formatWeeklyRoiReport({
      shopName: authenticatedShop.name,
      ownerName: authenticatedShop.owner_name,
      scansCount: scans,
      reviewsGained: reviews,
      complaintsBlocked: complaints,
      ratingAvg: rating,
      lang: lang,
    });

    navigator.clipboard.writeText(report);
    setWeeklyReportToast('Weekly report copied to clipboard!');
    setTimeout(() => setWeeklyReportToast(null), 3500);
  };

  // --------------------------------------------------------------------------
  // SCREEN 1: LOGIN GATE (If not authenticated)
  // --------------------------------------------------------------------------
  if (isLoading && !authenticatedShop) {
    return (
      <StarLoadingScreen
        theme={isLight ? 'luxury' : 'dark'}
        badge="Store Management Portal"
        badgeIcon={<Store className="w-3.5 h-3.5 text-amber-500" />}
        title="Entering Store Portal"
        subtitle="Verifying store credentials & opening your private reputation desk..."
      />
    );
  }

  if (!authenticatedShop) {
    return (
      <div
        className={`min-h-screen transition-colors duration-200 font-sans flex flex-col justify-between ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#07090e] text-slate-100'
        }`}
      >
        <header
          className={`border-b sticky top-0 z-40 backdrop-blur-md ${
            isLight ? 'bg-white/85 border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800 shadow-md'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/luxury" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 p-[2px]">
                <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
                  <Store className="w-4 h-4 text-amber-500 group-hover:scale-105 transition-transform" />
                </div>
              </div>
              <span className="font-extrabold text-base tracking-tight">RepuBoost Client Portal</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/luxury"
                className={`text-xs font-semibold hover:underline hidden sm:inline ${
                  isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ← Back to Luxury Site
              </Link>
              <button
                onClick={() => setTheme(isLight ? 'dark' : 'light')}
                className={`p-2 rounded-xl border text-xs font-semibold ${isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
              >
                {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900/90 border-slate-800 shadow-black/80'
            }`}
          >
            <div className="text-center space-y-2 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-[2px] mx-auto shadow-lg shadow-amber-500/20">
                <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
                  <KeyRound className="w-7 h-7 text-amber-500" />
                </div>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight">Store Management Login</h1>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Sign in to view your live table scans, Google review booster, and private customer complaints.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Business Identifier
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. your-store-id"
                  required
                  autoComplete="off"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Store Access PIN
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your store access PIN"
                    required
                    autoComplete="new-password"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all pr-11 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <p className="text-xs text-rose-500 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                <span>{isLoading ? 'Verifying...' : 'Access My Store Panel'}</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
              <p className={`text-[11px] font-medium ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                Credentials provided by your RepuBoost Agency Partner
              </p>
            </div>
          </div>
        </main>

        <footer className={`py-4 text-center text-xs border-t ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-600'}`}>
          RepuBoost • Strict Tenant Privacy Engine
        </footer>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SCREEN 2: AUTHENTICATED SHOPKEEPER DASHBOARD
  // --------------------------------------------------------------------------
  const pendingComplaints = feedbacks.filter((f) => f.status === 'pending');
  const isPaused = authenticatedShop.subscription_status === 'paused';

  return (
    <div
      className={`min-h-screen transition-colors duration-200 font-sans flex flex-col ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#07090e] text-slate-100'
      }`}
    >
      {/* Top Header */}
      <header
        className={`border-b sticky top-0 z-40 backdrop-blur-md ${
          isLight ? 'bg-white/85 border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-[2px] shadow-md shadow-amber-500/20">
              <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
                <Store className="w-5 h-5 text-amber-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base tracking-tight">{authenticatedShop.name}</h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                    isPaused
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                  {isPaused ? 'Stand Paused' : 'Stand Active'}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveTab('payment')}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
                  title="View Monthly Retainer & UPI Payment Details"
                >
                  <CreditCard className="w-3 h-3 text-amber-700" />
                  <span>₹899/mo (Due 3rd–8th)</span>
                </button>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {authenticatedShop.category} • {authenticatedShop.city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/luxury"
              className={`hidden sm:inline text-xs font-semibold hover:underline mr-1 ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              View Luxury Page
            </Link>
            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`p-2 rounded-xl border text-xs font-semibold ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={() => {
                setPinChangeCurrent(activePin);
                setPinChangeNew('');
                setPinChangeError(null);
                setPinChangeSuccess(null);
                setIsChangePinModalOpen(true);
              }}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300'
              }`}
              title="Change Store Access PIN"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Change PIN</span>
            </button>

            <button
              onClick={handleLogout}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isLight ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700' : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6 flex-1">
        {/* KPI Real-Time Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total QR Scans */}
          <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Total QR Scans</span>
              <QrCode className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-indigo-500">
                {authenticatedShop.total_scans ?? authenticatedShop.scans_count ?? 0}
              </span>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>scans</span>
            </div>
            <p className={`text-[11px] mt-1.5 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Table & Counter Acrylic Stand</p>
          </div>

          {/* 2. Sent to Google */}
          <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Sent to Google</span>
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-amber-500">
                +{authenticatedShop.positive_redirects ?? authenticatedShop.reviews_gained ?? 0}
              </span>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>reviews</span>
            </div>
            <p className={`text-[11px] mt-1.5 font-medium ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>100% 4–5★ Boosted Directly</p>
          </div>

          {/* 3. 1-3★ Complaints Blocked */}
          <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Complaints Blocked</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-emerald-500">
                {Math.max(authenticatedShop.complaints_blocked ?? 0, feedbacks.length)}
              </span>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>blocked</span>
            </div>
            <p className={`text-[11px] mt-1.5 font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>1–3★ Kept Off Google Maps</p>
          </div>

          {/* 4. Customer Satisfaction */}
          <div className={`p-5 rounded-2xl border transition-all ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Customer Rating</span>
              <span className="text-xs text-amber-500 font-bold">★ 5.0 Scale</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black">{authenticatedShop.rating_avg?.toFixed(1) ?? '4.8'}</span>
              <span className="text-xs text-slate-400 font-bold">/ 5.0</span>
            </div>
            <p className={`text-[11px] mt-1.5 font-medium ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>Verified Patron Loyalty</p>
          </div>
        </div>

        {/* WEEKLY ROI PERFORMANCE SUMMARY BANNER (SHOP PANEL VIEW) */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            isLight
              ? 'bg-gradient-to-r from-indigo-50/70 via-emerald-50/50 to-white border-indigo-100 shadow-sm'
              : 'bg-gradient-to-r from-indigo-950/30 via-emerald-950/20 to-slate-900 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm flex items-center gap-2">
                <span>Weekly Verified Review Report</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Performance Summary
                </span>
              </div>
              <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                +{authenticatedShop.positive_redirects ?? authenticatedShop.reviews_gained ?? 0} reviews added to Google • {Math.max(authenticatedShop.complaints_blocked ?? 0, feedbacks.length)} private complaints saved this week.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsViewReportModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>See Report</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyWeeklyReport(portalReportLang)}
              className={`px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Report</span>
            </button>
          </div>
        </div>

        {weeklyReportToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{weeklyReportToast}</span>
          </div>
        )}

        {/* 1-TAP WHATSAPP REVIEW REQUEST DISPATCHER */}
        <div
          className={`p-5 rounded-2xl border transition-all shadow-sm ${
            isLight
              ? 'bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white border-emerald-200'
              : 'bg-gradient-to-r from-emerald-950/40 via-teal-950/20 to-slate-900 border-emerald-800/40'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  1-Tap WhatsApp Review Request
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Instant Dispatch
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Enter a customer's phone number during billing to invite them to rate your shop on Google Maps.
              </p>
            </div>

            <form onSubmit={handleSendReviewRequest} className="flex flex-col sm:flex-row items-center gap-2.5 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  value={customerReviewPhone}
                  onChange={(e) => setCustomerReviewPhone(e.target.value)}
                  placeholder="98765 43210"
                  maxLength={14}
                  className={`w-full pl-12 pr-3 py-2.5 text-xs rounded-xl border font-mono font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all ${
                    isLight
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Send on WhatsApp</span>
              </button>
            </form>
          </div>

          {reviewRequestToast && (
            <div className="mt-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-in fade-in duration-200">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{reviewRequestToast}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'complaints'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Private Complaints Feed</span>
            {pendingComplaints.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-rose-600 text-white">
                {pendingComplaints.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('stand')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stand'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>My Counter Stand QR</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Monthly Retainer & Payment</span>
            <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-emerald-600 text-white shadow-sm">
              ₹899
            </span>
          </button>
        </div>

        {/* TAB 1: COMPLAINTS DESK */}
        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {feedbacks.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base">No Private Complaints</h3>
                <p className={`text-xs mt-1 max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Awesome news! Your customers are rating 4 and 5 stars on your table stands. Any private dissatisfaction will appear here immediately.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks.map((item) => (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border space-y-3 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">{item.customer_name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              item.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.customer_contact || 'No contact provided'}
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-500 font-extrabold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{item.rating} Stars</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl text-xs italic ${isLight ? 'bg-slate-50 text-slate-800 border border-slate-100' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}>
                      "{item.complaint_text}"
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                        {new Date(item.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center gap-2">
                        {item.customer_contact && (() => {
                          const cleanNum = item.customer_contact.replace(/[^0-9]/g, '');
                          const waPhone = cleanNum.length === 10 ? `91${cleanNum}` : cleanNum;
                          const storeSlug = authenticatedShop?.slug || '';
                          const shortStoreUrl = storeSlug ? `https://repoboost.vercel.app/r/${storeSlug}` : 'https://repoboost.vercel.app';
                          const rawComplaint = (item.complaint_text || 'your recent visit').trim();
                          let cleanComplaint = rawComplaint;
                          const match = rawComplaint.match(/^\[Issues reported:\s*([^\]]+)\](?:\s*(.*))?$/i);
                          if (match) {
                            const tags = match[1].trim();
                            const notes = (match[2] || '').trim();
                            cleanComplaint = notes ? `${tags} (${notes})` : tags;
                          }

                          const waEng = `Hi ${item.customer_name}! 👋\nThis is team ${authenticatedShop.name}.\n\nThank you for your feedback. We sincerely apologize for the issue reported: "${cleanComplaint}". We have addressed this directly with our team to make it right.\n\nOnce the problem is resolved to your satisfaction, please take a quick second to update your rating here:\n🔗 ${shortStoreUrl}`;

                          const waHinglish = `Hi ${item.customer_name}! 👋\nTeam ${authenticatedShop.name} se message hai.\n\nAapke feedback ke liye thank you. Aapne jo issue report kiya ("${cleanComplaint}"), uske liye really sorry. Humne isko note kar liya hai aur hum ise priority pe solve kar rahe hain.\n\nProblem solve hone ke baad agar aapko sab theek lage, toh please ek second nikaal kar apna rating yahan update kar dijiye:\n🔗 ${shortStoreUrl}`;

                          return (
                            <>
                              <a
                                href={`tel:${item.customer_contact.replace(/[^0-9+]/g, '')}`}
                                className="px-2.5 py-1.5 rounded-lg border font-bold text-[11px] flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Phone className="w-3 h-3 text-emerald-500" />
                                <span>Call</span>
                              </a>

                              <a
                                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waEng)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors"
                                title="Open WhatsApp (English)"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>

                              <a
                                href={`https://wa.me/${waPhone}?text=${encodeURIComponent(waHinglish)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
                                title="Open WhatsApp (Hinglish)"
                              >
                                <span>Hinglish</span>
                              </a>
                            </>
                          );
                        })()}

                        <button
                          onClick={() => handleResolveFeedback(item.id, item.status)}
                          className={`px-2.5 py-1.5 rounded-lg border font-bold text-[11px] transition-colors ${
                            item.status === 'resolved'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {item.status === 'resolved' ? 'Mark Pending' : 'Mark Resolved'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteFeedback(item.id)}
                          className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Permanently Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STAND QR VIEW */}
        {activeTab === 'stand' && (() => {
          const standTheme = getStandTheme(authenticatedShop.category);
          return (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center">
                <h3 className={`font-black text-xl ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Your Personalized Acrylic Counter Stand
                </h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Tailored 4x6" table stand designed for your shop counter, billing desks, and dining tables.
                </p>
              </div>

              {/* Physical Stand Mockup Card */}
              <div
                className={`rounded-3xl p-7 border-4 border-amber-500/30 text-center relative overflow-hidden transition-all shadow-2xl mx-auto max-w-md ${
                  isLight
                    ? 'bg-white text-slate-900 shadow-slate-200'
                    : 'bg-gradient-to-b from-slate-900 to-black text-white shadow-amber-500/10'
                }`}
              >
                {/* Category Gradient Top Bar */}
                <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${standTheme.gradientClass}`} />

                {/* Category Badge Pill */}
                <div className="flex justify-center mb-3 pt-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm"
                    style={{
                      backgroundColor: standTheme.accentBg,
                      color: standTheme.accentText,
                      border: `1px solid ${standTheme.accentBorder}`,
                    }}
                  >
                    <span>{standTheme.icon}</span>
                    <span>{standTheme.categoryLabel}</span>
                  </span>
                </div>

                {/* Gold Stars */}
                <div className="flex justify-center gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    />
                  ))}
                </div>

                {/* Shop Name */}
                <h3 className={`text-2xl font-black tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {authenticatedShop.name}
                </h3>
                <p className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                  {(authenticatedShop.city || 'India').toUpperCase()} • REPUBOOST™ VERIFIED PARTNER
                </p>

                {/* Personalized Category Experience Hook */}
                <p
                  className="text-sm font-extrabold mt-3 px-3 italic"
                  style={{ color: standTheme.primaryColor }}
                >
                  "{standTheme.hook}"
                </p>

                {/* Rate on Google Maps Header */}
                <div className="mt-3.5 py-1.5 px-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-black tracking-wider uppercase inline-block text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ⭐ Rate Us on Google Maps ⭐
                </div>

                {/* Scannable QR Code Frame */}
                {qrDataUrl && (
                  <div
                    className="my-4 p-3 rounded-2xl bg-white mx-auto inline-block shadow-lg"
                    style={{ border: `3px solid ${standTheme.primaryColor}` }}
                  >
                    <img
                      src={qrDataUrl}
                      alt={`${authenticatedShop.name} Scannable QR Code`}
                      className="w-52 h-52 object-contain mx-auto rounded-lg"
                    />
                  </div>
                )}

                <p className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                  Scan with Any Phone Camera
                </p>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Takes 5 seconds • No app download required
                </p>

                {/* Footer Branding */}
                <div className={`mt-5 pt-3 border-t flex items-center justify-center gap-1.5 text-[11px] font-semibold ${
                  isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>RepuBoost™</span>
                </div>
              </div>

              {/* Action Buttons: 1-Click Whole Stand Download */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadWholeStand}
                  disabled={isDownloadingStand || !qrDataUrl}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDownloadingStand ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating 4x6" Designed Stand Graphic...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Complete Designed Stand (PNG)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className={`w-full sm:w-auto px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Stand (4x6" Tent)</span>
                </button>

                <Link
                  href={`/r/${authenticatedShop.slug}`}
                  target="_blank"
                  className={`w-full sm:w-auto px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                  }`}
                >
                  <span>Preview Customer View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })()}

        {/* TAB 3: DEDICATED MONTHLY RETAINER & PAYMENT PAGE */}
        {activeTab === 'payment' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
            {/* Header Banner */}
            <div
              className={`p-6 rounded-2xl border shadow-sm ${
                isLight
                  ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white border-amber-200'
                  : 'bg-gradient-to-r from-amber-950/40 via-orange-950/20 to-slate-900 border-amber-800/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                    </div>
                    <h3 className={`font-black text-base sm:text-lg ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Monthly Retainer & Payment
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ₹899 Fixed
                    </span>
                  </div>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    Direct UPI renewal for <span className="font-bold text-amber-600">{authenticatedShop.name}</span>. Keeps your review booster stand online 24/7.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    <span>Billing Window: 3rd – 8th</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column: UPI Payment QR Card */}
              <div
                className={`p-6 rounded-2xl border text-center shadow-md ${
                  isLight ? 'bg-white border-slate-200 shadow-slate-200/50' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">
                    Scan UPI QR to Pay
                  </h4>
                </div>
                <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Use Google Pay, PhonePe, Paytm, or any UPI app to pay ₹899 instantly.
                </p>

                {/* Scannable UPI QR (Official Payment Stand QR) */}
                <div className="inline-block p-2.5 rounded-3xl bg-[#f5e6c8]/60 shadow-xl border-2 border-amber-300/80 relative group max-w-[270px] mx-auto">
                  <div className="rounded-2xl overflow-hidden shadow-sm bg-[#edd7a6] p-1">
                    <img
                      src="/repuboost_payment_qr.jpg"
                      alt="UPI Retainer Payment QR - 9315745798@fam"
                      className="w-60 h-auto mx-auto rounded-xl object-contain shadow-sm"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                    <span>Google Pay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
                  </div>
                </div>

                {/* Prominently directly under QR: ₹899 & pay on every 3-8 of month */}
                <div className="mt-5 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">₹899</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">/ month</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-black">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Pay on every 3rd – 8th of month</span>
                  </div>

                  <p className={`text-[11px] pt-1 max-w-xs mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Please complete your retainer payment between the 3rd and 8th of every calendar month to keep your store stand active.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 space-y-2.5">
                  {/* Copy UPI ID */}
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center justify-between ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}>
                      <span className="truncate">9315745798@fam</span>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="ml-2 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy ID</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Billing Breakdown & Support */}
              <div className="space-y-4">
                {/* Plan Summary Card */}
                <div
                  className={`p-5 rounded-2xl border space-y-3.5 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <h4 className="font-extrabold text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Retainer Plan Details</span>
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Store Name</span>
                      <span className="font-bold">{authenticatedShop.name}</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Monthly Retainer</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹899 / month</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Payment Window</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">3rd to 8th of every month</span>
                    </div>

                    <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Stand Status</span>
                      <span className={`font-bold ${
                        authenticatedShop.subscription_status === 'paused'
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}>
                        {authenticatedShop.subscription_status === 'paused' ? 'Paused (Payment Due)' : 'Active & Protected'}
                      </span>
                    </div>

                    <div className="flex justify-between py-1.5">
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Payment Method</span>
                      <span className="font-bold">UPI / GPay / PhonePe / Paytm</span>
                    </div>
                  </div>
                </div>

                {/* Included Features */}
                <div
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                    What your ₹899/month covers
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Unlimited 24/7 QR scans on your counter stands</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Direct 4 & 5-star Google Maps review redirection</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Private interception of 1–3 star complaints</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>1-Tap WhatsApp customer review request tool</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Dedicated RepuBoost partner account support</span>
                    </li>
                  </ul>
                </div>

                {/* WhatsApp Payment Confirmation */}
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                    isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-950 dark:text-emerald-200">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Already Paid? Share Receipt</span>
                    </div>
                    <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400">
                      Send screenshot to partner WhatsApp for instant verification.
                    </p>
                  </div>

                  <a
                    href={`https://wa.me/918700316376?text=${encodeURIComponent(
                      `Namaste! I have paid the ₹899 monthly retainer for ${authenticatedShop.name} (${authenticatedShop.slug}). Please find attached my payment confirmation.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>Share on WhatsApp</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* STORE PIN MODAL */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className={`w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-5 shadow-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-sm sm:text-base truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Change Store Access PIN
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Store: <span className="font-bold text-amber-600">{authenticatedShop.name}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePinModalOpen(false)}
                className={`text-sm p-1 shrink-0 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            {pinChangeError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{pinChangeError}</span>
              </div>
            )}

            {pinChangeSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{pinChangeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStorePin} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Current Store PIN
                </label>
                <input
                  required
                  type="text"
                  value={pinChangeCurrent}
                  onChange={(e) => setPinChangeCurrent(e.target.value.toUpperCase())}
                  placeholder="Enter current PIN"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  New Store PIN
                </label>
                <input
                  required
                  type="text"
                  value={pinChangeNew}
                  onChange={(e) => setPinChangeNew(e.target.value.toUpperCase())}
                  placeholder="e.g. APURV99"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                <p className="text-[10px] text-slate-400">
                  4 to 12 alphanumeric characters. Automatically capitalized.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsChangePinModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPinChange}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {isSubmittingPinChange ? (
                    <span>Updating PIN...</span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Save New PIN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHOPKEEPER VIEW REPORT MODAL                                              */}
      {/* ========================================================================= */}
      {isViewReportModalOpen && authenticatedShop && (() => {
        const scans = authenticatedShop.total_scans ?? authenticatedShop.scans_count ?? 0;
        const reviews = authenticatedShop.positive_redirects ?? authenticatedShop.reviews_gained ?? 0;
        const complaints = Math.max(authenticatedShop.complaints_blocked ?? 0, feedbacks.length);
        const rating = authenticatedShop.rating_avg ?? 4.9;

        const reportContent = formatWeeklyRoiReport({
          shopName: authenticatedShop.name,
          ownerName: authenticatedShop.owner_name,
          scansCount: scans,
          reviewsGained: reviews,
          complaintsBlocked: complaints,
          ratingAvg: rating,
          lang: portalReportLang,
        });

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div
              className={`w-full max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-4 shadow-2xl border ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">Weekly Performance Report</h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {authenticatedShop.name} • Verified Review Summary
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsViewReportModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metrics Highlights */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-900/30'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Scans</div>
                  <div className="text-lg font-black text-indigo-500">{scans}</div>
                </div>
                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-amber-50/50 border-amber-100' : 'bg-amber-950/20 border-amber-900/30'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500">5★ Added</div>
                  <div className="text-lg font-black text-amber-500">+{reviews}</div>
                </div>
                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-emerald-50/50 border-emerald-100' : 'bg-emerald-950/20 border-emerald-900/30'}`}>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Saved</div>
                  <div className="text-lg font-black text-emerald-500">{complaints}</div>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">View In:</span>
                <div className="flex items-center p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-xs">
                  <button
                    type="button"
                    onClick={() => setPortalReportLang('hinglish')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      portalReportLang === 'hinglish'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    🇮🇳 Hinglish
                  </button>
                  <button
                    type="button"
                    onClick={() => setPortalReportLang('english')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      portalReportLang === 'english'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    🌐 English
                  </button>
                </div>
              </div>

              {/* Message Live Preview */}
              <div
                className={`p-3.5 rounded-xl border font-mono text-xs leading-relaxed whitespace-pre-wrap select-all max-h-56 overflow-y-auto ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              >
                {reportContent}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsViewReportModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  }`}
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleCopyWeeklyReport(portalReportLang);
                    setIsViewReportModalOpen(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Report</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Stand Generation Luxury Star Loading Overlay */}
      {isDownloadingStand && (
        <StarLoadingScreen
          theme="overlay"
          badge="Print Studio"
          badgeIcon={<Printer className="w-3.5 h-3.5 text-amber-400" />}
          title="Generating 4x6&quot; Acrylic Stand Graphic"
          subtitle="Baking 300 DPI vector QR, category palette & personalized shop branding..."
        />
      )}

      {/* Footer */}
      <footer className={`py-4 text-center text-xs border-t ${isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800 text-slate-600'}`}>
        RepuBoost Client Portal • {authenticatedShop.name} ({authenticatedShop.city})
      </footer>
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <StarLoadingScreen
          theme="dark"
          badge="Store Management Portal"
          badgeIcon={<Store className="w-3.5 h-3.5 text-amber-400" />}
          title="Entering Store Portal"
          subtitle="Authenticating store security keys & loading live feedback desk..."
        />
      }
    >
      <PortalInner />
    </Suspense>
  );
}

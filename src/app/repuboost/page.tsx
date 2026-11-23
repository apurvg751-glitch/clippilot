'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getCategoryConfig, INDUSTRY_CATEGORIES } from '@/lib/industryCategories';
import {
  Sparkles,
  Users,
  Star,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  QrCode,
  MessageCircle,
  Plus,
  CheckCircle,
  Printer,
  Copy,
  Database,
  ArrowUpRight,
  Store,
  RefreshCw,
  Sun,
  Moon,
  Download,
  Trash2,
  Zap,
  PauseCircle,
  PlayCircle,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  Settings,
  Search,
  LayoutGrid,
  List,
  Filter,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { getStandTheme, downloadDesignedStand } from '@/lib/standGenerator';
import { SubscriptionStatus } from '@/types/repuboost';
import StarLoadingScreen from '@/components/common/StarLoadingScreen';

interface ClientRecord {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  owner_name: string;
  owner_phone: string;
  google_review_url: string;
  monthly_retainer: number;
  payment_status: string;
  portal_password?: string;
  subscription_status?: SubscriptionStatus;
  trial_ends_at?: string;
  current_period_end?: string | null;
  razorpay_subscription_id?: string | null;
  payment_link?: string | null;
  total_scans?: number;
  positive_redirects?: number;
  scans_count?: number;
  rating_avg?: number;
  reviews_gained?: number;
  complaints_blocked?: number;
}

interface FeedbackRecord {
  id: string;
  business_id?: string;
  business_name?: string;
  rating: number;
  customer_name: string;
  customer_contact: string;
  complaint_text: string;
  status: string;
  created_at: string;
}

const isDemoFeedbackRecord = (f: any): boolean => {
  if (!f) return false;
  const name = String(f.customer_name || '').toLowerCase();
  const contact = String(f.customer_contact || '');
  const biz = String(f.business_name || '').toLowerCase();
  const text = String(f.complaint_text || '').toLowerCase();
  return (
    name.includes('e2e') ||
    name.includes('verification') ||
    name.includes('vikram') ||
    name.includes('rahul') ||
    contact.includes('98111') ||
    contact.includes('98765') ||
    biz.includes('management') ||
    text.includes('samosas were cold') ||
    text.includes('rasmalai was slightly sour') ||
    text.includes('counter queue was slightly slow')
  );
};

export default function RepuBoostDashboard() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'clients' | 'complaints' | 'stand_studio' | 'database'>('clients');
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [dataSource, setDataSource] = useState<string>('loading');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for adding client
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newBizSlug, setNewBizSlug] = useState('');
  const [newBizCategory, setNewBizCategory] = useState('Restaurant & Cafe');
  const [newBizCity, setNewBizCity] = useState('Jaipur');
  const [newBizOwner, setNewBizOwner] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizGoogleUrl, setNewBizGoogleUrl] = useState('');

  // Selected client for Stand Studio
  const [selectedStandClient, setSelectedStandClient] = useState<ClientRecord | null>(null);
  const [standQrDataUrl, setStandQrDataUrl] = useState<string>('');
  const [isDownloadingStandAdmin, setIsDownloadingStandAdmin] = useState<boolean>(false);
  const [createdClientSuccess, setCreatedClientSuccess] = useState<{
    name: string;
    slug: string;
    qrDataUrl: string;
    pin?: string;
    phone?: string;
    owner?: string;
  } | null>(null);

  // Copy toast state
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Complaints Desk Left-Sidebar Filtering
  const [selectedComplaintBizId, setSelectedComplaintBizId] = useState<string>('all');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');

  // Admin Override Toggle State
  const [updatingShopId, setUpdatingShopId] = useState<string | null>(null);
  const [deletingShopId, setDeletingShopId] = useState<string | null>(null);
  const [statusFeedbackToast, setStatusFeedbackToast] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  // Master Admin Authentication State (Strict Server-Validated via ADMIN_PASSWORD)
  const [adminKey, setAdminKey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Admin Change Password Modal State
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState<boolean>(false);

  // Client Store PIN Modal State (Admin only access)
  const [isStorePinModalOpen, setIsStorePinModalOpen] = useState<boolean>(false);
  const [selectedClientForPin, setSelectedClientForPin] = useState<ClientRecord | null>(null);
  const [newStorePinInput, setNewStorePinInput] = useState<string>('');
  const [isUpdatingStorePin, setIsUpdatingStorePin] = useState<boolean>(false);
  const [storePinError, setStorePinError] = useState<string | null>(null);

  // Roster Search, Filter & View Toggle State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'trial'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [activeManageShopId, setActiveManageShopId] = useState<string | null>(null);
  const [copiedUpiId, setCopiedUpiId] = useState<string | null>(null);

  // Consolidated Header Settings Dropdown State
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const manageMenuRef = useRef<HTMLDivElement>(null);

  // Click outside listener for dropdown menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
      if (manageMenuRef.current && !manageMenuRef.current.contains(event.target as Node)) {
        setActiveManageShopId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAdminHeaders = () => {
    const key = adminKey || (typeof window !== 'undefined' ? (sessionStorage.getItem('repuboost_admin_key') || '') : '');
    return {
      'Content-Type': 'application/json',
      'x-admin-key': key,
    };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputPassword.trim();
    if (!clean) {
      setAuthError('Please enter the master admin password.');
      return;
    }

    setIsAuthChecking(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/repuboost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': clean,
        },
        body: JSON.stringify({ action: 'verify_admin', admin_password: clean }),
      });

      const data = await res.json();
      if (res.ok && data.authorized) {
        setAdminKey(clean);
        setIsAuthenticated(true);
        setAuthError(null);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('repuboost_admin_key', clean);
        }
      } else {
        setAuthError('Incorrect master admin password. Access denied.');
      }
    } catch {
      setAuthError('Network error connecting to verification server.');
    } finally {
      setIsAuthChecking(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey('');
    setInputPassword('');
    setAuthError(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('repuboost_admin_key');
      localStorage.removeItem('repuboost_admin_auth');
      localStorage.removeItem('repuboost_custom_admin_password');
    }
  };

  // Initial Auth Verification against Server
  useEffect(() => {
    async function verifyInitialSession() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('repuboost_custom_admin_password');
        localStorage.removeItem('repuboost_admin_auth');

        const savedKey = (sessionStorage.getItem('repuboost_admin_key') || '').trim();
        if (savedKey) {
          try {
            const res = await fetch('/api/repuboost', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-admin-key': savedKey,
              },
              body: JSON.stringify({ action: 'verify_admin', admin_password: savedKey }),
            });
            const data = await res.json();
            if (res.ok && data.authorized) {
              setAdminKey(savedKey);
              setIsAuthenticated(true);
            } else {
              sessionStorage.removeItem('repuboost_admin_key');
              setIsAuthenticated(false);
            }
          } catch {
            sessionStorage.removeItem('repuboost_admin_key');
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
      }
      setIsAuthChecking(false);
    }

    verifyInitialSession();
  }, []);

  const handleUpdateStorePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForPin) return;
    const cleanPin = newStorePinInput.trim().toUpperCase();
    if (cleanPin.length < 3) {
      setStorePinError('PIN must be at least 3 characters.');
      return;
    }

    setIsUpdatingStorePin(true);
    setStorePinError(null);

    try {
      const res = await fetch('/api/repuboost', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'update_shop_pin',
          shop_id: selectedClientForPin.id,
          slug: selectedClientForPin.slug,
          new_pin: cleanPin,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === selectedClientForPin.id || c.slug === selectedClientForPin.slug
              ? { ...c, portal_password: cleanPin }
              : c
          )
        );
        setIsStorePinModalOpen(false);
        setStatusFeedbackToast({
          message: `🔑 PIN for "${selectedClientForPin.name}" updated to ${cleanPin}!`,
          type: 'success',
        });
        setTimeout(() => setStatusFeedbackToast(null), 4000);
      } else {
        setStorePinError(data.error || 'Failed to update PIN.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error updating PIN.';
      setStorePinError(msg);
    } finally {
      setIsUpdatingStorePin(false);
    }
  };

  const handleToggleStatus = async (client: ClientRecord, newStatus?: SubscriptionStatus) => {
    const currentStatus = (client.subscription_status || client.payment_status || 'trial') as SubscriptionStatus;
    const targetStatus: SubscriptionStatus = newStatus || (currentStatus === 'paused' ? 'active' : 'paused');

    setUpdatingShopId(client.id);

    // Optimistically update the UI immediately
    setClients((prev) =>
      prev.map((c) =>
        c.id === client.id || c.slug === client.slug
          ? {
              ...c,
              subscription_status: targetStatus,
              payment_status: targetStatus,
              current_period_end:
                targetStatus === 'active'
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  : c.current_period_end,
            }
          : c
      )
    );

    try {
      const res = await fetch('/api/repuboost', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'toggle_subscription_status',
          shop_id: client.id,
          slug: client.slug,
          new_status: targetStatus,
          extend_days: targetStatus === 'active' ? 30 : 0,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusFeedbackToast({
          message:
            targetStatus === 'active'
              ? `⚡ ${client.name} reactivated! QR feedback portal is now LIVE.`
              : targetStatus === 'paused'
              ? `🛑 Remote Kill Switch active: ${client.name} portal is now PAUSED.`
              : targetStatus === 'grace_period'
              ? `⚠️ ${client.name} moved to Grace Period (Payment Due).`
              : `⏳ ${client.name} set to 7-Day Trial.`,
          type: targetStatus === 'active' ? 'success' : 'alert',
        });
        setTimeout(() => setStatusFeedbackToast(null), 4000);
      } else {
        fetchData(true);
      }
    } catch (err) {
      console.error('Failed toggling subscription status:', err);
      fetchData(true);
    } finally {
      setUpdatingShopId(null);
    }
  };

  const handleDeleteShop = async (client: ClientRecord) => {
    const confirmed = window.confirm(
      `Permanently delete "${client.name}"?\nThis will remove the business, its QR landing page, and all private feedback records.`
    );
    if (!confirmed) return;

    setDeletingShopId(client.id);
    try {
      const res = await fetch('/api/repuboost', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'delete_shop',
          shop_id: client.id,
          slug: client.slug,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setClients((prev) => prev.filter((c) => c.id !== client.id && c.slug !== client.slug));
        setStatusFeedbackToast({
          message: `🗑️ Successfully deleted "${client.name}" and all related data.`,
          type: 'success',
        });
        setTimeout(() => setStatusFeedbackToast(null), 4000);
      } else {
        alert(`Failed to delete: ${data.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingShopId(null);
    }
  };

  const fetchData = async (isBackground = false) => {
    if (!isBackground) {
      setIsLoading(true);
    }
    try {
      const res = await fetch('/api/repuboost', {
        cache: 'no-store',
        headers: { 'x-admin-key': getAdminHeaders()['x-admin-key'] },
      });
      const data = await res.json();
      setClients(data.clients || []);

      const serverFeedbacks: FeedbackRecord[] = (data.feedback || []).filter((fb: FeedbackRecord) => !isDemoFeedbackRecord(fb));
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('repuboost_saved_feedbacks', JSON.stringify(serverFeedbacks));
        }
      } catch {
        // ignore storage error
      }

      setFeedbacks(serverFeedbacks);
      setIsSupabaseConnected(Boolean(data.isSupabaseConnected));
      setDataSource(data.source || 'local');
      if (data.clients && data.clients.length > 0) {
        setSelectedStandClient((prev) => prev || data.clients[0]);
      }
    } catch {
      // Fallback
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData(false);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }
      fetchData(true);
    }, 15000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, adminKey]);

  useEffect(() => {
    if (!selectedStandClient) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://clippilot-rust.vercel.app';
    const targetUrl = `${origin}/r/${selectedStandClient.slug}`;

    QRCode.toDataURL(targetUrl, {
      width: 688,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url: string) => setStandQrDataUrl(url))
      .catch((err: unknown) => console.error('Failed to generate stand QR:', err));
  }, [selectedStandClient]);

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleCopyUpiRenewalLink = (client: ClientRecord) => {
    const shopClean = client.name.replace(/[^a-zA-Z0-9]/g, '');
    const upiLink = `upi://pay?pa=9315745798@fam&pn=RepuBoost&am=899&tn=${encodeURIComponent(shopClean)}_Retainer`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(upiLink);
    }
    setCopiedUpiId(client.id);
    setTimeout(() => setCopiedUpiId(null), 2000);
  };

  const handleDownloadWholeStandAdmin = async () => {
    if (!selectedStandClient || !standQrDataUrl) return;
    setIsDownloadingStandAdmin(true);
    try {
      await downloadDesignedStand({
        shopName: selectedStandClient.name,
        category: selectedStandClient.category,
        city: selectedStandClient.city,
        slug: selectedStandClient.slug,
        qrDataUrl: standQrDataUrl,
      });
    } catch (err) {
      console.error('Failed to download stand graphic:', err);
    } finally {
      setIsDownloadingStandAdmin(false);
    }
  };

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBizName || !newBizSlug || !newBizGoogleUrl) return;

    const formattedSlug = newBizSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

    try {
      const res = await fetch('/api/repuboost', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'add_client',
          name: newBizName,
          slug: formattedSlug,
          category: newBizCategory,
          city: newBizCity,
          owner_name: newBizOwner,
          owner_phone: newBizPhone,
          google_review_url: newBizGoogleUrl,
          monthly_retainer: 899,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://clippilot-rust.vercel.app';
        const targetUrl = `${origin}/r/${formattedSlug}`;

        const qrDataUrl = await QRCode.toDataURL(targetUrl, {
          width: 688,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });

        const newRecord: ClientRecord = data.client || {
          id: `b_${Date.now()}`,
          name: newBizName,
          slug: formattedSlug,
          category: newBizCategory,
          city: newBizCity,
          owner_name: newBizOwner,
          owner_phone: newBizPhone,
          google_review_url: newBizGoogleUrl,
          monthly_retainer: 899,
          payment_status: 'active',
        };

        const generatedPin = `${formattedSlug.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X')}88`;

        setCreatedClientSuccess({
          name: newBizName,
          slug: formattedSlug,
          qrDataUrl,
          pin: generatedPin,
          phone: newBizPhone,
          owner: newBizOwner,
        });

        setSelectedStandClient(newRecord);
        setClients((prev) => [newRecord, ...prev.filter((c) => c.slug !== formattedSlug)]);

        setNewBizName('');
        setNewBizSlug('');
        setNewBizGoogleUrl('');
        setNewBizOwner('');
        setNewBizPhone('');
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  const handleResolveComplaint = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'resolved' : 'pending';
    setFeedbacks((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, status: nextStatus } : f));
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('repuboost_saved_feedbacks', JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
    try {
      await fetch('/api/repuboost', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'resolve_feedback',
          feedback_id: id,
          new_status: nextStatus,
        }),
      });
    } catch {
      // ignore
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    setFeedbacks((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('repuboost_saved_feedbacks', JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
    try {
      await fetch('/api/repuboost', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'delete_feedback',
          feedback_id: id,
        }),
      });
    } catch (err) {
      console.error('Failed to delete complaint on server:', err);
    }
  };

  const handleClearDemoComplaints = async () => {
    setFeedbacks((prev) => {
      const updated = prev.filter((f) => !isDemoFeedbackRecord(f));
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('repuboost_saved_feedbacks', JSON.stringify(updated));
        }
      } catch {}
      return updated;
    });
    try {
      await fetch('/api/repuboost', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          action: 'clear_demo_feedbacks',
        }),
      });
    } catch {}
    setStatusFeedbackToast({
      message: '🧹 All demo customer feedbacks permanently removed.',
      type: 'success',
    });
    setTimeout(() => setStatusFeedbackToast(null), 3000);
  };

  const totalMRR = clients.reduce((sum, c) => sum + (c.monthly_retainer || 899), 0);
  const pendingComplaintsCount = feedbacks.filter((f) => f.status === 'pending').length;
  const totalPositiveRedirects = clients.reduce((sum, c) => sum + (c.positive_redirects ?? c.reviews_gained ?? 0), 0);
  const totalQRScans = clients.reduce((sum, c) => sum + (c.total_scans ?? c.scans_count ?? 0), 0);
  const totalComplaintsBlocked = Math.max(
    clients.reduce((sum, c) => sum + (c.complaints_blocked ?? 0), 0),
    feedbacks.length
  );

  const filteredClients = clients.filter((client) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match =
        client.name.toLowerCase().includes(q) ||
        client.slug.toLowerCase().includes(q) ||
        (client.city && client.city.toLowerCase().includes(q)) ||
        (client.category && client.category.toLowerCase().includes(q)) ||
        (client.owner_name && client.owner_name.toLowerCase().includes(q)) ||
        (client.owner_phone && client.owner_phone.includes(q));
      if (!match) return false;
    }

    if (statusFilter !== 'all') {
      const status = (client.subscription_status || client.payment_status || 'trial').toLowerCase();
      if (statusFilter === 'active' && status !== 'active') return false;
      if (statusFilter === 'paused' && status !== 'paused') return false;
      if (statusFilter === 'trial' && status !== 'trial' && status !== 'grace_period') return false;
    }

    return true;
  });

  const isLight = theme === 'light';

  if (isAuthChecking) {
    return (
      <StarLoadingScreen
        theme={isLight ? 'luxury' : 'dark'}
        badge="Agency Master Control"
        title="Accessing Master Admin Panel"
        subtitle="Verifying authorization and decrypting client telemetry..."
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className={`min-h-screen transition-colors duration-200 font-sans flex flex-col justify-between ${
          isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#07090e] text-slate-100'
        }`}
      >
        {/* Minimal Header */}
        <header
          className={`border-b sticky top-0 z-40 transition-colors backdrop-blur-md ${
            isLight ? 'bg-white/85 border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800/80 shadow-md'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-[2px] shadow-lg shadow-amber-500/20">
                <div
                  className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                    isLight ? 'bg-white' : 'bg-slate-950'
                  }`}
                >
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div>
                <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  RepuBoost
                </span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isLight ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  Locked
                </span>
              </div>
            </div>

            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </header>

        {/* Lock Screen Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div
            className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-slate-200/50'
                : 'bg-slate-900/90 border-slate-800 shadow-black/80 backdrop-blur-xl'
            }`}
          >
            <div className="text-center space-y-3 mb-6">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 p-[2px] mx-auto shadow-xl shadow-amber-500/20">
                <div
                  className={`w-full h-full rounded-[22px] flex items-center justify-center ${
                    isLight ? 'bg-white' : 'bg-slate-950'
                  }`}
                >
                  <Lock className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <div>
                <h1 className={`text-xl font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Admin Panel Login
                </h1>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Enter master password to access RepuBoost Agency Dashboard
                </p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="Enter admin password..."
                    autoFocus
                    required
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all pr-11 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                        : 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {authError && (
                  <p className="text-xs text-rose-500 font-semibold mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{authError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Unlock Admin Panel</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
              <span className={`text-[11px] font-medium flex items-center justify-center gap-1.5 ${
                isLight ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Protected by RepuBoost Agency Security Gate</span>
              </span>
            </div>
          </div>
        </main>

        <footer className={`py-4 text-center text-xs border-t ${
          isLight ? 'border-slate-200 text-slate-400' : 'border-slate-800/80 text-slate-600'
        }`}>
          RepuBoost Agency OS • Authorized Personnel Only
        </footer>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-200 font-sans selection:bg-amber-500 selection:text-black flex flex-col ${
        isLight ? 'bg-slate-50 text-slate-900' : 'bg-[#07090e] text-slate-100'
      }`}
    >
      {/* Top Navigation Bar */}
      <header
        className={`border-b sticky top-0 z-40 transition-colors backdrop-blur-md ${
          isLight ? 'bg-white/85 border-slate-200 shadow-sm' : 'bg-slate-950/80 border-slate-800/80 shadow-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-[2px] shadow-lg shadow-amber-500/20">
              <div
                className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                  isLight ? 'bg-white' : 'bg-slate-950'
                }`}
              >
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  RepuBoost
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isLight
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  Agency OS
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Local Shop 5-Star Reputation Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Consolidated Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  isLight
                    ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 shadow-sm'
                } ${isSettingsOpen ? 'ring-2 ring-amber-500/30 border-amber-500/50' : ''}`}
                title="Admin Settings & Controls"
                aria-label="Settings"
              >
                <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">Settings</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isSettingsOpen && (
                <div
                  className={`absolute right-0 mt-2 w-56 rounded-2xl border p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
                      : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/60'
                  }`}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Master Control
                    </p>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                      Master Administrator
                    </p>
                  </div>

                  {/* 1. Theme Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme(isLight ? 'dark' : 'light');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isLight ? (
                        <Moon className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Theme Mode</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isLight ? 'Light' : 'Dark'}
                    </span>
                  </button>

                  {/* 2. Admin Security */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsAdminPasswordModalOpen(true);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Master Admin Security</span>
                  </button>

                  {/* 3. Test QR Demo */}
                  <Link
                    href="/review-demo"
                    target="_blank"
                    onClick={() => setIsSettingsOpen(false)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                      isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Test QR Flow Demo</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800/80" />

                  {/* 4. Lock Dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Lock Dashboard</span>
                  </button>
                </div>
              )}
            </div>

            {/* Standalone Primary CTA */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Local Client</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Floating Admin Override Notification Toast */}
        {statusFeedbackToast && (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top duration-300 shadow-lg ${
              statusFeedbackToast.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {statusFeedbackToast.type === 'success' ? (
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              )}

                
              <span className="text-sm font-bold">{statusFeedbackToast.message}</span>
            </div>
            <button
              onClick={() => setStatusFeedbackToast(null)}
              className="text-xs px-2 py-1 rounded-lg border font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

                

        {/* Metric Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: MRR */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/80 shadow-xl'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Monthly Retainer Revenue
                </p>
                <h3 className={`text-2xl font-extrabold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  ₹{totalMRR.toLocaleString('en-IN')}
                </h3>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  isLight
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-bold">
              <span>Goal: ₹50,000/mo (Summer Launch)</span>
            </div>
          </div>

          {/* Card 2: Clients */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/80 shadow-xl'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Active Retainer Clients
                </p>
                <h3 className={`text-2xl font-extrabold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {clients.length} Shops
                </h3>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  isLight
                    ? 'bg-sky-100 text-sky-700 border border-sky-200'
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                }`}
              >
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className={`mt-4 text-xs ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
              ₹899 / month fixed retainer
            </div>
          </div>

          {/* Card 3: 5-Star Reviews */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/80 shadow-xl'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  5-Star Reviews Sent to Google
                </p>
                <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                  +{totalPositiveRedirects} Boosted
                </h3>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  isLight
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                <Star className="w-5 h-5 fill-emerald-600" />
              </div>
            </div>
            <div className={`mt-4 text-xs ${isLight ? 'text-slate-500 font-medium' : 'text-slate-400'}`}>
              From {totalQRScans} total counter QR scans
            </div>
          </div>

          {/* Card 4: Negative Filtered */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                : 'bg-gradient-to-b from-slate-900/90 to-slate-950/90 border-slate-800/80 shadow-xl'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Bad Reviews Intercepted
                </p>
                <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
                  {totalComplaintsBlocked} Blocked
                </h3>
              </div>
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
                  isLight
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 text-xs text-rose-600 font-bold">
              {pendingComplaintsCount} pending private resolution
            </div>
          </div>
        </section>

        {/* View Tabs */}
        <div className={`flex items-center gap-2 border-b pb-3 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'clients'
                ? isLight
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Client Roster ({clients.length})
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'complaints'
                ? isLight
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <span>Private Complaints Desk</span>
            {pendingComplaintsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-bold">
                {pendingComplaintsCount}
              </span>
            )}

                
          </button>

          <button
            onClick={() => setActiveTab('stand_studio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'stand_studio'
                ? isLight
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Acrylic Stand Studio
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'database'
                ? isLight
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Sync</span>
          </button>
        </div>

        {/* TAB 1: CLIENTS ROSTER */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            {/* Roster Header with Title & View Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Client Accounts Roster
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Local shops, clinics, and restaurants paying ₹899/month
                </p>
              </div>

              {/* View Toggle (Cards vs Table) & Refresh Action */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center p-1 rounded-xl border ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setViewMode('card')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'card'
                        ? isLight
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'bg-slate-800 text-white shadow-sm'
                        : isLight
                        ? 'text-slate-500 hover:text-slate-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Card View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Card View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === 'table'
                        ? isLight
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'bg-slate-800 text-white shadow-sm'
                        : isLight
                        ? 'text-slate-500 hover:text-slate-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Table View (Compact for 25+ shops)"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Table View</span>
                  </button>
                </div>

                <button
                  onClick={() => fetchData(false)}
                  disabled={isLoading}
                  className={`p-2 rounded-xl border transition-colors ${
                    isLight
                      ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Refresh Client Roster"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Roster Search & Filter Controls Row */}
            <div
              className={`p-3 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              {/* Search shops text input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search shops..."
                  className={`w-full pl-9 pr-8 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status filter dropdown */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden md:inline">
                    Status:
                  </span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className={`text-xs py-2 px-3 rounded-xl border font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <option value="all">All ({clients.length})</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="trial">Trial</option>
                </select>

                <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-2 shrink-0">
                  {filteredClients.length} of {clients.length}
                </div>
              </div>
            </div>

            {/* Zero State if search/filter produces no results */}
            {filteredClients.length === 0 && (
              <div
                className={`p-12 text-center rounded-2xl border ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <Store className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <h3 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                  No shops found
                </h3>
                <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  No businesses matched your search query or status filter.
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 transition-colors"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}

            {/* Render Mode: TABLE VIEW */}
            {filteredClients.length > 0 && viewMode === 'table' && (
              <div
                className={`rounded-2xl border overflow-hidden shadow-sm ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr
                        className={`border-b text-[11px] uppercase tracking-wider font-extrabold ${
                          isLight
                            ? 'bg-slate-50/80 border-slate-200 text-slate-500'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <th className="py-3.5 px-4 font-bold">Shop Name</th>
                        <th className="py-3.5 px-4 font-bold">Category</th>
                        <th className="py-3.5 px-4 font-bold">Status Badge</th>
                        <th className="py-3.5 px-4 font-bold">MRR</th>
                        <th className="py-3.5 px-4 font-bold text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y text-xs ${
                        isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/60 text-slate-200'
                      }`}
                    >
                      {filteredClients.map((client) => {
                        const status = (client.subscription_status || client.payment_status || 'trial') as SubscriptionStatus;
                        const isPaused = status === 'paused';
                        const isActive = status === 'active';
                        const isTrial = status === 'trial';
                        const isGrace = status === 'grace_period';
                        const isManageOpen = activeManageShopId === client.id;

                        let daysLeft = 0;
                        if (isTrial && client.trial_ends_at) {
                          const ms = new Date(client.trial_ends_at).getTime() - Date.now();
                          daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
                        }

                        return (
                          <tr
                            key={client.id}
                            className={`transition-colors ${
                              isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                            }`}
                          >
                            {/* 1. Shop Name */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                                    isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400'
                                  }`}
                                >
                                  <Store className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                                    {client.name}
                                  </div>
                                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono flex items-center gap-2">
                                    <span>/r/{client.slug}</span>
                                    {client.city && <span>• {client.city}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* 2. Category */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                                  isLight
                                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {client.category || 'Local Business'}
                              </span>
                            </td>

                            {/* 3. Status Badge */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isPaused && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                                    <PauseCircle className="w-3 h-3" />
                                    <span>Paused</span>
                                  </span>
                                )}
                                {isActive && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Active</span>
                                  </span>
                                )}
                                {isTrial && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                                    <Clock className="w-3 h-3" />
                                    <span>Trial ({daysLeft}d left)</span>
                                  </span>
                                )}
                                {isGrace && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Grace Period</span>
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* 4. MRR */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                              ₹{(client.monthly_retainer || 899).toLocaleString('en-IN')}/mo
                            </td>

                            {/* 5. Manage Button */}
                            <td className="py-3.5 px-4 text-right relative">
                              <div className="inline-flex items-center justify-end gap-1.5">
                                {/* Quick Acrylic Stand CTA */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedStandClient(client);
                                    setActiveTab('stand_studio');
                                  }}
                                  className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                                    isLight
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                                  }`}
                                  title="Open Acrylic Stand Studio"
                                >
                                  <QrCode className="w-3.5 h-3.5 text-amber-500" />
                                </button>

                                {/* Manage Dropdown Menu */}
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setActiveManageShopId(isManageOpen ? null : client.id)}
                                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                                      isLight
                                        ? 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
                                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 shadow-sm'
                                    }`}
                                  >
                                    <span>Manage</span>
                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                  </button>

                                  {isManageOpen && (
                                    <div
                                      ref={manageMenuRef}
                                      className={`absolute right-0 mt-1 w-48 rounded-xl border p-1.5 shadow-xl z-50 text-left animate-in fade-in zoom-in-95 duration-100 ${
                                        isLight
                                          ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
                                          : 'bg-slate-900 border-slate-800 text-slate-100 shadow-black/60'
                                      }`}
                                    >
                                      {/* Open QR Page */}
                                      <Link
                                        href={`/r/${client.slug}`}
                                        target="_blank"
                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                          isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                                          <span>Open QR Page</span>
                                        </div>
                                      </Link>

                                      {/* Open Shopkeeper Portal */}
                                      <Link
                                        href={`/portal?shop=${client.slug}`}
                                        target="_blank"
                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                          isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Store className="w-3.5 h-3.5 text-indigo-500" />
                                          <span>Store Portal</span>
                                        </div>
                                      </Link>

                                      {/* Edit PIN */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveManageShopId(null);
                                          setSelectedClientForPin(client);
                                          const currentPin = client.portal_password || `${client.slug.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X')}88`;
                                          setNewStorePinInput(currentPin);
                                          setStorePinError(null);
                                          setIsStorePinModalOpen(true);
                                        }}
                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                          isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                                        }`}
                                      >
                                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Edit Store PIN</span>
                                      </button>

                                      {/* Quick Toggle Status */}
                                      {isPaused ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveManageShopId(null);
                                            handleToggleStatus(client, 'active');
                                          }}
                                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-600 transition-colors ${
                                            isLight ? 'hover:bg-emerald-50' : 'hover:bg-emerald-950/40'
                                          }`}
                                        >
                                          <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                          <span>Reactivate (Live)</span>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setActiveManageShopId(null);
                                            handleToggleStatus(client, 'paused');
                                          }}
                                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-600 transition-colors ${
                                            isLight ? 'hover:bg-amber-50' : 'hover:bg-amber-950/40'
                                          }`}
                                        >
                                          <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                          <span>Pause (Kill Switch)</span>
                                        </button>
                                      )}

                                      {/* Copy Link */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveManageShopId(null);
                                          handleCopyLink(client.slug);
                                        }}
                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                          isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                                        }`}
                                      >
                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Copy Link</span>
                                      </button>

                                      {/* Copy UPI Renewal Link */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveManageShopId(null);
                                          handleCopyUpiRenewalLink(client);
                                        }}
                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 transition-colors ${
                                          isLight ? 'hover:bg-emerald-50' : 'hover:bg-emerald-950/40'
                                        }`}
                                      >
                                        <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Copy UPI Renewal Link</span>
                                      </button>

                                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                                      {/* Delete Shop */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveManageShopId(null);
                                          handleDeleteShop(client);
                                        }}
                                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                        <span>Delete Shop</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Render Mode: CARD VIEW */}
            {filteredClients.length > 0 && viewMode === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {client.name}
                        </h3>
                        {(() => {
                          const status = (client.subscription_status || client.payment_status || 'trial') as SubscriptionStatus;
                          const isPaused = status === 'paused';
                          const isActive = status === 'active';
                          const isTrial = status === 'trial';
                          const isGrace = status === 'grace_period';

                          let daysLeft = 0;
                          if (isTrial && client.trial_ends_at) {
                            const ms = new Date(client.trial_ends_at).getTime() - Date.now();
                            daysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
                          }

                          return (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : isPaused
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                  : isGrace
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                              }`}
                            >
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block mr-0.5" />}
                              {isPaused && <Lock className="w-2.5 h-2.5" />}
                              {isTrial && <Clock className="w-2.5 h-2.5" />}
                              {isGrace && <AlertTriangle className="w-2.5 h-2.5" />}
                              <span>
                                {isActive
                                  ? 'Active (Live)'
                                  : isPaused
                                  ? 'Paused (Kill Switch)'
                                  : isGrace
                                  ? 'Grace Period'
                                  : `Trial (${daysLeft}d left)`}
                              </span>
                            </span>
                          );
                        })()}
                      </div>
                      <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {client.category} • {client.city}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-extrabold ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                        ₹{(client.monthly_retainer || 899).toLocaleString('en-IN')}
                      </span>
                      <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>monthly</p>
                    </div>
                  </div>

                  {/* REQUIREMENT 5: ADMIN OVERRIDE 1-CLICK TOGGLE BAR */}
                  <div
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        Gatekeeper:
                      </span>
                      <span
                        className={`text-xs font-bold flex items-center gap-1 ${
                          (client.subscription_status || client.payment_status) === 'paused'
                            ? 'text-rose-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {(client.subscription_status || client.payment_status) === 'paused' ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked (Inactive Fallback)</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Live (Rating Flow Active)</span>
                          </>
                        )}

                
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* 1-Click Direct Toggle Button */}
                      {(client.subscription_status || client.payment_status) === 'paused' ? (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(client, 'active')}
                          disabled={updatingShopId === client.id}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                          title="1-Click Reactivate: unlocks QR landing page for direct UPI payment"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{updatingShopId === client.id ? 'Reactivating...' : '⚡ Reactivate (UPI Paid)'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(client, 'paused')}
                          disabled={updatingShopId === client.id}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all"
                          title="1-Click Pause: engages Remote Kill Switch, immediately blocks QR page"
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>{updatingShopId === client.id ? 'Pausing...' : '🛑 Pause (Kill Switch)'}</span>
                        </button>
                      )}

                

                      {/* Direct Lifecycle Selector Dropdown */}
                      <select
                        value={client.subscription_status || client.payment_status || 'trial'}
                        onChange={(e) => handleToggleStatus(client, e.target.value as SubscriptionStatus)}
                        disabled={updatingShopId === client.id}
                        className={`text-xs py-1.5 px-2 rounded-xl border font-bold focus:outline-none transition-colors ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-800'
                            : 'bg-slate-900 border-slate-700 text-slate-200'
                        }`}
                        title="Manually override lifecycle state"
                      >
                        <option value="active">Active (Paid)</option>
                        <option value="paused">Paused (Kill Switch)</option>
                        <option value="trial">Trial (7 Days)</option>
                        <option value="grace_period">Grace Period (Due)</option>
                      </select>
                    </div>
                  </div>

                  {/* 3 Real-Time Conversion & Scan Metrics */}
                  <div
                    className={`grid grid-cols-3 gap-2 p-3 rounded-xl border text-center ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/70 border-slate-800/80'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                        <QrCode className="w-3 h-3 text-indigo-500" />
                        <span>Total Scans</span>
                      </div>
                      <div className="text-base font-black text-indigo-500">
                        {client.total_scans ?? client.scans_count ?? 0}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">QR Stand Visits</p>
                    </div>

                    <div className="space-y-0.5 border-x border-slate-200 dark:border-slate-800 px-1">
                      <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Sent to Google</span>
                      </div>
                      <div className="text-base font-black text-amber-500">
                        +{client.positive_redirects ?? client.reviews_gained ?? 0}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">4–5★ Boosted</p>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold text-slate-500">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>Blocked</span>
                      </div>
                      <div className="text-base font-black text-emerald-500">
                        {client.complaints_blocked ?? 0}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">1–3★ Saved</p>
                    </div>
                  </div>

                  {/* Owner & WhatsApp Action */}
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-950/60 border-slate-800/60'
                    }`}
                  >
                    <div>
                      <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>Owner: </span>
                      <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        {client.owner_name}
                      </span>
                    </div>
                    <a
                      href={`https://wa.me/${client.owner_phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-colors ${
                        isLight
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{client.owner_phone}</span>
                    </a>
                  </div>

                  {/* STORE PORTAL ACCESS CREDENTIALS BOX */}
                  <div
                    className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                      isLight ? 'bg-amber-50/70 border-amber-200/80' : 'bg-amber-950/20 border-amber-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-extrabold text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-400">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Store Management Portal Credentials</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 font-black text-amber-950 dark:text-amber-200">
                          PIN: {(client.portal_password || `${client.slug.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X')}88`)}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClientForPin(client);
                            const currentPin = client.portal_password || `${client.slug.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X')}88`;
                            setNewStorePinInput(currentPin);
                            setStorePinError(null);
                            setIsStorePinModalOpen(true);
                          }}
                          className="px-2 py-0.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shadow-sm transition-all active:scale-95 flex items-center gap-0.5"
                          title="Change this store's PIN (Admin only)"
                        >
                          <span>Edit PIN</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Business ID: </span>
                        <span className="font-mono font-black text-slate-950 dark:text-white">{client.slug}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Owner Phone: </span>
                        <span className="font-mono font-black text-slate-950 dark:text-white">{client.owner_phone || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
                      <Link
                        href={`/portal?shop=${client.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 hover:underline text-[11px]"
                      >
                        <span>Open Shopkeeper Portal →</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          const pin = client.portal_password || `${client.slug.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase().padEnd(4, 'X')}88`;
                          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://clippilot-rust.vercel.app';
                          const text = `🏪 *${client.name} Portal Credentials*\n\n🔗 Portal Link: ${origin}/portal?shop=${client.slug}\n🔑 Business ID: \`${client.slug}\`\n🔢 Access PIN: \`${pin}\``;
                          navigator.clipboard.writeText(text);
                          alert(`Copied credentials for ${client.name}!\n\nID: ${client.slug}\nPIN: ${pin}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-900/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-[10px] transition-colors"
                        title="Copy Store Portal Login Details"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Credentials</span>
                      </button>
                    </div>
                  </div>

                  {/* Links & Stand Actions */}
                  <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t text-xs ${
                      isLight ? 'border-slate-100' : 'border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleCopyLink(client.slug)}
                        className={`inline-flex items-center gap-1.5 transition-colors ${
                          isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedSlug === client.slug ? 'Copied URL!' : `/r/${client.slug}`}</span>
                      </button>

                      {/* 1-Click UPI Renewal Link Button */}
                      <button
                        type="button"
                        onClick={() => handleCopyUpiRenewalLink(client)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${
                          copiedUpiId === client.id
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                            : isLight
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-800/50'
                        }`}
                        title="Copy ₹899 UPI Renewal Link"
                      >
                        {copiedUpiId === client.id ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-white" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Copy UPI Renewal Link</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedStandClient(client);
                          setActiveTab('stand_studio');
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-colors ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Acrylic Stand</span>
                      </button>

                      <Link
                        href={`/r/${client.slug}`}
                        target="_blank"
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-medium border transition-colors ${
                          isLight
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                        }`}
                      >
                        <span>Open QR Page</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      {/* Delete Business Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteShop(client)}
                        disabled={deletingShopId === client.id}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                          isLight
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/30 hover:border-rose-500/40'
                        }`}
                        title={`Permanently delete ${client.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>{deletingShopId === client.id ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

                

        {/* TAB 2: PRIVATE COMPLAINTS DESK - ORGANIZED BY BUSINESS */}
        {activeTab === 'complaints' && (() => {
          const filteredFeedbacks = feedbacks.filter((fb: any) => {
            if (selectedComplaintBizId !== 'all') {
              const biz = clients.find(c => c.id === selectedComplaintBizId || c.slug === selectedComplaintBizId);
              const matchesId = fb.business_id === selectedComplaintBizId;
              const matchesSlug = biz && (fb.business_id === biz.slug || fb.business_name === biz.name);
              if (!matchesId && !matchesSlug) return false;
            }
            if (complaintStatusFilter !== 'all' && fb.status !== complaintStatusFilter) {
              return false;
            }
            return true;
          });

          const selectedBiz = clients.find(c => c.id === selectedComplaintBizId || c.slug === selectedComplaintBizId);

          return (
            <div className="space-y-6">
              {/* Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <span>Private Complaints Interceptor</span>
                  </h2>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                    1–3 star ratings intercepted privately before ever reaching Google Maps. Filter by client shop below.
                  </p>
                </div>

                {/* Status Filter Tabs (All / Pending / Resolved) */}
                <div className={`inline-flex p-1 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                  {(['all', 'pending', 'resolved'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setComplaintStatusFilter(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                        complaintStatusFilter === status
                          ? isLight
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'bg-amber-500 text-slate-950 shadow-md'
                          : isLight
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {status === 'all' ? `All (${feedbacks.length})` : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Screen Layout: Left = Businesses List, Right = Business Complaints */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT SIDEBAR: CLIENT SHOPS (4 cols) */}
                <div className="lg:col-span-4 space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Select Business
                    </span>
                    <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                      {clients.length} Shops
                    </span>
                  </div>

                  {/* Option 1: All Businesses Combined */}
                  <button
                    type="button"
                    onClick={() => setSelectedComplaintBizId('all')}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      selectedComplaintBizId === 'all'
                        ? isLight
                          ? 'bg-amber-500/10 border-amber-500 text-slate-900 font-bold shadow-sm ring-1 ring-amber-500'
                          : 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                        : isLight
                        ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedComplaintBizId === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'}`}>
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">All Businesses Combined</div>
                        <div className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Unified Inbox across all clients</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      feedbacks.filter(f => f.status === 'pending').length > 0
                        ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                    }`}>
                      {feedbacks.length}
                    </span>
                  </button>

                  {/* Individual Client Shops */}
                  <div className="space-y-2">
                    {clients.map((client) => {
                      const clientFeedbacks = feedbacks.filter((fb: any) => 
                        fb.business_id === client.id || fb.business_id === client.slug || fb.business_name === client.name
                      );
                      const pendingCount = clientFeedbacks.filter(f => f.status === 'pending').length;
                      const isSelected = selectedComplaintBizId === client.id || selectedComplaintBizId === client.slug;

                      return (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => setSelectedComplaintBizId(client.id)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? isLight
                                ? 'bg-amber-500/10 border-amber-500 text-slate-900 font-bold shadow-sm ring-1 ring-amber-500'
                                : 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-md shadow-amber-500/10 ring-1 ring-amber-400/50'
                              : isLight
                              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${isSelected ? 'bg-amber-500 text-slate-950 font-bold' : isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-500/10 text-amber-400'}`}>
                              <Store className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold truncate">{client.name}</div>
                              <div className={`text-[10px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {client.city} • {client.owner_phone}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {pendingCount > 0 ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                                {pendingCount} Pending
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                                Clean (0)
                              </span>
                            )}

                
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT PANEL: SELECTED BUSINESS COMPLAINTS & ACTION RESOLVER (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Selected Shop Info Card */}
                  <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/90 border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {selectedBiz ? selectedBiz.name : 'All Businesses Combined'}
                        </h3>
                        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {selectedBiz ? `${selectedBiz.category} • Owner: ${selectedBiz.owner_name} (${selectedBiz.owner_phone})` : `Viewing complaints across ${clients.length} active client businesses`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-xl font-bold ${filteredFeedbacks.length > 0 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'}`}>
                        {filteredFeedbacks.length} Total Complaints
                      </span>
                    </div>
                  </div>

                  {/* Complaints Cards List */}
                  {filteredFeedbacks.length === 0 ? (
                    <div
                      className={`p-12 text-center rounded-2xl border ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-500'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                      <p className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        No unresolved complaints for this view!
                      </p>
                      <p className="text-xs mt-1">
                        All ratings are clean 5-star public reviews on Google Maps with zero pending private complaints.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredFeedbacks.map((fb: any) => {
                        const clientMatch = clients.find(c => c.name === fb.business_name || c.id === fb.business_id || c.slug === fb.business_id || c.slug === fb.business_slug) || clients.find(c => c.name === fb.business_name);
                        const businessName = clientMatch?.name || fb.business_name || 'Management';
                        const storeSlug = clientMatch?.slug || fb.business_slug || fb.business_id || '';
                        const shortStoreUrl = storeSlug ? `https://repoboost.vercel.app/r/${storeSlug}` : 'https://repoboost.vercel.app';
                        const catConfig = getCategoryConfig(clientMatch?.category || fb.business_category || '');
                        
                        const cleanPhone = (fb.customer_contact || '').replace(/[^0-9]/g, '');
                        const waTargetNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

                        const rawComplaint = (fb.complaint_text || 'your recent visit').trim();
                        let cleanComplaint = rawComplaint;
                        const match = rawComplaint.match(/^\[Issues reported:\s*([^\]]+)\](?:\s*(.*))?$/i);
                        if (match) {
                          const tags = match[1].trim();
                          const notes = (match[2] || '').trim();
                          cleanComplaint = notes ? `${tags} (${notes})` : tags;
                        }

                        const waTextEng = `Hi ${fb.customer_name}! 👋\nThis is team ${businessName}.\n\nThank you for your feedback. We sincerely apologize for the issue reported: "${cleanComplaint}". We have addressed this directly with our team to make it right.\n\nOnce the problem is resolved to your satisfaction, please take a quick second to update your rating here:\n🔗 ${shortStoreUrl}`;

                        const waTextHinglish = `Hi ${fb.customer_name}! 👋\nTeam ${businessName} se message hai.\n\nAapke feedback ke liye thank you. Aapne jo issue report kiya ("${cleanComplaint}"), uske liye really sorry. Humne isko note kar liya hai aur hum ise priority pe solve kar rahe hain.\n\nProblem solve hone ke baad agar aapko sab theek lage, toh please ek second nikaal kar apna rating yahan update kar dijiye:\n🔗 ${shortStoreUrl}`;

                        return (
                          <div
                            key={fb.id}
                            className={`p-5 rounded-2xl border space-y-3 transition-all ${
                              isLight
                                ? 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                                : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold ${
                                    fb.rating >= 4
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : isLight
                                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  <span>{fb.rating}</span>
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                      {businessName}
                                    </h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isLight ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'}`}>
                                      {catConfig.categoryLabel}
                                    </span>
                                    <span className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                      • {new Date(fb.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Customer: <span className={isLight ? 'text-slate-900 font-semibold' : 'text-slate-200 font-medium'}>{fb.customer_name}</span> • Contact: <span className="font-mono text-amber-500 font-semibold">{fb.customer_contact}</span>
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  fb.status === 'resolved'
                                    ? isLight
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : isLight
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {fb.status?.toUpperCase()}
                              </span>
                            </div>

                            {/* Complaint Message Box */}
                            <div
                              className={`p-3.5 rounded-xl border text-xs leading-relaxed italic ${
                                isLight
                                  ? 'bg-slate-50 border-slate-200 text-slate-800 font-medium'
                                  : 'bg-slate-950/70 border-slate-800/80 text-slate-200'
                              }`}
                            >
                              "{fb.complaint_text}"
                            </div>

                            {/* Action Bar: WhatsApp Resolution, Resolve Toggle, Delete */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                              <div className="flex flex-wrap items-center gap-2">
                                <a
                                  href={`https://wa.me/${waTargetNumber}?text=${encodeURIComponent(waTextEng)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all active:scale-95 shadow-sm shadow-emerald-600/20"
                                  title="Open WhatsApp with English recovery message"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>WhatsApp (English)</span>
                                </a>

                                <a
                                  href={`https://wa.me/${waTargetNumber}?text=${encodeURIComponent(waTextHinglish)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-bold transition-all active:scale-95 shadow-sm"
                                  title="Open WhatsApp with Hinglish recovery message"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Hinglish</span>
                                </a>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <button
                                  type="button"
                                  onClick={() => handleResolveComplaint(fb.id, fb.status)}
                                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                                    fb.status === 'pending'
                                      ? isLight
                                        ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                                      : isLight
                                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                                      : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                  }`}
                                >
                                  {fb.status === 'pending' ? '✓ Mark as Resolved' : 'Re-open'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteComplaint(fb.id)}
                                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors inline-flex items-center gap-1.5 ${
                                    isLight
                                      ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                                      : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400'
                                  }`}
                                  title="Delete Complaint"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                
                </div>
              </div>
            </div>
          );
        })()}


        {/* TAB 3: ACRYLIC TABLE STAND STUDIO */}
        {activeTab === 'stand_studio' && (() => {
          const standTheme = getStandTheme(selectedStandClient?.category);
          return (
            <div className="space-y-6">
              <div>
                <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Acrylic QR Stand Studio
                </h2>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  High-contrast printable 4x6" table stand designed for shop countertops and dining tables — personalized automatically per business category
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Stand Config Selector */}
                <div className="lg:col-span-5 space-y-4">
                  <div
                    className={`p-6 rounded-2xl border space-y-4 ${
                      isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
                    }`}
                  >
                    <label
                      className={`block text-xs font-bold uppercase tracking-wider ${
                        isLight ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    >
                      Select Client Business
                    </label>
                    <select
                      value={selectedStandClient?.slug || ''}
                      onChange={(e) => {
                        const matched = clients.find((c) => c.slug === e.target.value);
                        if (matched) setSelectedStandClient(matched);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:border-amber-500 ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-700 text-white'
                      }`}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name} ({c.city}) — {c.category || 'General'}
                        </option>
                      ))}
                    </select>

                    <div className={`text-xs space-y-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <p>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">Category Theme:</span>{' '}
                        <span className="font-bold text-amber-600 dark:text-amber-400">{standTheme.icon} {standTheme.categoryLabel}</span>
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">QR Target:</span>{' '}
                        {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/r/{selectedStandClient?.slug || 'demo'}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">Format:</span> 4x6" Clear Acrylic Counter Tent (1200x1800 HD Print)
                      </p>
                      <p>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">Printing Cost:</span> ₹60 - ₹80 at any local digital print shop
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        onClick={handleDownloadWholeStandAdmin}
                        disabled={isDownloadingStandAdmin || !standQrDataUrl}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isDownloadingStandAdmin ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating 4x6" Stand Graphic...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download Designed Stand (4x6" PNG)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => window.print()}
                        className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print Stand (PDF Tent)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Physical Stand Mockup Card */}
                <div className="lg:col-span-7 flex justify-center">
                  <div
                    className={`w-full max-w-sm rounded-3xl p-7 border-4 border-amber-500/30 text-center relative overflow-hidden transition-all shadow-2xl ${
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
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm"
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
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        />
                      ))}
                    </div>

                    {/* Shop Name */}
                    <h3 className={`text-xl font-black tracking-tight uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {selectedStandClient?.name || 'Client Store'}
                    </h3>
                    <p className={`text-[11px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      {(selectedStandClient?.city || 'India').toUpperCase()} • REPUBOOST™ VERIFIED PARTNER
                    </p>

                    {/* Personalized Category Experience Hook */}
                    <p
                      className="text-xs font-black mt-2 px-2 italic"
                      style={{ color: standTheme.primaryColor }}
                    >
                      "{standTheme.hook}"
                    </p>

                    {/* Rate on Google Maps Header */}
                    <div className="mt-3 py-1 px-3 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold tracking-wider uppercase inline-block text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      ⭐ Rate Us on Google Maps ⭐
                    </div>

                    {/* Real Camera-Scannable QR Code */}
                    <div
                      className="my-3.5 p-3 rounded-2xl bg-white mx-auto inline-block shadow-lg"
                      style={{ border: `3px solid ${standTheme.primaryColor}` }}
                    >
                      <img
                        src={standQrDataUrl || '/icons/icon.svg'}
                        alt={`${selectedStandClient?.name || 'Client'} Camera Scannable QR Code`}
                        className="w-44 h-44 object-contain mx-auto rounded-lg"
                      />
                    </div>

                    <p className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
                      Scan with any phone camera
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Takes 5 seconds • No app download required
                    </p>

                    <div className={`mt-4 pt-3 border-t flex items-center justify-center gap-1.5 text-[10px] ${
                      isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800 text-slate-400'
                    }`}>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>RepuBoost™</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

                

        {/* TAB 4: SUPABASE SYNC */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            <div>
              <h2 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Supabase PostgreSQL Connection
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Connected to project <span className="font-mono text-amber-600 font-bold">spvsejqcdmnwxbxkbkwe</span> (Mumbai, ap-south-1)
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      PostgreSQL Database Connected
                    </h3>
                    <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      `businesses`, `private_feedback`, and `scan_analytics` tables configured
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isLight
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  Ready
                </span>
              </div>

              <div
                className={`p-4 rounded-xl font-mono text-xs space-y-1.5 border ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div>Project URL: https://spvsejqcdmnwxbxkbkwe.supabase.co</div>
                <div>Region: ap-south-1 (Mumbai)</div>
                <div>Data API: Enabled</div>
                <div>Row Level Security (RLS): Active with Public Read & Submit Policies</div>
              </div>
            </div>

            {/* Real-time Analytics SQL Migration Box */}
            <div
              className={`p-6 rounded-2xl border space-y-4 ${
                isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    PostgreSQL Schema Migration: Real-Time Analytics Counters
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Adds `total_scans` and `positive_redirects` columns + atomic `increment_business_metric()` RPC function.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const sql = `-- RepuBoost Analytics Counters & Atomic RPC
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS total_scans INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS positive_redirects INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS complaints_blocked INTEGER DEFAULT 0 NOT NULL;

CREATE OR REPLACE FUNCTION public.increment_business_metric(
    p_business_id UUID,
    p_metric TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated RECORD;
BEGIN
    IF p_metric NOT IN ('total_scans', 'positive_redirects', 'complaints_blocked') THEN
        RAISE EXCEPTION 'Invalid metric: %', p_metric;
    END IF;

    IF p_metric = 'total_scans' THEN
        UPDATE public.businesses
        SET total_scans = COALESCE(total_scans, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    ELSIF p_metric = 'positive_redirects' THEN
        UPDATE public.businesses
        SET positive_redirects = COALESCE(positive_redirects, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    ELSIF p_metric = 'complaints_blocked' THEN
        UPDATE public.businesses
        SET complaints_blocked = COALESCE(complaints_blocked, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    END IF;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true, 
            'metric', p_metric, 
            'total_scans', v_updated.total_scans, 
            'positive_redirects', v_updated.positive_redirects,
            'complaints_blocked', v_updated.complaints_blocked
        );
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'Business not found');
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_business_metric(UUID, TEXT) TO anon, authenticated, service_role;`;
                    navigator.clipboard.writeText(sql);
                    alert('SQL Migration copied to clipboard! Paste into Supabase SQL Editor.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SQL Migration</span>
                </button>
              </div>

              <pre
                className={`p-4 rounded-xl font-mono text-[11px] overflow-x-auto border max-h-48 leading-relaxed ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
{`-- Run this once in Supabase SQL Editor:
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS total_scans INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS positive_redirects INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS complaints_blocked INTEGER DEFAULT 0 NOT NULL;

CREATE OR REPLACE FUNCTION public.increment_business_metric(
    p_business_id UUID,
    p_metric TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated RECORD;
BEGIN
    IF p_metric NOT IN ('total_scans', 'positive_redirects', 'complaints_blocked') THEN
        RAISE EXCEPTION 'Invalid metric: %', p_metric;
    END IF;

    IF p_metric = 'total_scans' THEN
        UPDATE public.businesses
        SET total_scans = COALESCE(total_scans, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    ELSIF p_metric = 'positive_redirects' THEN
        UPDATE public.businesses
        SET positive_redirects = COALESCE(positive_redirects, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    ELSIF p_metric = 'complaints_blocked' THEN
        UPDATE public.businesses
        SET complaints_blocked = COALESCE(complaints_blocked, 0) + 1
        WHERE id = p_business_id
        RETURNING id, name, slug, total_scans, positive_redirects, complaints_blocked INTO v_updated;
    END IF;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'success', true, 
            'metric', p_metric, 
            'total_scans', v_updated.total_scans, 
            'positive_redirects', v_updated.positive_redirects,
            'complaints_blocked', v_updated.complaints_blocked
        );
    END IF;

    RETURN jsonb_build_object('success', false, 'error', 'Business not found');
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_business_metric(UUID, TEXT) TO anon, authenticated, service_role;`}
              </pre>
            </div>
          </div>
        )}

                
      </main>

      {/* ADD CLIENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className={`text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Add New Local Client
                </h3>
                <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Onboard a shopkeeper for ₹899/month
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`text-sm ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            {createdClientSuccess ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {createdClientSuccess.name} Added!
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    Dynamic camera-scannable QR stand generated for <span className="font-mono text-amber-500 font-bold">/r/{createdClientSuccess.slug}</span>
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl inline-block shadow-lg border border-slate-200">
                  <img
                    src={createdClientSuccess.qrDataUrl}
                    alt={`${createdClientSuccess.name} QR Code`}
                    className="w-48 h-48 object-contain mx-auto rounded-lg"
                  />
                </div>

                {/* Generated Tenant Portal Credentials */}
                {createdClientSuccess.pin && (
                  <div
                    className={`p-4 rounded-2xl border text-left space-y-2.5 ${
                      isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-950 border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Client Portal Login Credentials</span>
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Multi-Tenant
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Business ID</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {createdClientSuccess.slug}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Store PIN</span>
                        <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 tracking-wider">
                          {createdClientSuccess.pin}
                        </span>
                      </div>
                    </div>

                    {createdClientSuccess.phone && (
                      <a
                        href={`https://wa.me/${createdClientSuccess.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Namaste ${createdClientSuccess.owner || createdClientSuccess.name},\nYour RepuBoost Business Portal & 5-Star Feedback Stand are ready!\n\n🔑 Portal URL: https://clippilot-rust.vercel.app/portal\n📲 Business ID: ${createdClientSuccess.slug}\n🔒 Store Access PIN: ${createdClientSuccess.pin}\n\nLog in anytime to see your live table scans and private customer feedback!`
                        )}

                `}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Send Login Credentials on WhatsApp</span>
                      </a>
                    )}

                
                  </div>
                )}

                

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = createdClientSuccess.qrDataUrl;
                      link.download = `${createdClientSuccess.slug}_QR.png`;
                      link.click();
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download QR PNG</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCreatedClientSuccess(null);
                      setActiveTab('stand_studio');
                    }}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                      isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View in Stand Studio</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCreatedClientSuccess(null);
                    }}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium ${
                      isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleAddClientSubmit} className="space-y-3.5">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Business Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Rawat Mishtan Bhandar"
                  value={newBizName}
                  onChange={(e) => {
                    setNewBizName(e.target.value);
                    if (!newBizSlug) {
                      setNewBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-amber-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    URL Slug *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="rawat-sweets"
                    value={newBizSlug}
                    onChange={(e) => setNewBizSlug(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Category / Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Auto / Detailing, Sweets, Salon..."
                    value={newBizCategory}
                    onChange={(e) => setNewBizCategory(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                  {/* Category Quick Presets */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Auto / Car Detailing', 'Sweet Shop & Bakery', 'Restaurant & Cafe', 'Salon & Spa', 'Dental & Clinic', 'Retail & Shopping'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewBizCategory(cat)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition-all ${
                          newBizCategory === cat
                            ? 'bg-amber-500 text-black border-amber-600 font-bold'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {/* Category AI Intelligence Preview */}
                  {newBizCategory && (
                    <div className={`mt-2 p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                      isLight ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    }`}>
                      <span>🎯 <strong>AI Mode:</strong> {getCategoryConfig(newBizCategory).categoryLabel}</span>
                      <span className="text-[10px] opacity-75">Tailored apology offers & tags active</span>
                    </div>
                  )}

                
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Owner Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Kumar"
                    value={newBizOwner}
                    onChange={(e) => setNewBizOwner(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    WhatsApp Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765..."
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Google Maps Review URL *
                </label>
                <input
                  required
                  type="url"
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={newBizGoogleUrl}
                  onChange={(e) => setNewBizGoogleUrl(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:outline-none focus:border-amber-500 ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Save & Generate QR
                </button>
              </div>
            </form>
            )}

                
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MASTER ADMIN CHANGE PASSWORD MODAL (ADMIN ONLY)                          */}
      {/* ========================================================================= */}
      {isAdminPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Master Admin Security
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Server Environment Variable • Zero Browser Leakage
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminPasswordModalOpen(false)}
                className={`text-sm ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className={`p-4 rounded-2xl border space-y-2.5 ${isLight ? 'bg-amber-50/70 border-amber-200/80 text-amber-950' : 'bg-amber-500/10 border-amber-500/20 text-slate-200'}`}>
                <p className="font-bold flex items-center gap-2 text-amber-900 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Server-Side Password Protection Active</span>
                </p>
                <p className="text-[11px] leading-relaxed opacity-90">
                  Your master admin password is authenticated strictly on the server against the <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">ADMIN_PASSWORD</code> environment variable. Secrets are never exposed in browser code.
                </p>
                <div className="pt-2 text-[11px] space-y-1.5 border-t border-amber-300/40 dark:border-amber-500/20">
                  <p className="font-bold">To update your master password:</p>
                  <ol className="list-decimal list-inside space-y-1 opacity-90 pl-1">
                    <li>Open your server <code className="font-mono">.env.local</code> file (or Vercel Dashboard Settings).</li>
                    <li>Update: <code className="font-mono text-amber-800 dark:text-amber-300">ADMIN_PASSWORD=your_new_secret</code></li>
                    <li>Restart or redeploy. Old passwords are immediately invalidated.</li>
                  </ol>
                </div>
              </div>

              <div className="pt-2 flex justify-end border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdminPasswordModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STORE ACCESS PIN UPDATE MODAL (ADMIN ONLY ACCESS)                        */}
      {/* ========================================================================= */}
      {isStorePinModalOpen && selectedClientForPin && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className={`w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-5 shadow-2xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-bold text-sm sm:text-base truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Update Store Access PIN
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Store: <span className="font-bold text-amber-600">{selectedClientForPin.name}</span> ({selectedClientForPin.slug})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsStorePinModalOpen(false)}
                className={`text-sm p-1 shrink-0 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'}`}
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px]">
              🔒 <strong>Admin-Only Policy:</strong> Client store managers cannot change their PINs from their portal. Only you as agency master admin can issue or update their access keys.
            </div>

            {storePinError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{storePinError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStorePin} className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  New Store Access PIN
                </label>
                <input
                  required
                  type="text"
                  value={newStorePinInput}
                  onChange={(e) => setNewStorePinInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ANJU88"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono font-bold tracking-wider focus:outline-none focus:border-amber-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-950 border-slate-700 text-white'
                  }`}
                />
                <p className="text-[10px] text-slate-400">
                  Letters & numbers (e.g., ANJU88). Automatically converted to uppercase.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStorePinModalOpen(false)}
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
                  disabled={isUpdatingStorePin}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  {isUpdatingStorePin ? (
                    <span>Saving PIN...</span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Save Store PIN</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stand Generation Luxury Star Loading Overlay */}
      {isDownloadingStandAdmin && (
        <StarLoadingScreen
          theme="overlay"
          badge="Print Studio"
          badgeIcon={<Printer className="w-3.5 h-3.5 text-amber-400" />}
          title="Generating 4x6&quot; Acrylic Stand Graphic"
          subtitle="Baking 300 DPI vector QR, category palette & personalized shop branding..."
        />
      )}
    </div>
  );
}

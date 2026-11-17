'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCategoryConfig } from '@/lib/industryCategories';
import {
  getPositiveTagsForCategory,
  generateRandomizedReviewText,
  PositiveTagDefinition,
} from '@/lib/reviewVariations';
import { SubscriptionStatus } from '@/types/repuboost';
import {
  Star,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  MessageSquare,
  Send,
  ArrowRight,
  Store,
  Sparkles,
  Award,
  MapPin,
  Lock,
  PauseCircle,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface BusinessInfo {
  id?: string;
  name: string;
  category: string;
  city?: string;
  owner_name: string;
  google_review_url: string;
  subscription_status: SubscriptionStatus;
}

const RATING_FEEDBACK_TEXTS = [
  'Tap a star to rate your visit',
  '😞 Disappointed with visit',
  '🙁 Could be much better',
  '😐 Decent / It was okay',
  '😊 Great experience!',
  '🌟 Exceptional! Loved everything!',
];

function cleanGoogleReviewUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  return rawUrl.replace(/#repuboost_pin=[^&?#]*/i, '').trim();
}



const copyToClipboard = async (text: string) => {
  if (typeof window === 'undefined') return;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Continue to fallback
  }

  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  } catch (err) {
    console.warn('Fallback copy failed:', err);
  }
};

function ReviewPageInner() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [business, setBusiness] = useState<BusinessInfo>({
    name: '',
    category: 'Retail & General',
    city: '',
    owner_name: '',
    google_review_url: '',
    subscription_status: 'trial',
  });

  const categoryConfig = getCategoryConfig(business.category);

  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [stage, setStage] = useState<'rate' | 'positive' | 'negative' | 'submitted'>('rate');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // 1-Tap Positive Compliment & Direct Launch States (No shuffle friction - saves customer time)
  const [selectedPositiveTag, setSelectedPositiveTag] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [copiedReviewText, setCopiedReviewText] = useState<string>('');
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const REVIEW_CHIPS = [
    'Fast service & great quality!',
    'Highly recommended!',
    'Polite staff & clean place.',
  ];

  const handleChipClick = async (chipText: string) => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    setSelectedChip(chipText);
    setCopiedReviewText(chipText);
    setIsRedirecting(true);

    // Write text to clipboard
    await copyToClipboard(chipText);

    // Track positive redirect metric in background
    if (business.subscription_status !== 'paused') {
      try {
        fetch('/api/repuboost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'track_metric',
            business_slug: slug,
            business_id: business.id,
            metric: 'positive_redirects',
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    }

    // 1.5-second timeout redirect to Google Maps
    redirectTimerRef.current = setTimeout(() => {
      const rawDest = cleanGoogleReviewUrl(business.google_review_url);
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ' ' + (business.city || ''))}`;
      const finalDestination = rawDest.startsWith('https://') ? rawDest : fallbackUrl;
      window.location.href = finalDestination;
    }, 1500);
  };

  const positiveTags = getPositiveTagsForCategory(business.category);

  // Cleans up redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const handleSelectCompliment = async (tagId: string) => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);

    setSelectedPositiveTag(tagId);
    setIsRedirecting(true);

    // Non-blocking background tracking: positive_redirects (Only if active)
    if (business.subscription_status !== 'paused') {
      try {
        fetch('/api/repuboost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'track_metric',
            business_slug: slug,
            business_id: business.id,
            metric: 'positive_redirects',
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Silently continue without delaying redirect
      }
    }

    // Behind-the-scenes randomization: 1 of 10+ variations + 12 sign-offs
    const { reviewText } = generateRandomizedReviewText(business.name, [tagId], business.category);
    setCopiedReviewText(reviewText);

    // Silently copy to clipboard
    await copyToClipboard(reviewText);

    // Ultra-fast 1-second launch to Google Maps (saves customer's precious time)
    redirectTimerRef.current = setTimeout(() => {
      const rawDest = cleanGoogleReviewUrl(business.google_review_url);
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ' ' + (business.city || ''))}`;
      const finalDestination = rawDest.startsWith('https://') ? rawDest : fallbackUrl;
      window.location.href = finalDestination;
    }, 1100);
  };

  const handleProceedDirectly = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    setIsRedirecting(true);

    // Non-blocking background tracking: positive_redirects
    if (business.subscription_status !== 'paused') {
      try {
        fetch('/api/repuboost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'track_metric',
            business_slug: slug,
            business_id: business.id,
            metric: 'positive_redirects',
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Silently continue
      }
    }

    const rawDest = cleanGoogleReviewUrl(business.google_review_url);
    const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ' ' + (business.city || ''))}`;
    const finalDestination = rawDest.startsWith('https://') ? rawDest : fallbackUrl;
    window.location.href = finalDestination;
  };

  // Fetch shop and verify live subscription status
  useEffect(() => {
    if (!slug) {
      setIsNotFound(true);
      setIsLoadingStatus(false);
      return;
    }

    setIsLoadingStatus(true);
    const startTime = Date.now();
    const minDisplayMs = 700;

    fetch(`/api/repuboost?slug=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Store not found');
        }
        return res.json();
      })
      .then((data) => {
        if (data.client) {
          const matched = data.client;
          setBusiness({
            id: matched.id,
            name: matched.name,
            category: matched.category,
            city: matched.city || 'Delhi',
            owner_name: matched.owner_name,
            google_review_url: matched.google_review_url,
            subscription_status: matched.subscription_status || 'trial',
          });
          setIsNotFound(false);

          // NON-BLOCKING BACKGROUND TRACKING: total_scans (Once per session, never when paused)
          if (matched.subscription_status !== 'paused' && typeof window !== 'undefined') {
            try {
              const sessionKey = `repuboost_scanned_${slug}`;
              if (!sessionStorage.getItem(sessionKey)) {
                sessionStorage.setItem(sessionKey, '1');
                fetch('/api/repuboost', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'track_metric',
                    business_slug: slug,
                    business_id: matched.id,
                    metric: 'total_scans',
                  }),
                  keepalive: true,
                }).catch(() => {});
              }
            } catch {
              // Ignore sessionStorage errors (e.g. strict security modes)
            }
          }
        } else {
          setIsNotFound(true);
        }
      })
      .catch((err) => {
        console.error('Failed fetching shop status:', err);
        setIsNotFound(true);
      })
      .finally(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayMs - elapsed);
        setTimeout(() => {
          setIsLoadingStatus(false);
        }, remaining);
      });
  }, [slug]);

  const handleRatingClick = (selectedStars: number) => {
    // Kill Switch Guard: Prevent rating interaction if shop is paused
    if (business.subscription_status === 'paused') {
      return;
    }

    setRating(selectedStars);
    if (selectedStars >= 4) {
      setStage('positive');
      setSelectedPositiveTag(null);
      setCopiedReviewText('');
      setIsRedirecting(false);
    } else {
      setStage('negative');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePrivateFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kill Switch Guard: Block any feedback submission or bot triggers if paused
    if (business.subscription_status === 'paused') {
      return;
    }

    setFormError(null);

    // Validation: Name and Phone are mandatory
    if (!customerName.trim()) {
      setFormError('Please enter your name so the store manager knows who to address.');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (!customerPhone.trim() || cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile or WhatsApp number.');
      return;
    }

    const tagsSummary = selectedTags.length > 0 ? `Issues reported: ${selectedTags.join(', ')}` : '';
    const userNotes = complaintText.trim();
    
    // Auto-synthesize complaint so the customer is NEVER blocked from 1-tap submission
    const finalComplaint = userNotes
      ? (tagsSummary ? `[${tagsSummary}] ${userNotes}` : userNotes)
      : (tagsSummary || `Customer reported an unsatisfactory experience (${rating} Stars).`);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/repuboost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_feedback',
          business_slug: slug,
          rating,
          customer_name: customerName.trim(),
          customer_contact: customerPhone.trim(),
          complaint_text: finalComplaint,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.code === 'PORTAL_PAUSED') {
          setBusiness((prev) => ({ ...prev, subscription_status: 'paused' }));
          return;
        }
      }

      setStage('submitted');
    } catch {
      setStage('submitted');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStarCount = hoveredRating || rating;
  const ratingPrompt = RATING_FEEDBACK_TEXTS[activeStarCount] || RATING_FEEDBACK_TEXTS[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbf8f1] via-[#f7f2e7] to-[#efe7d6] text-amber-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-amber-500 selection:text-black relative overflow-hidden font-sans">
      {/* Soft Ambient Gold Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-300/35 via-yellow-400/20 to-transparent rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-gradient-to-t from-yellow-300/25 to-transparent rounded-full blur-[100px] pointer-events-none" />

      {/* Main Luxury Cream Parchment Card */}
      <main className="relative z-10 w-full max-w-lg bg-[#fffdfa]/95 backdrop-blur-xl border border-amber-300/70 rounded-3xl p-5 sm:p-8 shadow-[0_25px_60px_-12px_rgba(180,83,9,0.22)] ring-1 ring-amber-400/20">
        
        {/* Animated Spawning Star Loading Screen */}
        {isLoadingStatus ? (
          <div className="text-center py-10 px-2 space-y-6 animate-in fade-in duration-300">
            {/* Center Animated Spawning Star Emblem */}
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              {/* Outer Pulsing Golden Aura */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/30 via-yellow-300/40 to-amber-500/20 blur-2xl animate-pulse" />

              {/* Celestial Rotating Star Ring */}
              <div className="absolute inset-2 rounded-full border-2 border-dashed border-amber-400/60 animate-star-ring" />

              {/* Orbiting Satellite Star */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-star-orbit">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              </div>

              {/* Floating Spawning Micro-Sparks */}
              <div className="absolute -top-1 left-8 pointer-events-none animate-star-sparkle" style={{ animationDelay: '0.2s' }}>
                <span className="text-amber-500 text-xs font-black">✦</span>
              </div>
              <div className="absolute -bottom-1 right-8 pointer-events-none animate-star-sparkle" style={{ animationDelay: '0.9s' }}>
                <span className="text-amber-500 text-xs font-black">★</span>
              </div>
              <div className="absolute top-5 right-2 pointer-events-none animate-star-sparkle" style={{ animationDelay: '1.4s' }}>
                <span className="text-yellow-500 text-[10px] font-black">✧</span>
              </div>

              {/* The Main Spawning Star (Scales into Star Shape from 0 with Spring Physics) */}
              <div className="relative z-10 flex items-center justify-center animate-star-spawn">
                <div className="relative flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-xl shadow-amber-500/40 border border-amber-200/50">
                  <Star className="w-12 h-12 fill-white text-white drop-shadow-[0_4px_12px_rgba(217,119,6,0.6)] animate-star-twinkle" />
                </div>
              </div>
            </div>

            {/* Title & Brand */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300/80 text-[11px] font-black uppercase tracking-wider text-amber-900 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>RepuBoost™ Verified</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-amber-950">
                Opening Feedback Gateway
              </h2>
              <p className="text-xs text-amber-800/70 font-medium">
                Spawning your 5-star customer experience...
              </p>
            </div>

            {/* 5 Sequentially Spawning Gold Stars */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-xl bg-amber-100/90 border border-amber-300/80 flex items-center justify-center shadow-md animate-star-spawn"
                  style={{
                    animationDelay: `${150 + i * 140}ms`,
                    transformOrigin: 'center center',
                  }}
                >
                  <Star
                    className="w-5 h-5 fill-amber-400 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-star-twinkle"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                </div>
              ))}
            </div>

            {/* Golden Progress Shimmer Bar */}
            <div className="w-48 mx-auto bg-amber-200/50 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 h-full w-full animate-progress-fast" />
            </div>
          </div>
        ) : isNotFound || !business.name ? (
          <div className="text-center py-10 space-y-4 animate-in fade-in duration-200">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100/90 border border-amber-300/80 flex items-center justify-center text-amber-700 shadow-md">
              <Store className="w-8 h-8 text-amber-700" />
            </div>
            <h1 className="text-xl font-bold text-amber-950">Store Not Found</h1>
            <p className="text-xs sm:text-sm text-amber-900/80 max-w-sm mx-auto leading-relaxed">
              This review stand or portal is currently not registered or has been removed. Please verify your link or contact store management.
            </p>
          </div>
        ) : business.subscription_status === 'paused' ? (
          /* ====================================================================
             REQUIREMENT 2: REMOTE KILL SWITCH FALLBACK SCREEN (PAUSED)
             Polite, clean fallback screen blocking rating flow & bot triggers
             ==================================================================== */
          <div className="text-center py-6 sm:py-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Subtle Crest with Pause/Lock Badge */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-b from-slate-800 via-slate-900 to-amber-950 border border-slate-700/80 shadow-xl shadow-slate-900/30 flex items-center justify-center">
                <Store className="w-9 h-9 text-amber-200/80" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center shadow-md">
                <Lock className="w-3.5 h-3.5 text-slate-950" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight">
                {business.name}
              </h1>
              <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-amber-900/70">
                <span className="font-semibold">{business.category}</span>
                {business.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-800 font-medium">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {business.city}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Polite Fallback Notice Message */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900/90 shadow-sm space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-xs font-bold">
                <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>Portal Temporarily Inactive</span>
              </div>
              <p className="text-sm font-semibold text-amber-950 leading-relaxed pt-1">
                This feedback portal is currently inactive. Please contact store management for assistance.
              </p>
              <p className="text-xs text-amber-900/70 leading-relaxed">
                If you are currently dining or shopping at the premises, please speak directly with a staff member or manager on duty.
              </p>
            </div>

            <div className="pt-2 text-xs text-amber-900/60 flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Reference code: {slug}</span>
            </div>
          </div>
        ) : (
          /* ====================================================================
             NORMAL ACTIVE / TRIAL / GRACE_PERIOD RATING FLOW
             ==================================================================== */
          <>
            {/* Business Branding Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/80 text-amber-900 text-xs font-semibold mb-3 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                <span>Verified Customer Experience</span>
              </div>

              {/* Gold Seal Store Crest */}
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border border-amber-400/80 shadow-lg shadow-amber-900/25 flex items-center justify-center transition-transform hover:scale-105 duration-200">
                <Store className="w-8 h-8 text-amber-100" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight">
                {business.name}
              </h1>

              <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-amber-900/75">
                <span className="font-semibold">{business.category}</span>
                {business.city && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-800 font-medium">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      {business.city}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* STAGE 1: STAR SELECTION */}
            {stage === 'rate' && (
              <div className="space-y-6 text-center">
                <div className="py-2">
                  <span className="text-xs font-bold tracking-wider uppercase text-amber-700 block mb-1">
                    Your Feedback Matters
                  </span>
                  <p className="text-sm sm:text-base font-bold text-amber-950">
                    How was your visit with us today?
                  </p>
                </div>

                {/* Dynamic Emotion Pill */}
                <div className="h-8 flex items-center justify-center">
                  <span
                    className={`text-xs sm:text-sm font-bold px-3.5 py-1 rounded-full border transition-all duration-200 ${
                      activeStarCount >= 4
                        ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-md shadow-amber-500/10'
                        : activeStarCount > 0
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-[#f7f2e7] text-amber-950 border-amber-200/80'
                    }`}
                  >
                    {ratingPrompt}
                  </span>
                </div>

                {/* Tactile Large Gold Stars with Radiant Glow */}
                <div className="flex justify-center items-center gap-1.5 sm:gap-3 py-3 sm:py-4 px-2 rounded-2xl bg-[#f7f2e7]/80 border border-amber-200/80">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = activeStarCount >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        onClick={() => handleRatingClick(star)}
                        className="p-1 sm:p-2 transition-all duration-150 active:scale-90 hover:scale-125 focus:outline-none group"
                        aria-label={`${star} Star`}
                      >
                        <Star
                          className={`w-9 h-9 sm:w-12 sm:h-12 transition-all duration-200 ${
                            isLit
                              ? 'fill-amber-500 text-amber-500 drop-shadow-[0_0_16px_rgba(245,158,11,0.9)] scale-105'
                              : 'text-amber-200 hover:text-amber-300 stroke-[1.5]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-amber-900/70 pt-1 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tap a star above to share your rating instantly</span>
                </div>
              </div>
            )}

            {/* STAGE 2: 4-5 STARS -> 1-TAP REVIEW CHIPS & GOOGLE MAPS LAUNCH */}
            {stage === 'positive' && (
              <div className="text-center space-y-4 py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl animate-pulse" />
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-amber-600 to-amber-800 border border-amber-400 flex items-center justify-center text-amber-100 shadow-xl shadow-amber-900/20">
                    <CheckCircle2 className="w-8 h-8 text-amber-100" />
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-700" />
                    <span>{rating}-Star Verified Experience</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950">Thank you so much!</h2>
                  <p className="text-sm font-semibold text-amber-900/90 mt-2 max-w-sm mx-auto">
                    Tap a phrase to copy it, then paste it on Google!
                  </p>
                </div>

                {/* 1-TAP REVIEW CHIPS (User requested: 3 clickable Tailwind UI chips) */}
                <div className="flex flex-col gap-2.5 max-w-md mx-auto pt-2">
                  {REVIEW_CHIPS.map((chip, idx) => {
                    const isSelected = selectedChip === chip;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        disabled={isRedirecting && isSelected}
                        className={`w-full py-3.5 px-4 rounded-2xl text-left border transition-all flex items-center justify-between gap-3 active:scale-[0.98] group cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-700/30 ring-2 ring-emerald-400 scale-[1.01]'
                            : 'bg-amber-50/90 hover:bg-amber-100/90 border-amber-200/90 text-amber-950 hover:shadow-md'
                        }`}
                      >
                        <span className="flex-1 font-semibold text-xs sm:text-sm">"{chip}"</span>
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1.5 transition-colors ${
                            isSelected
                              ? 'bg-emerald-800 text-white border border-emerald-400'
                              : 'bg-amber-200/70 text-amber-900 group-hover:bg-amber-200'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-amber-800" />
                              <span>Tap to copy</span>
                            </>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* REDIRECTING STATUS & TOAST */}
                {isRedirecting && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm space-y-2 animate-in fade-in duration-150 max-w-md mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Copied! Redirecting...</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleProceedDirectly}
                        className="text-[11px] font-bold text-emerald-800 underline hover:text-emerald-950 flex items-center gap-0.5"
                      >
                        <span>Open Now</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* 1.5s Progress bar */}
                    <div className="w-full bg-emerald-200/80 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full w-full animate-progress-fast" />
                    </div>
                  </div>
                )}

                {/* DIRECT BYPASS OPTION */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleProceedDirectly}
                    className="inline-flex items-center justify-center gap-1.5 w-full max-w-md py-2.5 px-3 rounded-xl border border-amber-300/80 bg-white/80 hover:bg-white text-amber-900 font-semibold text-xs transition-all hover:shadow-sm"
                  >
                    <span>Or write your own review directly on Google Maps</span>
                    <ExternalLink className="w-3 h-3 text-amber-700" />
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: 1-3 STARS -> PRIVATE MANAGEMENT DESK */}
            {stage === 'negative' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Respectful Privacy Header */}
                <div className="p-3.5 rounded-2xl bg-amber-100/90 border border-amber-300/80 flex items-start gap-3 shadow-sm">
                  <HeartHandshake className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold">Private Manager Desk: </span>
                    Your review is completely <span className="underline font-bold">confidential</span> and delivered directly to the store manager so we can resolve this promptly.
                  </div>
                </div>

                {/* Quick-tap Tag Selector */}
                <div>
                  <label className="block text-xs font-bold text-amber-950 mb-2">
                    What area needs improvement? (Tap to select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryConfig.tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                            isSelected
                              ? 'bg-amber-700 text-white font-bold shadow-md shadow-amber-800/30 scale-105'
                              : 'bg-[#f7f2e7] text-amber-900 border border-amber-300/70 hover:bg-amber-100'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handlePrivateFeedbackSubmit} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-amber-950">
                        Tell us what went wrong
                      </label>
                      <span className="text-[10px] font-semibold text-amber-700/80 bg-amber-100/70 px-2 py-0.5 rounded-full">
                        Optional
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder={selectedTags.length > 0 ? "Add any extra details, or tap Send to submit your selected areas..." : categoryConfig.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white text-amber-950 border border-amber-300/80 text-sm placeholder-amber-800/40 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-all resize-none shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-amber-950">
                          Your Name <span className="text-rose-600 font-black">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                          Required
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="e.g. Sunil"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white text-amber-950 border text-xs placeholder-amber-800/40 focus:outline-none focus:border-amber-600 shadow-sm transition-all ${
                          formError && !customerName.trim() ? 'border-rose-500 ring-1 ring-rose-500' : 'border-amber-300/80'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-amber-950">
                          Phone / WhatsApp <span className="text-rose-600 font-black">*</span>
                        </label>
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md">
                          Required
                        </span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (formError) setFormError(null);
                        }}
                        placeholder="+91 98765 43210"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white text-amber-950 border text-xs placeholder-amber-800/40 focus:outline-none focus:border-amber-600 shadow-sm transition-all ${
                          formError && (!customerPhone.trim() || customerPhone.replace(/[^0-9]/g, '').length < 10)
                            ? 'border-rose-500 ring-1 ring-rose-500'
                            : 'border-amber-300/80'
                        }`}
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-100 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-900/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending to Store Manager...' : 'Send Directly to Owner'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* STAGE 4: SUBMITTED CONFIRMATION */}
            {stage === 'submitted' && (
              <div className="text-center space-y-4 py-6 animate-in fade-in duration-200">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-md">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-amber-950">Feedback Received</h2>
                <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed max-w-sm mx-auto">
                  Your message was delivered privately to{' '}
                  <span className="font-bold text-amber-950">{business.owner_name}</span>. We take customer satisfaction seriously and will review your comments promptly.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Trust & Security Footer */}
      <footer className="mt-6 text-center text-xs text-amber-900/70 flex flex-col items-center justify-center gap-2 font-medium">
        <div className="flex items-center justify-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-amber-700" />
          <span>100% Private & Verified Customer Gateway • Powered by <span className="font-bold text-amber-950">RepuBoost™</span></span>
        </div>
      </footer>
    </div>
  );
}

export default function DynamicQRReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf8f1] flex items-center justify-center text-amber-900 text-sm font-medium">
          Loading feedback portal...
        </div>
      }
    >
      <ReviewPageInner />
    </Suspense>
  );
}

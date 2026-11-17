'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Store,
  Award,
  KeyRound,
} from 'lucide-react';

export default function LuxuryLandingPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#1E1B18] font-serif antialiased selection:bg-[#E8D8B8] selection:text-[#1E1B18]">
      {/* Luxury Navigation: RepuBoost Logo + Hospitality Standard + Client Portal */}
      <header className="sticky top-0 z-50 bg-[#FBF9F5]/95 backdrop-blur-md border-b border-[#E8E2D8] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/luxury" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9B7B38] via-[#C5A059] to-[#EAD8A4] p-[1.5px] shadow-sm flex-shrink-0">
              <div className="w-full h-full bg-[#1A1815] rounded-[10px] flex items-center justify-center">
                <Store className="w-5 h-5 text-[#EAD8A4] transition-transform group-hover:scale-105" />
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="font-serif text-2xl font-bold tracking-tight text-[#1E1B18]">
                Repu<span className="text-[#A7843B] font-light italic">Boost</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links: Clean spacing between RepuBoost and Hospitality Standard */}
          <nav className="hidden md:flex items-center gap-10 font-sans text-xs font-semibold tracking-wider uppercase text-[#544E45]">
            <a href="#portal" className="hover:text-[#A7843B] transition-colors">
              Hospitality Standard
            </a>
            <Link
              href="/portal"
              className="text-[#A7843B] hover:text-[#7A5F28] transition-colors font-bold flex items-center gap-1.5"
            >
              <span>Client Portal →</span>
            </Link>
          </nav>

          {/* Action Button: Direct Portal Sign In (Never squashed on mobile) */}
          <div className="flex items-center gap-3 font-sans flex-shrink-0">
            <Link
              href="/portal"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C5A059] via-[#D8B46E] to-[#B8924B] hover:from-[#B8924B] hover:to-[#9F7A35] text-[#161412] text-xs font-bold uppercase tracking-wider shadow-md shadow-[#C5A059]/25 hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-[#ECE5DA]">
        {/* Subtle Ambient Backdrops */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F3EAD8]/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#EFE4CF]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE7D8] border border-[#DDD2C0] text-[#7A5F28] font-sans text-[11px] font-bold uppercase tracking-widest">
                <Award className="w-3.5 h-3.5 text-[#A7843B]" />
                <span>The Gold Standard for Premium Venues</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#181614] font-medium leading-[1.12] tracking-tight">
                Elevate Your Venue’s Reputation to <span className="italic font-normal text-[#9B7B38]">Michelin Standard</span>
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#5E574D] font-normal leading-relaxed max-w-xl">
                Replace flimsy cardboard QR tents with architectural brushed brass & optical-grade acrylic stands.
                Direct delighted patrons seamlessly to your official Google Maps profile while intercepting sensitive
                critiques privately on your manager’s desk.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 font-sans">
                <Link
                  href="/portal"
                  className="px-7 py-4 rounded-full bg-gradient-to-r from-[#C5A059] via-[#D8B46E] to-[#B8924B] hover:from-[#B8924B] hover:to-[#9F7A35] text-[#161412] text-sm font-bold uppercase tracking-wider shadow-lg shadow-[#C5A059]/30 hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Access Client Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Prestige Stats */}
              <div className="pt-6 border-t border-[#ECE5DA] grid grid-cols-3 gap-6 font-sans">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#181614]">99.4%</div>
                  <div className="text-[11px] uppercase tracking-wider text-[#7C7467] font-medium mt-0.5">Guest Satisfaction</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#181614]">+4.9★</div>
                  <div className="text-[11px] uppercase tracking-wider text-[#7C7467] font-medium mt-0.5">Average Score</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[#181614]">0 Apps</div>
                  <div className="text-[11px] uppercase tracking-wider text-[#7C7467] font-medium mt-0.5">Instant NFC Tap</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Pristine Luxury Stand Commercial Photography (100% Uncut & Photorealistic) */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 flex flex-col items-center">
              {/* Warm Ambient Glow Backing */}
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300/30 via-amber-200/25 to-amber-400/25 rounded-[40px] blur-3xl -z-10 pointer-events-none" />

              {/* Hero Image Frame with Floating Social Proof Badges */}
              <div className="relative w-full max-w-[440px] group">
                {/* Floating Google Verified Rating Badge (Top Right) */}
                <div className="absolute -top-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-amber-200/90 flex items-center gap-2.5 z-20 transition-transform group-hover:scale-105">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black text-xs shadow-sm">
                    ★
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                      ★★★★★ <span className="text-slate-900 ml-1 font-sans text-xs">4.98</span>
                    </div>
                    <div className="text-[9px] font-sans font-bold uppercase tracking-wider text-slate-500">Google Verified Partner</div>
                  </div>
                </div>

                {/* Pristine Commercial Photograph (Full Frame, Zero Crop) */}
                <div className="overflow-hidden rounded-3xl border border-[#DDD2C0] shadow-2xl bg-white/50 p-2 sm:p-2.5 backdrop-blur-sm">
                  <img
                    src="/repuboost-luxury-hero.jpg"
                    alt="RepuBoost Optical Acrylic & Brushed Brass Review Stand"
                    className="w-full h-auto rounded-2xl object-contain block transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="eager"
                  />
                </div>

                {/* Floating Contactless NFC Pulse Badge (Bottom Left) */}
                <div className="absolute -bottom-3 -left-2 sm:-left-4 bg-[#181614]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-amber-500/30 text-white flex items-center gap-3 z-20 transition-transform group-hover:scale-105">
                  <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
                    <div className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-sans font-bold text-amber-300">0.5s Contactless NFC Tap</div>
                    <div className="text-[9px] font-sans text-slate-400">Instant Official Google 5★ Form</div>
                  </div>
                </div>
              </div>

              {/* Feature Highlight Pill Below Stand */}
              <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-[440px] font-sans text-xs">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8DEC8] shadow-sm flex items-center gap-2.5">
                  <span className="text-lg">🌟</span>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">Direct 5★ Boost</div>
                    <div className="text-[9px] text-slate-500">Straight to Google Maps</div>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/80 border border-[#E8DEC8] shadow-sm flex items-center gap-2.5">
                  <span className="text-lg">🛡️</span>
                  <div>
                    <div className="font-bold text-slate-900 text-[11px]">Private Shield</div>
                    <div className="text-[9px] text-slate-500">Critiques kept off Google</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated Client Portal Section (Strictly Zero Master Agency Panel link) */}
      <section id="portal" className="py-20 bg-[#161412] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A241D] border border-[#443B2E] text-[#EAD8A4] font-sans text-[11px] font-semibold uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Multi-Tenant Store Management</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight">
              The Dedicated Client Portal
            </h2>

            <p className="font-sans text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl mx-auto">
              Every venue manager receives isolated access credentials to track real-time counter scans, 5-star Google review growth, and incoming private guest feedback with 1-click WhatsApp apology outreach.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 font-sans">
              <Link
                href="/portal"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#C5A059] to-[#D8B46E] hover:from-[#B8924B] hover:to-[#C5A059] text-[#161412] text-sm font-bold uppercase tracking-wider transition-all shadow-xl shadow-[#C5A059]/25 flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Sign In to Store Portal →</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Minimal Footer */}
      <footer className="bg-[#12100E] text-neutral-400 font-sans text-xs py-12 border-t border-[#231F1B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl font-bold text-white tracking-tight">
              Repu<span className="text-[#C5A059] font-light italic">Boost</span>
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-[11px] text-neutral-500">Haute Hospitality Standard</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-neutral-300">
            <Link href="/portal" className="text-[#C5A059] hover:underline font-bold">Client Portal</Link>
          </div>

          <div className="text-[11px] text-neutral-500">
            © 2026 RepuBoost Agency Systems.
          </div>
        </div>
      </footer>
    </div>
  );
}

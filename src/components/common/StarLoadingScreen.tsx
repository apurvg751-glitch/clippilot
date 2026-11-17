'use client';

import React from 'react';
import { Star, ShieldCheck, Sparkles } from 'lucide-react';

export interface StarLoadingScreenProps {
  theme?: 'luxury' | 'dark' | 'overlay';
  badge?: string;
  badgeIcon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
}

export default function StarLoadingScreen({
  theme = 'luxury',
  badge = 'RepuBoost™ Verified',
  badgeIcon,
  title = 'Opening Feedback Gateway',
  subtitle = 'Spawning your 5-star customer experience...',
  fullScreen = true,
}: StarLoadingScreenProps) {
  const isDark = theme === 'dark';
  const isOverlay = theme === 'overlay';
  const isLuxury = theme === 'luxury';

  const containerClasses = isOverlay
    ? 'fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md text-white font-sans'
    : fullScreen
    ? isDark
      ? 'min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#07090e] via-[#0d111d] to-[#07090e] text-white font-sans relative overflow-hidden'
      : 'min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#fbf8f1] via-[#f7f2e7] to-[#efe7d6] text-amber-950 font-sans relative overflow-hidden'
    : 'w-full py-12 flex flex-col items-center justify-center text-center font-sans';

  const cardClasses = isDark || isOverlay
    ? 'relative z-10 w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-8 text-center shadow-[0_25px_60px_-12px_rgba(0,0,0,0.6)] ring-1 ring-amber-400/20 space-y-6 animate-in fade-in zoom-in-95 duration-200'
    : 'relative z-10 w-full max-w-sm bg-[#fffdfa]/95 backdrop-blur-xl border border-amber-300/70 rounded-3xl p-8 text-center shadow-[0_25px_60px_-12px_rgba(180,83,9,0.22)] ring-1 ring-amber-400/20 space-y-6 animate-in fade-in zoom-in-95 duration-200';

  const ambientGlowClasses = isDark || isOverlay
    ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-b from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-[120px] pointer-events-none'
    : 'absolute top-0 left-1/2 -translate-x-1/2 w-[550px] h-[320px] bg-gradient-to-b from-amber-300/40 via-yellow-400/25 to-transparent rounded-full blur-[110px] pointer-events-none';

  return (
    <div className={containerClasses}>
      {/* Soft Ambient Gold Lighting */}
      <div className={ambientGlowClasses} />

      {/* Main Luxury Loading Card */}
      <div className={cardClasses}>
        
        {/* Animated Spawning Star Center Emblem */}
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

        {/* Text Prompt */}
        <div className="space-y-1.5">
          <div
            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${
              isDark || isOverlay
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-amber-100 border border-amber-300/80 text-amber-900'
            }`}
          >
            {badgeIcon || <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />}
            <span>{badge}</span>
          </div>
          <h2
            className={`text-lg font-black tracking-tight ${
              isDark || isOverlay ? 'text-white' : 'text-amber-950'
            }`}
          >
            {title}
          </h2>
          <p
            className={`text-xs font-medium ${
              isDark || isOverlay ? 'text-slate-400' : 'text-amber-800/70'
            }`}
          >
            {subtitle}
          </p>
        </div>

        {/* 5 Sequentially Spawning Gold Stars */}
        <div className="flex items-center justify-center gap-2 pt-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md animate-star-spawn ${
                isDark || isOverlay
                  ? 'bg-slate-800/90 border border-amber-500/40'
                  : 'bg-amber-100/90 border border-amber-300/80'
              }`}
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
        <div
          className={`w-48 mx-auto rounded-full h-1.5 overflow-hidden ${
            isDark || isOverlay ? 'bg-slate-800' : 'bg-amber-200/50'
          }`}
        >
          <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 h-full w-full animate-progress-fast" />
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  Users2,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Eye,
  Key,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

export function PlatformAccountsView() {
  const { accounts, setAccountToConnect, syncAccount, toggleAccountConnection, addToast } = useStore();

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return 'Not available';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users2 className="w-5 h-5 text-violet-400" />
            <span>Connected Social Media Channels</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage official OAuth 2.0 credentials and monitor sync telemetry across YouTube Shorts, Instagram Reels, and TikTok.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          <span>Zero Password Storage Policy</span>
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((acc) => {
          const isYT = acc.platform === 'youtube';
          const isIG = acc.platform === 'instagram';
          const isTT = acc.platform === 'tiktok';

          return (
            <div
              key={acc.id}
              className={`rounded-3xl p-6 glass-card flex flex-col justify-between border relative overflow-hidden transition-all ${
                acc.isConnected
                  ? 'border-[#222e4d]'
                  : 'border-slate-800 opacity-80'
              }`}
            >
              {/* Top Accent Gradient Border */}
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${
                  isYT
                    ? 'bg-gradient-to-r from-red-500 to-rose-600'
                    : isIG
                    ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500'
                    : 'bg-gradient-to-r from-cyan-400 to-teal-500'
                }`}
              />

              <div>
                {/* Channel Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-white/10 shrink-0">
                      <img
                        src={acc.avatarUrl}
                        alt={acc.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{acc.displayName}</span>
                      </h3>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {acc.handle}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                      acc.isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        acc.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span>{acc.isConnected ? 'Active' : 'Offline'}</span>
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-2.5 my-4 p-3.5 rounded-2xl bg-[#0e1424] border border-[#1d2742] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      {isYT ? 'Subscribers:' : 'Followers:'}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {acc.isConnected ? formatNumber(acc.followersOrSubscribers) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Channel Views:</span>
                    <span className="font-semibold text-slate-200">
                      {acc.isConnected ? formatNumber(acc.totalViews) : '—'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#1a233b] text-[11px]">
                    <span className="text-slate-400">Last Telemetry Sync:</span>
                    <span className="text-slate-300">
                      {acc.lastSyncAt ? new Date(acc.lastSyncAt).toLocaleTimeString() : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Special Developer Notice */}
                {acc.requiresApprovalNotice && (
                  <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200 mb-4 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{acc.requiresApprovalNotice}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#1d2742] flex items-center justify-between gap-2">
                <button
                  onClick={() => syncAccount(acc.id)}
                  disabled={!acc.isConnected}
                  className="p-2 rounded-xl bg-[#141b2e] hover:bg-[#1a243e] disabled:opacity-40 text-slate-300 hover:text-white border border-[#232f4e] transition-colors"
                  title="Refresh channel telemetry"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setAccountToConnect(acc)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    acc.isConnected
                      ? 'bg-[#141b2e] hover:bg-rose-950/40 text-slate-300 hover:text-rose-200 border-[#232f4e] hover:border-rose-500/40'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-transparent shadow-md'
                  }`}
                >
                  {acc.isConnected ? 'Manage API / Scopes' : 'Connect via OAuth'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

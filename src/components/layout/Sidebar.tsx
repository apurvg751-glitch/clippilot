'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { NavigationTab } from '@/types';
import {
  LayoutDashboard,
  Film,
  Send,
  BarChart3,
  Users2,
  TrendingUp,
  CalendarDays,
  Settings,
  Sparkles,
  HardDrive,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'library', label: 'Video Library', icon: Film },
  { id: 'publishing', label: 'Publishing Centre', icon: Send },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'accounts', label: 'Platform Accounts', icon: Users2 },
  { id: 'growth', label: 'Growth Tracker', icon: TrendingUp },
  { id: 'planner', label: 'Content Planner', icon: CalendarDays },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { activeTab, setActiveTab, videos, accounts, isDemoMode, ideas } = useStore();

  const draftCount = videos.filter((v) => v.status === 'draft' || v.status === 'ready').length;
  const readyIdeasCount = ideas.filter((i) => i.stage === 'ready').length;

  return (
    <aside className="w-64 shrink-0 bg-[#0c101c] border-r border-[#1a233a] flex flex-col h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1a233a]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-[#0c101c] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ClipPilot
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Creator Command Studio</p>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="mt-3.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-200">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Demo Preview Mode
            </span>
            <span className="text-[11px] text-indigo-300/80">Sample Data</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Studio Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          let badgeText = item.badge;
          if (item.id === 'library' && draftCount > 0) badgeText = String(draftCount);
          if (item.id === 'planner' && readyIdeasCount > 0) badgeText = `${readyIdeasCount} ready`;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600/25 to-indigo-600/15 text-white border border-violet-500/30 shadow-md shadow-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {badgeText && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-violet-500 text-white'
                      : 'bg-[#1a233a] text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {badgeText}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Channel Connections Strip */}
      <div className="p-4 border-t border-[#1a233a]/80 bg-[#0a0e18]">
        <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase mb-2 flex items-center justify-between">
          <span>Active Channels</span>
          <span className="text-[10px] text-slate-400 font-normal">3 Target APIs</span>
        </div>
        <div className="space-y-1.5">
          {accounts.map((acc) => {
            const isYT = acc.platform === 'youtube';
            const isIG = acc.platform === 'instagram';
            return (
              <div
                key={acc.id}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#111728] border border-[#1e2842] text-xs"
              >
                <div className="flex items-center gap-2">
                  {isYT ? (
                    <Youtube className="w-3.5 h-3.5 text-rose-500" />
                  ) : isIG ? (
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  ) : (
                    <span className="font-bold text-[10px] text-cyan-400">TT</span>
                  )}
                  <span className="text-slate-300 truncate max-w-[110px]">{acc.handle}</span>
                </div>
                {acc.isConnected ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Local Storage Indicator */}
        <div className="mt-4 pt-3 border-t border-[#1a233a]/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3 h-3 text-slate-400" />
              Local Cache
            </span>
            <span className="text-slate-300 font-medium">182 MB / 5 GB</span>
          </div>
          <div className="w-full bg-[#161d31] rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-500 to-cyan-400 h-1.5 rounded-full w-[14%]" />
          </div>
        </div>
      </div>
    </aside>
  );
}

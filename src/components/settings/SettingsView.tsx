'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Settings,
  User,
  ShieldCheck,
  FileDown,
  RefreshCw,
  LogOut,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Key,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SettingsView() {
  const {
    isDemoMode,
    toggleDemoMode,
    resetDemoData,
    accounts,
    exportDataToCSV,
    addToast,
    setAccountToConnect,
  } = useStore();

  const [creatorName, setCreatorName] = useState('Alex Rivera');
  const [handle, setHandle] = useState('@alexrivera');
  const [defaultTags, setDefaultTags] = useState('shorts, creator, tech, reels, viral');
  const [refreshFrequency, setRefreshFrequency] = useState('1hr');

  const supabaseActive = isSupabaseConfigured();

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Profile and creator studio settings updated.');
  };

  const handleSignOut = () => {
    if (confirm('Are you sure you want to sign out and clear your active studio session?')) {
      addToast('info', 'Signed out. Studio local cache secured.');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-violet-400" />
          <span>Studio Settings & Integrations</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure profile details, API credentials, sync cadences, and download analytics backups.
        </p>
      </div>

      {/* Creator Profile Card */}
      <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-violet-400" />
          <span>Creator Profile</span>
        </h3>

        <div className="flex items-center gap-4 py-2">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            alt="Profile Avatar"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-violet-500/40"
          />
          <div>
            <div className="text-xs font-semibold text-white">Profile Photo</div>
            <p className="text-[11px] text-slate-400">Used across video exports and preview cards</p>
            <span className="mt-1 inline-block text-[10px] text-violet-300 font-medium">
              Synced with verified creator identity
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Creator Name</label>
            <input
              type="text"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Universal Handle</label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Default Hashtag Preset</label>
            <input
              type="text"
              value={defaultTags}
              onChange={(e) => setDefaultTags(e.target.value)}
              className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-violet-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md"
          >
            Save Profile
          </button>
        </div>
      </form>

      {/* API Connections & Database Status */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-cyan-400" />
          <span>API Connection & Database Status</span>
        </h3>

        {/* Supabase Status Banner */}
        <div className="p-4 rounded-2xl bg-[#101627] border border-[#1f2942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Supabase PostgreSQL + RLS</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    supabaseActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {supabaseActive ? 'Connected & Live' : 'Local Fallback State'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {supabaseActive
                  ? 'Supabase URL and Anon Key configured in .env.local.'
                  : 'To enable remote cloud sync, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.'}
              </p>
            </div>
          </div>
        </div>

        {/* Channels List */}
        <div className="space-y-2.5">
          {accounts.map((acc) => {
            const isYT = acc.platform === 'youtube';
            const isIG = acc.platform === 'instagram';

            return (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#101627] border border-[#1d2742]"
              >
                <div className="flex items-center gap-3">
                  {isYT ? (
                    <Youtube className="w-4 h-4 text-rose-500" />
                  ) : isIG ? (
                    <Instagram className="w-4 h-4 text-pink-500" />
                  ) : (
                    <span className="text-[11px] font-bold text-cyan-400">TT</span>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">{acc.platformName}</div>
                    <div className="text-[10px] text-slate-400">{acc.handle} • {acc.scopes.length} scopes</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      acc.isConnected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {acc.isConnected ? 'Connected' : 'Pending Credentials'}
                  </span>
                  <button
                    onClick={() => setAccountToConnect(acc)}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium"
                  >
                    Configure
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telemetry Refresh Cadence */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>Telemetry Refresh Cadence</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { id: 'manual', label: 'Manual Only' },
            { id: '1hr', label: 'Every 1 Hour' },
            { id: '6hr', label: 'Every 6 Hours' },
            { id: 'daily', label: 'Daily at Midnight' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setRefreshFrequency(item.id);
                addToast('info', `Sync cadence set to: ${item.label}`);
              }}
              className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                refreshFrequency === item.id
                  ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-md'
                  : 'bg-[#101627] border-[#1d2742] text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* CSV Export Centre */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>Export Analytics Data (CSV)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate instant downloadable CSV spreadsheets for external audits and reporting.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => exportDataToCSV('videos')}
            className="p-3.5 rounded-xl bg-[#101627] hover:bg-[#161f38] border border-[#1d2742] hover:border-cyan-500/40 transition-colors flex items-center justify-between group"
          >
            <div className="text-left">
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                Download Video Performance CSV
              </div>
              <div className="text-[10px] text-slate-400">Title, views, likes, comments, and engagement</div>
            </div>
            <FileDown className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={() => exportDataToCSV('growth')}
            className="p-3.5 rounded-xl bg-[#101627] hover:bg-[#161f38] border border-[#1d2742] hover:border-violet-500/40 transition-colors flex items-center justify-between group"
          >
            <div className="text-left">
              <div className="text-xs font-bold text-white group-hover:text-violet-300">
                Download 30-Day Growth Telemetry
              </div>
              <div className="text-[10px] text-slate-400">Day-by-day views and subscriber accretion</div>
            </div>
            <FileDown className="w-4 h-4 text-violet-400" />
          </button>
        </div>
      </div>

      {/* Demo Mode & Data Reset */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Demo Mode & Environment Reset</span>
        </h3>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#101627] border border-[#1d2742]">
          <div>
            <div className="text-xs font-bold text-white">Realistic Sample Creator Data</div>
            <div className="text-[11px] text-slate-400">
              {isDemoMode
                ? 'Currently displaying sample creator metrics, videos, and growth curves.'
                : 'Displaying live connected account metrics.'}
            </div>
          </div>
          <button
            onClick={toggleDemoMode}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#151c30] border border-[#212b45] text-xs font-semibold text-slate-200 hover:text-white"
          >
            {isDemoMode ? <ToggleRight className="w-5 h-5 text-violet-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
            <span>{isDemoMode ? 'Enabled' : 'Disabled'}</span>
          </button>
        </div>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={resetDemoData}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            Restore Default Sample Data
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

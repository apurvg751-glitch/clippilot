'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  TrendingUp,
  Calendar,
  Filter,
  Eye,
  Users,
  Info,
  FileDown,
  Sparkles,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export function GrowthTrackerView() {
  const { dailyAnalytics, videos, exportDataToCSV } = useStore();

  const [dateRangeDays, setDateRangeDays] = useState<number>(30);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const filteredData = dailyAnalytics.slice(-dateRangeDays);

  // Top 10 videos by combined views
  const top10Videos = [...videos]
    .map((v) => {
      const ytViews = v.posts.find((p) => p.platform === 'youtube')?.views || 0;
      const igViews = v.posts.find((p) => p.platform === 'instagram')?.views || 0;
      const ttViews = v.posts.find((p) => p.platform === 'tiktok')?.views || 0;
      return {
        name: v.title.length > 25 ? v.title.slice(0, 25) + '...' : v.title,
        'Combined Views': ytViews + igViews + ttViews,
        'YouTube Shorts': ytViews,
        'Instagram Reels': igViews,
        TikTok: ttViews,
      };
    })
    .sort((a, b) => b['Combined Views'] - a['Combined Views'])
    .slice(0, 10);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            <span>Growth Tracker & Audience Velocity</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Time-series telemetry comparing day-by-day views, subscriber accretion, and multi-network share.
          </p>
        </div>

        <button
          onClick={() => exportDataToCSV('growth')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13192b] hover:bg-[#1a233d] border border-[#202b4a] text-xs font-semibold text-slate-200 hover:text-white transition-colors shrink-0"
        >
          <FileDown className="w-4 h-4 text-cyan-400" />
          <span>Export 30-Day Growth CSV</span>
        </button>
      </div>

      {/* Filter Ribbon */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4">
        {/* Date range picker pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Date Range:
          </span>
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setDateRangeDays(days)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                dateRangeDays === days
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-[#12182b] text-slate-400 hover:text-white border border-[#1e2744]'
              }`}
            >
              Last {days} Days
            </button>
          ))}
        </div>

        {/* Platform filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Platform:
          </span>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-[#12182b] border border-[#1e2744] text-xs text-slate-200 rounded-lg px-3 py-1 outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">All Channels (Combined)</option>
            <option value="youtube">YouTube Shorts Only</option>
            <option value="instagram">Instagram Reels Only</option>
            <option value="tiktok">TikTok Only</option>
          </select>
        </div>
      </div>

      {/* Important Analytics Rule Callout */}
      <div className="p-4 rounded-2xl bg-[#101628] border border-violet-500/20 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong>Official Metric Standard:</strong> ClipPilot groups cross-channel statistics under <em>"Combined platform views"</em>. This represents the total count of times videos were rendered across platforms, not unique human reach. Viewers watching your video on both YouTube and Instagram are reported by both networks independently.
        </div>
      </div>

      {/* Growth Metric Callouts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card">
          <div className="text-xs text-slate-400 font-medium">Weekly Growth Delta</div>
          <div className="text-2xl font-bold text-white mt-1">+18.4%</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Accelerating view velocity across TikTok & Shorts</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card">
          <div className="text-xs text-slate-400 font-medium">Monthly Growth Delta</div>
          <div className="text-2xl font-bold text-white mt-1">+32.6%</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Net new audience accretion up MoM</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card">
          <div className="text-xs text-slate-400 font-medium">Avg Daily Views</div>
          <div className="text-2xl font-bold text-white mt-1">
            {formatNumber(
              Math.floor(
                filteredData.reduce((s, d) => s + d.combinedViews, 0) / (filteredData.length || 1)
              )
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Over the selected {dateRangeDays}-day timeframe
          </div>
        </div>
      </div>

      {/* Chart 1: Daily Views (AreaChart) */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Daily Views Performance</h3>
            <p className="text-xs text-slate-400">
              {selectedPlatform === 'all'
                ? 'Breakdown across YouTube Shorts, Instagram Reels, and TikTok'
                : `Views on ${selectedPlatform}`}
            </p>
          </div>
          <Eye className="w-4 h-4 text-violet-400" />
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="igGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="ttGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111728',
                  borderColor: '#2e3b5e',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [Number(val).toLocaleString(), 'Views']}
              />
              <Legend />
              {(selectedPlatform === 'all' || selectedPlatform === 'youtube') && (
                <Area type="monotone" dataKey="youtubeViews" name="YouTube Shorts" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#ytGrad)" />
              )}
              {(selectedPlatform === 'all' || selectedPlatform === 'instagram') && (
                <Area type="monotone" dataKey="instagramViews" name="Instagram Reels" stroke="#ec4899" strokeWidth={2} fillOpacity={1} fill="url(#igGrad)" />
              )}
              {(selectedPlatform === 'all' || selectedPlatform === 'tiktok') && (
                <Area type="monotone" dataKey="tiktokViews" name="TikTok" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#ttGrad)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Daily Followers Accretion (LineChart) */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Daily Audience Growth</h3>
            <p className="text-xs text-slate-400">Cumulative followers & subscribers progression</p>
          </div>
          <Users className="w-4 h-4 text-cyan-400" />
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(val) => val.slice(5)} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111728',
                  borderColor: '#2e3b5e',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [Number(val).toLocaleString(), 'Followers']}
              />
              <Legend />
              <Line type="monotone" dataKey="youtubeSubscribers" name="YouTube Subscribers" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="instagramFollowers" name="Instagram Followers" stroke="#ec4899" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tiktokFollowers" name="TikTok Followers" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Top 10 Videos by Views */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Top 10 Video Assets by Views</h3>
          <p className="text-xs text-slate-400">Aggregated channel performance per master vertical asset</p>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10Videos} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111728',
                  borderColor: '#2e3b5e',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [Number(val).toLocaleString(), 'Views']}
              />
              <Legend />
              <Bar dataKey="Combined Views" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

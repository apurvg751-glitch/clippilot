'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  Eye,
  Users,
  Video,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Info,
  ArrowUpRight,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function OverviewView() {
  const {
    videos,
    accounts,
    dailyAnalytics,
    setActiveTab,
    setActiveVideoForModal,
    setActiveVideoForComparison,
    setIsUploadModalOpen,
  } = useStore();

  // Aggregate stats across videos and accounts
  const publishedVideos = videos.filter((v) => v.status === 'published');
  
  let totalLikes = 0;
  let totalComments = 0;
  let totalShares = 0;
  let totalVideoViews = 0;

  videos.forEach((v) => {
    v.posts.forEach((p) => {
      totalVideoViews += p.views || 0;
      totalLikes += p.likes || 0;
      totalComments += p.comments || 0;
      totalShares += p.shares || 0;
    });
  });

  const totalFollowers = accounts.reduce((acc, a) => acc + (a.followersOrSubscribers || 0), 0);

  // Views gained calculations from daily analytics
  const last7Days = dailyAnalytics.slice(-7);
  const viewsGained7d = last7Days.reduce((sum, d) => sum + d.combinedViews, 0);

  const last30Days = dailyAnalytics.slice(-30);
  const viewsGained30d = last30Days.reduce((sum, d) => sum + d.combinedViews, 0);

  // Top 4 best-performing videos
  const sortedVideos = [...videos].sort((a, b) => {
    const aViews = a.posts.reduce((s, p) => s + (p.views || 0), 0);
    const bViews = b.posts.reduce((s, p) => s + (p.views || 0), 0);
    return bViews - aViews;
  });

  const topVideos = sortedVideos.slice(0, 4);

  // Recent uploads (latest 4)
  const recentVideos = [...videos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Platform views breakdown for the chart
  const platformComparisonData = [
    {
      platform: 'YouTube Shorts',
      views: videos.reduce(
        (acc, v) => acc + (v.posts.find((p) => p.platform === 'youtube')?.views || 0),
        0
      ),
      likes: videos.reduce(
        (acc, v) => acc + (v.posts.find((p) => p.platform === 'youtube')?.likes || 0),
        0
      ),
      fill: '#ef4444',
    },
    {
      platform: 'Instagram Reels',
      views: videos.reduce(
        (acc, v) => acc + (v.posts.find((p) => p.platform === 'instagram')?.views || 0),
        0
      ),
      likes: videos.reduce(
        (acc, v) => acc + (v.posts.find((p) => p.platform === 'instagram')?.likes || 0),
        0
      ),
      fill: '#ec4899',
    },
    {
      platform: 'TikTok',
      views: videos.reduce(
        (acc, v) => acc + (v.posts.find((p) => p.platform === 'tiktok')?.views || 0),
        0
      ),
      likes: videos.reduce(
        (acc, v) => acc + (v.posts.find((p) => p.platform === 'tiktok')?.likes || 0),
        0
      ),
      fill: '#06b6d4',
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner Notice on Combined Views */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-slate-900/60 border border-violet-500/30 flex items-start gap-3.5 shadow-lg">
        <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 shrink-0 mt-0.5">
          <Info className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-violet-200">
              Combined Platform Views vs Unique Reach
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-violet-500/30 text-violet-300 rounded">
              Official Metrics
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Multi-platform figures represent the mathematical sum of platform-reported impressions across YouTube Shorts, Instagram Reels, and TikTok. Because the same person may watch your content on multiple networks, these metrics do not represent deduplicated unique individuals.
          </p>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Combined Views */}
        <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Combined Views</span>
            <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {formatNumber(totalVideoViews)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+24.8% this month</span>
          </div>
        </div>

        {/* Total Followers */}
        <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Audience</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {formatNumber(totalFollowers)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Across 3 active platforms
          </div>
        </div>

        {/* Videos Published */}
        <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Published Clips</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {publishedVideos.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            {videos.length} total in library
          </div>
        </div>

        {/* Total Likes */}
        <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Likes</span>
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {formatNumber(totalLikes)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 font-medium">
            11.8% avg ratio
          </div>
        </div>

        {/* Total Comments */}
        <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Comments</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <MessageCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {formatNumber(totalComments)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            High community talk
          </div>
        </div>

        {/* Total Shares */}
        <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Shares</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-white">
            {formatNumber(totalShares)}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 truncate" title="Reported by IG & TikTok">
            IG & TikTok reported
          </div>
        </div>
      </div>

      {/* Views Gained Highlight Pills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#12182a] to-[#182138] border border-[#202b48] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Views Gained (Last 7 Days)
              </div>
              <div className="text-xl font-bold text-white mt-0.5">
                +{formatNumber(viewsGained7d)} views
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            +18.4% WoW
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#12182a] to-[#182138] border border-[#202b48] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Views Gained (Last 30 Days)
              </div>
              <div className="text-xl font-bold text-white mt-0.5">
                +{formatNumber(viewsGained30d)} views
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            +32.6% MoM
          </span>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Follower Growth Over Time (Area Chart) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Audience Growth Timeline</h3>
              <p className="text-xs text-slate-400">Cumulative followers & subscribers across platforms (last 30 days)</p>
            </div>
            <button
              onClick={() => setActiveTab('growth')}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <span>Detailed view</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => val.slice(5)}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111728',
                    borderColor: '#2e3b5e',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [Number(value).toLocaleString(), 'Followers']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="totalFollowers"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#followerGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Views Comparison (Bar Chart) */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Platform Views</h3>
                <p className="text-xs text-slate-400">Reported video impressions by network</p>
              </div>
              <BarChart2 className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformComparisonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                  <XAxis dataKey="platform" stroke="#64748b" fontSize={10} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111728',
                      borderColor: '#2e3b5e',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [Number(value).toLocaleString(), 'Views']}
                  />
                  <Bar dataKey="views" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1e263d] space-y-2">
            {platformComparisonData.map((item) => (
              <div key={item.platform} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-slate-300">{item.platform}</span>
                </div>
                <span className="font-semibold text-white">{formatNumber(item.views)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Best-Performing Videos & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best-Performing Videos */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Top Performing Clips</span>
                <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  By Combined Views
                </span>
              </h3>
              <p className="text-xs text-slate-400">Highest engaging short-form assets</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <span>All analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topVideos.map((video, idx) => {
              const videoTotalViews = video.posts.reduce((s, p) => s + (p.views || 0), 0);
              const videoTotalLikes = video.posts.reduce((s, p) => s + (p.likes || 0), 0);

              return (
                <div
                  key={video.id}
                  className="p-3 rounded-xl bg-[#12182b] border border-[#1e2844] hover:border-violet-500/40 transition-all flex items-center gap-3.5 group cursor-pointer"
                  onClick={() => setActiveVideoForModal(video)}
                >
                  <div className="font-bold text-sm text-slate-400 w-4 text-center">
                    #{idx + 1}
                  </div>
                  <div className="w-14 h-16 rounded-lg overflow-hidden shrink-0 relative bg-slate-900 border border-[#263354]">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1 rounded text-white font-mono">
                      {video.durationSeconds}s
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                      {video.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Eye className="w-3 h-3 text-violet-400" />
                        {formatNumber(videoTotalViews)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        {formatNumber(videoTotalLikes)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveVideoForComparison(video);
                    }}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#1a233e] hover:bg-violet-600/30 text-violet-300 border border-[#2b3a62] hover:border-violet-500/50 transition-colors shrink-0"
                    title="Compare performance across YouTube, Instagram & TikTok"
                  >
                    Compare
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Recent Video Library Assets</h3>
              <p className="text-xs text-slate-400">Latest media clips added to your workspace</p>
            </div>
            <button
              onClick={() => setActiveTab('library')}
              className="text-xs font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              <span>View library</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentVideos.map((video) => {
              const isPublished = video.status === 'published';
              const isScheduled = video.status === 'scheduled';
              const isFailed = video.status === 'failed';

              return (
                <div
                  key={video.id}
                  className="p-3 rounded-xl bg-[#12182b] border border-[#1e2844] flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 relative bg-slate-900 border border-[#263354]">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4
                        className="text-xs font-semibold text-slate-200 truncate cursor-pointer hover:text-white"
                        onClick={() => setActiveVideoForModal(video)}
                      >
                        {video.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPublished
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isScheduled
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : isFailed
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-slate-700/50 text-slate-300 border border-slate-600/40'
                          }`}
                        >
                          {video.status}
                        </span>

                        {/* Connected platform icons */}
                        <div className="flex items-center gap-1 ml-1">
                          {video.platformCaptions.youtube && (
                            <Youtube className="w-3 h-3 text-rose-400" />
                          )}
                          {video.platformCaptions.instagram && (
                            <Instagram className="w-3 h-3 text-pink-400" />
                          )}
                          {video.platformCaptions.tiktok && (
                            <span className="text-[9px] font-bold text-cyan-400">TT</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (video.status === 'ready' || video.status === 'draft') {
                        setActiveTab('publishing');
                      } else {
                        setActiveVideoForModal(video);
                      }
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-[#19223c] hover:bg-[#222e50] text-slate-200 border border-[#263354] transition-colors shrink-0"
                  >
                    {video.status === 'ready' ? 'Publish' : 'Details'}
                  </button>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-[#2a385c] hover:border-violet-500 text-xs font-medium text-slate-400 hover:text-white hover:bg-violet-950/20 transition-all flex items-center justify-center gap-2"
          >
            <span>+ Ingest New Video Clip</span>
          </button>
        </div>
      </div>
    </div>
  );
}

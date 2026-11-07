'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import {
  X,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  Award,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export function VideoCompareModal() {
  const { activeVideoForComparison, setActiveVideoForComparison } = useStore();

  if (!activeVideoForComparison) return null;

  const video = activeVideoForComparison;

  const ytPost = video.posts.find((p) => p.platform === 'youtube');
  const igPost = video.posts.find((p) => p.platform === 'instagram');
  const ttPost = video.posts.find((p) => p.platform === 'tiktok');

  const comparisonData = [
    {
      metric: 'Views',
      'YouTube Shorts': ytPost?.views || 0,
      'Instagram Reels': igPost?.views || 0,
      TikTok: ttPost?.views || 0,
    },
    {
      metric: 'Likes',
      'YouTube Shorts': ytPost?.likes || 0,
      'Instagram Reels': igPost?.likes || 0,
      TikTok: ttPost?.likes || 0,
    },
    {
      metric: 'Comments',
      'YouTube Shorts': ytPost?.comments || 0,
      'Instagram Reels': igPost?.comments || 0,
      TikTok: ttPost?.comments || 0,
    },
    {
      metric: 'Shares',
      'YouTube Shorts': ytPost?.shares || 0,
      'Instagram Reels': igPost?.shares || 0,
      TikTok: ttPost?.shares || 0,
    },
  ];

  // Calculate highest performing platform by views
  const platformsViews = [
    { name: 'YouTube Shorts', views: ytPost?.views || 0 },
    { name: 'Instagram Reels', views: igPost?.views || 0 },
    { name: 'TikTok', views: ttPost?.views || 0 },
  ];
  platformsViews.sort((a, b) => b.views - a.views);
  const winner = platformsViews[0];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-[#212b45] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2842] flex items-center justify-between sticky top-0 bg-[#0f1422]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Cross-Platform Performance Comparison</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Head-to-Head
                </span>
              </h2>
              <p className="text-xs text-slate-400 line-clamp-1">{video.title}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveVideoForComparison(null)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Top Video Overview Banner */}
          <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-18 rounded-xl overflow-hidden bg-black shrink-0 relative">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{video.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <span>Duration: {video.durationSeconds}s</span>
                  <span>•</span>
                  <span>Published on {video.posts.length} platforms</span>
                </div>
              </div>
            </div>

            {winner.views > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/30 flex items-center gap-2 text-xs">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-200">
                  Top Channel: <strong className="text-amber-300">{winner.name}</strong> ({formatNumber(winner.views)} views)
                </span>
              </div>
            )}
          </div>

          {/* Three Channel Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* YouTube Shorts */}
            <div className="p-4 rounded-2xl bg-[#121829] border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <Youtube className="w-4 h-4" />
                  <span>YouTube Shorts</span>
                </div>
                {ytPost?.externalUrl && (
                  <a
                    href={ytPost.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {ytPost ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Views:</span>
                    <span className="font-bold text-white">{formatNumber(ytPost.views)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Likes:</span>
                    <span className="font-semibold text-white">{formatNumber(ytPost.likes)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Comments:</span>
                    <span className="font-semibold text-white">{formatNumber(ytPost.comments)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Engagement Rate:</span>
                    <span className="font-bold text-emerald-400">{ytPost.engagementRate}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">Not published to YouTube</div>
              )}
            </div>

            {/* Instagram Reels */}
            <div className="p-4 rounded-2xl bg-[#121829] border border-pink-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-xs">
                  <Instagram className="w-4 h-4" />
                  <span>Instagram Reels</span>
                </div>
                {igPost?.externalUrl && (
                  <a
                    href={igPost.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {igPost ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Views:</span>
                    <span className="font-bold text-white">{formatNumber(igPost.views)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Likes:</span>
                    <span className="font-semibold text-white">{formatNumber(igPost.likes)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Comments:</span>
                    <span className="font-semibold text-white">{formatNumber(igPost.comments)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Engagement Rate:</span>
                    <span className="font-bold text-emerald-400">{igPost.engagementRate}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">Not published to Instagram</div>
              )}
            </div>

            {/* TikTok */}
            <div className="p-4 rounded-2xl bg-[#121829] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <span className="text-[11px] font-bold">TT</span>
                  <span>TikTok</span>
                </div>
                {ttPost?.externalUrl && (
                  <a
                    href={ttPost.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {ttPost ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Views:</span>
                    <span className="font-bold text-white">{formatNumber(ttPost.views)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Likes:</span>
                    <span className="font-semibold text-white">{formatNumber(ttPost.likes)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1f2842]">
                    <span className="text-slate-400">Comments:</span>
                    <span className="font-semibold text-white">{formatNumber(ttPost.comments)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Engagement Rate:</span>
                    <span className="font-bold text-emerald-400">{ttPost.engagementRate}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">Not published to TikTok</div>
              )}
            </div>
          </div>

          {/* Grouped Comparative Bar Chart */}
          <div className="p-5 rounded-2xl bg-[#121829] border border-[#212b45] space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Relative Metric Comparison
            </h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111728',
                      borderColor: '#2e3b5e',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [Number(val).toLocaleString(), '']}
                  />
                  <Legend />
                  <Bar dataKey="YouTube Shorts" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Instagram Reels" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="TikTok" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

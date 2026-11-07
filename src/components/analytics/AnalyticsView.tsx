'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { PlatformType } from '@/types';
import {
  BarChart3,
  Search,
  Filter,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ExternalLink,
  ArrowUpDown,
  FileDown,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

export function AnalyticsView() {
  const { videos, searchQuery, setSearchQuery, setActiveVideoForComparison, exportDataToCSV } = useStore();

  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'comments' | 'engagement' | 'date'>('views');

  // Extract all published post records across videos
  interface PostRow {
    videoId: string;
    videoTitle: string;
    thumbnailUrl: string;
    aspectRatio: string;
    durationSeconds: number;
    platform: PlatformType;
    publishedAt?: string;
    views: number;
    likes: number;
    comments: number;
    shares?: number;
    engagementRate: number;
    externalUrl?: string;
    videoRef: any;
  }

  const allPosts: PostRow[] = [];

  videos.forEach((video) => {
    video.posts.forEach((post) => {
      if (post.status === 'published') {
        allPosts.push({
          videoId: video.id,
          videoTitle: video.title,
          thumbnailUrl: video.thumbnailUrl,
          aspectRatio: video.aspectRatio,
          durationSeconds: video.durationSeconds,
          platform: post.platform,
          publishedAt: post.publishedAt || video.createdAt,
          views: post.views,
          likes: post.likes,
          comments: post.comments,
          shares: post.shares,
          engagementRate: post.engagementRate,
          externalUrl: post.externalUrl,
          videoRef: video,
        });
      }
    });
  });

  // Filter posts
  const filteredPosts = allPosts.filter((post) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!post.videoTitle.toLowerCase().includes(q)) return false;
    }
    if (platformFilter !== 'all' && post.platform !== platformFilter) {
      return false;
    }
    return true;
  });

  // Sort posts
  filteredPosts.sort((a, b) => {
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'comments') return b.comments - a.comments;
    if (sortBy === 'engagement') return b.engagementRate - a.engagementRate;
    if (sortBy === 'date') {
      return new Date(b.publishedAt || '').getTime() - new Date(a.publishedAt || '').getTime();
    }
    return 0;
  });

  const formatNumber = (num: number) => {
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
            <BarChart3 className="w-5 h-5 text-violet-400" />
            <span>Content & Video Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official platform-reported post metrics, engagement velocity, and cross-platform comparisons.
          </p>
        </div>

        <button
          onClick={() => exportDataToCSV('videos')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#13192b] hover:bg-[#1a233d] border border-[#202b4a] text-xs font-semibold text-slate-200 hover:text-white transition-colors shrink-0"
        >
          <FileDown className="w-4 h-4 text-cyan-400" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4">
        {/* Platform filter pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Channel:</span>
          {['all', 'youtube', 'instagram', 'tiktok'].map((pl) => (
            <button
              key={pl}
              onClick={() => setPlatformFilter(pl)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                platformFilter === pl
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-[#12182b] text-slate-400 hover:text-white border border-[#1e2744]'
              }`}
            >
              {pl === 'all' ? 'All Channels' : pl}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#12182b] border border-[#1e2744] text-xs text-slate-200 rounded-lg px-3 py-1 outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="views">Most Views</option>
            <option value="likes">Most Likes</option>
            <option value="comments">Most Comments</option>
            <option value="engagement">Highest Engagement Rate</option>
            <option value="date">Latest Published</option>
          </select>
        </div>
      </div>

      {/* Posts Table / Card List */}
      <div className="rounded-2xl glass-panel overflow-hidden border border-[#1e2844]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e1322] text-slate-400 font-semibold border-b border-[#1c2640] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Clip / Title</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Published Date</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Likes</th>
                <th className="py-3 px-4">Comments</th>
                <th className="py-3 px-4">Shares</th>
                <th className="py-3 px-4">Engagement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#182035] text-slate-200">
              {filteredPosts.map((post, idx) => {
                const isYT = post.platform === 'youtube';
                const isIG = post.platform === 'instagram';

                return (
                  <tr
                    key={`${post.videoId}_${post.platform}_${idx}`}
                    className="hover:bg-[#131a2e]/60 transition-colors group"
                  >
                    {/* Title + Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-black relative border border-[#212c49]">
                          <img
                            src={post.thumbnailUrl}
                            alt={post.videoTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-[240px]">
                          <div className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                            {post.videoTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                            <span>{post.durationSeconds}s</span>
                            <span>•</span>
                            <span>{post.aspectRatio}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Platform Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {isYT ? (
                          <div className="p-1 rounded bg-rose-500/20 text-rose-400">
                            <Youtube className="w-3.5 h-3.5" />
                          </div>
                        ) : isIG ? (
                          <div className="p-1 rounded bg-pink-500/20 text-pink-400">
                            <Instagram className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                            TT
                          </div>
                        )}
                        <span className="capitalize font-medium text-slate-300">
                          {isYT ? 'Shorts' : isIG ? 'Reels' : 'TikTok'}
                        </span>
                      </div>
                    </td>

                    {/* Published Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-white text-sm">
                        {formatNumber(post.views)}
                      </span>
                    </td>

                    {/* Likes */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      {formatNumber(post.likes)}
                    </td>

                    {/* Comments */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      {formatNumber(post.comments)}
                    </td>

                    {/* Shares */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-300">
                      {post.shares !== undefined ? (
                        formatNumber(post.shares)
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Not reported</span>
                      )}
                    </td>

                    {/* Engagement Rate */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px]">
                        {post.engagementRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {post.externalUrl && (
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#19223c] hover:bg-[#233054] text-slate-300 hover:text-white transition-colors"
                            title="Open live post"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => setActiveVideoForComparison(post.videoRef)}
                          className="px-2.5 py-1 rounded-lg bg-violet-950/40 hover:bg-violet-900/50 text-violet-300 border border-violet-500/30 text-[11px] font-medium transition-colors"
                        >
                          Compare
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

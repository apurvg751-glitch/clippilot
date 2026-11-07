'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import { VideoItem, VideoStatus, PlatformType } from '@/types';
import {
  Film,
  Plus,
  Search,
  Filter,
  Eye,
  Heart,
  Calendar,
  Clock,
  MoreVertical,
  Play,
  Send,
  Trash2,
  Edit3,
  SlidersHorizontal,
  Share2,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

export function VideoLibraryView() {
  const {
    videos,
    searchQuery,
    setSearchQuery,
    setIsUploadModalOpen,
    setActiveVideoForModal,
    setActiveVideoForComparison,
    deleteVideo,
    setActiveTab,
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Filter logic
  const filteredVideos = videos.filter((video) => {
    // Search match
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = video.title.toLowerCase().includes(q);
      const descMatch = video.description.toLowerCase().includes(q);
      const tagsMatch = video.tags.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !tagsMatch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && video.status !== statusFilter) {
      return false;
    }

    // Platform filter
    if (platformFilter !== 'all') {
      const hasPlatformPost = video.posts.some((p) => p.platform === platformFilter);
      const hasPlatformCaption = Boolean(
        video.platformCaptions[platformFilter as PlatformType]
      );
      if (!hasPlatformPost && !hasPlatformCaption) return false;
    }

    return true;
  });

  const getStatusBadge = (status: VideoStatus) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'scheduled':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'ready':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'draft':
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
      case 'failed':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Film className="w-5 h-5 text-violet-400" />
              <span>Video Library</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1b233a] border border-[#2b385e] text-slate-300 font-semibold">
              {filteredVideos.length} clips
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Store raw vertical assets, adjust multi-platform hooks & captions, and trigger publishing.
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Original Video</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Pills */}
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 pl-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Status:
          </span>
          {['all', 'published', 'scheduled', 'ready', 'draft', 'failed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                statusFilter === st
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20'
                  : 'bg-[#12182b] text-slate-400 hover:text-slate-200 border border-[#1e2744]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Platform Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            Target:
          </span>
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="bg-[#12182b] border border-[#1e2744] text-xs text-slate-200 rounded-lg px-2.5 py-1 outline-none focus:border-violet-500 cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="youtube">YouTube Shorts</option>
            <option value="instagram">Instagram Reels</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="p-12 text-center rounded-2xl glass-panel border border-[#1e2744] max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400 mb-4">
            <Film className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No video clips found</h3>
          <p className="text-xs text-slate-400 mt-1.5 mb-5 max-w-sm mx-auto">
            Try adjusting your search criteria or upload your first original 9:16 vertical clip.
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Clip</span>
          </button>
        </div>
      )}

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVideos.map((video) => {
          const totalViews = video.posts.reduce((s, p) => s + (p.views || 0), 0);
          const totalLikes = video.posts.reduce((s, p) => s + (p.likes || 0), 0);
          const publishedPlatforms = video.posts.map((p) => p.platform);

          const hasYT = video.platformCaptions.youtube || publishedPlatforms.includes('youtube');
          const hasIG = video.platformCaptions.instagram || publishedPlatforms.includes('instagram');
          const hasTT = video.platformCaptions.tiktok || publishedPlatforms.includes('tiktok');

          return (
            <div
              key={video.id}
              className="glass-card rounded-2xl overflow-hidden flex flex-col group border border-[#1c253f] hover:border-violet-500/40"
            >
              {/* Media Thumbnail & Overlays */}
              <div
                className="relative aspect-[16/10] bg-[#0d1220] overflow-hidden cursor-pointer"
                onClick={() => setActiveVideoForModal(video)}
              >
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Aspect Ratio & Duration Pill */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-white border border-white/10 font-mono">
                    {video.aspectRatio}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-300 border border-white/10 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {video.durationSeconds}s
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-md ${getStatusBadge(
                      video.status
                    )}`}
                  >
                    {video.status}
                  </span>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-xl shadow-violet-600/40 backdrop-blur-md transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Scheduled Time Banner if applicable */}
                {video.status === 'scheduled' && video.scheduledFor && (
                  <div className="absolute bottom-2 left-3 right-3 px-2 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 backdrop-blur-md text-[11px] text-cyan-200 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">
                      Drops {new Date(video.scheduledFor).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className="text-sm font-semibold text-slate-100 line-clamp-2 cursor-pointer hover:text-violet-300 transition-colors"
                    onClick={() => setActiveVideoForModal(video)}
                  >
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {video.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {video.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#151c30] text-slate-400 border border-[#212c4d]"
                      >
                        #{tag}
                      </span>
                    ))}
                    {video.tags.length > 3 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 text-slate-400">
                        +{video.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats & Platform Targets */}
                <div className="mt-4 pt-3.5 border-t border-[#1a233b] flex items-center justify-between">
                  {/* Channels prepared / published */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">Channels:</span>
                    <div
                      className={`p-1 rounded ${
                        hasYT ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                      }`}
                      title={hasYT ? 'YouTube Shorts configured' : 'Not added to YouTube'}
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </div>
                    <div
                      className={`p-1 rounded ${
                        hasIG ? 'bg-pink-500/20 text-pink-400' : 'bg-slate-800 text-slate-400'
                      }`}
                      title={hasIG ? 'Instagram Reels configured' : 'Not added to Instagram'}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </div>
                    <div
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        hasTT ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
                      }`}
                      title={hasTT ? 'TikTok configured' : 'Not added to TikTok'}
                    >
                      TT
                    </div>
                  </div>

                  {/* Views & Likes pill if published */}
                  {video.status === 'published' ? (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                      <span className="flex items-center gap-1 text-violet-300">
                        <Eye className="w-3 h-3" />
                        {totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
                      </span>
                      <span className="flex items-center gap-1 text-rose-300">
                        <Heart className="w-3 h-3" />
                        {totalLikes > 1000 ? `${(totalLikes / 1000).toFixed(1)}k` : totalLikes}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {video.fileSizeMb} MB original
                    </span>
                  )}
                </div>

                {/* Actions Row */}
                <div className="mt-3 pt-2.5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveVideoForModal(video)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#141b2f] hover:bg-[#1a233d] text-xs font-medium text-slate-200 border border-[#202b4a] transition-colors text-center"
                  >
                    Inspect & Captions
                  </button>

                  {video.status === 'published' ? (
                    <button
                      onClick={() => setActiveVideoForComparison(video)}
                      className="py-1.5 px-2.5 rounded-lg bg-violet-950/40 hover:bg-violet-900/50 text-violet-300 border border-violet-500/30 text-xs font-medium transition-colors"
                      title="Compare cross-platform stats"
                    >
                      Compare
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTab('publishing');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition-all flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>Publish</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
                        deleteVideo(video.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-[#141b2f] hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-[#202b4a] hover:border-rose-500/40 transition-colors"
                    title="Delete clip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

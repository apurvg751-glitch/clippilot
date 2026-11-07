'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  X,
  Film,
  Calendar,
  Clock,
  HardDrive,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Send,
  ExternalLink,
  Edit2,
  Check,
  TrendingUp,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';
import { PlatformType } from '@/types';

export function VideoDetailModal() {
  const {
    activeVideoForModal,
    setActiveVideoForModal,
    setActiveVideoForComparison,
    updatePlatformCaption,
    setActiveTab,
  } = useStore();

  const [activePlatformTab, setActivePlatformTab] = useState<PlatformType>('youtube');
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editCaption, setEditCaption] = useState('');

  if (!activeVideoForModal) return null;

  const video = activeVideoForModal;
  const currentCaption = video.platformCaptions[activePlatformTab]?.caption || '';

  const handleStartEdit = () => {
    setEditCaption(currentCaption || video.description);
    setIsEditingCaption(true);
  };

  const handleSaveEdit = () => {
    updatePlatformCaption(video.id, activePlatformTab, {
      title: video.platformCaptions[activePlatformTab]?.title || video.title,
      caption: editCaption,
      hashtags: video.platformCaptions[activePlatformTab]?.hashtags || [],
    });
    setIsEditingCaption(false);
  };

  const totalViews = video.posts.reduce((s, p) => s + (p.views || 0), 0);
  const totalLikes = video.posts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalComments = video.posts.reduce((s, p) => s + (p.comments || 0), 0);
  const totalShares = video.posts.reduce((s, p) => s + (p.shares || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-[#212b45] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2842] flex items-center justify-between sticky top-0 bg-[#0f1422]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white line-clamp-1">{video.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="capitalize">{video.status}</span>
                <span>•</span>
                <span>Created {new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveVideoForModal(null)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left 9:16 Preview Box */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[260px] aspect-[9/16] rounded-2xl overflow-hidden relative shadow-2xl border-2 border-[#263354] bg-black">
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Top Overlay Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] text-white">
                  <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 font-mono">
                    {video.aspectRatio}
                  </span>
                  <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {video.durationSeconds}s
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-semibold line-clamp-2 drop-shadow">
                    {video.title}
                  </div>
                  <div className="text-[10px] text-slate-300 mt-1 flex items-center gap-2">
                    <span>{video.fileSizeMb} MB</span>
                    <span>•</span>
                    <span className="capitalize">{video.status}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons under Preview */}
              <div className="w-full max-w-[260px] mt-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveVideoForModal(null);
                    setActiveTab('publishing');
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish / Schedule</span>
                </button>

                {video.status === 'published' && (
                  <button
                    onClick={() => {
                      setActiveVideoForModal(null);
                      setActiveVideoForComparison(video);
                    }}
                    className="p-2 rounded-xl bg-violet-950/40 hover:bg-violet-900/50 text-violet-300 border border-violet-500/30 transition-colors"
                    title="Compare across platforms"
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Right Details Column */}
            <div className="md:col-span-7 space-y-5">
              {/* Performance Stats if Published */}
              {video.status === 'published' && (
                <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300">
                      Combined Platform Performance
                    </span>
                    <span className="text-[10px] text-violet-400 font-medium">Non-deduplicated</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded-xl bg-[#0d1220] border border-[#1d263d] text-center">
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Eye className="w-3 h-3 text-violet-400" />
                        <span>Views</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        {totalViews.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0d1220] border border-[#1d263d] text-center">
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span>Likes</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        {totalLikes.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0d1220] border border-[#1d263d] text-center">
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <MessageCircle className="w-3 h-3 text-amber-400" />
                        <span>Comments</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        {totalComments.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-[#0d1220] border border-[#1d263d] text-center">
                      <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                        <Share2 className="w-3 h-3 text-cyan-400" />
                        <span>Shares</span>
                      </div>
                      <div className="text-sm font-bold text-white mt-1">
                        {totalShares.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description & Tags */}
              <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-2">
                <span className="text-xs font-semibold text-slate-300">Description & Tags</span>
                <p className="text-xs text-slate-400 leading-relaxed">{video.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {video.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#182035] text-slate-300 border border-[#263354]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Platform Custom Captions Tab */}
              <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Platform-Specific Captions
                  </span>
                  <div className="flex items-center gap-1 bg-[#0d1220] p-1 rounded-lg border border-[#1f2842]">
                    <button
                      onClick={() => {
                        setActivePlatformTab('youtube');
                        setIsEditingCaption(false);
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                        activePlatformTab === 'youtube'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'text-slate-400'
                      }`}
                    >
                      <Youtube className="w-3 h-3" />
                      <span>Shorts</span>
                    </button>
                    <button
                      onClick={() => {
                        setActivePlatformTab('instagram');
                        setIsEditingCaption(false);
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                        activePlatformTab === 'instagram'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                          : 'text-slate-400'
                      }`}
                    >
                      <Instagram className="w-3 h-3" />
                      <span>Reels</span>
                    </button>
                    <button
                      onClick={() => {
                        setActivePlatformTab('tiktok');
                        setIsEditingCaption(false);
                      }}
                      className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                        activePlatformTab === 'tiktok'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-bold">TT</span>
                      <span>TikTok</span>
                    </button>
                  </div>
                </div>

                {isEditingCaption ? (
                  <div className="space-y-2">
                    <textarea
                      rows={4}
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full bg-[#0d1220] border border-[#263354] rounded-xl p-3 text-xs text-white focus:border-violet-500 outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingCaption(false)}
                        className="px-3 py-1 rounded-lg text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0d1220] rounded-xl p-3 border border-[#1f2842] flex flex-col justify-between min-h-[90px]">
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {currentCaption || 'No platform-specific hook customized yet.'}
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#1f2842] flex justify-end">
                      <button
                        onClick={handleStartEdit}
                        className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit {activePlatformTab} Caption</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Published Platforms List */}
              {video.posts.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#121829] border border-[#212b45] space-y-2.5">
                  <span className="text-xs font-semibold text-slate-300">
                    Live Platform Dispatches
                  </span>
                  <div className="space-y-2">
                    {video.posts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d1220] border border-[#1f2842] text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {post.platform === 'youtube' && <Youtube className="w-4 h-4 text-rose-500" />}
                          {post.platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                          {post.platform === 'tiktok' && (
                            <span className="text-[10px] font-bold text-cyan-400">TT</span>
                          )}
                          <span className="capitalize font-medium text-slate-200">
                            {post.platform}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                            {post.status}
                          </span>
                        </div>

                        {post.externalUrl ? (
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
                          >
                            <span>Open Post</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-500">Scheduled queue</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { PlatformType } from '@/types';
import { MobilePhonePreview } from './MobilePhonePreview';
import {
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Info,
  ShieldCheck,
  Check,
  Film,
  Smartphone,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

export function PublishingCentreView() {
  const {
    videos,
    accounts,
    publishingJob,
    startPublishing,
    cancelPublishing,
    updatePlatformCaption,
    setActiveTab,
  } = useStore();

  // Find a default video
  const availableVideos = videos.filter((v) => v.status !== 'published');
  const [selectedVideoId, setSelectedVideoId] = useState<string>(
    availableVideos[0]?.id || videos[0]?.id || ''
  );

  const selectedVideo = videos.find((v) => v.id === selectedVideoId) || videos[0];

  // Selected destination platforms
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformType[]>([
    'youtube',
    'instagram',
    'tiktok',
  ]);

  // Preview tab platform
  const [previewPlatform, setPreviewPlatform] = useState<PlatformType>('youtube');

  // Publish mode
  const [publishMode, setPublishMode] = useState<'now' | 'schedule'>('now');
  const [scheduledDateTime, setScheduledDateTime] = useState<string>('');

  useEffect(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    d.setMinutes(0);
    setScheduledDateTime(d.toISOString().slice(0, 16));
  }, []);

  // Captions editing
  const [customCaptions, setCustomCaptions] = useState<{
    youtube: string;
    instagram: string;
    tiktok: string;
  }>({
    youtube:
      selectedVideo?.platformCaptions.youtube?.caption ||
      selectedVideo?.description ||
      'Top AI workflow tools in 2026 #Shorts #Tech',
    instagram:
      selectedVideo?.platformCaptions.instagram?.caption ||
      selectedVideo?.description ||
      'Save this for later! ⚡️ #reels #productivity',
    tiktok:
      selectedVideo?.platformCaptions.tiktok?.caption ||
      selectedVideo?.description ||
      'Try this before it gets patched 😳 #fyp #techtok',
  });

  const togglePlatform = (p: PlatformType) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handlePublishClick = () => {
    if (!selectedVideo) return;

    // Save platform captions first
    selectedPlatforms.forEach((p) => {
      updatePlatformCaption(selectedVideo.id, p, {
        title: selectedVideo.platformCaptions[p]?.title || selectedVideo.title,
        caption: customCaptions[p],
        hashtags: selectedVideo.platformCaptions[p]?.hashtags || [],
      });
    });

    startPublishing(
      selectedVideo.id,
      selectedPlatforms,
      publishMode === 'now',
      publishMode === 'schedule' ? scheduledDateTime : undefined
    );
  };

  const ytAccount = accounts.find((a) => a.platform === 'youtube');
  const igAccount = accounts.find((a) => a.platform === 'instagram');
  const ttAccount = accounts.find((a) => a.platform === 'tiktok');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Send className="w-5 h-5 text-violet-400" />
            <span>Publishing Centre</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch original vertical video assets to YouTube Shorts, Instagram Reels, and TikTok via official APIs.
          </p>
        </div>

        {/* Security / Compliance Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Official OAuth 2.0 Connectors Only</span>
        </div>
      </div>

      {/* Main Publishing Workspace: Left Controls / Right Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Video Selector */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Select Source Video From Library</span>
              </label>
              <button
                onClick={() => setActiveTab('library')}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                Browse all {videos.length} videos
              </button>
            </div>

            <select
              value={selectedVideoId}
              onChange={(e) => {
                setSelectedVideoId(e.target.value);
                const vid = videos.find((v) => v.id === e.target.value);
                if (vid) {
                  setCustomCaptions({
                    youtube: vid.platformCaptions.youtube?.caption || vid.description,
                    instagram: vid.platformCaptions.instagram?.caption || vid.description,
                    tiktok: vid.platformCaptions.tiktok?.caption || vid.description,
                  });
                }
              }}
              className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-500 cursor-pointer"
            >
              {videos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title} ({v.durationSeconds}s • {v.aspectRatio} • {v.status.toUpperCase()})
                </option>
              ))}
            </select>

            {/* Selected Video Snapshot Preview */}
            {selectedVideo && (
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#0d1220] border border-[#1f2842]">
                <div className="w-14 h-16 rounded-lg overflow-hidden bg-black shrink-0 relative">
                  <img
                    src={selectedVideo.thumbnailUrl}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 px-1 rounded text-white font-mono">
                    {selectedVideo.durationSeconds}s
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-white truncate">
                    {selectedVideo.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {selectedVideo.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span>{selectedVideo.fileSizeMb} MB</span>
                    <span>•</span>
                    <span>Format: {selectedVideo.aspectRatio} Vertical</span>
                    <span>•</span>
                    <span className="capitalize text-violet-400">{selectedVideo.status}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Target Channels Checkboxes */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Target Publishing Platforms</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* YouTube Shorts */}
              <div
                onClick={() => togglePlatform('youtube')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPlatforms.includes('youtube')
                    ? 'bg-rose-950/30 border-rose-500/60 shadow-lg shadow-rose-950/20'
                    : 'bg-[#111728] border-[#1e2842] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-bold text-white">YouTube Shorts</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center ${
                      selectedPlatforms.includes('youtube')
                        ? 'bg-rose-500 text-white'
                        : 'border border-slate-600'
                    }`}
                  >
                    {selectedPlatforms.includes('youtube') && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 truncate">
                  {ytAccount?.handle || 'YouTube API v3'}
                </div>
              </div>

              {/* Instagram Reels */}
              <div
                onClick={() => togglePlatform('instagram')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPlatforms.includes('instagram')
                    ? 'bg-pink-950/30 border-pink-500/60 shadow-lg shadow-pink-950/20'
                    : 'bg-[#111728] border-[#1e2842] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    <span className="text-xs font-bold text-white">Instagram Reels</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center ${
                      selectedPlatforms.includes('instagram')
                        ? 'bg-pink-500 text-white'
                        : 'border border-slate-600'
                    }`}
                  >
                    {selectedPlatforms.includes('instagram') && <Check className="w-3 h-3" />}
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 truncate">
                  {igAccount?.handle || 'Meta Graph API'}
                </div>
              </div>

              {/* TikTok */}
              <div
                onClick={() => togglePlatform('tiktok')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPlatforms.includes('tiktok')
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                    : 'bg-[#111728] border-[#1e2842] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-cyan-400">TT</span>
                    <span className="text-xs font-bold text-white">TikTok</span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center ${
                      selectedPlatforms.includes('tiktok')
                        ? 'bg-cyan-500 text-black'
                        : 'border border-slate-600'
                    }`}
                  >
                    {selectedPlatforms.includes('tiktok') && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 truncate">
                  {ttAccount?.handle || 'Posting API v2'}
                </div>
              </div>
            </div>

            {/* Platform Requirement Notice */}
            <div className="p-3 rounded-xl bg-[#0d1220] border border-[#1f2842] text-[11px] text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Official API Safety Rule:</strong> No scraping or fake browser sessions. If a platform account is disconnected or requires renewed OAuth permissions, ClipPilot will hold the dispatch and prompt for re-authentication rather than failing silently.
              </span>
            </div>
          </div>

          {/* Step 3: Platform Specific Hook / Caption Customizer */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Customize Platform Hooks & Captions</span>
              </label>
              <div className="flex items-center gap-1 bg-[#121829] p-1 rounded-lg border border-[#212b45]">
                {selectedPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPreviewPlatform(p);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium capitalize transition-colors ${
                      previewPlatform === p
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {previewPlatform === 'youtube' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-rose-400 flex items-center gap-1.5">
                    <Youtube className="w-3.5 h-3.5" /> YouTube Shorts Caption
                  </span>
                  <span>{customCaptions.youtube.length}/5000 characters</span>
                </div>
                <textarea
                  rows={3}
                  value={customCaptions.youtube}
                  onChange={(e) =>
                    setCustomCaptions({ ...customCaptions, youtube: e.target.value })
                  }
                  className="w-full bg-[#121829] border border-[#212b45] rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-rose-500 outline-none resize-none"
                  placeholder="Title, description, and hashtags for YouTube Shorts..."
                />
              </div>
            )}

            {previewPlatform === 'instagram' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-pink-400 flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5" /> Instagram Reels Caption
                  </span>
                  <span>{customCaptions.instagram.length}/2200 characters</span>
                </div>
                <textarea
                  rows={3}
                  value={customCaptions.instagram}
                  onChange={(e) =>
                    setCustomCaptions({ ...customCaptions, instagram: e.target.value })
                  }
                  className="w-full bg-[#121829] border border-[#212b45] rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-pink-500 outline-none resize-none"
                  placeholder="Instagram caption with spacing and hashtag blocks..."
                />
              </div>
            )}

            {previewPlatform === 'tiktok' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-cyan-400 flex items-center gap-1.5">
                    <span className="font-bold text-[10px]">TT</span> TikTok Hook & Caption
                  </span>
                  <span>{customCaptions.tiktok.length}/2200 characters</span>
                </div>
                <textarea
                  rows={3}
                  value={customCaptions.tiktok}
                  onChange={(e) =>
                    setCustomCaptions({ ...customCaptions, tiktok: e.target.value })
                  }
                  className="w-full bg-[#121829] border border-[#212b45] rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 outline-none resize-none"
                  placeholder="Punchy hook and hashtags for TikTok FYP..."
                />
              </div>
            )}
          </div>

          {/* Step 4: Dispatch Options (Publish Now vs Schedule) */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px]">
                4
              </span>
              <span>Publishing Timing</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPublishMode('now')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  publishMode === 'now'
                    ? 'bg-violet-600/25 border-violet-500 text-white shadow-md'
                    : 'bg-[#121829] border-[#212b45] text-slate-400 hover:text-white'
                }`}
              >
                <Send className="w-4 h-4 text-violet-400" />
                <span>Publish Immediately</span>
              </button>

              <button
                type="button"
                onClick={() => setPublishMode('schedule')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                  publishMode === 'schedule'
                    ? 'bg-cyan-600/25 border-cyan-500 text-white shadow-md'
                    : 'bg-[#121829] border-[#212b45] text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Schedule for Later</span>
              </button>
            </div>

            {publishMode === 'schedule' && (
              <div className="p-3 rounded-xl bg-[#0d1220] border border-[#1f2842] flex items-center justify-between gap-4">
                <span className="text-xs text-slate-300 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Target Release Time:
                </span>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="bg-[#151c30] border border-[#212b45] text-xs text-white rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Publishing Progress Bar (if active) */}
            {publishingJob.isPublishing && (
              <div className="p-4 rounded-xl bg-violet-950/40 border border-violet-500/50 space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-medium text-violet-200">
                  <span className="flex items-center gap-2">
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    <span>{publishingJob.stageMessage}</span>
                  </span>
                  <span className="font-mono">{publishingJob.progress}%</span>
                </div>
                <div className="w-full bg-[#141b2e] rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${publishingJob.progress}%` }}
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={cancelPublishing}
                    className="text-[11px] text-rose-400 hover:text-rose-300"
                  >
                    Abort Dispatch
                  </button>
                </div>
              </div>
            )}

            {/* Action Trigger Button */}
            {!publishingJob.isPublishing && (
              <button
                onClick={handlePublishClick}
                disabled={selectedPlatforms.length === 0}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold shadow-xl shadow-violet-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>
                  {publishMode === 'now'
                    ? `Publish Now to ${selectedPlatforms.length} Platform(s)`
                    : `Schedule Dispatch (${selectedPlatforms.length} Channels)`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Phone Mockup Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-20 flex flex-col items-center space-y-3">
            {/* Preview Platform Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0f1422] border border-[#212b45] shadow-lg">
              <span className="text-xs font-medium text-slate-400 px-2 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" /> Preview:
              </span>
              <button
                onClick={() => setPreviewPlatform('youtube')}
                className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors ${
                  previewPlatform === 'youtube'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Shorts
              </button>
              <button
                onClick={() => setPreviewPlatform('instagram')}
                className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors ${
                  previewPlatform === 'instagram'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Reels
              </button>
              <button
                onClick={() => setPreviewPlatform('tiktok')}
                className={`px-3 py-1 text-xs rounded-xl font-medium transition-colors ${
                  previewPlatform === 'tiktok'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                TikTok
              </button>
            </div>

            {/* Mobile Phone Mockup */}
            {selectedVideo && (
              <MobilePhonePreview
                video={selectedVideo}
                platform={previewPlatform}
                customCaption={customCaptions[previewPlatform]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

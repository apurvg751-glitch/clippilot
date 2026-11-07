'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  X,
  UploadCloud,
  Film,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';
import { PlatformType } from '@/types';

const THUMBNAIL_PRESETS = [
  {
    id: 'thumb_1',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    label: 'Abstract AI Neon',
  },
  {
    id: 'thumb_2',
    url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&auto=format&fit=crop&q=80',
    label: 'Workspace Desk',
  },
  {
    id: 'thumb_3',
    url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
    label: 'Studio Lighting',
  },
  {
    id: 'thumb_4',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    label: 'Coffee & Laptop',
  },
];

export function VideoUploadModal() {
  const { isUploadModalOpen, setIsUploadModalOpen, addVideo } = useStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedThumbnail, setSelectedThumbnail] = useState(THUMBNAIL_PRESETS[0].url);
  const [duration, setDuration] = useState(45);
  const [fileSize, setFileSize] = useState(32.4);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [status, setStatus] = useState<'draft' | 'ready'>('ready');
  
  // Platform custom captions tab
  const [activeTab, setActiveTab] = useState<PlatformType>('youtube');
  const [ytTitle, setYtTitle] = useState('');
  const [ytCaption, setYtCaption] = useState('');
  const [igCaption, setIgCaption] = useState('');
  const [ttCaption, setTtCaption] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  if (!isUploadModalOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    // Auto populate title if blank
    if (!title) {
      const cleanedName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanedName);
    }
    const sizeInMb = Number((file.size / (1024 * 1024)).toFixed(1));
    setFileSize(sizeInMb > 0 ? sizeInMb : 28.5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    addVideo({
      title,
      description: description || 'Vertical video clip ready for multi-channel distribution.',
      tags: tags.length > 0 ? tags : ['shorts', 'creator', 'viral'],
      thumbnailUrl: selectedThumbnail,
      durationSeconds: Number(duration) || 30,
      fileSizeMb: Number(fileSize) || 25,
      aspectRatio,
      status,
      platformCaptions: {
        youtube: {
          title: ytTitle || `${title} #Shorts`,
          caption: ytCaption || description,
          hashtags: ['#Shorts', '#Creator'],
        },
        instagram: {
          caption: igCaption || `${description}\n\n#reels #creator #trending`,
          hashtags: ['#reels', '#creator'],
        },
        tiktok: {
          caption: ttCaption || `${title} #fyp #viral`,
          hashtags: ['#fyp', '#viral'],
        },
      },
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setTagsInput('');
    setUploadedFileName(null);
    setIsUploadModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border border-[#212b45] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2842] flex items-center justify-between sticky top-0 bg-[#0f1422]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Upload Original Video Clip</h2>
              <p className="text-xs text-slate-400">Ingest original high-res 9:16 assets into ClipPilot</p>
            </div>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              dragActive
                ? 'border-violet-500 bg-violet-950/20'
                : 'border-[#263252] hover:border-violet-500/50 bg-[#121829]'
            }`}
          >
            <input
              type="file"
              id="video-file-input"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={handleFileInput}
              className="hidden"
            />
            <label htmlFor="video-file-input" className="cursor-pointer block">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-3">
                <Film className="w-6 h-6" />
              </div>
              {uploadedFileName ? (
                <div>
                  <div className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Selected: {uploadedFileName}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {fileSize} MB • Click to replace file
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-semibold text-slate-200">
                    Drag and drop your vertical video file here
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports MP4, MOV, WEBM (up to 250MB, recommended 9:16 under 60 seconds)
                  </p>
                  <span className="mt-3 inline-block px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-violet-300 text-xs font-medium border border-violet-500/40">
                    Browse Local File
                  </span>
                </div>
              )}
            </label>
          </div>

          {/* Primary Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Master Video Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 3 AI Tools That Will Save You 10 Hours"
                className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 outline-none"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">
                Description / Core Hook
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Core premise, points covered, or creator notes..."
                className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="ai, productivity, viral, tech"
                className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:border-violet-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:border-violet-500 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#121829] border border-[#212b45] rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-violet-500 outline-none"
                >
                  <option value="ready">Ready to Publish</option>
                  <option value="draft">Draft (Editing)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Thumbnail Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Cover Thumbnail Poster</span>
              <span className="text-[11px] text-slate-400 font-normal">Choose representative frame</span>
            </label>
            <div className="grid grid-cols-4 gap-3">
              {THUMBNAIL_PRESETS.map((thumb) => (
                <div
                  key={thumb.id}
                  onClick={() => setSelectedThumbnail(thumb.url)}
                  className={`relative rounded-xl overflow-hidden aspect-[9/14] border-2 cursor-pointer transition-all ${
                    selectedThumbnail === thumb.url
                      ? 'border-violet-500 ring-2 ring-violet-500/30 scale-102'
                      : 'border-[#263354] hover:border-slate-500'
                  }`}
                >
                  <img
                    src={thumb.url}
                    alt={thumb.label}
                    className="w-full h-full object-cover"
                  />
                  {selectedThumbnail === thumb.url && (
                    <div className="absolute top-1 right-1 bg-violet-600 rounded-full p-0.5 text-white">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white p-1 text-center truncate">
                    {thumb.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Specific Captions Tab */}
          <div className="space-y-3 pt-2 border-t border-[#1f2842]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Channel-Specific Captions & Hooks (Optional)</span>
              </label>
              <div className="flex items-center gap-1 bg-[#121829] p-1 rounded-lg border border-[#212b45]">
                <button
                  type="button"
                  onClick={() => setActiveTab('youtube')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'youtube'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Youtube className="w-3 h-3" />
                  <span>Shorts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('instagram')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'instagram'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Instagram className="w-3 h-3" />
                  <span>Reels</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tiktok')}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                    activeTab === 'tiktok'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-bold">TT</span>
                  <span>TikTok</span>
                </button>
              </div>
            </div>

            {activeTab === 'youtube' && (
              <div className="space-y-2 bg-[#121829] p-3.5 rounded-xl border border-[#212b45]">
                <input
                  type="text"
                  value={ytTitle}
                  onChange={(e) => setYtTitle(e.target.value)}
                  placeholder="YouTube Shorts Title (includes #Shorts by default)"
                  className="w-full bg-[#0d1220] border border-[#1f2842] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-500"
                />
                <textarea
                  rows={2}
                  value={ytCaption}
                  onChange={(e) => setYtCaption(e.target.value)}
                  placeholder="YouTube description & pinned comment notes..."
                  className="w-full bg-[#0d1220] border border-[#1f2842] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-rose-500 resize-none"
                />
              </div>
            )}

            {activeTab === 'instagram' && (
              <div className="space-y-2 bg-[#121829] p-3.5 rounded-xl border border-[#212b45]">
                <textarea
                  rows={3}
                  value={igCaption}
                  onChange={(e) => setIgCaption(e.target.value)}
                  placeholder="Instagram caption with line breaks and 15-25 targeted hashtags..."
                  className="w-full bg-[#0d1220] border border-[#1f2842] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-pink-500 resize-none"
                />
              </div>
            )}

            {activeTab === 'tiktok' && (
              <div className="space-y-2 bg-[#121829] p-3.5 rounded-xl border border-[#212b45]">
                <textarea
                  rows={2}
                  value={ttCaption}
                  onChange={(e) => setTtCaption(e.target.value)}
                  placeholder="Punchy TikTok hook caption with #fyp #viral tags (keep under 150 chars)..."
                  className="w-full bg-[#0d1220] border border-[#1f2842] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 resize-none"
                />
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-[#1f2842] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Save Clip to Library
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

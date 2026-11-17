'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import {
  Scissors,
  Sparkles,
  Play,
  Pause,
  Film,
  Send,
  Wand2,
  Tv,
  CheckCircle2,
  Clock,
  Layers,
  Flame,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sliders,
  Check,
  Video,
  X,
  Volume2,
  VolumeX,
  Type,
  Palette,
  AlignLeft,
  Plus,
  Trash2,
  Eye,
  Download,
  AlertCircle,
  FolderOpen,
  Folder,
} from 'lucide-react';
import { YoutubeIcon as Youtube } from '@/components/common/PlatformIcons';
import { saveVideoFile } from '@/lib/video-file-store';

interface SubtitleLine {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
}

interface ManiClipItem {
  id: string;
  projectId: string;
  projectName: string;
  videoTitle: string;
  clipIndex: number;
  fileName: string;
  absolutePath: string;
  streamUrl: string;
  downloadUrl: string;
  fileSizeMb: number;
  durationSec: number;
  hotScore: number;
  captionStyle: string;
  captions: Array<{ startSec: number; endSec: number; text: string }>;
}

interface ManiProjectGroup {
  id: string;
  name: string;
  videoTitle: string;
  folderPath: string;
  clipCount: number;
  clips: ManiClipItem[];
}

export function AIClipperStudioView() {
  const { addVideo, setActiveTab, addToast } = useStore();

  const [activeMode, setActiveMode] = useState<'vault' | 'render'>('vault');

  // Vault state
  const [projects, setProjects] = useState<ManiProjectGroup[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedClip, setSelectedClip] = useState<ManiClipItem | null>(null);
  const [isLoadingVault, setIsLoadingVault] = useState(false);

  // New URL render state
  const [videoUrl, setVideoUrl] = useState('');
  const [clipLength, setClipLength] = useState<30 | 45 | 60>(30);
  const [captionStyle, setCaptionStyle] = useState<'neon-glow' | 'hormozi' | 'beast'>('neon-glow');
  const [fontSize, setFontSize] = useState<number>(20);

  // Real render state
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Subtitles state
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([
    { id: 'sub_1', startSec: 0.0, endSec: 3.5, text: 'Wait until you see how this plays out...' },
    { id: 'sub_2', startSec: 3.5, endSec: 8.0, text: 'Look at the background reaction right now!' },
    { id: 'sub_3', startSec: 8.0, endSec: 14.5, text: 'Nobody expected this insane move 💀' },
    { id: 'sub_4', startSec: 14.5, endSec: 22.0, text: 'Drop a like and subscribe to MASTERDOM!' },
  ]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load Mani Clips projects and clips from disk on mount
  const loadManiClipsVault = async () => {
    setIsLoadingVault(true);
    try {
      const res = await fetch('/api/maniclips');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          const firstProj = data.projects[0];
          setSelectedProjectId(firstProj.id);
          if (firstProj.clips.length > 0) {
            const firstClip = firstProj.clips[0];
            setSelectedClip(firstClip);
            if (firstClip.captions && firstClip.captions.length > 0) {
              setSubtitles(
                firstClip.captions.map((c: any, i: number) => ({
                  id: `sub_${i}`,
                  startSec: Math.round(c.startSec * 10) / 10,
                  endSec: Math.round(c.endSec * 10) / 10,
                  text: c.text,
                }))
              );
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load Mani Clips vault:', err);
    } finally {
      setIsLoadingVault(false);
    }
  };

  useEffect(() => {
    loadManiClipsVault();
  }, []);

  // When project selection changes, update clips
  const handleSelectProject = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find((p) => p.id === projId);
    if (proj && proj.clips.length > 0) {
      const firstClip = proj.clips[0];
      setSelectedClip(firstClip);
      if (firstClip.captions && firstClip.captions.length > 0) {
        setSubtitles(
          firstClip.captions.map((c: any, i: number) => ({
            id: `sub_${i}`,
            startSec: Math.round(c.startSec * 10) / 10,
            endSec: Math.round(c.endSec * 10) / 10,
            text: c.text,
          }))
        );
      }
    }
  };

  const handleSelectClip = (clip: ManiClipItem) => {
    setSelectedClip(clip);
    if (clip.captions && clip.captions.length > 0) {
      setSubtitles(
        clip.captions.map((c: any, i: number) => ({
          id: `sub_${i}`,
          startSec: Math.round(c.startSec * 10) / 10,
          endSec: Math.round(c.endSec * 10) / 10,
          text: c.text,
        }))
      );
    }
  };

  const handleStartRealRender = async () => {
    const trimmed = videoUrl.trim();
    if (!trimmed) {
      addToast('error', 'Please enter a real YouTube video URL.');
      return;
    }

    if (!trimmed.includes('youtube.com') && !trimmed.includes('youtu.be')) {
      addToast('error', 'Invalid URL! Please enter a valid YouTube video link.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Connecting to Mani Clips engine (yt-dlp)... Downloading video stream...');

    try {
      const res = await fetch('/api/clipper/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: trimmed,
          clipLength,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to render short.');
      }

      const newClip: ManiClipItem = {
        id: `render_${Date.now()}`,
        projectId: 'Recent Ingestion',
        projectName: 'Recent Ingestion',
        videoTitle: data.title,
        clipIndex: 0,
        fileName: `${data.title}.mp4`,
        absolutePath: data.videoPath,
        streamUrl: data.streamUrl,
        downloadUrl: data.downloadUrl,
        fileSizeMb: data.fileSizeMb,
        durationSec: data.durationSeconds,
        hotScore: 88.5,
        captionStyle: captionStyle,
        captions: [],
      };

      setSelectedClip(newClip);
      addToast('success', `Rendered "${data.title}" in 9:16 vertical format!`);
      // Reload vault to refresh newly created files
      loadManiClipsVault();
    } catch (err: any) {
      addToast('error', `Rendering error: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  const handlePublishToMasterdom = async () => {
    if (!selectedClip) {
      addToast('error', 'Please select or render a video first.');
      return;
    }

    try {
      addToast('info', 'Preparing video file for YouTube upload...');
      const videoRes = await fetch(selectedClip.streamUrl);
      if (!videoRes.ok) throw new Error('Could not read rendered video file.');

      const blob = await videoRes.blob();
      const file = new File([blob], `${selectedClip.videoTitle}.mp4`, { type: 'video/mp4' });

      const captionText = subtitles.map((s) => s.text).join(' ');

      const newVideoId = addVideo(
        {
          title: `${selectedClip.videoTitle} #Shorts`,
          description: `${captionText}\n\n#Shorts #Gaming #Viral #MASTERDOM`,
          tags: ['Shorts', 'Gaming', 'Viral', 'MASTERDOM'],
          thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
          durationSeconds: selectedClip.durationSec,
          fileSizeMb: selectedClip.fileSizeMb,
          aspectRatio: '9:16',
          status: 'ready',
          platformCaptions: {
            youtube: {
              title: `${selectedClip.videoTitle} #Shorts`,
              caption: `${captionText}\n\n#Shorts #Gaming #Viral #MASTERDOM`,
              hashtags: ['#Shorts', '#Gaming', '#Viral', '#MASTERDOM'],
            },
            instagram: {
              caption: `${captionText}\n\n#reels #gaming`,
              hashtags: ['#reels', '#gaming'],
            },
            tiktok: {
              caption: `${selectedClip.videoTitle} #fyp #viral`,
              hashtags: ['#fyp', '#viral'],
            },
          },
        },
        file
      );

      saveVideoFile(newVideoId, file);
      addToast('success', 'Video file attached! Redirecting to Publishing Centre...');
      setActiveTab('publishing');
    } catch (err: any) {
      addToast('error', `Failed to prepare upload: ${err.message}`);
    }
  };

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Scissors className="w-5 h-5 text-violet-400" />
              <span>Mani Clips AI Engine Studio</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              D:\Mani Clips Engine Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real multi-clip generation and playback using bundled <strong>yt-dlp</strong>, <strong>FFmpeg 8.1.2</strong>, and local <strong>Whisper AI</strong>.
          </p>
        </div>

        {/* Channel Badge & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#111728] p-1 rounded-xl border border-[#202c4b]">
            <button
              onClick={() => setActiveMode('vault')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeMode === 'vault'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Mani Clips Vault ({projects.reduce((acc, p) => acc + p.clipCount, 0)} Clips)</span>
            </button>
            <button
              onClick={() => setActiveMode('render')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeMode === 'render'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Render New URL</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-medium">
            <Youtube className="w-4 h-4 text-rose-500" />
            <span>MASTERDOM</span>
          </div>
        </div>
      </div>

      {/* Mode A: Mani Clips Vault Project & Clip Selector */}
      {activeMode === 'vault' && (
        <div className="p-5 rounded-3xl glass-panel border border-[#212b45] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Folder className="w-4 h-4 text-cyan-400" />
                <span>Detected Mani Clips Projects in Documents</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Choose a project below to audition its generated vertical clips with HotScores.
              </p>
            </div>
            <button
              onClick={loadManiClipsVault}
              disabled={isLoadingVault}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isLoadingVault ? 'animate-spin' : ''}`} />
              <span>Refresh Vault</span>
            </button>
          </div>

          {/* Project Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => handleSelectProject(proj.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  selectedProjectId === proj.id
                    ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                    : 'bg-[#111728] text-slate-400 hover:text-white border-[#1f2842]'
                }`}
              >
                <span>{proj.videoTitle}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/40 font-mono">
                  {proj.clipCount} clips
                </span>
              </button>
            ))}
          </div>

          {/* Multi-Clip Grid / Carousel */}
          {currentProject && currentProject.clips.length > 0 && (
            <div className="pt-2 border-t border-[#1a233a] space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">
                  Available Vertical Clips in &ldquo;{currentProject.videoTitle}&rdquo;:
                </span>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Ranked by HotScore (Virality)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {currentProject.clips.map((clip) => {
                  const isSelected = selectedClip?.id === clip.id;
                  return (
                    <button
                      key={clip.id}
                      onClick={() => handleSelectClip(clip)}
                      className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-violet-600/20 border-cyan-400 shadow-lg shadow-cyan-500/10'
                          : 'bg-[#0f1422] border-[#1d263d] hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-white">
                          Clip #{clip.clipIndex + 1}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 fill-current" />
                          <span>{clip.hotScore}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {clip.fileName}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{clip.durationSec}s</span>
                        <span>{clip.fileSizeMb} MB</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Render New YouTube Video */}
      {activeMode === 'render' && (
        <div className="p-6 rounded-3xl glass-panel border border-[#212b45] space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-violet-400" /> YouTube Video URL
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=...)"
              className="w-full bg-[#111728] border border-[#202c4b] rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500 transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-400" /> Clip Length
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 45, 60].map((len) => (
                  <button
                    key={len}
                    onClick={() => setClipLength(len as 30 | 45 | 60)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      clipLength === len
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {len}s
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-rose-400" /> Canvas Rendering
              </label>
              <div className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/60 text-xs text-rose-300 flex items-center justify-between font-mono">
                <span>9:16 Gaussian Blur</span>
                <span>1080x1920</span>
              </div>
            </div>
          </div>

          {/* Action Button & Status */}
          {isProcessing ? (
            <div className="p-4 rounded-2xl bg-violet-950/40 border border-violet-500/50 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-xs font-medium text-violet-200">
                <RotateCcw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{statusMessage}</span>
              </div>
              <div className="w-full bg-[#141b2e] rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 h-1.5 rounded-full animate-pulse w-full" />
              </div>
            </div>
          ) : (
            <button
              onClick={handleStartRealRender}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-500 text-white text-sm font-bold shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Render Real 9:16 Video with Mani Clips Engine</span>
            </button>
          )}
        </div>
      )}

      {/* Main Studio Viewport: Real Video Player on Left + Live Subtitle Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 9:16 Vertical Phone Simulator with REAL VIDEO PLAYER */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                <span>Real 9:16 Video Player</span>
              </span>
              {selectedClip && (
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>Score: {selectedClip.hotScore}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {selectedClip.fileSizeMb} MB
                  </span>
                </div>
              )}
            </div>

            {/* Mobile Phone Bezel with REAL HTML5 VIDEO */}
            <div className="relative aspect-[9/16] w-full bg-black rounded-[2.5rem] border-4 border-[#222b42] overflow-hidden shadow-2xl flex flex-col justify-between">
              {selectedClip ? (
                <video
                  key={selectedClip.streamUrl}
                  ref={videoRef}
                  src={selectedClip.streamUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#0a0d17]">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center text-violet-400">
                    <Film className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">No Video Selected</p>
                    <p className="text-[11px] text-slate-400">
                      Select a clip from the Mani Clips Vault above or paste a YouTube URL to render.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Prominent Direct 1-Click Download Button */}
            {selectedClip && (
              <a
                href={selectedClip.downloadUrl}
                download={selectedClip.fileName}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download Video (MP4) • {selectedClip.fileSizeMb} MB</span>
              </a>
            )}
          </div>
        </div>

        {/* Right: Subtitle Editor & Styling Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Clip Metadata */}
          {selectedClip && (
            <div className="p-4 rounded-2xl bg-[#111728] border border-[#202c4b] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  Active Clip Source
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">
                  {selectedClip.videoTitle}
                </h4>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  File: {selectedClip.fileName} • Duration: {selectedClip.durationSec}s
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                1080x1920 (9:16)
              </span>
            </div>
          )}

          {/* Subtitle Style Bar */}
          <div className="p-5 rounded-3xl glass-panel border border-[#212b45] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" /> Subtitle Presets
              </span>
              <span className="text-[11px] text-slate-400">
                Matches Mani Clips styles
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'neon-glow', label: 'Neon Glow (Mani)', desc: 'Cyan glowing outline' },
                { id: 'hormozi', label: 'Alex Hormozi', desc: 'Bouncing yellow & green' },
                { id: 'beast', label: 'MrBeast', desc: 'High contrast black stroke' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setCaptionStyle(style.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    captionStyle === style.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-[#111728] border-[#1f2842] text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{style.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[#1a233a]">
              <label className="text-[11px] text-slate-400 block mb-1">
                Font Size ({fontSize}px)
              </label>
              <input
                type="range"
                min="16"
                max="28"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Subtitle Lines Editor */}
          <div className="p-5 rounded-3xl glass-panel border border-[#212b45] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Type className="w-4 h-4 text-violet-400" />
                  <span>Subtitle Slides Editor</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real subtitle text extracted from Whisper AI. Edit text inline below.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {subtitles.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl border bg-[#0f1422] border-[#1d263d] flex items-center gap-3"
                >
                  <span className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px] font-mono text-cyan-300 shrink-0">
                    {sub.startSec}s - {sub.endSec}s
                  </span>
                  <input
                    type="text"
                    value={sub.text}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSubtitles((prev) =>
                        prev.map((s) => (s.id === sub.id ? { ...s, text: val } : s))
                      );
                    }}
                    className="flex-1 bg-transparent text-xs text-white outline-none font-medium focus:text-cyan-200"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Publish Action Footer */}
          <div className="p-5 rounded-3xl glass-panel border border-[#212b45] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Publish Directly to YouTube</h4>
              <p className="text-[11px] text-slate-400">
                Dispatches the rendered MP4 file straight to <strong>MASTERDOM</strong> via Google API.
              </p>
            </div>

            <button
              onClick={handlePublishToMasterdom}
              disabled={!selectedClip}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 via-violet-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 disabled:opacity-40 text-white text-xs font-bold shadow-xl shadow-rose-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Publish Short to MASTERDOM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VideoItem, PlatformType } from '@/types';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';
import { getVideoFile } from '@/lib/video-file-store';

interface MobilePhonePreviewProps {
  video?: VideoItem | null;
  platform: PlatformType;
  customCaption?: string;
  customTitle?: string;
}

export function MobilePhonePreview({
  video,
  platform,
  customCaption,
  customTitle,
}: MobilePhonePreviewProps) {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const displayCaption =
    customCaption ||
    video?.platformCaptions?.[platform]?.caption ||
    video?.description ||
    'Your video caption and hashtags will appear here...';

  const displayTitle =
    customTitle ||
    video?.platformCaptions?.[platform]?.title ||
    video?.title ||
    'Vertical Clip Title';

  useEffect(() => {
    if (!video) {
      setVideoSrc(null);
      return;
    }

    // Check if real video File is cached in memory
    const file = getVideoFile(video.id);
    if (file) {
      const objUrl = URL.createObjectURL(file);
      setVideoSrc(objUrl);
      return () => URL.revokeObjectURL(objUrl);
    }

    // Or check if video has direct videoUrl or streamUrl
    if (video.videoUrl) {
      setVideoSrc(video.videoUrl);
    } else {
      setVideoSrc(null);
    }
  }, [video]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  return (
    <div className="w-[300px] h-[600px] rounded-[44px] bg-[#05070c] border-[7px] border-[#222c47] relative overflow-hidden shadow-2xl flex flex-col justify-between shrink-0 select-none ring-1 ring-white/10 group">
      {/* Top Phone Speaker / Notch */}
      <div className="absolute top-2 inset-x-0 flex justify-center z-30 pointer-events-none">
        <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#111] mr-3" />
          <div className="w-10 h-1 bg-[#222] rounded-full" />
        </div>
      </div>

      {/* Real Video Player or Thumbnail */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            playsInline
            loop
            muted={isMuted}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />
        ) : video?.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#131b2e] border border-[#233152] flex items-center justify-center mx-auto text-violet-400">
              <Film className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-400">9:16 Vertical Video Preview</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Top Header bar within phone */}
      <div className="relative z-20 pt-8 px-4 flex items-center justify-between text-white text-xs font-semibold">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          {platform === 'youtube' && <Youtube className="w-3.5 h-3.5 text-rose-500" />}
          {platform === 'instagram' && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
          {platform === 'tiktok' && <span className="text-[10px] text-cyan-400 font-bold">TT</span>}
          <span className="capitalize">{platform === 'youtube' ? 'Shorts' : platform === 'instagram' ? 'Reels' : 'TikTok'}</span>
        </div>

        {/* Video Player Quick Controls */}
        {videoSrc && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-black/80 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
            </button>
            <button
              onClick={toggleMute}
              className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10 text-white hover:bg-black/80 transition-all"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {/* Floating Right Action Icons */}
      <div className="relative z-20 self-end pr-3 pb-24 flex flex-col items-center gap-3.5 text-white text-[11px] font-semibold">
        {platform === 'youtube' ? (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <ThumbsUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px]">Like</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <ThumbsDown className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px]">Dislike</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px]">Chat</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px]">Share</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px]">Like</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px]">Comment</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Bookmark className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px]">Save</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-[10px]">Share</span>
            </div>
          </>
        )}

        {/* 1-Click Download button directly on phone */}
        {videoSrc && (
          <a
            href={videoSrc}
            download={`${video?.title || 'short_clip'}.mp4`}
            className="flex flex-col items-center gap-1 text-cyan-300 hover:text-cyan-200 transition-colors"
            title="Download MP4 Video"
          >
            <div className="w-9 h-9 rounded-full bg-cyan-950/80 backdrop-blur-md flex items-center justify-center border border-cyan-500/50 shadow-lg shadow-cyan-500/20">
              <Download className="w-4 h-4 text-cyan-300" />
            </div>
            <span className="text-[9px] font-bold">Download</span>
          </a>
        )}
      </div>

      {/* Bottom Content / Caption */}
      <div className="relative z-20 pb-6 px-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 p-[1.5px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
              M
            </div>
          </div>
          <span className="text-xs font-bold text-white shadow-sm">
            @apurvg-p9m
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-semibold">
            Subscribe
          </span>
        </div>

        {platform === 'youtube' && (
          <h4 className="text-xs font-semibold text-white line-clamp-1 drop-shadow-md">
            {displayTitle}
          </h4>
        )}

        <p className="text-[11px] text-slate-200 line-clamp-2 leading-relaxed drop-shadow-md">
          {displayCaption}
        </p>

        <div className="flex items-center justify-between text-[10px] text-slate-300">
          <div className="flex items-center gap-1">
            <Music className="w-3 h-3 text-cyan-400" />
            <span className="truncate max-w-[140px]">Original Audio • MASTERDOM</span>
          </div>
          {videoSrc && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] border border-emerald-500/30">
              LIVE MP4
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

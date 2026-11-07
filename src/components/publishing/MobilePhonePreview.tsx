'use client';

import React from 'react';
import { VideoItem, PlatformType } from '@/types';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Music,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

interface MobilePhonePreviewProps {
  video: VideoItem;
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
  const displayCaption =
    customCaption ||
    video.platformCaptions[platform]?.caption ||
    video.description;

  const displayTitle =
    customTitle ||
    video.platformCaptions[platform]?.title ||
    video.title;

  return (
    <div className="w-[300px] h-[600px] rounded-[44px] bg-[#05070c] border-[7px] border-[#222c47] relative overflow-hidden shadow-2xl flex flex-col justify-between shrink-0 select-none ring-1 ring-white/10">
      {/* Top Phone Speaker / Notch */}
      <div className="absolute top-2 inset-x-0 flex justify-center z-30 pointer-events-none">
        <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#111] mr-3" />
          <div className="w-10 h-1 bg-[#222] rounded-full" />
        </div>
      </div>

      {/* Video Background Image */}
      <div className="absolute inset-0 bg-black">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
      </div>

      {/* Top Header Overlay depending on platform */}
      <div className="relative z-20 pt-8 px-4 flex items-center justify-between text-white text-xs font-semibold drop-shadow">
        {platform === 'youtube' && (
          <>
            <div className="flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="font-bold tracking-tight">Shorts</span>
            </div>
            <MoreVertical className="w-4 h-4 text-white/80" />
          </>
        )}

        {platform === 'instagram' && (
          <>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-sm">Reels</span>
            </div>
            <Instagram className="w-4 h-4 text-white/80" />
          </>
        )}

        {platform === 'tiktok' && (
          <div className="w-full flex items-center justify-center gap-4 text-xs font-bold text-white/70">
            <span>Following</span>
            <span className="text-white border-b-2 border-white pb-0.5">For You</span>
          </div>
        )}
      </div>

      {/* Right Side Action Bar (Vertical Stack) */}
      <div className="relative z-20 self-end mr-3 mb-20 flex flex-col items-center gap-4 text-white drop-shadow">
        {platform === 'youtube' && (
          <>
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
                <ThumbsUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold mt-1">14.2K</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
                <ThumbsDown className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-medium mt-1">Dislike</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold mt-1">420</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-medium mt-1">Share</span>
            </div>
          </>
        )}

        {platform === 'instagram' && (
          <>
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">9,820</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">310</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2.5 rounded-full bg-black/30 backdrop-blur-md">
                <Bookmark className="w-5 h-5 text-white" />
              </div>
            </div>
          </>
        )}

        {platform === 'tiktok' && (
          <>
            {/* Creator avatar with plus icon */}
            <div className="relative mb-2">
              <div className="w-9 h-9 rounded-full ring-2 ring-white overflow-hidden bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                +
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-black/30 backdrop-blur-md">
                <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">48.2K</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-black/30 backdrop-blur-md">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">1.2K</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-black/30 backdrop-blur-md">
                <Bookmark className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">3.8K</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 rounded-full bg-black/30 backdrop-blur-md">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold mt-0.5">950</span>
            </div>

            {/* Spinning Music Vinyl Disc */}
            <div className="w-7 h-7 rounded-full bg-[#111] border-2 border-slate-700 flex items-center justify-center animate-spin">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
          </>
        )}
      </div>

      {/* Bottom Creator Info & Caption Area */}
      <div className="relative z-20 pb-6 px-4 text-white drop-shadow-md">
        {/* Creator Channel Row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-violet-600 ring-1 ring-white/50 overflow-hidden shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">
              {platform === 'youtube'
                ? '@AlexRiveraClips'
                : platform === 'instagram'
                ? 'alexrivera.creates'
                : '@alexrivera_official'}
            </div>
          </div>
          {platform === 'youtube' && (
            <button className="px-2 py-0.5 rounded-full bg-white text-black text-[10px] font-bold ml-1">
              Subscribe
            </button>
          )}
          {platform === 'instagram' && (
            <button className="text-[11px] font-semibold text-white/90 border border-white/40 px-2 py-0.5 rounded-md ml-1">
              Follow
            </button>
          )}
        </div>

        {/* Video Title / Caption */}
        <div className="text-xs leading-snug line-clamp-2 text-slate-100 font-medium">
          {platform === 'youtube' ? displayTitle : displayCaption}
        </div>

        {/* Sound / Music bar */}
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-300 font-medium">
          <Music className="w-3 h-3 text-cyan-400" />
          <span className="truncate">Original audio — Alex Rivera • Trending sound</span>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
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
} from 'lucide-react';
import { YoutubeIcon as Youtube, InstagramIcon as Instagram } from '@/components/common/PlatformIcons';

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

  return (
    <div className="w-[300px] h-[600px] rounded-[44px] bg-[#05070c] border-[7px] border-[#222c47] relative overflow-hidden shadow-2xl flex flex-col justify-between shrink-0 select-none ring-1 ring-white/10">
      {/* Top Phone Speaker / Notch */}
      <div className="absolute top-2 inset-x-0 flex justify-center z-30 pointer-events-none">
        <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-[#111] mr-3" />
          <div className="w-10 h-1 bg-[#222] rounded-full" />
        </div>
      </div>

      {/* Video Background Image or Placeholder */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        {video?.thumbnailUrl ? (
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

      {/* Header bar within phone */}
      <div className="relative z-20 pt-8 px-4 flex items-center justify-between text-white text-xs font-semibold">
        <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          {platform === 'youtube' && <Youtube className="w-3.5 h-3.5 text-rose-500" />}
          {platform === 'instagram' && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
          {platform === 'tiktok' && <span className="text-[10px] text-cyan-400 font-bold">TT</span>}
          <span className="capitalize">{platform === 'youtube' ? 'Shorts' : platform === 'instagram' ? 'Reels' : 'TikTok'}</span>
        </div>
        <div className="text-[11px] text-slate-300 font-mono">9:16</div>
      </div>

      {/* Floating Right Action Icons */}
      <div className="relative z-20 self-end pr-3 pb-24 flex flex-col items-center gap-4 text-white text-[11px] font-semibold">
        {platform === 'youtube' ? (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <ThumbsUp className="w-4 h-4 text-white" />
              </div>
              <span>Like</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <ThumbsDown className="w-4 h-4 text-white" />
              </div>
              <span>Dislike</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span>Chat</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <span>Share</span>
            </div>
          </>
        ) : platform === 'instagram' ? (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span>Like</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span>Comment</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <span>Share</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Bookmark className="w-4 h-4 text-white" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <span>Heart</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span>Comment</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Bookmark className="w-4 h-4 text-white" />
              </div>
              <span>Save</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <span>Share</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom Content / Caption */}
      <div className="relative z-20 pb-6 px-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 p-[1.5px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
              A
            </div>
          </div>
          <span className="text-xs font-bold text-white shadow-sm">
            @apurvg-p9m
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-semibold">
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

        <div className="flex items-center gap-1 text-[10px] text-slate-300">
          <Music className="w-3 h-3 text-cyan-400" />
          <span className="truncate">Original Audio • @apurvg-p9m</span>
        </div>
      </div>
    </div>
  );
}

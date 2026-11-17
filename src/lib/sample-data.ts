import { VideoItem, SocialAccount, DailyAnalyticsSnapshot, ContentIdea } from '@/types';

export const SAMPLE_ACCOUNTS: SocialAccount[] = [
  {
    id: 'acc_yt',
    platform: 'youtube',
    platformName: 'YouTube Shorts',
    handle: '@apurvg-p9m',
    displayName: 'MASTERDOM',
    avatarUrl: '',
    isConnected: true,
    status: 'connected',
    followersOrSubscribers: 0,
    totalViews: 0,
    totalLikes: 0,
    lastSyncAt: '2026-11-07T13:15:35.000Z',
    scopes: ['youtube.upload', 'youtube.readonly', 'yt-analytics.readonly'],
  },
  {
    id: 'acc_ig',
    platform: 'instagram',
    platformName: 'Instagram Reels',
    handle: '@masterdom713',
    displayName: 'Masterdom',
    avatarUrl: '/masterdom_logo.jpg',
    isConnected: true,
    status: 'connected',
    followersOrSubscribers: 0,
    totalViews: 0,
    totalLikes: 0,
    lastSyncAt: new Date().toISOString(),
    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_show_list'],
  },
  {
    id: 'acc_tt',
    platform: 'tiktok',
    platformName: 'TikTok',
    handle: 'Not Connected',
    displayName: 'TikTok Account',
    avatarUrl: '',
    isConnected: false,
    status: 'disconnected',
    followersOrSubscribers: 0,
    totalViews: 0,
    totalLikes: 0,
    lastSyncAt: null,
    scopes: [],
    requiresApprovalNotice: 'TikTok Content Posting API v2 requires verified TikTok Developer App credentials.',
  },
];

// Clean real state: Zero fake videos, zero simulated scenes
export const SAMPLE_VIDEOS: VideoItem[] = [];

// Clean real state: Zero fake analytics
export const SAMPLE_DAILY_ANALYTICS: DailyAnalyticsSnapshot[] = [];

// Clean real state: Clean empty Kanban planner ready for real ideas
export const SAMPLE_CONTENT_IDEAS: ContentIdea[] = [];

export type PlatformType = 'youtube' | 'instagram' | 'tiktok';

export type VideoStatus = 'draft' | 'ready' | 'scheduled' | 'published' | 'failed';

export type IdeaStage = 'idea' | 'scripting' | 'editing' | 'ready' | 'published';

export interface PlatformCaption {
  title?: string;
  caption: string;
  hashtags: string[];
}

export interface VideoPlatformPost {
  id: string;
  videoId: string;
  platform: PlatformType;
  externalPostId?: string;
  externalUrl?: string;
  caption: string;
  publishedAt?: string;
  status: 'published' | 'scheduled' | 'failed' | 'pending';
  errorMessage?: string;
  views: number;
  likes: number;
  comments: number;
  shares?: number; // Not always available on all platforms
  engagementRate: number; // ((likes + comments + shares) / views) * 100
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  videoUrl?: string;
  durationSeconds: number;
  fileSizeMb: number;
  aspectRatio: '9:16' | '16:9' | '1:1';
  status: VideoStatus;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  platformCaptions: {
    youtube?: PlatformCaption;
    instagram?: PlatformCaption;
    tiktok?: PlatformCaption;
  };
  posts: VideoPlatformPost[];
}

export interface SocialAccount {
  id: string;
  platform: PlatformType;
  platformName: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  isConnected: boolean;
  status: 'connected' | 'disconnected' | 'needs_reauth' | 'pending_developer_app';
  followersOrSubscribers: number;
  totalViews?: number;
  totalLikes?: number;
  lastSyncAt: string | null;
  scopes: string[];
  requiresApprovalNotice?: string;
}

export interface DailyAnalyticsSnapshot {
  date: string;
  combinedViews: number;
  youtubeViews: number;
  instagramViews: number;
  tiktokViews: number;
  totalFollowers: number;
  youtubeSubscribers: number;
  instagramFollowers: number;
  tiktokFollowers: number;
  netNewFollowers: number;
}

export interface ContentIdea {
  id: string;
  title: string;
  notes: string;
  targetPlatforms: PlatformType[];
  stage: IdeaStage;
  targetDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface PublishingJob {
  videoId: string;
  selectedPlatforms: PlatformType[];
  scheduledTime?: string;
  publishNow: boolean;
  progress: number;
  stageMessage: string;
  isPublishing: boolean;
  error?: string;
}

export type NavigationTab = 
  | 'overview' 
  | 'library' 
  | 'publishing' 
  | 'analytics' 
  | 'accounts' 
  | 'growth' 
  | 'planner' 
  | 'settings';

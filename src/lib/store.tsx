'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavigationTab,
  VideoItem,
  SocialAccount,
  DailyAnalyticsSnapshot,
  ContentIdea,
  PlatformType,
  PublishingJob,
  PlatformCaption,
} from '@/types';
import {
  SAMPLE_ACCOUNTS,
  SAMPLE_VIDEOS,
  SAMPLE_DAILY_ANALYTICS,
  SAMPLE_CONTENT_IDEAS,
} from '@/lib/sample-data';
import { exportVideosToCSV, exportGrowthToCSV } from '@/lib/export-csv';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  videos: VideoItem[];
  accounts: SocialAccount[];
  dailyAnalytics: DailyAnalyticsSnapshot[];
  ideas: ContentIdea[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeVideoForModal: VideoItem | null;
  setActiveVideoForModal: (v: VideoItem | null) => void;
  activeVideoForComparison: VideoItem | null;
  setActiveVideoForComparison: (v: VideoItem | null) => void;
  accountToConnect: SocialAccount | null;
  setAccountToConnect: (acc: SocialAccount | null) => void;
  isUploadModalOpen: boolean;
  setIsUploadModalOpen: (open: boolean) => void;
  isIdeaModalOpen: boolean;
  setIsIdeaModalOpen: (open: boolean) => void;
  publishingJob: PublishingJob;
  startPublishing: (
    videoId: string,
    platforms: PlatformType[],
    isNow: boolean,
    scheduledTime?: string
  ) => void;
  cancelPublishing: () => void;
  retryPublishing: (videoId: string, platform: PlatformType) => void;
  addVideo: (video: Omit<VideoItem, 'id' | 'createdAt' | 'updatedAt' | 'posts'>) => void;
  updateVideo: (id: string, updates: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;
  updatePlatformCaption: (
    videoId: string,
    platform: PlatformType,
    captionData: PlatformCaption
  ) => void;
  addContentIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt'>) => void;
  updateIdeaStage: (id: string, stage: ContentIdea['stage']) => void;
  deleteIdea: (id: string) => void;
  toggleAccountConnection: (accountId: string) => void;
  syncAccount: (accountId: string) => void;
  exportDataToCSV: (type: 'videos' | 'growth') => void;
  resetDemoData: () => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [videos, setVideos] = useState<VideoItem[]>(SAMPLE_VIDEOS);
  const [accounts, setAccounts] = useState<SocialAccount[]>(SAMPLE_ACCOUNTS);
  const [dailyAnalytics, setDailyAnalytics] = useState<DailyAnalyticsSnapshot[]>(SAMPLE_DAILY_ANALYTICS);
  const [ideas, setIdeas] = useState<ContentIdea[]>(SAMPLE_CONTENT_IDEAS);

  const [activeVideoForModal, setActiveVideoForModal] = useState<VideoItem | null>(null);
  const [activeVideoForComparison, setActiveVideoForComparison] = useState<VideoItem | null>(null);
  const [accountToConnect, setAccountToConnect] = useState<SocialAccount | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [publishingJob, setPublishingJob] = useState<PublishingJob>({
    videoId: '',
    selectedPlatforms: [],
    publishNow: true,
    progress: 0,
    stageMessage: '',
    isPublishing: false,
  });

  // Load from local storage if available
  useEffect(() => {
    try {
      const savedVideos = localStorage.getItem('clippilot_videos');
      if (savedVideos) setVideos(JSON.parse(savedVideos));

      const savedAccounts = localStorage.getItem('clippilot_accounts');
      if (savedAccounts) setAccounts(JSON.parse(savedAccounts));

      const savedIdeas = localStorage.getItem('clippilot_ideas');
      if (savedIdeas) setIdeas(JSON.parse(savedIdeas));

      const savedDemo = localStorage.getItem('clippilot_demomode');
      if (savedDemo !== null) setIsDemoMode(savedDemo === 'true');
    } catch {
      // LocalStorage not available or parse error
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('clippilot_videos', JSON.stringify(videos));
      localStorage.setItem('clippilot_accounts', JSON.stringify(accounts));
      localStorage.setItem('clippilot_ideas', JSON.stringify(ideas));
      localStorage.setItem('clippilot_demomode', String(isDemoMode));
    } catch {
      // Ignore storage errors
    }
  }, [videos, accounts, ideas, isDemoMode]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      addToast('info', next ? 'Demo Mode activated (using sample creator data)' : 'Live Mode activated (showing real connected accounts)');
      return next;
    });
  };

  const resetDemoData = () => {
    setVideos(SAMPLE_VIDEOS);
    setAccounts(SAMPLE_ACCOUNTS);
    setDailyAnalytics(SAMPLE_DAILY_ANALYTICS);
    setIdeas(SAMPLE_CONTENT_IDEAS);
    setIsDemoMode(true);
    addToast('success', 'Reset dashboard to fresh sample data.');
  };

  const addVideo = (videoData: Omit<VideoItem, 'id' | 'createdAt' | 'updatedAt' | 'posts'>) => {
    const newVideo: VideoItem = {
      ...videoData,
      id: `vid_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      posts: [],
    };
    setVideos((prev) => [newVideo, ...prev]);
    addToast('success', `Added "${videoData.title}" to Video Library`);
  };

  const updateVideo = (id: string, updates: Partial<VideoItem>) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v))
    );
    addToast('info', 'Video updated successfully');
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    if (activeVideoForModal?.id === id) setActiveVideoForModal(null);
    if (activeVideoForComparison?.id === id) setActiveVideoForComparison(null);
    addToast('info', 'Video removed from library');
  };

  const updatePlatformCaption = (
    videoId: string,
    platform: PlatformType,
    captionData: PlatformCaption
  ) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id !== videoId) return v;
        return {
          ...v,
          platformCaptions: {
            ...v.platformCaptions,
            [platform]: captionData,
          },
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('success', `Saved ${platform} caption & hashtags`);
  };

  const addContentIdea = (ideaData: Omit<ContentIdea, 'id' | 'createdAt'>) => {
    const newIdea: ContentIdea = {
      ...ideaData,
      id: `idea_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setIdeas((prev) => [newIdea, ...prev]);
    addToast('success', `Created idea: "${ideaData.title}"`);
  };

  const updateIdeaStage = (id: string, stage: ContentIdea['stage']) => {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, stage } : idea))
    );
    addToast('info', `Moved idea to ${stage.toUpperCase()}`);
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    addToast('info', 'Idea deleted');
  };

  const toggleAccountConnection = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        const nextConnected = !acc.isConnected;
        return {
          ...acc,
          isConnected: nextConnected,
          status: nextConnected ? 'connected' : 'disconnected',
          lastSyncAt: nextConnected ? new Date().toISOString() : acc.lastSyncAt,
        };
      })
    );
  };

  const syncAccount = (accountId: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id !== accountId) return acc;
        return {
          ...acc,
          lastSyncAt: new Date().toISOString(),
        };
      })
    );
    addToast('success', `Refreshed metrics for ${accounts.find((a) => a.id === accountId)?.platformName}`);
  };

  const startPublishing = (
    videoId: string,
    platforms: PlatformType[],
    isNow: boolean,
    scheduledTime?: string
  ) => {
    const video = videos.find((v) => v.id === videoId);
    if (!video) {
      addToast('error', 'Select a video first.');
      return;
    }
    if (platforms.length === 0) {
      addToast('error', 'Please select at least one platform to publish to.');
      return;
    }

    if (!isNow && !scheduledTime) {
      addToast('error', 'Please choose a date and time to schedule this post.');
      return;
    }

    if (!isNow) {
      // Scheduling mode
      setVideos((prev) =>
        prev.map((v) => {
          if (v.id !== videoId) return v;
          const newPosts = platforms.map((p) => ({
            id: `post_${Date.now()}_${p}`,
            videoId,
            platform: p,
            caption: v.platformCaptions[p]?.caption || v.description,
            status: 'scheduled' as const,
            views: 0,
            likes: 0,
            comments: 0,
            engagementRate: 0,
          }));
          return {
            ...v,
            status: 'scheduled',
            scheduledFor: scheduledTime,
            posts: [...v.posts.filter((post) => !platforms.includes(post.platform)), ...newPosts],
          };
        })
      );
      addToast('success', `Successfully scheduled for ${new Date(scheduledTime!).toLocaleString()}`);
      setActiveTab('library');
      return;
    }

    // Immediate publishing simulation with multi-stage progress
    setPublishingJob({
      videoId,
      selectedPlatforms: platforms,
      publishNow: isNow,
      progress: 5,
      stageMessage: 'Validating media specifications and container formats...',
      isPublishing: true,
    });

    const stages = [
      { progress: 25, message: 'Transcoding 9:16 vertical stream & optimizing audio bitrate...' },
      { progress: 50, message: 'Requesting upload sessions from official platform APIs...' },
      { progress: 75, message: 'Transferring video chunks to media endpoints...' },
      { progress: 95, message: 'Finalizing post containers and applying hashtags...' },
      { progress: 100, message: 'Verified! All platforms confirmed successful publication.' },
    ];

    stages.forEach((st, idx) => {
      setTimeout(() => {
        setPublishingJob((prev) => ({
          ...prev,
          progress: st.progress,
          stageMessage: st.message,
        }));

        if (st.progress === 100) {
          setTimeout(() => {
            setVideos((prev) =>
              prev.map((v) => {
                if (v.id !== videoId) return v;
                const newPosts = platforms.map((p) => ({
                  id: `post_${Date.now()}_${p}`,
                  videoId,
                  platform: p,
                  externalPostId: `live_${Math.random().toString(36).substring(2, 9)}`,
                  externalUrl:
                    p === 'youtube'
                      ? 'https://youtube.com/shorts/live-sample'
                      : p === 'instagram'
                      ? 'https://instagram.com/reel/live-sample'
                      : 'https://tiktok.com/@alexrivera/live-sample',
                  caption: v.platformCaptions[p]?.caption || v.description,
                  publishedAt: new Date().toISOString(),
                  status: 'published' as const,
                  views: 12,
                  likes: 2,
                  comments: 0,
                  shares: 0,
                  engagementRate: 16.6,
                }));
                return {
                  ...v,
                  status: 'published',
                  posts: [...v.posts.filter((post) => !platforms.includes(post.platform)), ...newPosts],
                };
              })
            );

            setPublishingJob({
              videoId: '',
              selectedPlatforms: [],
              publishNow: true,
              progress: 0,
              stageMessage: '',
              isPublishing: false,
            });

            addToast('success', `Published "${video.title}" to ${platforms.join(', ')}!`);
            setActiveTab('analytics');
          }, 1200);
        }
      }, (idx + 1) * 900);
    });
  };

  const cancelPublishing = () => {
    setPublishingJob({
      videoId: '',
      selectedPlatforms: [],
      publishNow: true,
      progress: 0,
      stageMessage: '',
      isPublishing: false,
    });
    addToast('info', 'Publishing cancelled.');
  };

  const retryPublishing = (videoId: string, platform: PlatformType) => {
    startPublishing(videoId, [platform], true);
  };

  const exportDataToCSV = (type: 'videos' | 'growth') => {
    if (type === 'videos') {
      exportVideosToCSV(videos);
      addToast('success', 'Exported video performance data to CSV.');
    } else {
      exportGrowthToCSV(dailyAnalytics);
      addToast('success', 'Exported 30-day growth analytics to CSV.');
    }
  };

  return (
    <StoreContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDemoMode,
        toggleDemoMode,
        videos,
        accounts,
        dailyAnalytics,
        ideas,
        searchQuery,
        setSearchQuery,
        activeVideoForModal,
        setActiveVideoForModal,
        activeVideoForComparison,
        setActiveVideoForComparison,
        accountToConnect,
        setAccountToConnect,
        isUploadModalOpen,
        setIsUploadModalOpen,
        isIdeaModalOpen,
        setIsIdeaModalOpen,
        publishingJob,
        startPublishing,
        cancelPublishing,
        retryPublishing,
        addVideo,
        updateVideo,
        deleteVideo,
        updatePlatformCaption,
        addContentIdea,
        updateIdeaStage,
        deleteIdea,
        toggleAccountConnection,
        syncAccount,
        exportDataToCSV,
        resetDemoData,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

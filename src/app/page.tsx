'use client';

import React from 'react';
import { StoreProvider, useStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { OverviewView } from '@/components/dashboard/OverviewView';
import { VideoLibraryView } from '@/components/library/VideoLibraryView';
import { VideoUploadModal } from '@/components/library/VideoUploadModal';
import { VideoDetailModal } from '@/components/library/VideoDetailModal';
import { PublishingCentreView } from '@/components/publishing/PublishingCentreView';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { VideoCompareModal } from '@/components/analytics/VideoCompareModal';
import { PlatformAccountsView } from '@/components/accounts/PlatformAccountsView';
import { AccountConnectModal } from '@/components/accounts/AccountConnectModal';
import { GrowthTrackerView } from '@/components/growth/GrowthTrackerView';
import { ContentPlannerView } from '@/components/planner/ContentPlannerView';
import { NewIdeaModal } from '@/components/planner/NewIdeaModal';
import { SettingsView } from '@/components/settings/SettingsView';
import { ToastContainer } from '@/components/common/ToastContainer';

function DashboardContent() {
  const { activeTab } = useStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090c15] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Studio Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && <OverviewView />}
            {activeTab === 'library' && <VideoLibraryView />}
            {activeTab === 'publishing' && <PublishingCentreView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'accounts' && <PlatformAccountsView />}
            {activeTab === 'growth' && <GrowthTrackerView />}
            {activeTab === 'planner' && <ContentPlannerView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <VideoUploadModal />
      <VideoDetailModal />
      <VideoCompareModal />
      <AccountConnectModal />
      <NewIdeaModal />
      <ToastContainer />
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <DashboardContent />
    </StoreProvider>
  );
}

'use client';

import React from 'react';
import StarLoadingScreen from '@/components/common/StarLoadingScreen';
import { Store } from 'lucide-react';

export default function PortalLoading() {
  return (
    <StarLoadingScreen
      theme="dark"
      badge="Store Management Portal"
      badgeIcon={<Store className="w-3.5 h-3.5 text-amber-400" />}
      title="Entering Store Portal"
      subtitle="Authenticating store security keys & loading live feedback desk..."
      fullScreen={true}
    />
  );
}

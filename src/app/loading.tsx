'use client';

import React from 'react';
import StarLoadingScreen from '@/components/common/StarLoadingScreen';
import { ShieldCheck } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <StarLoadingScreen
      theme="dark"
      badge="RepuBoost™ Engine"
      badgeIcon={<ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
      title="Loading 5-Star Experience"
      subtitle="Connecting to secure review & reputation network..."
      fullScreen={true}
    />
  );
}

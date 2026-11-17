'use client';

import React from 'react';
import StarLoadingScreen from '@/components/common/StarLoadingScreen';
import { ShieldCheck } from 'lucide-react';

export default function MasterAdminLoading() {
  return (
    <StarLoadingScreen
      theme="dark"
      badge="Agency Master Control"
      badgeIcon={<ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
      title="Accessing Master Admin Panel"
      subtitle="Decrypting reputation database, client stands & live revenue telemetry..."
      fullScreen={true}
    />
  );
}

'use client';

import React from 'react';
import StarLoadingScreen from '@/components/common/StarLoadingScreen';

export default function CustomerReviewLoading() {
  return (
    <StarLoadingScreen
      theme="luxury"
      badge="RepuBoost™ Verified"
      title="Opening Feedback Gateway"
      subtitle="Spawning your 5-star customer experience..."
      fullScreen={true}
    />
  );
}

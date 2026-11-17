'use client';

import React, { useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StarLoadingScreen from '@/components/common/StarLoadingScreen';

/**
 * Route Compatibility: /portal/[slug] -> /r/[slug]
 * Ensures counter QR stands or legacy links pointing to /portal/[slug] seamlessly
 * route customers directly to the verified store review page with zero 404 errors.
 */
function PortalSlugRedirectInner() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || '';

  useEffect(() => {
    router.replace(`/r/${encodeURIComponent(slug)}`);
  }, [slug, router]);

  return (
    <StarLoadingScreen
      theme="luxury"
      badge="RepuBoost™ Verified"
      title="Opening Feedback Gateway"
      subtitle="Routing scan to verified store review desk..."
      fullScreen={true}
    />
  );
}

export default function PortalSlugPage() {
  return (
    <Suspense
      fallback={
        <StarLoadingScreen
          theme="luxury"
          badge="RepuBoost™ Verified"
          title="Opening Feedback Gateway"
          subtitle="Routing scan to verified store review desk..."
          fullScreen={true}
        />
      }
    >
      <PortalSlugRedirectInner />
    </Suspense>
  );
}

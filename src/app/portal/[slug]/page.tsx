'use client';

import React, { useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
    <div className="min-h-screen bg-gradient-to-b from-[#fbf8f1] via-[#f7f2e7] to-[#efe7d6] flex items-center justify-center p-4 font-sans">
      <div className="text-center space-y-3 p-6 rounded-2xl bg-white/80 border border-amber-200/80 shadow-lg max-w-sm w-full">
        <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-amber-950 tracking-wide">
          Connecting to store review stand...
        </p>
        <p className="text-[11px] text-amber-800/70">
          Redirecting to verified customer portal.
        </p>
      </div>
    </div>
  );
}

export default function PortalSlugPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf8f1] flex items-center justify-center p-4">
          <div className="text-center text-xs font-semibold text-amber-900">Loading...</div>
        </div>
      }
    >
      <PortalSlugRedirectInner />
    </Suspense>
  );
}

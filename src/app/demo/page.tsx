'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Isolated Demo Route (/demo)
 * Redirects or renders the standalone review demo without touching live Supabase tenant data.
 */
export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/r/demo');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fbf8f1] flex items-center justify-center p-4 font-sans">
      <div className="text-center space-y-3 p-6 rounded-2xl bg-white border border-amber-200 shadow-lg max-w-sm w-full">
        <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-amber-950 tracking-wide">
          Launching Isolated Demo Portal...
        </p>
      </div>
    </div>
  );
}

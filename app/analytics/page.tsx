
"use client";

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { LoadingAnimation } from '@/app/components/ui/loading-animation';
import { Sidebar } from '@/app/components/sidebar';
import { Header } from '@/app/components/header';

// DYNAMIC IMPORT WITH SSR DISABLED
const AnalyticsContent = dynamic(
  () => import('@/app/components/analytics-content').then((mod) => mod.AnalyticsContent),
  { 
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center"><LoadingAnimation /></div>
  }
);

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen w-full bg-muted/40 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<div className="flex h-full items-center justify-center"><LoadingAnimation /></div>}>
            <AnalyticsContent />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

    
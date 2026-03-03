'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import AnalyticsContent from '@/components/analytics-content';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-2">Track performance and metrics</p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : (
          <AnalyticsContent />
        )}
      </div>
    </DashboardLayout>
  );
}

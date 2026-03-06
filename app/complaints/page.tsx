
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ComplaintsContent } from "@/components/complaints-content"
import { LoadingAnimation } from "@/app/components/ui/loading-animation"
import { IUser } from '@/app/models/User';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ComplaintsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: user, isLoading } = useSWR<IUser>('/api/users/me', fetcher);

  useEffect(() => {
    if (!isLoading && user && user.role === 'user') {
      // Redirect staff/standard users to their portal while preserving query params (like ?id=...)
      const queryString = searchParams.toString();
      const redirectUrl = queryString ? `/portal?${queryString}` : '/portal';
      router.replace(redirectUrl);
    }
  }, [user, isLoading, router, searchParams]);

  if (isLoading || (user && user.role === 'user')) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden h-full">
          <ComplaintsContent />
        </main>
      </div>
    </div>
  )
}

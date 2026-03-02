
"use client";

import React, { Suspense } from 'react';
import { LoadingAnimation } from '@/components/ui/loading-animation';

export default function Template({ children }: { children: React.ReactNode }) {
  // This try-catch is a simplified error boundary for client-side rendering.
  // The actual error handling for server components and more complex scenarios
  // is handled by Next.js's built-in error.js and not-found.js files.
  try {
    return (
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><LoadingAnimation /></div>}>
        {children}
      </Suspense>
    );
  } catch (error) {
    // This is a fallback and ideally should not be hit if error.js is set up correctly.
    console.error("Rendering error caught in template:", error);
    return (
      <html>
        <body>
          <div className="flex h-screen w-full items-center justify-center">
            <h2 className="text-destructive">An unexpected error occurred.</h2>
          </div>
        </body>
      </html>
    );
  }
}

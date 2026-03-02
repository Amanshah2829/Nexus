
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ServerCrash, RotateCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,rgba(255,255,255,0))]"></div>
      <div className="relative z-10 space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <ServerCrash className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Something went wrong
        </h1>
        <p className="max-w-md text-muted-foreground">
          We're sorry, but an unexpected error occurred. Our team has been notified. Please try refreshing the page.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
             <div className="text-left bg-muted p-4 rounded-lg max-w-2xl mx-auto overflow-auto max-h-48">
                <h3 className="font-semibold">Error Details:</h3>
                <code className="text-xs text-destructive whitespace-pre-wrap">
                    {error.message}
                </code>
            </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <Button onClick={() => reset()}>
             <RotateCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

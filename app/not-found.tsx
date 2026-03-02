
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,white,rgba(255,255,255,0))]"></div>
      <div className="relative z-10 space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Compass className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          404 - Page Not Found
        </h1>
        <p className="max-w-md text-muted-foreground">
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        <Button asChild>
          <Link href="/dashboard">Go back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

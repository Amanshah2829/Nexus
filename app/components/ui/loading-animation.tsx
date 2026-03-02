
import { Shield } from 'lucide-react';

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-12 w-12">
        <Shield className="h-12 w-12 text-primary animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="loading-dot h-2 w-2 rounded-full bg-primary" />
            <div className="loading-dot h-2 w-2 rounded-full bg-primary" />
            <div className="loading-dot h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Loading Vynsec Nexus...</p>
    </div>
  );
}

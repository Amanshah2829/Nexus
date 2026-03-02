'use client';

import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RemoteSessionApprovalDialogProps {
  isOpen: boolean;
  sessionId: string;
  engineerName: string;
  complaintTitle: string;
  reason: string;
  estimatedDuration: number;
  onApprove?: (timeLimit?: number) => void;
  onDeny?: () => void;
}

export function RemoteSessionApprovalDialog({
  isOpen,
  sessionId,
  engineerName,
  complaintTitle,
  reason,
  estimatedDuration,
  onApprove,
  onDeny,
}: RemoteSessionApprovalDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [timeLimit, setTimeLimit] = useState(estimatedDuration.toString());
  const [countdown, setCountdown] = useState(300); // 5 minutes auto-reject

  // Countdown timer for auto-reject
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleDeny();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  async function handleApprove() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/remote-sessions/${sessionId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeLimit: parseInt(timeLimit),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve session');
      }

      toast({
        title: 'Success',
        description: 'Remote session approved. You can now connect with the engineer.',
      });

      onApprove?.(parseInt(timeLimit));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeny() {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/remote-sessions/${sessionId}/deny`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'User denied the request',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deny session');
      }

      toast({
        title: 'Session Denied',
        description: 'The engineer has been notified.',
      });

      onDeny?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deny session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <AlertDialogTitle>Remote Support Request</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 text-left mt-4">
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="font-semibold text-foreground mb-2">
                {engineerName} is requesting remote access to help you with:
              </p>
              <p className="text-sm mb-3">{complaintTitle}</p>
              
              {reason && (
                <>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Reason:</p>
                  <p className="text-sm bg-background rounded p-2 mb-3">{reason}</p>
                </>
              )}

              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Est. Duration: {estimatedDuration} min</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-time-limit">Time Limit (minutes)</Label>
              <Input
                id="session-time-limit"
                type="number"
                min="5"
                max="120"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                The engineer will have this much time to diagnose and fix your issue. You can end the session anytime.
              </p>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2 border-t">
              Request auto-expires in {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex gap-2 justify-end">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              onClick={handleDeny}
              disabled={isLoading}
            >
              Deny
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Approve
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface RemoteSessionRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  complaintId: string;
  complaintTitle: string;
  onSuccess?: (sessionId: string) => void;
}

export function RemoteSessionRequestModal({
  isOpen,
  onOpenChange,
  complaintId,
  complaintTitle,
  onSuccess,
}: RemoteSessionRequestModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('15');

  async function handleRequestSession() {
    if (!reason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for remote support',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/remote-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintId,
          reason,
          estimatedDuration: parseInt(estimatedDuration),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create remote session');
      }

      const { session } = await response.json();

      toast({
        title: 'Success',
        description: 'Remote session request sent to customer',
      });

      onSuccess?.(session._id);
      onOpenChange(false);
      setReason('');
      setEstimatedDuration('15');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create remote session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Remote Support</DialogTitle>
          <DialogDescription>
            Request remote access to help resolve: <span className="font-semibold">{complaintTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">Reason for Remote Access</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need remote access to resolve this issue..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-2 h-24 resize-none"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="duration">Estimated Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="5"
              max="120"
              step="5"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              disabled={isLoading}
              className="mt-2"
            />
          </div>

          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              The customer will receive a notification and must approve this request before the session begins.
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRequestSession}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Send Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

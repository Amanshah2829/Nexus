'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RemoteSessionRequestModal } from './remote-session-request-modal';
import { RemoteSessionApprovalDialog } from './remote-session-approval-dialog';
import { Video, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ComplaintRemoteSupportButtonProps {
  complaintId: string;
  complaintTitle: string;
  userRole?: string;
  isComplainer?: boolean;
}

interface ActiveSession {
  _id: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
  engineer?: { name: string; email: string };
  complainer?: { name: string; email: string };
  reason: string;
  estimatedDuration: number;
  requestedAt: string;
}

export function ComplaintRemoteSupportButton({
  complaintId,
  complaintTitle,
  userRole = 'engineer',
  isComplainer = false,
}: ComplaintRemoteSupportButtonProps) {
  const { toast } = useToast();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkActiveSession();
  }, [complaintId]);

  async function checkActiveSession() {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/remote-sessions?complaintId=${complaintId}&status=${'pending,approved,active'.split(',').join('&status=')}`
      );
      if (response.ok) {
        const { sessions } = await response.json();
        if (sessions.length > 0) {
          const session = sessions[0];
          setActiveSession(session);

          // Show approval dialog if complainer and request is pending
          if (isComplainer && session.status === 'pending') {
            setIsApprovalDialogOpen(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'approved':
      case 'active':
        return <Video className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  }

  // Engineer view - can request remote support
  if (userRole === 'engineer' && !isComplainer) {
    if (activeSession && ['pending', 'approved', 'active'].includes(activeSession.status)) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          {getStatusIcon(activeSession.status)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {activeSession.status === 'pending' && 'Waiting for customer approval...'}
              {activeSession.status === 'approved' && 'Customer approved - Ready to start'}
              {activeSession.status === 'active' && 'Session active'}
            </p>
            {activeSession.status === 'pending' && (
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                Requested at {new Date(activeSession.requestedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
          {activeSession.status === 'approved' && (
            <Button size="sm" className="gap-2 shrink-0">
              <Video className="w-4 h-4" />
              Start Session
            </Button>
          )}
        </div>
      );
    }

    return (
      <>
        <Button
          onClick={() => setIsRequestModalOpen(true)}
          className="gap-2 w-full sm:w-auto"
          disabled={isLoading}
        >
          <Video className="w-4 h-4" />
          Request Remote Support
        </Button>

        <RemoteSessionRequestModal
          isOpen={isRequestModalOpen}
          onOpenChange={setIsRequestModalOpen}
          complaintId={complaintId}
          complaintTitle={complaintTitle}
          onSuccess={() => {
            checkActiveSession();
          }}
        />
      </>
    );
  }

  // Complainer view - can approve/deny requests
  if (isComplainer) {
    if (activeSession && activeSession.status === 'pending') {
      return (
        <>
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                {activeSession.engineer?.name} is requesting remote access
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-200 mt-1">
                Tap the button below to approve or deny the request
              </p>
            </div>
          </div>

          <RemoteSessionApprovalDialog
            isOpen={isApprovalDialogOpen}
            onOpenChange={setIsApprovalDialogOpen}
            sessionId={activeSession._id}
            engineerName={activeSession.engineer?.name || 'Support Engineer'}
            complaintTitle={complaintTitle}
            reason={activeSession.reason}
            estimatedDuration={activeSession.estimatedDuration}
            onApprove={() => {
              checkActiveSession();
              setIsApprovalDialogOpen(false);
            }}
            onDeny={() => {
              checkActiveSession();
              setIsApprovalDialogOpen(false);
            }}
          />
        </>
      );
    }

    if (activeSession && ['approved', 'active'].includes(activeSession.status)) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          {getStatusIcon(activeSession.status)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {activeSession.status === 'approved'
                ? 'Remote session approved - Engineer will connect soon'
                : 'Remote session in progress'}
            </p>
            {activeSession.status === 'active' && (
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                Connected with {activeSession.engineer?.name}
              </p>
            )}
          </div>
          {activeSession.status === 'active' && (
            <Button size="sm" variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              End Session
            </Button>
          )}
        </div>
      );
    }

    // No active session for complainer
    return null;
  }

  return null;
}

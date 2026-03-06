
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { RemoteSessionRequestModal } from './remote-session-request-modal';
import { RemoteSessionApprovalDialog } from './remote-session-approval-dialog';
import { Video, Clock, CheckCircle, AlertCircle, Play, ExternalLink, Loader2 } from 'lucide-react';

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
  const router = useRouter();
  const { toast } = useToast();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkActiveSession = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const response = await fetch(
        `/api/remote-sessions?complaintId=${complaintId}`
      );
      if (response.ok) {
        const { sessions } = await response.json();
        // Look for pending, approved or active sessions
        const session = sessions.find((s: any) => ['pending', 'approved', 'active'].includes(s.status));
        
        if (session) {
          // If we found a new pending session and user is the complainer, open the dialog
          if (isComplainer && session.status === 'pending' && (!activeSession || activeSession.status !== 'pending')) {
            setIsApprovalDialogOpen(true);
          }
          setActiveSession(session);
        } else {
          setActiveSession(null);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [complaintId, isComplainer, activeSession]);

  useEffect(() => {
    checkActiveSession();
    
    // Set up polling for real-time updates (every 5 seconds)
    const interval = setInterval(() => {
      checkActiveSession(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [checkActiveSession]);

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

  const handleEnterWorkspace = () => {
    if (activeSession) {
      router.push(`/remote-sessions/${activeSession._id}`);
    }
  };

  // Personnel view (Engineer or Admin) - can request remote support
  const isPersonnel = ['engineer', 'super-admin', 'admin', 'tenant-admin'].includes(userRole);

  if (isPersonnel && !isComplainer) {
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
          {activeSession.status === 'active' ? (
            <Button size="sm" className="gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleEnterWorkspace}>
              <ExternalLink className="w-4 h-4" />
              Enter Workspace
            </Button>
          ) : activeSession.status === 'approved' ? (
            <Button size="sm" className="gap-2 shrink-0" onClick={handleEnterWorkspace}>
              <Play className="w-4 h-4" />
              Start Session
            </Button>
          ) : null}
        </div>
      );
    }

    return (
      <>
        <Button
          onClick={() => setIsRequestModalOpen(true)}
          className="gap-2 w-full sm:w-auto font-bold"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="w-4 h-4" />}
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
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-yellow-900 dark:text-yellow-100">
                Remote access requested
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-200 mt-0.5 line-clamp-1">
                {activeSession.engineer?.name || 'Support Agent'} needs to help you.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setIsApprovalDialogOpen(true)} className="bg-white dark:bg-slate-900 border-yellow-300">
              Review
            </Button>
          </div>

          <RemoteSessionApprovalDialog
            isOpen={isApprovalDialogOpen}
            onOpenChange={setIsApprovalDialogOpen}
            sessionId={activeSession._id}
            engineerName={activeSession.engineer?.name || 'Support Agent'}
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
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg animate-in fade-in duration-300">
          {getStatusIcon(activeSession.status)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
              {activeSession.status === 'approved'
                ? 'Support Access Approved'
                : 'Remote Session Active'}
            </p>
            {activeSession.status === 'active' && (
              <p className="text-xs text-blue-700 dark:text-blue-200 mt-0.5">
                Connected with {activeSession.engineer?.name}
              </p>
            )}
          </div>
          {activeSession.status === 'active' && (
            <Button size="sm" variant="outline" onClick={handleEnterWorkspace} className="bg-white dark:bg-slate-900">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Workspace
            </Button>
          )}
        </div>
      );
    }

    return null;
  }

  return null;
}

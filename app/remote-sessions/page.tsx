'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Play, Clock, CheckCircle, XCircle, AlertCircle, Eye, Video } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface RemoteSession {
  _id: string;
  id: string;
  complaint: { title: string; ticketNumber: string };
  engineer: { name: string; email: string };
  complainer: { name: string; email: string };
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
  reason: string;
  estimatedDuration: number;
  actualDuration?: number;
  controlLevel: string;
  requestedAt: string;
  startedAt?: string;
  endedAt?: string;
  recordingUrl?: string;
}

export default function RemoteSessionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<RemoteSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/remote-sessions');
      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }
      const { sessions } = await response.json();
      setSessions(sessions);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load sessions',
        variant: 'destructive',
      });
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
        return <Play className="w-4 h-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'approved':
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  const activeSessions = sessions.filter((s) => ['pending', 'approved', 'active'].includes(s.status));
  const historySessions = sessions.filter((s) => ['completed', 'cancelled', 'rejected'].includes(s.status));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Remote Support Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all remote support sessions with customers
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            <Play className="w-4 h-4" />
            Active Sessions ({activeSessions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="w-4 h-4" />
            History ({historySessions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : activeSessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
                <Video className="w-12 h-12 text-muted-foreground opacity-50" />
                <div className="text-center">
                  <h3 className="font-semibold">No active sessions</h3>
                  <p className="text-sm text-muted-foreground">
                    You don&apos;t have any active remote sessions right now
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeSessions.map((session) => (
                <Card key={session._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{session.complaint.title}</h3>
                            <Badge variant="secondary">{session.complaint.ticketNumber}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Customer: {session.complainer.name} ({session.complainer.email})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(session.status)}
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Reason */}
                      {session.reason && (
                        <div className="bg-muted rounded-lg p-3 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-semibold text-foreground">Reason:</span> {session.reason}
                          </p>
                        </div>
                      )}

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs">Duration</p>
                          <p className="font-semibold">
                            {session.actualDuration || session.estimatedDuration} min
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Control Level</p>
                          <p className="font-semibold capitalize">{session.controlLevel}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Started</p>
                          <p className="font-semibold">
                            {session.startedAt ? format(new Date(session.startedAt), 'HH:mm') : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Created</p>
                          <p className="font-semibold">
                            {format(new Date(session.requestedAt), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {session.status === 'active' && (
                          <>
                            <Button size="sm" className="gap-2">
                              <Video className="w-4 h-4" />
                              View Session
                            </Button>
                            <Button size="sm" variant="outline">
                              End Session
                            </Button>
                          </>
                        )}
                        {session.status === 'pending' && (
                          <p className="text-xs text-muted-foreground">
                            Waiting for customer approval...
                          </p>
                        )}
                        {session.status === 'approved' && (
                          <Button size="sm" className="gap-2">
                            <Play className="w-4 h-4" />
                            Start Session
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {historySessions.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
                <Clock className="w-12 h-12 text-muted-foreground opacity-50" />
                <div className="text-center">
                  <h3 className="font-semibold">No session history</h3>
                  <p className="text-sm text-muted-foreground">
                    Past sessions will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {historySessions.map((session) => (
                <Card key={session._id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{session.complaint.title}</h3>
                          <Badge variant="secondary">{session.complaint.ticketNumber}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {session.complainer.name} • {format(new Date(session.requestedAt), 'MMM d, yyyy HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.status)}
                        <Badge className={getStatusColor(session.status)}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    {session.recordingUrl && (
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View Recording
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

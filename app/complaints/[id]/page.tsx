'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import DashboardLayout from '@/components/dashboard-layout';
import { ComplaintRemoteSupportButton } from '@/app/components/complaint-remote-support-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, Phone, Mail, AlertCircle, Send, Archive } from 'lucide-react';
import { IUser } from '@/app/models/User';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;
  
  const { data: complaint, error, mutate, isLoading } = useSWR(complaintId ? `/api/complaints/${complaintId}` : null, fetcher);
  const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher);
  
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/complaints/${complaintId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: comment }),
      });
      
      if (response.ok) {
        setComment('');
        mutate();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !complaint) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Complaint Not Found</h2>
          <p className="text-muted-foreground mt-2">The complaint you're looking for doesn't exist or you don't have access.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{complaint.title}</h1>
            <p className="text-muted-foreground mt-2">ID: {complaint.id} • Ticket: {complaint.ticketNumber}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <ComplaintRemoteSupportButton 
              complaintId={complaintId} 
              complaintTitle={complaint.title} 
              userRole={currentUser?.role || 'user'} 
              isComplainer={currentUser?.email === complaint.reporterEmail}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="mt-2 capitalize">{complaint.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant={getPriorityColor(complaint.priority)} className="mt-2 capitalize">
                      {complaint.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium mt-2">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="text-sm font-medium mt-2 capitalize">{complaint.category || 'Uncategorized'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="activity" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {complaint.comments && complaint.comments.length > 0 ? (
                        complaint.comments.map((comment: any, idx: number) => (
                          <div key={idx} className="border-l-2 border-primary/20 pl-4 py-2">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-bold text-primary">{comment.authorName || comment.author}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No comments yet</p>
                      )}
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <Textarea
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Button 
                        onClick={handleAddComment}
                        disabled={submitting || !comment.trim()}
                        className="gap-2"
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Post Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attachments">
                <Card>
                  <CardHeader>
                    <CardTitle>Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {complaint.attachments && complaint.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {complaint.attachments.map((attachment: any, idx: number) => (
                          <a
                            key={idx}
                            href={typeof attachment === 'string' ? attachment : attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-muted/50 hover:bg-muted border rounded-lg transition-colors group"
                          >
                            <Paperclip className="h-4 w-4 text-primary" />
                            <span className="text-sm truncate flex-1">{typeof attachment === 'string' ? attachment.split('/').pop() : attachment.name}</span>
                            <Download className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No attachments available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Change History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {complaint.history && complaint.history.length > 0 ? (
                        complaint.history.sort((a:any, b:any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry: any, idx: number) => (
                          <div key={idx} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border shrink-0">
                                <GitCommit className="h-4 w-4 text-primary" />
                              </div>
                              {idx < complaint.history.length - 1 && <div className="w-px h-full bg-border" />}
                            </div>
                            <div className="pb-6">
                              <p className="text-sm font-bold text-foreground">{entry.action}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                by {entry.user} • {new Date(entry.timestamp).toLocaleString()}
                              </p>
                              {entry.details?.message && (
                                <p className="text-xs mt-2 p-2 bg-muted rounded-md border-l-2 border-primary italic">
                                  "{entry.details.message}"
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No history recorded.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Reporter Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reporter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{complaint.reporter}</p>
                    <p className="text-xs text-muted-foreground truncate">{complaint.building} - {complaint.room}</p>
                  </div>
                </div>
                {complaint.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{complaint.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{complaint.reporterEmail}</span>
                </div>
              </CardContent>
            </Card>

            {/* Assigned To */}
            {currentUser?.role !== 'user' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={complaint.assignedTo?.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {complaint.assignedTo?.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{complaint.assignedTo?.name || 'Unassigned'}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black">Support Professional</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Initialized:</span>
                    <span className="font-bold">{new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Activity:</span>
                    <span className="font-bold">{new Date(complaint.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {complaint.resolvedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Resolution:</span>
                      <span className="font-bold text-success">{new Date(complaint.resolvedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Paperclip(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

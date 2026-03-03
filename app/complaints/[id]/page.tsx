'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/dashboard-layout';
import RemoteSessionRequestModal from '@/components/remote-session-request-modal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, Phone, Mail, AlertCircle, Send, Archive } from 'lucide-react';

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;
  
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch complaint details
    const fetchComplaint = async () => {
      try {
        const response = await fetch(`/api/complaints/${complaintId}`);
        if (response.ok) {
          const data = await response.json();
          setComplaint(data);
        }
      } catch (error) {
        console.error('Failed to fetch complaint:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

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
        // Refresh complaint to show new comment
        const updatedResponse = await fetch(`/api/complaints/${complaintId}`);
        if (updatedResponse.ok) {
          setComplaint(await updatedResponse.json());
        }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'warning';
      case 'in-progress': return 'info';
      case 'pending': return 'secondary';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
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

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Complaint Not Found</h2>
          <p className="text-muted-foreground mt-2">The complaint you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{complaint.title}</h1>
            <p className="text-muted-foreground mt-2">ID: {complaint.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button 
              onClick={() => setShowRemoteModal(true)}
              className="gap-2"
            >
              🔗 Request Remote Support
            </Button>
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
                    <Badge className="mt-2">{complaint.status}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant={getPriorityColor(complaint.priority)} className="mt-2">
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
                    <p className="text-sm font-medium mt-2">{complaint.category}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm leading-relaxed">{complaint.description}</p>
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
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {complaint.comments && complaint.comments.length > 0 ? (
                        complaint.comments.map((comment: any, idx: number) => (
                          <div key={idx} className="border-l-2 border-muted pl-4 py-2">
                            <p className="text-sm font-medium">{comment.author}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm mt-2">{comment.text}</p>
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
                      />
                      <Button 
                        onClick={handleAddComment}
                        disabled={submitting || !comment.trim()}
                        className="gap-2"
                      >
                        <Send className="h-4 w-4" />
                        {submitting ? 'Posting...' : 'Post Comment'}
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
                      <div className="space-y-2">
                        {complaint.attachments.map((attachment: any, idx: number) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 hover:bg-muted rounded transition-colors"
                          >
                            <span>📎</span>
                            <span className="text-sm">{attachment.name}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">No attachments</p>
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
                      {complaint.history && complaint.history.map((entry: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-muted pl-4 py-2">
                          <p className="text-sm font-medium">{entry.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
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
                <CardTitle className="text-base">Reporter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{complaint.reporter}</p>
                    <p className="text-xs text-muted-foreground">{complaint.building} - {complaint.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {complaint.phone}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {complaint.reporterEmail}
                </div>
              </CardContent>
            </Card>

            {/* Assigned To */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select defaultValue={complaint.assignedTo || 'unassigned'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="engineer1">Engineer 1</SelectItem>
                    <SelectItem value="engineer2">Engineer 2</SelectItem>
                    <SelectItem value="engineer3">Engineer 3</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {new Date(complaint.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Updated: {new Date(complaint.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Remote Support Modal */}
      <RemoteSessionRequestModal
        isOpen={showRemoteModal}
        onClose={() => setShowRemoteModal(false)}
        complaintId={complaintId}
        complaintTitle={complaint.title}
        reporterName={complaint.reporter}
      />
    </DashboardLayout>
  );
}

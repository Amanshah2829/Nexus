
"use client"

import { useState, useMemo, useEffect, forwardRef } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CheckCircle,
  Clock,
  Wrench,
  LayoutDashboard,
  User,
  MapPin,
  FileText,
  Calendar,
  Send,
  Loader2,
  Paperclip,
  ArrowLeft,
  ArrowUpDown,
  MessageSquare,
  GitCommit,
  UserCheck,
  UserX,
  Mail,
  Edit,
  Wifi,
  Play,
  RefreshCw,
  Star,
} from "lucide-react"
import { IComplaint, IHistory } from "@/app/models/Complaint"
import { IUser } from "@/app/models/User"
import { LoadingAnimation } from "./ui/loading-animation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/app/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import React from "react"
import { IAsset } from "@/app/models/Asset"
import { useRouter } from "next/navigation"
import { ScheduleVisitDialog } from "./complaints-content"


const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json()
});

const complaintStatuses: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
  created: { label: "Created", color: "bg-gray-500", icon: FileText, description: "Complaint has been logged." },
  scheduled: { label: "Scheduled", color: "bg-blue-500", icon: Calendar, description: "Visit has been scheduled." },
  visited: { label: "Visited", color: "bg-yellow-500", icon: UserCheck, description: "Engineer has visited the location." },
  observation: { label: "Observation", color: "bg-orange-500", icon: Wrench, description: "Issue diagnosed, pending action." },
  "follow-up": { label: "Follow-up", color: "bg-indigo-500", icon: Clock, description: "Requires further action." },
  closed: { label: "Closed", color: "bg-green-500", icon: CheckCircle, description: "Issue resolved and ticket closed." },
  'pending-info': { label: "Pending Info", color: "bg-purple-500", icon: Paperclip, description: "Waiting for user information." },
  archived: { label: "Archived", color: "bg-gray-500", icon: Paperclip, description: "Ticket is archived." },
}


export function EngineerContent() {
  const { data: currentUser, error: userError } = useSWR<IUser>('/api/users/me', fetcher);
  const { data: complaintsData, error: complaintsError, mutate: mutateComplaints } = useSWR<IComplaint[]>(currentUser ? `/api/complaints?engineerId=${currentUser._id}` : null, fetcher, { revalidateOnFocus: false });
  const [selectedComplaint, setSelectedComplaint] = useState<IComplaint | null>(null);
  const [filter, setFilter] = useState('all');

  const handleUpdateSuccess = () => {
    mutateComplaints();
    if(selectedComplaint) {
      // Re-fetch the single complaint to get the latest data for the detail view
      fetch(`/api/complaints/${selectedComplaint._id}`).then(res => res.json()).then(data => setSelectedComplaint(data));
    }
  }

  useEffect(() => {
    if (complaintsData && complaintsData.length > 0 && !selectedComplaint) {
      if (window.innerWidth >= 768) { // Only autoselect on desktop
        const openComplaints = complaintsData.filter(c => c.status !== 'closed' && c.status !== 'archived');
        setSelectedComplaint(openComplaints.length > 0 ? openComplaints[0] : complaintsData[0]);
      }
    }
  }, [complaintsData, selectedComplaint]);
  
  const filteredComplaints = useMemo(() => {
    if (!complaintsData) return [];
    if (filter === 'all') return complaintsData.filter(c => c.status !== 'closed' && c.status !== 'archived');
    return complaintsData.filter(c => c.status === filter);
  }, [complaintsData, filter]);


  if (userError) {
      return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <Wrench className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p>You must be logged in to view this page.</p>
        </div>
      </div>
      )
  }
  
  if (!currentUser || !complaintsData) {
     return null; // The page-level loading.tsx will handle this
  }

  if (currentUser.role !== 'engineer') {
    return (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <LayoutDashboard className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Engineer Dashboard</h2>
          <p>This page is intended for users with the 'engineer' role.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] h-full">
        {/* Task List */}
        <div className={cn("border-r border-border bg-card/30 flex-col h-full", selectedComplaint ? "hidden md:flex" : "flex")}>
            <div className="p-4 border-b border-border">
                <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarImage src={currentUser.avatar || `https://avatar.vercel.sh/${currentUser.name}.png`} />
                        <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-lg font-semibold">My Tasks</h1>
                        <p className="text-sm text-muted-foreground">{filteredComplaints.length} open tasks</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Filter tasks..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Open</SelectItem>
                            {Object.entries(complaintStatuses).filter(([key]) => key !== 'closed' && key !== 'archived').map(([key, {label}]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon"><ArrowUpDown className="h-4 w-4"/></Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {filteredComplaints.length > 0 ? filteredComplaints.map(complaint => (
                    <div 
                      key={complaint._id} 
                      className={cn("p-4 border-b border-border cursor-pointer hover:bg-accent/50", selectedComplaint?._id === complaint._id && "bg-accent")}
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                        <ComplaintTaskCard complaint={complaint}/>
                    </div>
                )) : (
                    <div className="text-center text-muted-foreground p-10">
                        <FileText className="h-8 w-8 mx-auto mb-2"/>
                        <p>No tasks found for this filter.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Task Details */}
        <div className={cn("flex-1", !selectedComplaint && "hidden md:flex md:items-center md:justify-center")}>
            {selectedComplaint && currentUser ? (
                <TaskDetailView 
                    complaint={selectedComplaint} 
                    onUpdate={handleUpdateSuccess} 
                    currentUser={currentUser} 
                    onBackClick={() => setSelectedComplaint(null)}
                />
            ) : (
                <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>Select a task to view details</p>
                </div>
            )}
        </div>
    </div>
  )
}

function ComplaintTaskCard({ complaint }: { complaint: IComplaint; }) {
    const status = complaintStatuses[complaint.status as keyof typeof complaintStatuses];
    const lastHistoryItem = complaint.history.length > 0 ? complaint.history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] : null;

    return (
      <>
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", status.color)}></div>
                <p className="font-semibold text-sm line-clamp-1 pr-2">{complaint.title}</p>
            </div>
            <Badge variant={complaint.priority === 'high' || complaint.priority === 'critical' ? 'destructive' : complaint.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">{complaint.priority}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{complaint.id} &bull; {complaint.building} - {complaint.room}</p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
             <div className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                <span>{complaint.reporter}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>{complaint.scheduledAt ? new Date(complaint.scheduledAt).toLocaleDateString() : 'Unscheduled'}</span>
            </div>
        </div>
        {lastHistoryItem && (
            <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                <GitCommit className="h-3 w-3 shrink-0" />
                <p className="truncate">
                    <strong>Last update:</strong> {lastHistoryItem.action} by {lastHistoryItem.user}
                </p>
            </div>
        )}
      </>
    )
}

function TaskDetailView({ complaint, onUpdate, currentUser, onBackClick }: { complaint: IComplaint; onUpdate: () => void; currentUser: IUser; onBackClick: () => void; }) {
  const router = useRouter();

  return (
    <div className="flex-1 grid md:grid-cols-[1fr_420px] h-full bg-background overflow-hidden">
        {/* Left Side: Details */}
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={onBackClick}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className={cn("w-3 h-3 rounded-full", complaintStatuses[complaint.status as keyof typeof complaintStatuses]?.color)}></div>
                    <div>
                        <h2 className="font-semibold">{complaint.title}</h2>
                        <p className="text-sm text-muted-foreground">{complaint.id} &bull; {complaint.ticketNumber}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push(`/report/${complaint._id}`)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <Card className="glass-card">
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User/>Reporter Info</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Name:</strong> {complaint.reporter}</p>
                        <p><strong>Email:</strong> {complaint.reporterEmail}</p>
                        <p><strong>Phone:</strong> {complaint.phone || 'N/A'}</p>
                    </CardContent>
                    </Card>
                    <Card className="glass-card">
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin/>Location Info</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-2">
                        <p><strong>Building:</strong> {complaint.building}</p>
                        <p><strong>Room:</strong> {complaint.room}</p>
                    </CardContent>
                    </Card>
                </div>
                <Card className="glass-card">
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText/>Description</CardTitle></CardHeader>
                    <CardContent><p className="text-sm whitespace-pre-wrap">{complaint.description}</p></CardContent>
                </Card>
            </div>
        </div>

        {/* Right Side: Action Hub */}
        <div className="border-l border-border bg-card/30 flex flex-col h-full">
            <ActionHub complaint={complaint} onUpdate={onUpdate} currentUser={currentUser} />
        </div>
    </div>
  )
}

function ActionHub({ complaint, onUpdate, currentUser }: { complaint: IComplaint; onUpdate: () => void; currentUser: IUser; }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailPreviewState, setEmailPreviewState] = useState<{ open: boolean; title: string; body: string; onConfirm: (editedBody: string) => void } | null>(null);

    const handleUpdateStatus = async (complaint: IComplaint, status: string, details: any, emailDetails?: { subject: string, body: string }) => {
        const performUpdate = async (editedBody?: string) => {
            setIsSubmitting(true);
            try {
              const response = await fetch(`/api/complaints/${complaint._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    status: status,
                    ...details,
                    history: [{
                        action: details?.action || `Status changed to ${status}`,
                        user: currentUser?.name || 'Engineer',
                        timestamp: new Date(),
                        details: {
                          message: details?.message,
                          notes: details?.notes
                        }
                    }]
                }),
              });
              if (!response.ok) throw new Error("Failed to update status.");
              
              if(emailDetails) {
                await fetch('/api/emails/send', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    to: complaint.reporterEmail, 
                    subject: `Re: ${complaint.title} [${complaint.id}]`,
                    text: editedBody || emailDetails.body,
                    inReplyTo: complaint.originalEmailMessageId,
                    references: complaint.originalEmailReferences
                  }),
                });
              }
    
              onUpdate();
              toast({
                title: "Status Updated",
                description: `Complaint status changed to "${status}"${emailDetails ? ' and user notified.' : ''}`,
              });
    
              setEmailPreviewState(null);
    
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Update Failed",
                description: (error as Error).message,
              });
            } finally {
              setIsSubmitting(false);
            }
        };
        
        if (emailDetails) {
            setEmailPreviewState({
                open: true,
                title: `Re: ${complaint.title} [${complaint.id}]`,
                body: emailDetails.body,
                onConfirm: performUpdate
            });
        } else {
            await performUpdate();
        }
    };
    
    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-lg">Action Hub</h3>
                <p className="text-sm text-muted-foreground">Update the task status and log actions.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <StatusTimeline currentStatus={complaint.status} />

                {complaint.status === 'scheduled' && <StartVisitAction complaint={complaint} />}
                {(complaint.status === 'visited' || complaint.status === 'observation' || complaint.status === 'follow-up') && <ResolveAction onUpdate={onUpdate} complaint={complaint} />}
                
                <div className="pt-4">
                  <Tabs defaultValue="update">
                      <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="update"><Wrench className="h-4 w-4 mr-1"/>Update</TabsTrigger>
                          <TabsTrigger value="mail"><Mail className="h-4 w-4 mr-1"/>Mail</TabsTrigger>
                          <TabsTrigger value="attachments"><Paperclip className="h-4 w-4 mr-1"/>Files</TabsTrigger>
                      </TabsList>
                      <TabsContent value="update" className="mt-4">
                          <UpdateStatusTab onUpdate={handleUpdateStatus} complaint={complaint} />
                      </TabsContent>
                      <TabsContent value="mail" className="mt-4 h-[400px]">
                          <MailTab complaint={complaint} onUpdate={onUpdate} currentUser={currentUser} />
                      </TabsContent>
                      <TabsContent value="attachments" className="mt-4">
                          <p className="text-sm text-muted-foreground">Manage attachments.</p>
                      </TabsContent>
                  </Tabs>
                </div>
            </div>
             {emailPreviewState && (
                <EmailPreviewDialog
                    isOpen={emailPreviewState.open}
                    onOpenChange={(open) => !open && setEmailPreviewState(null)}
                    title={emailPreviewState.title}
                    initialBody={emailPreviewState.body}
                    onConfirm={(editedBody) => {
                        emailPreviewState.onConfirm(editedBody);
                    }}
                />
            )}
        </div>
    );
}

function StatusTimeline({ currentStatus }: { currentStatus: string }) {
    const stages = ['created', 'scheduled', 'visited', 'observation', 'follow-up', 'closed'];
    const currentIndex = stages.indexOf(currentStatus);

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">Lifecycle</p>
            <div className="flex items-center">
                {stages.map((stage, index) => {
                    const isActive = index <= currentIndex;
                    const StatusIcon = complaintStatuses[stage].icon;
                    return (
                        <React.Fragment key={stage}>
                            <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center border-2", isActive ? `${complaintStatuses[stage].color.replace('bg-','border-')} bg-background` : 'border-border bg-background')}>
                                        <StatusIcon className={cn("h-4 w-4", isActive ? complaintStatuses[stage].color.replace('bg-','text-') : 'text-muted-foreground')} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="capitalize">{complaintStatuses[stage].label}</p>
                                    <p className="text-xs text-muted-foreground">{complaintStatuses[stage].description}</p>
                                </TooltipContent>
                            </Tooltip>
                            </TooltipProvider>
                            {index < stages.length - 1 && (
                                <div className={cn("flex-1 h-0.5", index < currentIndex ? complaintStatuses[stage].color : 'bg-border')}/>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}

function StartVisitAction({ complaint }: { complaint: IComplaint; }) {
  const router = useRouter();

  const handleStartVisit = () => {
    router.push(`/on-visit?id=${complaint._id}`);
  };

  return (
    <div className="p-4 border rounded-lg bg-card space-y-3">
      <h4 className="font-medium">Primary Action: Start Visit</h4>
      <p className="text-sm text-muted-foreground">Proceed to the on-site diagnostic workflow.</p>
        <Button variant="default" onClick={handleStartVisit} className="flex-1 w-full">
          <Play className="mr-2 h-4 w-4" /> Start On-Site Visit
        </Button>
    </div>
  );
}

function ResolveAction({ complaint, onUpdate }: { complaint: IComplaint, onUpdate: any }) {
    const { toast } = useToast();
    const [notes, setNotes] = useState('');
    const [saveAsSolution, setSaveAsSolution] = useState(false);
    const [sendSurvey, setSendSurvey] = useState(true);

    const handleSubmit = async () => {
        try {
            const response = await fetch(`/api/complaints/${complaint._id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resolutionNotes: notes, saveAsSolution: saveAsSolution }),
            });
            if (!response.ok) throw new Error("Failed to resolve complaint");
            toast({
                title: "Complaint Resolved",
                description: `The ticket has been successfully closed. ${sendSurvey ? 'A satisfaction survey has been sent.' : ''}`,
            });
            onUpdate();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    }

    return (
        <div className="p-4 border rounded-lg bg-card space-y-3">
            <h4 className="font-medium">Primary Action: Resolve Ticket</h4>
            <p className="text-sm text-muted-foreground">Close the ticket if the issue has been resolved.</p>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., Replaced faulty port. Network is now working correctly." />
            <div className="space-y-3">
                <div className="flex items-center space-x-2">
                    <Checkbox id="save-as-solution" checked={saveAsSolution} onCheckedChange={(c) => setSaveAsSolution(!!c)} />
                    <Label htmlFor="save-as-solution">Save resolution to Knowledge Base</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="send-survey" checked={sendSurvey} onCheckedChange={(c) => setSendSurvey(!!c)} />
                    <Label htmlFor="send-survey">Send Customer Satisfaction Survey</Label>
                </div>
            </div>
            <Button className="w-full" disabled={!notes} onClick={handleSubmit}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve & Close Ticket
            </Button>
        </div>
    )
}

function UpdateStatusTab({ complaint, onUpdate }: { complaint: IComplaint, onUpdate: any }) {
    const [status, setStatus] = useState(complaint.status);
    const [notes, setNotes] = useState("");
    const [notify, setNotify] = useState(false);

    const handleSubmit = () => {
        let emailDetails;
        if (notify) {
            emailDetails = {
                subject: `An update on your IT request`,
                body: `Hi ${complaint.reporter.split(' ')[0]},\n\nThis is an update regarding your request, "${complaint.title}". The status has been updated to "${complaintStatuses[status].label}".\n\n${notes ? `Engineer's Note: ${notes}\n\n` : ''}If you have any questions, feel free to reply to this email.\n\nThank you,\n`
            }
        }
        onUpdate(complaint, status, { action: `Status changed to ${status}`, message: notes}, emailDetails);
    }
    
    return (
        <div className="space-y-4">
            <div>
                <Label>New Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {Object.entries(complaintStatuses).map(([key, {label}]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note about this status change..." />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="notify-update" checked={notify} onCheckedChange={(c) => setNotify(!!c)} />
                <Label htmlFor="notify-update">Notify user via email</Label>
            </div>
            <Button className="w-full" onClick={handleSubmit}>
                <Send className="h-4 w-4 mr-2" />
                Submit Update
            </Button>
        </div>
    )
}

function MailTab({ complaint, onUpdate, currentUser }: { complaint: IComplaint; onUpdate: () => void; currentUser: IUser; }) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const emailUsername = currentUser?.emailConfig?.imapUser || '';

  const { data: emails, error, mutate: mutateEmails, isLoading } = useSWR(
    complaint.id ? `/api/emails/search?subject=${encodeURIComponent(`[${complaint.id}]`)}` : null,
    fetcher, { revalidateOnFocus: true }
  );

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    setIsSending(true);

    try {
      const conversationEmails = emails || [];
      const latestEmail = conversationEmails.length > 0 ? conversationEmails[conversationEmails.length - 1] : null;

      // 1. Send email to user
      const emailRes = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: complaint.reporterEmail,
          subject: `Re: ${complaint.title} [${complaint.id}]`,
          text: message,
          inReplyTo: latestEmail?.messageId || complaint.originalEmailMessageId,
          references: latestEmail?.references ? `${latestEmail.references} ${latestEmail.messageId}` : latestEmail?.messageId || complaint.originalEmailReferences,
        }),
      });

      if (!emailRes.ok) throw new Error('Failed to send email.');

      // 2. Add message to complaint history
      const historyEntry = {
        action: 'Replied to User',
        user: currentUser?.name || 'Engineer', 
        timestamp: new Date(),
        details: { message },
      };

      const complaintUpdateRes = await fetch(`/api/complaints/${complaint._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [historyEntry],
        }),
      });

      if (!complaintUpdateRes.ok) throw new Error('Failed to update complaint history.');

      toast({
        title: "Reply Sent",
        description: "Your reply has been emailed to the user.",
      });
      setMessage('');
      onUpdate();
      setTimeout(() => mutateEmails(), 2000);

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to send reply",
        description: err.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const isFromEngineer = (email: any) => {
    return emailUsername && email.from.toLowerCase().includes(emailUsername.toLowerCase());
  }

  const conversation = emails ? [...emails].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 -mr-2">
        {isLoading && <div className="text-center text-muted-foreground py-10"><Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" /></div>}
        {error && <div className="text-center text-destructive py-10">Failed to load conversation.</div>}
        {conversation.length === 0 && !isLoading && (
          <div className="text-center text-muted-foreground py-10">
            <MessageSquare className="h-8 w-8 mx-auto mb-2" />
            <p>No email history for this complaint.</p>
          </div>
        )}
        {conversation.map((item: any, index: number) => (
          <div key={index} className={`flex ${isFromEngineer(item) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-lg ${isFromEngineer(item) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              <p className="text-sm whitespace-pre-wrap">{item.text}</p>
              <p className="text-xs opacity-75 mt-1 text-right">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="relative">
          <Textarea
            placeholder="Type your reply..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="pr-20"
            rows={3}
          />
          <Button
            size="sm"
            className="absolute right-2 bottom-2"
            onClick={handleSendMessage}
            disabled={isSending || !message.trim()}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="ml-2">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmailPreviewDialog({ isOpen, onOpenChange, title, initialBody, onConfirm }: { isOpen: boolean, onOpenChange: (open: boolean) => void, title: string, initialBody: string, onConfirm: (editedBody: string) => void }) {
    const [body, setBody] = useState(initialBody);
    const [isSending, setIsSending] = useState(false);

    const handleConfirm = async () => {
        setIsSending(true);
        await onConfirm(body);
        setIsSending(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Confirm Email</DialogTitle>
                    <DialogDescription>Review and edit the email before sending.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Subject</Label>
                        <Input value={title} readOnly disabled />
                    </div>
                    <div>
                        <Label>Body</Label>
                        <Textarea value={body} onChange={e => setBody(e.target.value)} className="h-64"/>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleConfirm} disabled={isSending}>
                        {isSending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                        Send Email
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

    

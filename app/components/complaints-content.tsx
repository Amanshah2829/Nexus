"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from 'swr'
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  User,
  Building,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Upload,
  Download,
  MoreHorizontal,
  Loader2,
  Info,
  GitCommit,
  Paperclip,
  MessageSquare,
  Send,
  ArrowLeft,
  Activity,
  UserCheck,
  ClipboardList
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/app/components/ui/dropdown-menu"
import { IHistory } from "@/app/models/Complaint"
import { IUser } from "@/app/models/User"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Label } from "@/app/components/ui/label"
import { useDialogStore } from "@/app/lib/store"
import { cn } from "@/app/lib/utils"
import { useRouter } from "next/navigation"

export type IComplaint = {
  _id: string;
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  reporter: string;
  reporterEmail: string;
  phone?: string;
  building?: string;
  room?: string;
  category: string;
  type: string;
  assignedTo?: IUser | string;
  scheduledAt?: string;
  history: IHistory[];
  attachments?: string[];
  originalEmailMessageId?: string;
  originalEmailReferences?: string;
  createdAt: string;
  updatedAt: string;
};

const complaintStatuses = {
    created: { label: "Created", color: "bg-blue-500", icon: FileText },
    scheduled: { label: "Scheduled", color: "bg-yellow-500", icon: Calendar },
    visited: { label: "Visited", color: "bg-purple-500", icon: User },
    observation: { label: "Observation", color: "bg-orange-500", icon: Eye },
    "follow-up": { label: "Follow-up", color: "bg-indigo-500", icon: Clock },
    closed: { label: "Closed", color: "bg-green-500", icon: CheckCircle },
    'pending-info': { label: "Pending Info", color: "bg-gray-500", icon: Info },
}

const complaintTemplates = [
  { id: 1, name: "WiFi not working", category: "connectivity", description: "Complete WiFi connectivity failure", type: "complaint" },
  { id: 2, name: "Slow internet", category: "speed", description: "Internet speed issues", type: "complaint" },
  { id: 3, name: "No coverage", category: "coverage", description: "WiFi signal coverage problems", type: "complaint" },
  { id: 4, name: "Router dead", category: "hardware", description: "Router hardware failure", type: "complaint" },
  { id: 5, name: "WiFi extension", category: "extension", description: "Request for WiFi coverage extension", type: "request" },
  { id: 6, name: "Router not working", category: "hardware", description: "Router malfunction or configuration issues", type: "complaint" },
  { id: 7, name: "Arrange ICT Equipment", category: "event", description: "Request to arrange ICT equipment for an event.", type: "request" }
]

export const fetcher = (url: string) => fetch(url).then(res => res.json())

export function ComplaintsContent() {
  const { toast } = useToast()
  const [selected, setSelected] = useState<IComplaint | null>(null)
  const { isCreateComplaintOpen, openCreateComplaint, closeCreateComplaint } = useDialogStore();
  const [isEditComplaintOpen, setIsEditComplaintOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [complaintToSchedule, setComplaintToSchedule] = useState<IComplaint | null>(null)
  const [filterStatus, setFilterStatus] = useState("open")
  const [searchQuery, setSearchQuery] = useState("")

  const { data: complaints, error, isLoading } = useSWR<IComplaint[]>(
    `/api/complaints?status=${filterStatus}&search=${searchQuery}`,
    fetcher
  )
   const { data: users } = useSWR<IUser[]>('/api/users', fetcher);

  useEffect(() => {
    if (!selected && complaints?.length && window.innerWidth >= 768) {
      setSelected(complaints[0])
    }
  }, [complaints, selected])

  const handleCreateComplaint = async (formData: any) => {
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to create complaint');
      
      const newComplaint = await response.json();
      mutate(`/api/complaints?status=${filterStatus}&search=${searchQuery}`);
      setSelected(newComplaint);
      closeCreateComplaint();
      setComplaintToSchedule(newComplaint);
      setIsScheduleDialogOpen(true);
      toast({ title: "Success", description: `New ${newComplaint.type} created. Please schedule.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not create ticket." });
    }
  };
  
  const handleUpdateComplaint = async (formData: any) => {
    if (!selected) return;
    try {
      const response = await fetch(`/api/complaints/${selected._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update complaint');
      
      const updatedComplaint = await response.json();
      mutate(`/api/complaints?status=${filterStatus}&search=${searchQuery}`);
      setSelected(updatedComplaint);
      setIsEditComplaintOpen(false);
      toast({ title: "Success", description: `Complaint ${updatedComplaint.id} updated.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not update ticket." });
    }
  };


  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-[380px_1fr] bg-background overflow-hidden">
      <aside className={cn("border-r border-border flex flex-col min-h-0 bg-card", selected && "hidden md:flex")}>
        <header className="p-4 flex items-center justify-between shrink-0 border-b border-border/50 bg-gradient-to-r from-card to-muted/10">
          <div>
            <h2 className="font-bold text-lg text-foreground">Inbox</h2>
            <p className="text-xs text-muted-foreground mt-1">{Array.isArray(complaints) ? complaints.length : 0} tickets</p>
          </div>
          <Button size="sm" onClick={openCreateComplaint} className="rounded-lg px-4 bg-primary text-primary-foreground font-semibold hover:shadow-lg transition-all">
            <Plus className="h-4 w-4 mr-1.5" /> New
          </Button>
        </header>

        <div className="px-4 py-3 border-b border-border/50 shrink-0 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background border-border/50 placeholder-muted-foreground/60 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 custom-sidebar-scrollbar bg-card">
          <AnimatePresence>
            {Array.isArray(complaints) && complaints.map(c => {
              const priorityColors = {
                critical: "bg-destructive/10 text-destructive border-destructive/20",
                high: "bg-warning/10 text-warning border-warning/20",
                medium: "bg-info/10 text-info border-info/20",
                low: "bg-muted text-muted-foreground border-border/50"
              }
              const priorityClass = priorityColors[c.priority as keyof typeof priorityColors] || priorityColors.low
              
              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelected(c)}
                  className={cn(
                    "px-4 py-4 border-b border-border/50 transition-all duration-200 cursor-pointer group",
                    selected?._id === c._id
                      ? "bg-muted/60 border-l-4 border-l-primary"
                      : "hover:bg-muted/30 bg-card"
                  )}
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <p className={cn("text-sm font-semibold line-clamp-2 flex-1", selected?._id === c._id ? "text-primary" : "text-foreground group-hover:text-primary transition-colors")}>{c.title}</p>
                    <Badge variant="outline" className={cn("capitalize text-[9px] h-5 rounded-full px-2 border flex-shrink-0 font-semibold", priorityClass)}>
                      {c.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-3">{c.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground/70 font-semibold">{c.id}</span>
                    <div className="flex items-center gap-2">
                      {c.assignedTo && (
                        <Avatar className="h-5 w-5 border border-border/50 ring-1 ring-primary/20">
                          <AvatarImage src={(c.assignedTo as any)?.avatar || `https://avatar.vercel.sh/${(c.assignedTo as any)?.name?.replace(' ', '')}.png`} />
                          <AvatarFallback className="text-[7px] bg-muted text-foreground font-bold">{(c.assignedTo as any)?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={cn("w-2 h-2 rounded-full", {
                        "bg-success": c.status === "closed",
                        "bg-warning": c.status === "observation" || c.status === "follow-up",
                        "bg-info": c.status === "scheduled" || c.status === "visited",
                        "bg-muted": c.status === "created" || c.status === "pending-info"
                      })} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {isLoading && (
            <div className="p-6 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading tickets...</p>
            </div>
          )}
          
          {!isLoading && complaints?.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No tickets found</p>
            </div>
          )}
        </div>
      </aside>
      
      <main className={cn("flex flex-col min-h-0 overflow-hidden bg-background", !selected && "hidden md:flex")}>
        {selected ? (
          <TicketContext 
            ticket={selected} 
            onBack={() => setSelected(null)} 
            onComplaintUpdate={() => mutate(`/api/complaints?status=${filterStatus}&search=${searchQuery}`)}
            onEditClick={() => setIsEditComplaintOpen(true)}
            onScheduleClick={() => {
                setComplaintToSchedule(selected);
                setIsScheduleDialogOpen(true);
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted">
            <div className="bg-card p-12 rounded-3xl border border-border text-center max-w-sm shadow-2xl">
                <Activity className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-bold text-foreground uppercase tracking-widest">Command Center</h3>
                <p className="text-sm mt-2 font-medium">Select a ticket from the inbox to view its complete lifecycle and take action.</p>
            </div>
          </div>
        )}
      </main>

      <Dialog open={isCreateComplaintOpen} onOpenChange={closeCreateComplaint}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-sidebar-scrollbar bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-black">CREATE NEW TICKET</DialogTitle>
          </DialogHeader>
          <CreateComplaintForm 
            onClose={closeCreateComplaint} 
            onSubmit={handleCreateComplaint}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditComplaintOpen} onOpenChange={setIsEditComplaintOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-sidebar-scrollbar bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-black">EDIT TICKET</DialogTitle>
          </DialogHeader>
          <CreateComplaintForm 
            onClose={() => setIsEditComplaintOpen(false)} 
            onSubmit={handleUpdateComplaint}
            complaint={selected}
            isEditMode={true}
          />
        </DialogContent>
      </Dialog>
      
      {complaintToSchedule && Array.isArray(users) && (
        <ScheduleVisitDialog
          complaint={complaintToSchedule}
          engineers={users.filter(u => u.role === 'engineer' && u.status === 'active')}
          isOpen={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
          onSuccess={() => {
            setIsScheduleDialogOpen(false);
            mutate(`/api/complaints?status=${filterStatus}&search=${searchQuery}`);
            if (selected) {
                fetch(`/api/complaints/${complaintToSchedule._id}`).then(res => res.json()).then(data => setSelected(data));
            }
          }}
        />
      )}
    </div>
  )
}

function TicketContext({ ticket, onBack, onComplaintUpdate, onEditClick, onScheduleClick }: { 
    ticket: IComplaint; 
    onBack: () => void; 
    onComplaintUpdate: () => void;
    onEditClick: () => void;
    onScheduleClick: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="p-4 md:p-6 border-b border-border/50 bg-gradient-to-r from-card via-card to-muted/5 flex items-center gap-3 shrink-0">
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-xl truncate tracking-tight text-foreground">{ticket.title}</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[10px] font-mono bg-primary/10 px-2.5 py-1 rounded-lg text-primary font-bold border border-primary/20">{ticket.id}</span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{ticket.ticketNumber}</span>
            <span className="text-[10px] text-muted-foreground">•</span>
            <span className="text-[10px] text-muted-foreground">{new Date(ticket.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <Badge className={cn(
              "capitalize rounded-full px-3 py-1.5 border font-semibold text-xs",
              ticket.status === "closed" ? "bg-success/10 text-success border-success/20" : 
              ticket.status === "created" ? "bg-info/10 text-info border-info/20" :
              ticket.status === "scheduled" ? "bg-warning/10 text-warning border-warning/20" :
              ticket.status === "visited" ? "bg-info/10 text-info border-info/20" :
              "bg-primary/10 text-primary border-primary/20"
            )}>
                {ticket.status}
            </Badge>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-2xl">
                    <DropdownMenuItem onClick={() => router.push(`/report/${ticket._id}`)} className="py-2.5 font-semibold text-foreground">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        View Report
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onScheduleClick} className="py-2.5 font-semibold text-foreground">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        Schedule Visit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onEditClick} className="py-2.5 font-semibold text-foreground">
                        <Edit className="h-4 w-4 mr-2 text-primary" />
                        Edit Complaint
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive py-2.5 font-bold focus:bg-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Complaint
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="border-b border-border shrink-0 bg-card">
          <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
            <TabsList className="rounded-none bg-transparent p-0 px-4 md:px-6 h-12">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-bold">OVERVIEW</TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-bold">ACTIVITY</TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-bold">CHAT</TabsTrigger>
              <TabsTrigger value="files" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary rounded-none h-full px-4 text-sm font-bold">FILES</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="overview" className="flex-1 overflow-y-auto p-6 space-y-6 custom-sidebar-scrollbar bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border shadow-md"><CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><User className="h-3 w-3"/> Reporter</CardTitle></CardHeader><CardContent className="space-y-4 pt-4"><InfoRow label="Name" value={ticket.reporter} /><InfoRow label="Email" value={ticket.reporterEmail} /><InfoRow label="Phone" value={ticket.phone} /></CardContent></Card>
            <Card className="bg-card border-border shadow-md"><CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><MapPin className="h-3 w-3"/> Location</CardTitle></CardHeader><CardContent className="space-y-4 pt-4"><InfoRow label="Building" value={ticket.building} /><InfoRow label="Room" value={ticket.room} /></CardContent></Card>
            <Card className="bg-card border-border shadow-md"><CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><Info className="h-3 w-3"/> Details</CardTitle></CardHeader><CardContent className="space-y-4 pt-4"><InfoRow label="Priority" value={<Badge variant={ticket.priority === "critical" ? "destructive" : "secondary"} className="capitalize font-bold">{ticket.priority}</Badge>} /><InfoRow label="Category" value={<span className="capitalize text-foreground font-semibold">{ticket.category}</span>} /></CardContent></Card>
            <Card className="bg-card border-border shadow-md"><CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><UserCheck className="h-3 w-3"/> Assignment</CardTitle></CardHeader><CardContent className="space-y-4 pt-4"><InfoRow label="Assigned To" value={(ticket.assignedTo as any)?.name || "Unassigned"} /></CardContent></Card>
          </div>
          <Card className="bg-card border-border shadow-md"><CardHeader className="pb-3 border-b"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><FileText className="h-3 w-3"/> Description</CardTitle></CardHeader><CardContent className="pt-4"><p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground font-medium">{ticket.description}</p></CardContent></Card>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 overflow-y-auto p-6 custom-sidebar-scrollbar bg-background">
            <div className="space-y-6">
                {ticket.history?.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry: IHistory, index: number) => (
                    <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="bg-primary rounded-full p-2"><GitCommit className="h-4 w-4 text-primary-foreground" /></div>
                            {index < ticket.history.length - 1 && <div className="w-px h-full bg-border"></div>}
                        </div>
                        <div className="flex-1 pb-8">
                           <Card className="border-border bg-card shadow-lg"><CardContent className="p-4">
                               <div className="flex items-center justify-between mb-2"><p className="text-sm font-black text-primary uppercase tracking-widest">{entry.action}</p><p className="text-[10px] font-mono text-muted-foreground font-bold">{new Date(entry.timestamp).toLocaleString()}</p></div>
                                <p className="text-xs text-foreground font-black">by {entry.user}</p>
                                {entry.details?.message && ( <blockquote className="text-sm mt-3 p-4 bg-muted rounded-xl whitespace-pre-wrap border-l-4 border-primary text-foreground font-medium italic">{entry.details.message}</blockquote>)}
                           </CardContent></Card>
                        </div>
                    </div>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="chat" className="flex-1 flex flex-col p-0 overflow-hidden bg-background">
          <CommunicationTab complaint={ticket} onUpdate={onComplaintUpdate} />
        </TabsContent>

        <TabsContent value="files" className="flex-1 overflow-y-auto p-6 custom-sidebar-scrollbar bg-background">
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ticket.attachments.map((file, i) => (
                <Card key={i} className="bg-card border-border shadow-md"><CardContent className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="bg-muted p-2 rounded-lg"><Paperclip className="h-4 w-4 text-primary"/></div><span className="text-sm font-bold truncate max-w-[150px] text-foreground">{file}</span></div><Button size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Download className="h-4 w-4 text-primary"/></Button></CardContent></Card>
              ))}
            </div>
          ) : (
            <EmptyState icon={Paperclip} label="No attachments found" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CommunicationTab({ complaint, onUpdate }: { complaint: IComplaint, onUpdate: () => void }) {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher);
  const emailUsername = currentUser?.emailConfig?.imapUser || '';

  const { data: emails, error, mutate: mutateEmails, isLoading } = useSWR(
    complaint.id ? `/api/emails/search?subject=${encodeURIComponent(`[${complaint.id}]`)}` : null,
    fetcher
  );

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;
    setIsSending(true);

    try {
      const conversationEmails = emails || [];
      const latestEmail = conversationEmails.length > 0 ? conversationEmails[conversationEmails.length - 1] : null;

      await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: complaint.reporterEmail, subject: `Re: ${complaint.title} [${complaint.id}]`, text: message,
          inReplyTo: latestEmail?.messageId, references: latestEmail?.references ? `${latestEmail.references} ${latestEmail.messageId}` : latestEmail?.messageId,
        }),
      });

      await fetch(`/api/complaints/${complaint._id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: [{ action: 'User Notified', user: currentUser?.name || 'Admin', timestamp: new Date(), details: { message } }] }),
      });

      toast({ title: "Notification Sent", description: "The user has been notified via email." });
      setMessage('');
      onUpdate();
      setTimeout(() => mutateEmails(), 2000);

    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send message", description: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const isFromAdmin = (email: any) => emailUsername && email.from.toLowerCase().includes(emailUsername.toLowerCase());
  const conversation = Array.isArray(emails) ? [...emails].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 space-y-4 overflow-y-auto p-6 custom-sidebar-scrollbar min-h-0">
        {isLoading && <EmptyState icon={Loader2} label="Syncing secure conversation..." />}
        {error && <EmptyState icon={MessageSquare} label="Could not synchronize messages" />}
        {!isLoading && !error && conversation.length === 0 && <EmptyState icon={MessageSquare} label="Start a secure conversation" />}
        {conversation.map((item: any, index: number) => (
          <div key={index} className={`flex ${isFromAdmin(item) ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-xl ${isFromAdmin(item) ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-card border border-border rounded-tl-none'}`}>
              <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{item.text}</p>
              <div className={cn("flex items-center gap-2 mt-2 text-[10px] font-mono font-black", isFromAdmin(item) ? "justify-end text-primary-foreground" : "justify-start text-muted-foreground")}>
                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isFromAdmin(item) && <CheckCircle className="h-3 w-3" />}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="shrink-0 p-4 border-t border-border bg-card shadow-2xl">
        <div className="relative">
          <Textarea 
            placeholder="Type your secure message..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            className="pr-20 min-h-[100px] resize-none bg-background border-border rounded-xl font-medium text-foreground"
          />
          <Button 
            size="sm" 
            className="absolute right-3 bottom-3 rounded-full h-10 px-4 bg-primary text-primary-foreground shadow-lg font-black" 
            onClick={handleSendMessage} 
            disabled={isSending || !message.trim()}
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}<span className="ml-2">NOTIFY</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, multiline }: any) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <div className={cn("text-sm font-bold text-foreground", multiline && "whitespace-pre-wrap leading-relaxed")}>{value}</div>
    </div>
  )
}

function EmptyState({ icon: Icon, label }: any) {
  return (
    <div className="flex flex-col items-center justify-center text-muted-foreground h-full min-h-[300px]">
      <Icon className="h-12 w-12 mb-4 text-primary animate-pulse" />
      <p className="text-sm font-black uppercase tracking-widest">{label}</p>
    </div>
  )
}

export function CreateComplaintForm({ onClose, onSubmit, complaint, isEditMode = false }: { onClose: () => void, onSubmit: (data: any) => void, complaint?: IComplaint | null, isEditMode?: boolean }) {
  const [formData, setFormData] = useState({
    title: complaint?.title || '', priority: complaint?.priority || 'medium', building: complaint?.building || '', room: complaint?.room || '',
    reporter: complaint?.reporter || '', reporterEmail: complaint?.reporterEmail || '', phone: complaint?.phone || '',
    description: complaint?.description || '', category: complaint?.category || '', type: complaint?.type || 'complaint'
  })
  
  useEffect(() => {
    if (isEditMode && complaint) {
        setFormData({
            title: complaint.title, priority: complaint.priority, building: complaint.building || '', room: complaint.room || '',
            reporter: complaint.reporter, reporterEmail: complaint.reporterEmail, phone: complaint.phone || '',
            description: complaint.description, category: complaint.category, type: complaint.type,
        });
    }
  }, [complaint, isEditMode]);

  const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }))

  const handleTemplateChange = (value: string) => {
    const template = complaintTemplates.find((t) => t.id.toString() === value)
    if(template){
      setFormData(prev => ({
        ...prev, title: template.name, description: template.description,
        category: template.category, type: template.type as 'complaint' | 'request'
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSubmit(formData); }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <RadioGroup defaultValue="complaint" className="grid grid-cols-2 gap-4" value={formData.type} onValueChange={(value) => handleInputChange('type', value)} disabled={isEditMode}>
        <div>
            <RadioGroupItem value="complaint" id="complaint" className="peer sr-only" />
            <Label htmlFor="complaint" className="flex flex-col items-center justify-between rounded-xl border-2 border-border bg-background p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-muted transition-all cursor-pointer">
                <span className="font-black uppercase tracking-widest text-foreground">Complaint</span>
                <span className="text-[10px] text-muted-foreground mt-1 font-bold">Issue report</span>
            </Label>
        </div>
        <div>
            <RadioGroupItem value="request" id="request" className="peer sr-only" />
            <Label htmlFor="request" className="flex flex-col items-center justify-between rounded-xl border-2 border-border bg-background p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-muted transition-all cursor-pointer">
                <span className="font-black uppercase tracking-widest text-foreground">Request</span>
                <span className="text-[10px] text-muted-foreground mt-1 font-bold">Service inquiry</span>
            </Label>
        </div>
      </RadioGroup>

      {!isEditMode && (
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Quick Template</Label>
            <Select onValueChange={handleTemplateChange}>
                <SelectTrigger className="rounded-xl bg-background border-border h-11 text-foreground font-bold">
                    <SelectValue placeholder="Select a template or create custom" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card border-border shadow-2xl">
                    {complaintTemplates.filter(t => t.type === formData.type).map((template) => (
                        <SelectItem key={template.id} value={template.id.toString()} className="font-bold text-foreground">{template.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Title</Label>
            <Input placeholder="Issue title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} required className="rounded-xl h-11 bg-background border-border font-bold text-foreground"/>
        </div>
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="rounded-xl h-11 bg-background border-border font-bold text-foreground">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card border-border shadow-2xl">
                    <SelectItem value="low" className="font-bold">Low</SelectItem>
                    <SelectItem value="medium" className="font-bold">Medium</SelectItem>
                    <SelectItem value="high" className="font-bold">High</SelectItem>
                    <SelectItem value="critical" className="font-bold text-destructive">Critical</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Building</Label>
            <Select value={formData.building} onValueChange={(value) => handleInputChange('building', value)}>
                <SelectTrigger className="rounded-xl h-11 bg-background border-border font-bold text-foreground">
                    <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-card border-border shadow-2xl">
                    <SelectItem value="Global HQ" className="font-bold">Global HQ</SelectItem>
                    <SelectItem value="Innovation Hub" className="font-bold">Innovation Hub</SelectItem>
                    <SelectItem value="Data Center" className="font-bold">Data Center</SelectItem>
                    <SelectItem value="EMEA Office" className="font-bold">EMEA Office</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Room Number</Label>
            <Input placeholder="e.g., Suite 101" value={formData.room} onChange={(e) => handleInputChange('room', e.target.value)} required className="rounded-xl h-11 bg-background border-border font-bold text-foreground"/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Reporter Name</Label>
            <Input placeholder="Full name" value={formData.reporter} onChange={(e) => handleInputChange('reporter', e.target.value)} required className="rounded-xl h-11 bg-background border-border font-bold text-foreground"/>
        </div>
        <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Email</Label>
            <Input placeholder="email@company.com" type="email" value={formData.reporterEmail} onChange={(e) => handleInputChange('reporterEmail', e.target.value)} required className="rounded-xl h-11 bg-background border-border font-bold text-foreground"/>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Description</Label>
        <Textarea placeholder="Detailed description..." value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} className="min-h-[120px] rounded-xl bg-background border-border p-4 text-foreground font-medium" required />
      </div>

      <div className="flex justify-end gap-3 pt-6 sticky bottom-0 bg-card pb-2 border-t mt-4">
        <Button variant="ghost" type="button" onClick={onClose} className="rounded-full px-6 font-bold text-foreground">Cancel</Button>
        <Button type="submit" className="rounded-full px-8 bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black">
            {isEditMode ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {isEditMode ? 'UPDATE TICKET' : 'LAUNCH TICKET'}
        </Button>
      </div>
    </form>
  )
}

function ScheduleVisitDialog({ complaint, engineers, isOpen, onOpenChange, onSuccess }: { complaint: IComplaint; engineers: IUser[]; isOpen: boolean; onOpenChange: (isOpen: boolean) => void; onSuccess: () => void; }) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher);
    const [formData, setFormData] = useState({ date: '', time: '', assignedTo: '', notes: '' });
    const today = new Date().toISOString().split('T')[0];
  
    useEffect(() => {
        if(complaint) {
            let assigned = (complaint.assignedTo as any)?._id || '';
            if (currentUser?.role === 'engineer') { assigned = currentUser._id; }
            const scheduleDate = complaint.scheduledAt ? new Date(complaint.scheduledAt) : new Date();
            setFormData(prev => ({ ...prev, assignedTo: assigned, date: scheduleDate.toISOString().split('T')[0], time: scheduleDate.toTimeString().split(' ')[0].substring(0,5), }));
        }
    }, [complaint, currentUser]);

    const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      const scheduledAt = new Date(`${formData.date}T${formData.time}`);
      
      let finalAssignedTo = formData.assignedTo;
      if (currentUser?.role === 'engineer') { finalAssignedTo = currentUser._id; }
      
      try {
        await fetch(`/api/complaints/${complaint._id}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                status: 'scheduled', scheduledAt: scheduledAt.toISOString(), assignedTo: finalAssignedTo,
                history: [{
                    action: `Visit scheduled for ${formData.date} at ${formData.time}`, user: 'System', timestamp: new Date(),
                    details: { notes: formData.notes }
                }]
            }),
        });
  
        toast({ title: "Visit Scheduled", description: "Visit has been scheduled and parties notified." });
        onSuccess();
      } catch (err: any) {
          toast({ variant: "destructive", title: "Scheduling Failed", description: err.message });
      } finally {
          setIsSubmitting(false);
      }
    };
  
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl max-w-lg bg-card border-border shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black text-foreground uppercase tracking-widest">Schedule Dispatch</DialogTitle>
                    <DialogDescription className="text-muted-foreground font-bold">Assign an engineer and coordinate a physical site visit.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Date</Label>
                            <Input type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} required min={today} className="rounded-xl h-11 bg-background border-border text-foreground font-bold"/>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Time</Label>
                            <Input type="time" value={formData.time} onChange={(e) => handleInputChange('time', e.target.value)} required className="rounded-xl h-11 bg-background border-border text-foreground font-bold"/>
                        </div>
                    </div>
                    {currentUser?.role !== 'engineer' && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Assign Professional</Label>
                            <Select value={formData.assignedTo} onValueChange={(v) => handleInputChange('assignedTo', v)} required>
                                <SelectTrigger className="rounded-xl h-11 bg-background border-border text-foreground font-bold">
                                    <SelectValue placeholder="Select engineer" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl bg-card border-border shadow-2xl">
                                    {engineers.map((engineer) => (
                                        <SelectItem key={engineer._id} value={engineer._id.toString()} className="font-bold text-foreground">{engineer.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Briefing Notes</Label>
                        <Textarea placeholder="Instructions..." value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} className="rounded-xl bg-background border-border h-24 text-foreground font-medium"/>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => onOpenChange(false)} className="rounded-full font-bold text-foreground">Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="rounded-full px-6 bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-black">
                            {isSubmitting ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : (<Calendar className="h-4 w-4 mr-2" />)}
                            SCHEDULE
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

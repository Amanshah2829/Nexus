
"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Progress } from "@/app/components/ui/progress"
import {
  Plus,
  BookOpen,
  Search,
  Clock,
  CheckCircle,
  FileText,
  User,
  Wrench,
  ChevronRight,
  GitCommit,
  Loader2
} from "lucide-react"
import { IComplaint, IHistory } from "@/app/models/Complaint"
import { IUser } from "@/app/models/User"
import { ISolution } from "@/app/models/Solution"
import { LoadingAnimation } from "@/app/components/ui/loading-animation"
import { CreateComplaintForm } from "@/app/components/complaints-content"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/app/components/ui/input"
import { ComplaintRemoteSupportButton } from "./complaint-remote-support-button"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const lifecycleStages = [
  { id: "created", name: "Created" },
  { id: "scheduled", name: "Scheduled" },
  { id: "visited", name: "Visited" },
  { id: "observation", name: "Observation" },
  { id: "follow-up", name: "Follow-up" },
  { id: "closed", name: "Closed" },
]

export function UserPortalContent() {
  const searchParams = useSearchParams();
  const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher)
  const { data: complaints, error: complaintsError, mutate: mutateComplaints } = useSWR<IComplaint[]>(
    currentUser ? `/api/complaints?reporterEmail=${currentUser.email}` : null, 
    fetcher,
    { refreshInterval: 10000 }
  )
  
  const [selectedTicket, setSelectedTicket] = useState<IComplaint | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const { toast } = useToast();

  const complaintsArray = Array.isArray(complaints) ? complaints : [];

  useEffect(() => {
    if (complaintsArray.length > 0) {
      const ticketId = searchParams.get('id');
      if (ticketId) {
        const found = complaintsArray.find(c => c._id === ticketId || c.id === ticketId);
        if (found) {
          setSelectedTicket(found);
        }
      }
    }
  }, [complaintsArray, searchParams]);

  const handleCreateComplaint = async (formData: any) => {
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, reporter: currentUser?.name, reporterEmail: currentUser?.email }),
      });

      if (!response.ok) throw new Error('Failed to create ticket');
      
      const newComplaint = await response.json();
      mutateComplaints();
      setSelectedTicket(newComplaint);
      setIsCreateTicketOpen(false);
      toast({ title: "Success", description: "Your ticket has been submitted." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Could not create ticket." });
    }
  };

  if (!currentUser || !complaints) {
    return <div className="flex h-full w-full items-center justify-center"><LoadingAnimation /></div>
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold">Welcome, {currentUser.name?.split(' ')[0]}</h1>
            <p className="text-muted-foreground">Here's an overview of your support tickets and resources.</p>
        </div>
        <Button onClick={() => setIsCreateTicketOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Submit New Ticket
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">My Tickets</h2>
            {complaintsArray.length > 0 ? (
                <div className="space-y-4">
                    {complaintsArray.map(ticket => (
                        <TicketCard key={ticket._id} ticket={ticket} onSelect={() => setSelectedTicket(ticket)} isSelected={selectedTicket?._id === ticket._id} />
                    ))}
                </div>
            ) : (
                <Card className="flex flex-col items-center justify-center text-center p-10 border-2 border-dashed">
                    <FileText className="h-10 w-10 text-muted-foreground mb-2"/>
                    <p className="font-medium">No tickets found.</p>
                    <p className="text-sm text-muted-foreground">Submit a new ticket to get started.</p>
                </Card>
            )}
        </div>
        <div className="space-y-6">
             {selectedTicket ? (
                <TicketDetails ticket={selectedTicket} currentUser={currentUser} />
             ) : (
                <KnowledgeBasePreview />
             )}
        </div>
      </div>

       <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogHeader>
              <DialogTitle>Submit a New Ticket</DialogTitle>
            </DialogHeader>
          </DialogHeader>
          <CreateComplaintForm 
            onClose={() => setIsCreateTicketOpen(false)} 
            onSubmit={handleCreateComplaint}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TicketCard({ ticket, onSelect, isSelected }: { ticket: IComplaint; onSelect: () => void, isSelected: boolean }) {
    const stageIndex = lifecycleStages.findIndex(s => s.id === ticket.status);
    const progress = stageIndex !== -1 ? ((stageIndex + 1) / lifecycleStages.length) * 100 : 0;
    
    return (
        <Card className={`cursor-pointer hover:bg-accent/50 transition-all ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}`} onClick={onSelect}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter">{ticket.id}</p>
                        <p className="font-bold text-base truncate">{ticket.title}</p>
                    </div>
                    <Badge variant={ticket.status === 'closed' ? 'default' : 'secondary'} className="capitalize shrink-0">{ticket.status}</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                   <div className="flex items-center gap-1.5"><Clock className="h-3 w-3"/> Submitted on {new Date(ticket.createdAt).toLocaleDateString()}</div>
                </div>
                 <div className="mt-4">
                    <Progress value={progress} className="h-1.5"/>
                 </div>
            </CardContent>
        </Card>
    )
}

function TicketDetails({ ticket, currentUser }: { ticket: IComplaint, currentUser: IUser }) {
    return (
        <Card className="flex flex-col h-full sticky top-6 shadow-2xl border-primary/10">
            <CardHeader className="border-b bg-muted/20">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg leading-tight font-black">{ticket.title}</CardTitle>
                        <CardDescription className="font-mono text-[10px] mt-1 text-primary font-bold">{ticket.id}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            
            <div className="p-4 border-b bg-muted/10">
                <ComplaintRemoteSupportButton 
                    complaintId={ticket._id} 
                    complaintTitle={ticket.title} 
                    userRole={currentUser.role} 
                    isComplainer={currentUser.email === ticket.reporterEmail}
                />
            </div>

            <CardContent className="space-y-6 pt-6 flex-1 overflow-y-auto max-h-[60vh] custom-sidebar-scrollbar">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">SITUATION REPORT</h4>
                    <p className="text-sm p-4 bg-muted/50 rounded-xl leading-relaxed whitespace-pre-wrap font-medium">
                        {ticket.description}
                    </p>
                </div>
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">OPERATIONAL TIMELINE</h4>
                    <div className="space-y-4">
                        {(ticket.history || []).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="bg-primary/10 p-2 rounded-full mt-1 shrink-0">
                                    <GitCommit className="h-4 w-4 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-foreground truncate">{entry.action}</p>
                                    <p className="text-[10px] font-mono text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                                    {entry.details?.message && (
                                        <blockquote className="text-xs mt-2 p-3 bg-card border border-border rounded-lg italic text-foreground/80 leading-relaxed shadow-sm">
                                            "{entry.details.message}"
                                        </blockquote>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </CardContent>
            
            <div className="p-4 border-t bg-muted/20">
                <p className="text-[9px] text-center text-muted-foreground uppercase font-black tracking-tight leading-tight">
                    Nexus Remote Protocol Active. <br />
                    Controlled environment for service demonstration.
                </p>
            </div>
        </Card>
    )
}

function KnowledgeBasePreview() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: solutions, isLoading } = useSWR<ISolution[]>(`/api/solutions?search=${searchQuery}`, fetcher);

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Resource Library</CardTitle>
        </div>
        <CardDescription className="text-xs">Find solutions to common problems instantly.</CardDescription>
        <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-px h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search solutions..." className="pl-10 h-10 rounded-xl" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary"/></div>}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-sidebar-scrollbar">
          {Array.isArray(solutions) && solutions.slice(0, 5).map(solution => (
            <div key={solution._id} className="p-3 bg-muted/50 rounded-xl hover:bg-muted border border-border/50 transition-colors cursor-default">
              <p className="text-sm font-bold flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-primary shrink-0"/>
                {solution.title}
              </p>
            </div>
          ))}
          {Array.isArray(solutions) && solutions.length === 0 && (
            <div className="text-center py-10 opacity-50">
                <FileText className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">No matching docs</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

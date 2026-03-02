
"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  GitCommit
} from "lucide-react"
import { IComplaint, IHistory } from "@/models/Complaint"
import { IUser } from "@/models/User"
import { ISolution } from "@/models/Solution"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { CreateComplaintForm } from "@/components/complaints-content"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

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
  const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher)
  const { data: complaints, error: complaintsError, mutate: mutateComplaints } = useSWR<IComplaint[]>(currentUser ? `/api/complaints?reporterEmail=${currentUser.email}` : null, fetcher)
  
  const [selectedTicket, setSelectedTicket] = useState<IComplaint | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const { toast } = useToast();

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
            <h1 className="text-2xl font-semibold">Welcome, {currentUser.name.split(' ')[0]}</h1>
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
            {complaints.length > 0 ? (
                <div className="space-y-4">
                    {complaints.map(ticket => (
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
                <TicketDetails ticket={selectedTicket} />
             ) : (
                <KnowledgeBasePreview />
             )}
        </div>
      </div>

       <Dialog open={isCreateTicketOpen} onOpenChange={setIsCreateTicketOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit a New Ticket</DialogTitle>
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
        <Card className={`cursor-pointer hover:bg-accent/50 transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`} onClick={onSelect}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-sm text-muted-foreground">{ticket.id}</p>
                        <p className="font-semibold">{ticket.title}</p>
                    </div>
                    <Badge variant={ticket.status === 'closed' ? 'default' : 'secondary'} className="capitalize">{ticket.status}</Badge>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                   <div className="flex items-center gap-1.5"><Clock className="h-3 w-3"/> Submitted on {new Date(ticket.createdAt).toLocaleDateString()}</div>
                </div>
                 <div className="mt-3">
                    <Progress value={progress} className="h-2"/>
                 </div>
            </CardContent>
        </Card>
    )
}

function TicketDetails({ ticket }: { ticket: IComplaint }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{ticket.title}</CardTitle>
                <CardDescription>{ticket.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="text-sm font-semibold mb-2">Description</h4>
                    <p className="text-sm p-3 bg-muted/50 rounded-md">{ticket.description}</p>
                </div>
                 <div>
                    <h4 className="text-sm font-semibold mb-2">Timeline</h4>
                    <div className="space-y-4">
                        {ticket.history.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((entry, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className="bg-muted p-2 rounded-full mt-1">
                                    <GitCommit className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{entry.action}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                                    {entry.details?.message && <blockquote className="text-xs mt-1 p-2 bg-accent/50 rounded-md">{entry.details.message}</blockquote>}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </CardContent>
        </Card>
    )
}

function KnowledgeBasePreview() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: solutions, isLoading } = useSWR<ISolution[]>(`/api/solutions?search=${searchQuery}`, fetcher);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <CardTitle>Knowledge Base</CardTitle>
        </div>
        <CardDescription>Find solutions to common problems.</CardDescription>
        <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-px h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search solutions..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <div className="text-center p-4"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div>}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {solutions?.slice(0, 5).map(solution => (
            <div key={solution._id} className="p-3 bg-muted/50 rounded-md">
              <p className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary"/>
                {solution.title}
              </p>
            </div>
          ))}
          {solutions && solutions.length === 0 && <p className="text-sm text-center text-muted-foreground p-4">No solutions found.</p>}
        </div>
      </CardContent>
    </Card>
  )
}

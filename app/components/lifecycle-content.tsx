
"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  ArrowRight,
  Clock,
  CheckCircle,
  FileText,
  Camera,
  MessageSquare,
  User,
  MapPin,
  Phone,
  Mail,
  Edit,
  Download,
  Loader2,
} from "lucide-react"
import { IComplaint } from "@/models/Complaint"
import { useToast } from "@/hooks/use-toast"
import { LoadingAnimation } from "@/components/ui/loading-animation"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const lifecycleStages = [
  { id: "created", name: "Created", color: "bg-blue-500", description: "Complaint received and logged" },
  { id: "scheduled", name: "Scheduled", color: "bg-yellow-500", description: "Visit scheduled with engineer" },
  { id: "visited", name: "Visited", color: "bg-orange-500", description: "Engineer visited the location" },
  { id: "observation", name: "Observation", color: "bg-purple-500", description: "Issue analyzed and documented" },
  { id: "follow-up", name: "Follow-up", color: "bg-indigo-500", description: "Additional actions taken" },
  { id: "closed", name: "Closed", color: "bg-green-500", description: "Issue resolved and closed" },
]

export function LifecycleContent() {
  const [selectedComplaint, setSelectedComplaint] = useState<IComplaint | null>(null)
  const [selectedStage, setSelectedStage] = useState("all")
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

  const { data: complaints, error, isLoading } = useSWR<IComplaint[]>('/api/complaints', fetcher)

  const getStageProgress = (currentStage: string) => {
    const stageIndex = lifecycleStages.findIndex((stage) => stage.id === currentStage)
    return ((stageIndex + 1) / lifecycleStages.length) * 100
  }

  const getFilteredComplaints = () => {
    if (!complaints) return []
    if (selectedStage === "all") return complaints
    return complaints.filter((complaint) => complaint.status === selectedStage)
  }

  const getStageColor = (stageId: string) => {
    const stage = lifecycleStages.find((s) => s.id === stageId)
    return stage?.color || "bg-gray-500"
  }

  const handleUpdateSuccess = () => {
    mutate('/api/complaints')
    if (selectedComplaint) {
      // Re-fetch the selected complaint to update its details
      fetch(`/api/complaints/${selectedComplaint._id}`)
        .then(res => res.json())
        .then(data => setSelectedComplaint(data))
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-border bg-card/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-semibold">Complaint Lifecycle</h1>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Stage Filter */}
          <div className="flex items-center gap-2 flex-wrap mt-4">
            <Button
              variant={selectedStage === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStage("all")}
            >
              All ({complaints?.length || 0})
            </Button>
            {lifecycleStages.map((stage) => {
              const count = complaints?.filter((c) => c.status === stage.id).length || 0
              return (
                <Button
                  key={stage.id}
                  variant={selectedStage === stage.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStage(stage.id)}
                  className="flex items-center gap-2"
                >
                  <div className={`w-2 h-2 rounded-full ${stage.color}`}></div>
                  {stage.name} ({count})
                </Button>
              )
            })}
          </div>
        </div>

        {/* Lifecycle Overview */}
        <div className="hidden md:block p-4 md:p-6 border-b border-border bg-card/20 overflow-x-auto">
          <h2 className="text-lg font-medium mb-4">Workflow Stages</h2>
          <div className="flex items-start justify-between min-w-max">
            {lifecycleStages.map((stage, index) => (
              <div key={stage.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-full ${stage.color} flex items-center justify-center text-white text-sm font-medium`}
                  >
                    {index + 1}
                  </div>
                  <div className="text-xs font-medium mt-2">{stage.name}</div>
                  <div className="text-xs text-muted-foreground w-24 mt-1">{stage.description}</div>
                </div>
                {index < lifecycleStages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground mx-4 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Complaints List */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {isLoading && <div className="flex justify-center items-center h-full"><LoadingAnimation /></div>}
          {error && <div className="text-center text-destructive">Failed to load complaints.</div>}
          <div className="space-y-4">
            {getFilteredComplaints().map((complaint) => (
              <Card
                key={complaint._id}
                className="glass-card cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-muted-foreground">{complaint.id}</span>
                          <Badge
                            variant={
                              complaint.priority === "critical"
                                ? "destructive"
                                : complaint.priority === "high"
                                  ? "default"
                                  : complaint.priority === "medium"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {complaint.priority}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-base md:text-lg">{complaint.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {complaint.reporter}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {complaint.building} - {complaint.room}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={`${getStageColor(complaint.status)} text-white`}>
                        {lifecycleStages.find((s) => s.id === complaint.status)?.name}
                      </Badge>
                      {complaint.assignedTo && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(complaint.assignedTo as any)?.avatar || `https://avatar.vercel.sh/${(complaint.assignedTo as any)?.name}.png`} />
                          <AvatarFallback className="text-xs">
                            {(complaint.assignedTo as any)?.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Progress</span>
                      <span>{Math.round(getStageProgress(complaint.status))}%</span>
                    </div>
                    <Progress value={getStageProgress(complaint.status)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Complaint Details Sidebar */}
      {selectedComplaint && (
        <div className="w-full md:w-96 border-l border-border bg-card/30">
          <ComplaintLifecycleDetails
            complaint={selectedComplaint}
            onClose={() => setSelectedComplaint(null)}
            onUpdate={() => setIsUpdateDialogOpen(true)}
          />
        </div>
      )}

      {/* Update Stage Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Complaint Stage</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <UpdateStageForm
              complaint={selectedComplaint}
              onClose={() => setIsUpdateDialogOpen(false)}
              onSuccess={handleUpdateSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ComplaintLifecycleDetails({
  complaint,
  onClose,
  onUpdate,
}: {
  complaint: IComplaint
  onClose: () => void
  onUpdate: () => void
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Lifecycle Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Basic Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Complaint Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">ID</label>
              <p className="text-sm">{complaint.id}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <p className="text-sm">{complaint.title}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Current Stage</label>
              <Badge
                className={`${lifecycleStages.find((s) => s.id === complaint.status)?.color} text-white`}
              >
                {lifecycleStages.find((s) => s.id === complaint.status)?.name}
              </Badge>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Progress</label>
              <div className="mt-1">
                <Progress
                  value={
                    ((lifecycleStages.findIndex((s) => s.id === complaint.status) + 1) / lifecycleStages.length) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complaint.history.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry: any, index: number) => {
                const stageId = lifecycleStages.find(s => entry.action.toLowerCase().includes(s.id))?.id || 'created';
                const stage = lifecycleStages.find((s) => s.id === stageId)
                return (
                  <div key={index} className="flex gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${stage?.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{entry.action}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {entry.details?.message && <p className="text-xs text-muted-foreground mb-2 p-2 bg-accent/50 rounded-md whitespace-pre-wrap">{entry.details.message}</p>}
                      <div className="text-xs text-muted-foreground">by {entry.user}</div>
                      {entry.attachments?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {entry.attachments.map((attachment: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <FileText className="h-3 w-3" />
                              <span>{attachment}</span>
                              <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reporter Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Reporter Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{complaint.reporter}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{complaint.reporterEmail}</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{complaint.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Engineer */}
        {complaint.assignedTo && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Assigned Engineer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={(complaint.assignedTo as any)?.avatar || `https://avatar.vercel.sh/${(complaint.assignedTo as any)?.name}.png`} />
                <AvatarFallback>
                  {(complaint.assignedTo as any)?.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{(complaint.assignedTo as any)?.name}</p>
                <p className="text-xs text-muted-foreground">{(complaint.assignedTo as any)?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={onUpdate}>
            <Edit className="h-4 w-4 mr-2" />
            Update Stage
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <MessageSquare className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>
    </div>
  )
}

function UpdateStageForm({ complaint, onClose, onSuccess }: { complaint: IComplaint; onClose: () => void; onSuccess: () => void; }) {
  const [selectedStage, setSelectedStage] = useState("")
  const [notes, setNotes] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast()

  const currentStageIndex = lifecycleStages.findIndex((s) => s.id === complaint.status)
  const availableStages = lifecycleStages.slice(currentStageIndex + 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStage) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a stage to move to.",
        });
        return;
    }
    setIsSubmitting(true);
    try {
        const response = await fetch(`/api/complaints/${complaint._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: selectedStage,
                history: [
                    {
                        action: `Status changed to ${selectedStage}`,
                        user: 'Admin', // Replace with actual user
                        timestamp: new Date(),
                        details: { message: notes }
                    }
                ]
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update complaint stage');
        }

        toast({
            title: "Success",
            description: `Complaint stage updated to "${selectedStage}".`,
        });
        onSuccess();
        onClose();

    } catch (err: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: err.message,
        });
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Current Stage</label>
        <div className="p-3 bg-muted rounded-md">
          <Badge
            className={`${lifecycleStages.find((s) => s.id === complaint.status)?.color} text-white`}
          >
            {lifecycleStages.find((s) => s.id === complaint.status)?.name}
          </Badge>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Move to Stage</label>
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger>
            <SelectValue placeholder="Select next stage" />
          </SelectTrigger>
          <SelectContent>
            {availableStages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                  {stage.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Notes</label>
        <Textarea
          placeholder="Add notes about this stage update..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Attachments</label>
        <div className="border-2 border-dashed border-border rounded-md p-4 text-center">
          <input
            type="file"
            multiple
            className="hidden"
            id="attachments"
            onChange={(e) => {
              if (e.target.files) {
                setAttachments(Array.from(e.target.files))
              }
            }}
          />
          <label htmlFor="attachments" className="cursor-pointer">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload files</p>
          </label>
        </div>
        {attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {attachments.map((file, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedStage || !notes || isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
          Update Stage
        </Button>
      </div>
    </form>
  )
}

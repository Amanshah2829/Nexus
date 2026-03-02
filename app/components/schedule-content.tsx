

"use client"

import { useState, useMemo, DragEvent } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, User, MapPin, Calendar, Plus, ChevronLeft, ChevronRight, Loader2, GripVertical, CheckCircle } from "lucide-react"
import { IComplaint } from "@/models/Complaint"
import { IUser } from "@/models/User"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { ScheduleVisitDialog } from "@/components/complaints-content"
import { useToast } from "@/hooks/use-toast"
import { cn } from "../lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Define time slots for the calendar view
const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 9; // 9 AM to 8 PM
    return `${hour % 12 === 0 ? 12 : hour % 12}${hour < 12 ? 'am' : 'pm'}`;
});

export function ScheduleContent() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [complaintToSchedule, setComplaintToSchedule] = useState<IComplaint | null>(null)
  
  const { data: complaints, error: complaintsError, mutate: mutateComplaints } = useSWR<IComplaint[]>('/api/complaints', fetcher)
  const { data: users, error: usersError } = useSWR<IUser[]>('/api/users', fetcher)

  const { toast } = useToast();
  const isMobile = useIsMobile();

  const isLoading = !complaints || !users;

  const unscheduledComplaints = useMemo(() => {
    return complaints?.filter(c => !c.scheduledAt && c.status !== 'closed' && c.status !== 'archived') || []
  }, [complaints])

  const scheduledComplaints = useMemo(() => {
    return complaints?.filter(c => {
        if(!c.scheduledAt) return false;
        const scheduledDate = new Date(c.scheduledAt);
        return scheduledDate.toDateString() === currentDate.toDateString();
    }) || []
  }, [complaints, currentDate])

  const engineers = useMemo(() => {
    return users?.filter(u => u.role === 'engineer' && u.status === 'active') || []
  }, [users])
  
  const changeDay = (amount: number) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + amount);
        return newDate;
    })
  }

  const handleDragStart = (e: DragEvent<HTMLDivElement>, complaint: IComplaint) => {
    e.dataTransfer.setData("complaintId", complaint._id);
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, engineerId: string, hour: number) => {
    e.preventDefault();
    const complaintId = e.dataTransfer.getData("complaintId");
    const complaint = unscheduledComplaints.find(c => c._id === complaintId);
    
    if (complaint) {
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(hour, 0, 0, 0);

        setComplaintToSchedule({ ...complaint, assignedTo: engineerId as any, scheduledAt: scheduledTime } as IComplaint);
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }
  
  const handleScheduleSuccess = () => {
    mutateComplaints();
    setComplaintToSchedule(null);
  }

  if (isLoading) return <div className="h-full flex items-center justify-center"><LoadingAnimation/></div>
  if (complaintsError || usersError) return <div>Failed to load schedule data</div>

  const UnscheduledColumn = (
    <div className="flex flex-col h-full min-h-0">
      <h2 className="font-semibold text-lg pb-4 hidden lg:block">Unscheduled ({unscheduledComplaints.length})</h2>
      <Card className="bg-muted/30 flex-1">
        <CardContent className="p-4 space-y-3 h-full overflow-y-auto">
          {unscheduledComplaints.map(complaint => (
            <UnscheduledTicketCard 
                key={complaint._id} 
                complaint={complaint} 
                onDragStart={(e) => handleDragStart(e, complaint)}
                onScheduleClick={() => setComplaintToSchedule(complaint)}
                isMobile={isMobile}
            />
          ))}
          {unscheduledComplaints.length === 0 && (
            <div className="text-center text-muted-foreground py-10">
              <CheckCircle className="h-8 w-8 mx-auto mb-2"/>
              <p>All tickets scheduled!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const EngineerTimelines = (
     <div className="flex-1 overflow-x-auto h-full min-h-0">
        <div className="grid grid-flow-col auto-cols-fr gap-2 h-full" style={{minWidth: `${engineers.length * 250}px`}}>
            {engineers.map(engineer => (
                <EngineerTimeline 
                    key={engineer._id} 
                    engineer={engineer} 
                    tasks={scheduledComplaints.filter(c => (c.assignedTo as any)?._id === engineer._id)} 
                    onDrop={handleDrop}
                    currentDate={currentDate}
                />
            ))}
        </div>
    </div>
  );


  return (
    <div className="p-4 md:p-6 space-y-6 flex flex-col h-full">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h1 className="text-2xl font-semibold">Engineer Schedule</h1>
            <p className="text-muted-foreground">Drag unscheduled tickets onto an engineer's timeline to schedule a visit.</p>
        </div>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => changeDay(-1)}><ChevronLeft className="h-4 w-4"/></Button>
            <span className="font-medium text-lg w-48 text-center">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
             <Button variant="outline" size="icon" onClick={() => changeDay(1)}><ChevronRight className="h-4 w-4"/></Button>
             <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </div>
      </header>
      
      {isMobile ? (
        <Tabs defaultValue="unscheduled" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="unscheduled">Unscheduled ({unscheduledComplaints.length})</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="unscheduled" className="flex-1 min-h-0 mt-4">
                {UnscheduledColumn}
            </TabsContent>
            <TabsContent value="timeline" className="flex-1 min-h-0 mt-4">
                {EngineerTimelines}
            </TabsContent>
        </Tabs>
      ) : (
         <div className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start min-h-0">
            {UnscheduledColumn}
            {EngineerTimelines}
        </div>
      )}


       {complaintToSchedule && (
        <ScheduleVisitDialog
          complaint={complaintToSchedule}
          engineers={engineers}
          isOpen={!!complaintToSchedule}
          onOpenChange={(isOpen) => !isOpen && setComplaintToSchedule(null)}
          onSuccess={handleScheduleSuccess}
        />
      )}
    </div>
  )
}

function UnscheduledTicketCard({ complaint, onDragStart, onScheduleClick, isMobile }: {
    complaint: IComplaint,
    onDragStart: (e: DragEvent<HTMLDivElement>) => void,
    onScheduleClick: () => void,
    isMobile: boolean,
}) {
    return (
        <Card
            className="bg-card shadow-sm group"
            draggable={!isMobile}
            onDragStart={onDragStart}
        >
            <CardContent className="p-3">
                <div className="flex gap-2">
                    {!isMobile && (
                        <div className="flex items-center justify-center cursor-grab text-muted-foreground group-hover:text-foreground">
                            <GripVertical className="h-5 w-5" />
                        </div>
                    )}
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-sm leading-tight">{complaint.title}</p>
                            <Badge variant={complaint.priority === 'high' || complaint.priority === 'critical' ? 'destructive' : complaint.priority === 'medium' ? 'secondary' : 'outline'} className="text-xs">
                                {complaint.priority}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{complaint.id}</p>
                        <div className="text-xs text-muted-foreground space-y-1 pt-1">
                            <div className="flex items-center gap-1.5"><User className="h-3 w-3" />{complaint.reporter}</div>
                            <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{complaint.building} - {complaint.room}</div>
                        </div>
                    </div>
                </div>
                 {isMobile && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <Button className="w-full" size="sm" onClick={onScheduleClick}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Visit
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function EngineerTimeline({ engineer, tasks, onDrop, currentDate }: { engineer: IUser, tasks: IComplaint[], onDrop: (e: DragEvent<HTMLDivElement>, engineerId: string, hour: number) => void, currentDate: Date }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = currentDate < today;
    
    return (
        <div className="flex flex-col h-full">
             <div className="flex items-center gap-3 p-2 mb-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <Avatar>
                    <AvatarImage src={engineer.avatar || `https://avatar.vercel.sh/${engineer.name}.png`} />
                    <AvatarFallback>{engineer.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-medium">{engineer.name}</p>
                    <p className="text-xs text-muted-foreground">{tasks.length} tasks scheduled</p>
                </div>
            </div>
            <div className="flex-1 relative border-l border-dashed">
                 {timeSlots.map((slot, index) => {
                    const hour = index + 9;
                    return (
                        <div 
                            key={slot} 
                            className={cn("h-20 border-t border-dashed relative", isPastDate && "bg-muted/30 cursor-not-allowed")}
                            onDrop={(e) => {
                                if(isPastDate) return;
                                onDrop(e, engineer._id, hour)
                            }}
                            onDragOver={(e) => {
                                if(isPastDate) return;
                                handleDragOver(e)
                            }}
                        >
                            <span className="absolute -left-8 top-0 text-xs text-muted-foreground">{slot}</span>
                        </div>
                    )
                 })}

                {tasks.map(task => {
                    const scheduledTime = new Date(task.scheduledAt!);
                    const topPosition = (scheduledTime.getHours() - 9 + (scheduledTime.getMinutes() / 60)) * 5; // 5rem per hour (h-20)
                    return (
                        <div
                            key={task._id}
                            className="absolute w-[calc(100%-0.5rem)] ml-1"
                            style={{ top: `${topPosition}rem`}}
                        >
                            <ScheduledTaskCard task={task} />
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

function ScheduledTaskCard({ task }: { task: IComplaint }) {
    const scheduledTime = task.scheduledAt ? new Date(task.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    
    return (
        <Card className="bg-card shadow-md">
            <CardContent className="p-3">
                <p className="font-semibold text-sm mb-1 line-clamp-1">{task.title}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3"/>{task.room}</div>
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3"/>{scheduledTime}</div>
                </div>
            </CardContent>
        </Card>
    )
}
function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
}

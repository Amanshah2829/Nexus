
"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Bell, Mail, GitCommit } from "lucide-react"
import { IComplaint } from "@/models/Complaint"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import Link from "next/link"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function NotificationsContent() {
  const [filter, setFilter] = useState("all")

  const { data: complaints, error, isLoading } = useSWR<IComplaint[]>('/api/complaints?status=all', fetcher)

  const complaintsArray = Array.isArray(complaints) ? complaints : [];

  const notifications = complaintsArray
    .flatMap(complaint =>
      (complaint.history || []).map(h => ({
        ...h,
        id: `${complaint._id}-${h.timestamp}`,
        complaintId: complaint._id,
        complaintTitle: complaint.title,
        complaintTicketNumber: complaint.ticketNumber,
        type: h.action.toLowerCase().includes("email") || h.action.toLowerCase().includes("notified") ? "email" : "system",
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
  const filteredNotifications = notifications.filter(n => filter === 'all' || n.type === filter);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifications
        </h1>
        <div className="flex items-center gap-2">
            <Button variant="outline">Mark all as read</Button>
        </div>
      </div>
      
       <div className="flex items-center gap-2 flex-wrap">
            <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                >
                All ({notifications.length})
            </Button>
             <Button
                variant={filter === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("system")}
                >
                System Updates
            </Button>
            <Button
                variant={filter === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("email")}
                >
                Email Replies
            </Button>
      </div>


      {isLoading && <div className="flex justify-center p-10"><LoadingAnimation /></div>}
      {error && <div className="text-destructive text-center p-10">Failed to load notifications.</div>}

      <div className="space-y-4">
        {filteredNotifications.map((notification: any) => (
          <Card key={notification.id} className="glass-card">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="p-3 bg-muted rounded-full">
                {notification.type === 'email' ? <Mail className="h-5 w-5 text-muted-foreground" /> : <GitCommit className="h-5 w-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{notification.action}</p>
                    <p className="text-xs text-muted-foreground">{new Date(notification.timestamp).toLocaleString()}</p>
                </div>
                 <p className="text-sm text-muted-foreground mt-1">
                    On ticket <Link href={`/complaints?id=${notification.complaintId}`} className="font-semibold text-primary hover:underline">{notification.complaintTicketNumber}</Link>: "{notification.complaintTitle}"
                </p>
                {notification.details?.message && (
                    <blockquote className="mt-2 text-xs p-2 bg-accent/50 rounded-md border-l-2 border-primary">
                        {notification.details.message}
                    </blockquote>
                )}
              </div>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Check className="h-4 w-4" />
               </Button>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 && !isLoading && (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <Bell className="h-10 w-10 mx-auto mb-2"/>
                <p>No notifications yet.</p>
            </div>
        )}
      </div>
    </div>
  )
}

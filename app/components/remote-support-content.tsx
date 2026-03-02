
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Monitor, Phone, Video, MessageSquare, Plus, ArrowRight } from "lucide-react"

const sessions = [
    { id: 'RS-123', user: 'Alvin Row', device: 'Desktop-LHR', status: 'connected', duration: '12:34' },
    { id: 'RS-124', user: 'Jane Doe', device: 'Laptop-NYC', status: 'pending', duration: '00:00' },
    { id: 'RS-125', user: 'Sam Wilson', device: 'Surface-SFO', status: 'disconnected', duration: '05:12' },
]

export function RemoteSupportContent() {

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Remote Support</h1>
        <p className="text-muted-foreground">
          Initiate and manage remote assistance sessions with users.
        </p>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Start a New Session</CardTitle>
                <CardDescription>Generate a one-time code for the user to start a session.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-4">
               <div className="flex-1">
                    <p className="text-4xl font-bold tracking-widest bg-muted rounded-md text-center py-4">
                        2AFG6K
                    </p>
               </div>
               <div className="flex flex-col gap-2">
                 <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Code
                </Button>
                 <Button variant="outline">
                    Copy Code & Instructions
                </Button>
               </div>
            </CardContent>
        </Card>

        <Card className="glass-card">
            <CardHeader>
                <CardTitle>Connect with Code</CardTitle>
                <CardDescription>Enter the code provided by the user to start a session.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
                <Input placeholder="Enter session code..." />
                <Button>
                    Connect <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Active and Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.id}</TableCell>
                  <TableCell>{session.user}</TableCell>
                  <TableCell>{session.device}</TableCell>
                  <TableCell>
                    <Badge variant={session.status === 'connected' ? 'default' : session.status === 'pending' ? 'secondary' : 'outline'}>
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon" disabled={session.status !== 'connected'}>
                      <Monitor className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" disabled={session.status !== 'connected'}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                     <Button variant="ghost" size="icon" disabled={session.status !== 'connected'}>
                      <Video className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

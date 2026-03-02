"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Plus,
  Wrench,
  BarChart3,
  Flame,
  Activity,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Globe,
} from "lucide-react"
import useSWR from "swr"
import Link from "next/link"
import { IComplaint } from "@/app/models/Complaint"
import { IUser } from "@/app/models/User"
import { LoadingAnimation } from "./ui/loading-animation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useMemo } from "react"
import { cn } from "@/app/lib/utils"

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
});

export function DashboardContent() {
  const { data: currentUser, isLoading } = useSWR<IUser>(
    "/api/users/me",
    fetcher
  )

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <LoadingAnimation />
      </div>
    )
  }

  if (currentUser?.role === "engineer") {
    return <EngineerDashboard />
  }

  if (currentUser?.role === "super-admin" || currentUser?.role === "sales" || currentUser?.role === "micro-admin" || currentUser?.role === "nano-admin") {
    return <SuperAdminDashboard />
  }

  return <TenantAndAuditDashboard currentUser={currentUser} />
}

function EngineerDashboard() {
  const { data: currentUser } = useSWR<IUser>("/api/users/me", fetcher)
  const { data: complaints, isLoading } = useSWR<IComplaint[]>(
    currentUser
      ? `/api/complaints?engineerId=${currentUser._id}&status=open`
      : null,
    fetcher
  )

  if (isLoading) return <div className="p-6 bg-background"><LoadingAnimation /></div>

  const complaintsArray = Array.isArray(complaints) ? complaints : [];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 bg-background">
      <header>
        <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                <Wrench className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Active Assignments</h1>
        </div>
        <p className="text-muted-foreground text-lg">Field tasks awaiting your immediate resolution.</p>
      </header>

      <div className="grid gap-4">
        {complaintsArray.length > 0 ? (
          complaintsArray.map(ticket => (
            <Link key={ticket._id} href={`/engineer`}>
                <Card className="hover:bg-accent transition-all group border-border bg-card relative overflow-hidden">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-primary bg-muted px-2 py-0.5 rounded-full">{ticket.id}</span>
                            <p className="font-bold text-lg group-hover:text-primary transition-colors text-foreground">{ticket.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                        <Badge variant={ticket.priority === "critical" ? "destructive" : "secondary"} className="capitalize h-8 px-4 rounded-full font-bold">{ticket.priority}</Badge>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    </CardContent>
                </Card>
            </Link>
          ))
        ) : (
          <Card className="flex flex-col items-center justify-center text-center p-20 border-border bg-card rounded-3xl">
            <CheckCircle className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground">Queue Empty</h3>
            <p className="text-muted-foreground mt-2">All tasks completed.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

function TenantAndAuditDashboard({ currentUser }: { currentUser?: IUser }) {
  const { data: complaints, error: complaintsError } = useSWR<IComplaint[]>("/api/complaints?brief=true", fetcher)
  const { data: users, error: usersError } = useSWR<IUser[]>("/api/users", fetcher)
  const [viewMode, setViewMode] = useState<"management" | "audit">("management")

  if (complaintsError || usersError) return <div className="p-10 text-center text-destructive bg-background"><AlertCircle className="h-10 w-10 mx-auto mb-2" /><p>Failed to load dashboard data.</p></div>;

  const complaintsArray = Array.isArray(complaints) ? complaints : [];
  const usersArray = Array.isArray(users) ? users : [];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={viewMode} onValueChange={value => setViewMode(value as any)} className="w-auto">
            <TabsList className="bg-card border border-border p-1 rounded-full h-12">
                <TabsTrigger value="management" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black transition-all">MANAGEMENT</TabsTrigger>
                <TabsTrigger value="audit" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-black transition-all">COMPLIANCE</TabsTrigger>
            </TabsList>
        </Tabs>
        {viewMode === 'management' && (
            <Button size="lg" className="rounded-full shadow-xl px-8 bg-primary text-primary-foreground font-black hover:scale-105 transition-transform" asChild>
                <Link href="/complaints"><Plus className="h-5 w-5 mr-2" /> CREATE TICKET</Link>
            </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={viewMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            {viewMode === "management" ? (
                <ManagementDashboard complaints={complaintsArray} users={usersArray} />
            ) : (
                <AuditDashboard complaints={complaintsArray} />
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function ManagementDashboard({ complaints, users }: { complaints: IComplaint[]; users: IUser[] }) {
  const activeTickets = useMemo(() => complaints.filter(c => c.status !== "closed" && c.status !== "archived"), [complaints])
  const critical = useMemo(() => activeTickets.filter(c => c.priority === "critical"), [activeTickets])

  return (
    <div className="space-y-8 bg-background">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <Kpi title="Active Tickets" value={activeTickets.length} icon={Activity} />
        <Kpi title="Critical" value={critical.length} icon={Flame} danger />
        <Kpi title="Resolved Today" value={complaints.filter(c => c.status === "closed").length} icon={ShieldCheck} />
        <Kpi title="Engineers" value={users.filter(u => u.role === "engineer").length} icon={Users} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <Card className="xl:col-span-2 bg-card border-border shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-6">
            <div>
                <CardTitle className="text-xl flex items-center gap-2 text-foreground font-black">
                <BarChart3 className="h-5 w-5 text-primary" /> LIVE TICKET FLOW
                </CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild className="font-bold text-primary">
                <Link href="/complaints">VIEW ALL <ChevronRight className="ml-1 h-4 w-4"/></Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {activeTickets.slice(0, 6).map(t => (
              <div key={t._id} className="group flex items-center justify-between p-4 rounded-2xl border border-border bg-background hover:bg-accent transition-all cursor-default">
                <div className="flex items-center gap-4 min-w-0">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", t.priority === 'critical' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-primary')}>
                        <Activity className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-sm truncate text-foreground">{t.title}</p>
                        <p className="text-[10px] font-mono text-muted-foreground mt-0.5 uppercase tracking-tighter">{t.id} &bull; {t.status}</p>
                    </div>
                </div>
                <Badge variant={t.priority === "critical" ? "destructive" : "secondary"} className="rounded-full px-3 font-bold">{t.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-md">
          <CardHeader className="border-b border-border pb-6">
            <CardTitle className="text-xl flex items-center gap-2 text-foreground font-black">
              <Users className="h-5 w-5 text-primary" /> ENGINEER LOAD
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {users.filter(u => u.role === "engineer").slice(0, 5).map(eng => {
                const assigned = complaints.filter(c => (c.assignedTo as any)?._id === eng._id || c.assignedTo?.toString() === eng._id)
                const resolved = assigned.filter(c => c.status === "closed")
                const rate = assigned.length ? Math.round((resolved.length / assigned.length) * 100) : 0
                return (
                  <div key={eng._id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-primary">
                          <AvatarImage src={eng.avatar || `https://avatar.vercel.sh/${(eng.name || 'U').replace(/\s+/g, '')}.png`} />
                          <AvatarFallback className="bg-muted text-foreground font-bold">{eng.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-bold text-foreground">{eng.name || 'User'}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase">{assigned.length} ACTIVE</p>
                        </div>
                      </div>
                      <p className="text-sm font-mono font-black text-primary">{rate}%</p>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                )
              })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AuditDashboard({ complaints }: { complaints: IComplaint[] }) {
  const sortedComplaints = useMemo(() => 
    [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  , [complaints]);

  return (
    <Card className="bg-card border-border shadow-md overflow-hidden">
        <CardHeader className="bg-muted border-b border-border py-6">
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-black tracking-tight text-foreground uppercase">COMPLIANCE LEDGER</CardTitle>
                    <p className="text-sm text-muted-foreground font-medium">Immutable record of all operational activity.</p>
                </div>
                <Badge variant="outline" className="h-8 px-4 rounded-full border-primary text-primary bg-card font-black">
                    {complaints.length} RECORDS
                </Badge>
            </div>
        </CardHeader>
        <CardContent className="p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted">
                        <tr>
                            <th className="px-6 py-4">ENTITY</th>
                            <th className="px-6 py-4">STATUS</th>
                            <th className="px-6 py-4">PRIORITY</th>
                            <th className="px-6 py-4">TIMELINE</th>
                            <th className="px-6 py-4 text-right">AUDIT</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedComplaints.map(ticket => {
                            const history = ticket.history || [];
                            const lastUpdate = (history.length || 0) > 0
                                ? [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
                                : (ticket.updatedAt || ticket.createdAt);

                            return (
                            <tr key={ticket._id} className="hover:bg-accent transition-colors group bg-card">
                                <td className="px-6 py-5">
                                    <p className="font-bold text-foreground group-hover:text-primary transition-colors">{ticket.title}</p>
                                    <p className="font-mono text-[10px] text-muted-foreground mt-1 font-bold">{ticket.id}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <Badge variant="outline" className="capitalize border-primary text-primary font-bold text-[10px] bg-card">{ticket.status}</Badge>
                                </td>
                                <td className="px-6 py-5">
                                    <Badge variant={ticket.priority === "critical" ? "destructive" : "secondary"} className="capitalize font-bold text-[10px]">{ticket.priority}</Badge>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="space-y-1 font-mono text-[10px]">
                                        <p className="text-muted-foreground font-bold">Opened: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                        <p className="text-foreground font-bold">Update: {new Date(lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <Link href={`/report/${ticket._id}`}><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><ArrowUpRight className="h-4 w-4" /></Button></Link>
                                </td>
                            </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </CardContent>
    </Card>
  )
}

function Kpi({ title, value, icon: Icon, danger }: any) {
  return (
    <Card className={cn("bg-card border-border transition-all hover:border-primary/20 shadow-md", danger && "border-destructive/20")}>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
          <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
        </div>
        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", danger ? "bg-destructive text-destructive-foreground" : "bg-muted text-primary")}>
            <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  )
}

function SuperAdminDashboard() {
    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto bg-background">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                        <Globe className="h-6 w-6" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground uppercase">GLOBAL COMMAND</h1>
                </div>
                <p className="text-muted-foreground text-lg font-bold uppercase tracking-widest text-[12px]">ENTERPRISE ECOSYSTEM OVERVIEW</p>
            </header>

            <Tabs defaultValue="tenants" className="space-y-8">
                <TabsList className="bg-card border border-border p-1 rounded-full h-14 inline-flex shadow-xl">
                    <TabsTrigger value="tenants" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-black transition-all">TENANTS</TabsTrigger>
                    <TabsTrigger value="sales" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-black transition-all">SALES</TabsTrigger>
                </TabsList>
                
                <TabsContent value="sales" className="mt-0"><Card className="p-20 text-center border-border bg-card font-bold text-muted-foreground uppercase tracking-widest">SALES MODULE INITIALIZED</Card></TabsContent>
                <TabsContent value="tenants" className="mt-0"><Card className="p-20 text-center border-border bg-card font-bold text-muted-foreground uppercase tracking-widest">TENANT MODULE INITIALIZED</Card></TabsContent>
            </Tabs>
        </div>
    );
}
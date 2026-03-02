"use client"

import { useState, useEffect } from "react"
import useSWR from 'swr'
import { Bell, Settings, Menu, LogOut, GitCommit, Monitor, Sun, Moon, Download } from "lucide-react"
import { useTheme } from 'next-themes'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSidebarStore, usePWAInstallStore } from "@/app/lib/store"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuPortal } from "@/components/ui/dropdown-menu"
import { IUser } from "@/models/User"
import { IComplaint } from "@/models/Complaint"
import { useToast } from "@/hooks/use-toast"
import { ITenant } from "@/app/models/Tenant"
import Image from "next/image"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function Header() {
  const router = useRouter()
  const { toast } = useToast();
  const { setTheme } = useTheme()
  const [time, setTime] = useState("...")
  const [date, setDate] = useState("...")
  const { openMobileSidebar } = useSidebarStore()
  const { openInstallDialog } = usePWAInstallStore();
  const { data: user } = useSWR<IUser>('/api/users/me', fetcher);
  const { data: tenant } = useSWR<ITenant>(user?.tenant ? `/api/tenants/${user.tenant}` : null, fetcher);
  const { data: complaints } = useSWR<IComplaint[]>('/api/complaints?status=all', fetcher);

  const notifications = Array.isArray(complaints)
    ? complaints
        .flatMap(complaint =>
          (complaint.history || []).map(h => ({
            ...h,
            complaintId: complaint._id,
            complaintTitle: complaint.title,
          }))
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5)
    : [];


  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
      setDate(now.toLocaleDateString([], { weekday: "long", day: "2-digit", month: "2-digit" }))
    }

    updateDateTime()
    const intervalId = setInterval(updateDateTime, 1000 * 60)

    return () => clearInterval(intervalId)
  }, [])
  
  const handleLogout = async () => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });

        if (!response.ok) throw new Error('Failed to log out');

        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        router.push('/login');
        router.refresh();
    } catch (error) {
        toast({ variant: "destructive", title: "Logout Failed", description: (error as Error).message });
    }
  };

  const companyName = tenant?.branding?.companyName || tenant?.name || "Vynsec Nexus";

  return (
    <header className="h-16 border-b border-border bg-card shrink-0 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="md:hidden text-foreground" onClick={openMobileSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg md:text-xl font-black text-foreground uppercase tracking-tight">{companyName}</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-foreground uppercase tracking-widest text-[10px]">CURRENT LOCAL TIME</p>
            <p className="text-xl font-black text-primary leading-none">{time}</p>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative text-foreground">
                  <Bell className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-card border-border shadow-2xl" align="end">
                <DropdownMenuLabel className="text-foreground font-black uppercase text-xs">NOTIFICATIONS</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification: any, index: number) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link href={`/complaints?id=${notification.complaintId}`} className="cursor-pointer p-3">
                        <div className="flex items-start gap-3">
                          <div className="bg-muted p-2 rounded-lg shrink-0">
                            <GitCommit className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold leading-tight text-foreground truncate">{notification.action}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{notification.complaintTitle}</p>
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <p className="p-4 text-center text-xs text-muted-foreground font-bold">NO NEW ALERTS</p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" asChild className="text-foreground">
              <Link href="/settings"><Settings className="h-4 w-4" /></Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 border border-primary">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || `https://avatar.vercel.sh/${(user?.name || 'U').replace(/\s+/g, '')}.png`} />
                    <AvatarFallback className="bg-muted text-foreground font-bold">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border shadow-2xl" align="end">
                <DropdownMenuLabel className="font-black p-4">
                  <p className="text-sm text-foreground uppercase tracking-tight">{user?.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openInstallDialog} className="font-bold">
                  <Download className="mr-2 h-4 w-4 text-primary" /> INSTALL APP
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive font-black focus:bg-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> LOG OUT
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
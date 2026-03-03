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
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm shrink-0 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-8">
        {/* Left Section - Company Name & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden hover:bg-muted" 
            onClick={openMobileSidebar}
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <h1 className="text-base font-bold text-foreground hidden sm:block">{companyName}</h1>
          </div>
        </div>

        {/* Right Section - Actions & User Menu */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Time Display */}
          <div className="text-right hidden lg:block pr-4 border-r border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Local Time</p>
            <p className="text-sm font-bold text-foreground">{time}</p>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-muted"
              >
                <Bell className="h-5 w-5 text-foreground" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-96 bg-card border-border shadow-xl" 
              align="end"
            >
              <DropdownMenuLabel className="font-semibold text-sm">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification: any, index: number) => (
                    <DropdownMenuItem key={index} asChild>
                      <Link 
                        href={`/complaints?id=${notification.complaintId}`} 
                        className="cursor-pointer p-3 hover:bg-muted rounded-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                            <GitCommit className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {notification.action}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {notification.complaintTitle}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-sm text-muted-foreground">No new notifications</p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-muted">
                <Sun className="h-5 w-5 text-foreground dark:hidden" />
                <Moon className="h-5 w-5 text-foreground hidden dark:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon" 
            asChild 
            className="hover:bg-muted"
          >
            <Link href="/settings">
              <Settings className="h-5 w-5 text-foreground" />
            </Link>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full p-0 hover:bg-muted"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage 
                    src={user?.avatar || `https://avatar.vercel.sh/${(user?.name || 'U').replace(/\s+/g, '')}.png`} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border shadow-xl" align="end">
              <DropdownMenuLabel className="p-4">
                <p className="font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openInstallDialog} className="cursor-pointer">
                <Download className="mr-3 h-4 w-4 text-primary" />
                <span>Install App</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-destructive cursor-pointer focus:bg-destructive/10"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

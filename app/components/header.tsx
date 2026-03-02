"use client"

import { useState, useEffect } from "react"
import useSWR from 'swr'
import { Bell, Settings, Menu, LogOut, GitCommit, Download, Search, SlashSquare } from "lucide-react"
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
import { cn } from "@/app/lib/utils"
import { ThemeSwitcher } from "@/components/theme-switcher"

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
    <header className="h-16 border-b border-border/50 bg-gradient-to-r from-card to-card/80 shrink-0 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 md:px-6 gap-4">
        {/* Left Section - Branding */}
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="md:hidden text-foreground h-9 w-9" onClick={openMobileSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base md:text-lg font-bold text-foreground uppercase tracking-tighter hidden sm:block">{companyName}</h1>
        </div>

        {/* Center Section - Search */}
        <div className="hidden md:flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search complaints, reports, or users..."
                className="w-full bg-muted/40 text-foreground placeholder-muted-foreground pl-10 pr-4 py-2 rounded-lg border border-border/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-sm"
              />
              <kbd className="hidden lg:flex absolute right-3 items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded pointer-events-none">
                <SlashSquare className="h-3 w-3" />
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          {/* Time Display */}
          <div className="hidden lg:flex items-center text-right pr-2">
            <div>
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">Local Time</p>
              <p className="text-sm font-bold text-primary leading-none">{time}</p>
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={cn(
                "relative h-9 w-9 text-muted-foreground hover:text-foreground transition-colors",
                notifications.length > 0 && "text-primary"
              )}>
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96 bg-card border-border/50 shadow-xl" align="end">
              <DropdownMenuLabel className="text-foreground font-semibold uppercase text-xs px-4 py-3">Notifications ({notifications.length})</DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-0" />
              {notifications.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification: any, index: number) => (
                    <DropdownMenuItem key={index} asChild className="p-0">
                      <Link href={`/complaints?id=${notification.complaintId}`} className="cursor-pointer p-3 hover:bg-muted/30 w-full border-b border-border/30 last:border-b-0 transition-colors">
                        <div className="flex items-start gap-3 w-full">
                          <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                            <GitCommit className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">{notification.action}</p>
                            <p className="text-[12px] text-muted-foreground truncate mt-1">{notification.complaintTitle}</p>
                          </div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground font-medium">No notifications</p>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Link */}
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-muted-foreground hover:text-foreground transition-colors">
            <Link href="/settings">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-primary/30 transition-all">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatar || `https://avatar.vercel.sh/${(user?.name || 'U').replace(/\s+/g, '')}.png`} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-card border-border/50 shadow-xl" align="end">
              <DropdownMenuLabel className="font-semibold p-3">
                <p className="text-sm text-foreground font-bold">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-1">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-0" />
              <DropdownMenuItem asChild className="font-medium cursor-pointer">
                <Link href="/settings">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openInstallDialog} className="font-medium cursor-pointer">
                <Download className="mr-2 h-4 w-4 text-primary" /> Install App
              </DropdownMenuItem>
              <DropdownMenuSeparator className="mx-0" />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive font-medium focus:bg-destructive/10 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

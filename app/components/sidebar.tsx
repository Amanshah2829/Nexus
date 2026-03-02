"use client"

import { useState, useMemo, useCallback } from "react"
import useSWR from 'swr'
import { cn } from "@/app/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Mail,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  Bell,
  Plus,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Package,
  BookOpen,
  ShoppingBag,
  Download,
  Home,
  LifeBuoy,
  UserCheck,
  FileText,
  PackagePlus,
  ShieldCheck,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useDialogStore, useSidebarStore, usePWAInstallStore } from "@/app/lib/store"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { IUser } from "@/models/User"
import { Skeleton } from "./ui/skeleton"

const fetcher = (url: string) => fetch(url).then(res => res.json())

const ALL_NAV_ITEMS = [
  { name: "Portal", icon: Home, href: "/portal", roles: ['user'] },
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ['admin', 'viewer', 'super-admin', 'micro-admin', 'nano-admin'] },
  { name: "My Tasks", icon: ClipboardList, href: "/engineer", roles: ['engineer'] },
  { name: "Approvals", icon: UserCheck, href: "/approvals", roles: ['hod'] },
  { name: "Sales", icon: ShoppingBag, href: "/sales", roles: ['super-admin', 'sales'] },
  { name: "Inbox", icon: Mail, href: "/inbox", roles: ['admin', 'engineer'] },
  { name: "Complaints", icon: ClipboardList, href: "/complaints", roles: ['admin', 'viewer'] },
  { name: "Inventory", icon: Package, href: "/inventory", roles: ['admin', 'engineer'] },
  { name: "Asset Verification", icon: ShieldCheck, href: "/inventory/verify", roles: ['admin', 'engineer'] },
  { name: "Asset Issuance", icon: PackagePlus, href: "/issue", roles: ['admin'] },
  { name: "Schedule", icon: Calendar, href: "/schedule", roles: ['admin'] },
  { name: "Knowledge Base", icon: BookOpen, href: "/knowledge-base", roles: ['admin', 'engineer', 'viewer'] },
  { name: "Lifecycle", icon: GitBranch, href: "/lifecycle", roles: ['admin'] },
  { name: "Analytics", icon: BarChart3, href: "/analytics", roles: ['admin', 'viewer'] },
  { name: "Reports", icon: FileText, href: "/reports", roles: ['admin', 'viewer'] },
  { name: "Notifications", icon: Bell, href: "/notifications", roles: ['admin', 'engineer', 'viewer'] },
  { name: "Settings", icon: Settings, href: "/settings", roles: ['admin', 'super-admin', 'engineer'] },
  { name: "Support", icon: LifeBuoy, href: "/support", roles: ['admin'] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { openCreateComplaint } = useDialogStore();
  const { isMobileSidebarOpen, closeMobileSidebar, openMobileSidebar } = useSidebarStore();
  const { openInstallDialog } = usePWAInstallStore();
  
  const { data: emails } = useSWR<{ emails: any[] }>('/api/emails', fetcher, { refreshInterval: 10000 });
  
  const inboxCount = useMemo(() => 
    emails?.emails?.filter(e => !e.seen).length || 0
  , [emails]);

  const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher, {
    revalidateOnFocus: false
  });

  const navigation = useMemo(() => {
    if (!currentUser) return [];
    return ALL_NAV_ITEMS.filter(item => item.roles.includes(currentUser.role)).map(item => ({
        ...item,
        badge: item.name === 'Inbox' ? inboxCount : 0
    }));
  }, [currentUser, inboxCount]);

  const toggleCollapse = useCallback(() => setCollapsed(prev => !prev), []);

  const SidebarContent = ({isMobile = false}: {isMobile?: boolean}) => (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border h-16 bg-card shrink-0">
        {!collapsed && currentUser ? (
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary">
              <AvatarImage src={currentUser.avatar || (currentUser.role === 'super-admin' ? '/super-admin-avatar.png' : `https://avatar.vercel.sh/${(currentUser.name || 'User').replace(/\s+/g, '')}.png`)} />
              <AvatarFallback className="bg-muted text-foreground font-bold">{currentUser.name?.split(' ').map(n=>n[0]).join('') || 'U'}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate text-foreground">{currentUser.name || 'User'}</p>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest truncate">{currentUser.role?.replace('-', ' ') || 'Role'}</p>
            </div>
          </div>
        ) : !collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        ) : null}
        <Button variant="ghost" size="icon" onClick={toggleCollapse} className={cn("h-8 w-8 p-0 shrink-0 text-foreground", isMobile ? "hidden" : "hidden md:flex")}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-sidebar-scrollbar bg-card">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href} passHref>
            <Button
              variant={pathname === item.href ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10 transition-all font-bold rounded-full",
                collapsed && !isMobile && "justify-center px-0",
                pathname === item.href 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              onClick={isMobile ? closeMobileSidebar : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <>
                  <span className="flex-1 text-left truncate">{item.name}</span>
                  {item.badge > 0 && (
                    <Badge variant={pathname === item.href ? 'destructive' : 'secondary'} className="ml-auto px-1.5 h-5 min-w-[1.25rem] font-black">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </Link>
        ))}
          
        <Button
            variant="outline"
            className={cn("w-full justify-start gap-3 h-10 bg-muted border-primary text-primary mt-4 font-black rounded-full hover:bg-accent", collapsed && !isMobile && "justify-center px-0")}
            onClick={openInstallDialog}
        >
            <Download className="h-4 w-4 flex-shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="flex-1 text-left">Install App</span>
            )}
        </Button>
      </nav>

      {currentUser && (['admin', 'super-admin', 'user'].includes(currentUser.role)) && (
        <div className="p-4 border-t border-border mt-auto bg-card shrink-0">
            <Button className="w-full gap-2 rounded-full bg-primary text-primary-foreground shadow-lg font-black h-12" size={(collapsed && !isMobile) ? "sm" : "default"} onClick={openCreateComplaint}>
            <Plus className="h-5 w-5" />
            {(!collapsed || isMobile) && "CREATE"}
            </Button>
        </div>
      )}
    </div>
  );

  if (!currentUser && !isMobileSidebarOpen) return <div className="hidden md:flex w-16 h-screen bg-card border-r border-border" />;

  return (
    <>
    <div
      className={cn(
        "hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 shrink-0 sticky top-0",
        collapsed ? "w-16" : "w-72",
      )}
    >
      <SidebarContent />
    </div>
    <Sheet open={isMobileSidebarOpen} onOpenChange={isMobileSidebarOpen ? closeMobileSidebar : openMobileSidebar}>
        <SheetContent side="left" className="p-0 w-72 flex flex-col bg-card border-r border-border">
            <SidebarContent isMobile={true}/>
        </SheetContent>
    </Sheet>
    </>
  )
}
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
    <div className="flex flex-col h-full bg-card/50">
      {/* User Profile Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 h-16 bg-gradient-to-b from-card to-card/50 shrink-0">
        {!collapsed && currentUser ? (
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/50">
              <AvatarImage src={currentUser.avatar || (currentUser.role === 'super-admin' ? '/super-admin-avatar.png' : `https://avatar.vercel.sh/${(currentUser.name || 'User').replace(/\s+/g, '')}.png`)} />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {currentUser.name?.split(' ').map(n=>n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-foreground">{currentUser.name || 'User'}</p>
              <p className="text-xs text-muted-foreground font-medium truncate">
                {currentUser.role?.replace('-', ' ') || 'Role'}
              </p>
            </div>
          </div>
        ) : !collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden flex-1">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-14" />
                </div>
            </div>
        ) : null}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse} 
          className={cn(
            "h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground", 
            isMobile ? "hidden" : "hidden md:flex"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-sidebar-scrollbar bg-card">
        {navigation.map((item) => (
          <Link key={item.name} href={item.href} passHref>
            <Button
              variant={pathname === item.href ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-9 transition-all font-medium text-sm rounded-lg",
                collapsed && !isMobile && "justify-center px-0",
                pathname === item.href 
                  ? "bg-primary/20 text-primary hover:bg-primary/30 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
              onClick={isMobile ? closeMobileSidebar : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <span className="truncate">{item.name}</span>
                  {item.badge > 0 && (
                    <Badge 
                      variant={pathname === item.href ? 'secondary' : 'destructive'} 
                      className="ml-auto px-2 h-5 min-w-fit text-xs font-bold flex-shrink-0"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border/50 bg-gradient-to-b from-card to-card/50 shrink-0 space-y-2">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-3 h-9 font-medium text-sm hover:bg-muted/50",
            collapsed && !isMobile && "justify-center px-0"
          )}
          onClick={openInstallDialog}
        >
          <Download className="h-4 w-4 flex-shrink-0" />
          {(!collapsed || isMobile) && <span className="flex-1 text-left">Install App</span>}
        </Button>

        {currentUser && (['admin', 'super-admin', 'user'].includes(currentUser.role)) && (
          <Button 
            className={cn(
              "w-full gap-2 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg font-semibold text-sm transition-all",
              collapsed && !isMobile ? "px-2" : ""
            )}
            onClick={openCreateComplaint}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>New Complaint</span>}
          </Button>
        )}
      </div>
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

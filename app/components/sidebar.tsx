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
  Home,
  LifeBuoy,
  UserCheck,
  FileText,
  PackagePlus,
  ShieldCheck,
  Command,
  Monitor
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useDialogStore, useSidebarStore } from "@/app/lib/store"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { IUser } from "@/models/User"

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface NavItem {
  name: string;
  icon: any;
  href: string;
  roles: string[];
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const ALL_NAV_ITEMS: NavItem[] = [
  { name: "Portal", icon: Home, href: "/portal", roles: ['user'] },
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ['admin', 'viewer', 'super-admin', 'micro-admin', 'nano-admin'] },
  { name: "My Tasks", icon: ClipboardList, href: "/engineer", roles: ['engineer'] },
  { name: "Approvals", icon: UserCheck, href: "/approvals", roles: ['hod'] },
  { name: "Sales", icon: ShoppingBag, href: "/sales", roles: ['super-admin', 'sales'] },
  { name: "Inbox", icon: Mail, href: "/inbox", roles: ['admin', 'engineer'] },
  { name: "Remote Sessions", icon: Monitor, href: "/remote-sessions", roles: ['admin', 'engineer', 'super-admin'] },
  { name: "Complaints", icon: ClipboardList, href: "/complaints", roles: ['admin', 'viewer'] },
  { name: "Schedule", icon: Calendar, href: "/schedule", roles: ['admin'] },
  { name: "Lifecycle", icon: GitBranch, href: "/lifecycle", roles: ['admin'] },
  { name: "Inventory", icon: Package, href: "/inventory", roles: ['admin', 'engineer'] },
  { name: "Asset Verification", icon: ShieldCheck, href: "/inventory/verify", roles: ['admin', 'engineer'] },
  { name: "Asset Issuance", icon: PackagePlus, href: "/issue", roles: ['admin'] },
  { name: "Knowledge Base", icon: BookOpen, href: "/knowledge-base", roles: ['admin', 'engineer', 'viewer'] },
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
  
  const { data: emails } = useSWR<{ emails: any[] }>('/api/emails', fetcher, { refreshInterval: 10000 });
  const { data: sessionsData } = useSWR('/api/remote-sessions', fetcher, { refreshInterval: 10000 });
  
  const inboxCount = useMemo(() => 
    emails?.emails?.filter(e => !e.seen).length || 0
  , [emails]);

  const activeSessionsCount = useMemo(() => 
    sessionsData?.sessions?.filter((s: any) => ['pending', 'approved', 'active'].includes(s.status)).length || 0
  , [sessionsData]);

  const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher, {
    revalidateOnFocus: false
  });

  const sections = useMemo(() => {
    if (!currentUser) return [];

    const filteredItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(currentUser.role)).map(item => ({
      ...item,
      badge: item.name === 'Inbox' ? inboxCount : item.name === 'Remote Sessions' ? activeSessionsCount : 0
    }));

    const result: NavSection[] = [
      {
        title: "Command",
        items: filteredItems.filter(i => ["Portal", "Dashboard", "My Tasks", "Approvals", "Sales"].includes(i.name))
      },
      {
        title: "Support Ops",
        items: filteredItems.filter(i => ["Inbox", "Remote Sessions", "Complaints", "Schedule", "Lifecycle"].includes(i.name))
      },
      {
        title: "Resources",
        items: filteredItems.filter(i => ["Inventory", "Asset Verification", "Asset Issuance"].includes(i.name))
      },
      {
        title: "Intelligence",
        items: filteredItems.filter(i => ["Knowledge Base", "Analytics", "Reports"].includes(i.name))
      },
      {
        title: "System",
        items: filteredItems.filter(i => ["Notifications", "Settings", "Support"].includes(i.name))
      }
    ];

    return result.filter(s => s.items.length > 0);
  }, [currentUser, inboxCount, activeSessionsCount]);

  const toggleCollapse = useCallback(() => setCollapsed(prev => !prev), []);

  const SidebarContent = ({isMobile = false}: {isMobile?: boolean}) => (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border/50 h-16 shrink-0">
        {!collapsed || isMobile ? (
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
              <Command className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-foreground">
              <p className="text-sm font-black uppercase tracking-widest">Nexus</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Enterprise v1.0</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
              <Command className="h-5 w-5" />
            </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse} 
          className={cn(
            "h-8 w-8 p-0 shrink-0 text-muted-foreground hover:text-foreground hidden md:flex",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-6 overflow-y-auto custom-sidebar-scrollbar">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {(!collapsed || isMobile) && (
              <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">
                {section.title}
              </h3>
            )}
            {section.items.map((item) => (
              <Link key={item.name} href={item.href} passHref title={collapsed ? item.name : undefined}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10 transition-all text-sm rounded-xl mb-0.5 group",
                    collapsed && !isMobile ? "justify-center px-0" : "px-3",
                    pathname === item.href 
                      ? "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary/90" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={isMobile ? closeMobileSidebar : undefined}
                >
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0 transition-colors",
                    pathname === item.href ? "text-primary-foreground" : "group-hover:text-primary"
                  )} />
                  {(!collapsed || isMobile) && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className={cn(
                        "truncate font-semibold",
                        pathname === item.href ? "text-primary-foreground" : "text-foreground"
                      )}>{item.name}</span>
                      {item.badge > 0 && (
                        <Badge 
                          className={cn(
                            "ml-auto px-1.5 h-4 min-w-fit text-[9px] font-black flex-shrink-0 border-none",
                            pathname === item.href ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border/50 space-y-3 bg-muted/20">
        {currentUser && (['admin', 'super-admin', 'user'].includes(currentUser.role)) && (
          <Button
            variant="secondary"
            className={cn(
              "w-full gap-2 shadow-md font-black text-xs tracking-widest rounded-xl h-11 uppercase bg-primary text-primary-foreground hover:bg-primary/90",
              collapsed && !isMobile ? "px-0 justify-center" : ""
            )}
            onClick={openCreateComplaint}
          >
            <Plus className="h-4 w-4 flex-shrink-0" />
            {(!collapsed || isMobile) && <span>New Ticket</span>}
          </Button>
        )}

        <div className={cn(
          "flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/50 transition-colors",
          collapsed && !isMobile ? "justify-center" : ""
        )}>
          <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background shadow-md">
            <AvatarImage src={currentUser?.avatar || `https://avatar.vercel.sh/${(currentUser?.name || 'User').replace(/\s+/g, '')}.png`} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {currentUser?.name?.split(' ').map(n=>n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-foreground">{currentUser?.name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter truncate">
                {currentUser?.role?.replace('-', ' ') || 'Identity'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!currentUser && !isMobileSidebarOpen) return <div className="hidden md:flex w-16 h-screen bg-card border-r border-border" />;

  return (
    <>
    <div
      className={cn(
        "hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 shrink-0 sticky top-0 z-40 shadow-xl",
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
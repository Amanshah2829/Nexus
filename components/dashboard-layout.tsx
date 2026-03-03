'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Bell, Settings, User, LogOut } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/tickets', label: 'Tickets', icon: '🎫' },
  { href: '/dashboard/team', label: 'Team', icon: '👥' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '📈' },
  { href: '/remote-sessions', label: 'Remote Sessions', icon: '🔗' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'bg-card border-r border-border transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-primary">Nexus</h1>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-4 custom-sidebar-scrollbar overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                'hover:bg-muted text-foreground',
                'active:bg-primary/10 active:text-primary'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <Button variant="ghost" className="w-full justify-start" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Welcome Back</h2>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

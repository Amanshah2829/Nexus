'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, BarChart3, Inbox, Ticket, CheckSquare2, Package,
  Database, BookOpen, FileText, Bell, Users, Settings, Plus,
  Menu, X, Search, Command, Moon, Sun, LogOut
} from 'lucide-react';
import Link from 'next/link';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} />, href: '/analytics' },
  { id: 'inbox', label: 'Inbox', icon: <Inbox size={20} />, href: '/inbox', badge: 12 },
  { id: 'tickets', label: 'Tickets', icon: <Ticket size={20} />, href: '/complaints', badge: 8 },
  { id: 'tasks', label: 'Tasks', icon: <CheckSquare2 size={20} />, href: '/tasks' },
  { id: 'inventory', label: 'Inventory', icon: <Package size={20} />, href: '/inventory' },
  { id: 'assets', label: 'Asset Mgmt', icon: <Database size={20} />, href: '/assets' },
  { id: 'knowledge', label: 'Knowledge Base', icon: <BookOpen size={20} />, href: '/knowledge' },
  { id: 'reports', label: 'Reports', icon: <FileText size={20} />, href: '/reports' },
];

interface ModernDashboardLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onCreateTicket?: () => void;
}

export function ModernDashboardLayout({ 
  children, 
  currentPage = 'dashboard',
  onCreateTicket 
}: ModernDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`fixed lg:relative z-40 h-full bg-gradient-to-b from-[#0F1117] via-[#161A23] to-[#0F1117] border-r border-white/5 backdrop-blur-xl transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } ${!sidebarOpen && 'lg:flex hidden'}`}
      >
        {/* Sidebar Header */}
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <span className="text-white font-bold text-lg">Nexus</span>
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {sidebarCollapsed ? <Plus size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-white border border-purple-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </motion.button>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateTicket}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl py-3 font-semibold transition-all"
            >
              <Plus size={18} />
              {!sidebarCollapsed && 'New Ticket'}
            </motion.button>

            <Link href="/settings">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5 ${
                  currentPage === 'settings' ? 'text-white bg-white/5' : ''
                }`}
              >
                <Settings size={18} />
                {!sidebarCollapsed && <span className="text-sm font-medium">Settings</span>}
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <motion.div
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          className="h-20 bg-gradient-to-b from-[#0F1117]/95 to-[#161A23]/95 border-b border-white/5 backdrop-blur-xl flex items-center px-6 gap-4"
        >
          {/* Mobile Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Search Bar */}
          <div className="flex-1 flex items-center gap-2 max-w-md">
            <div
              onClick={() => setSearchOpen(true)}
              className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 cursor-text transition-all"
            >
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search anything..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                onFocus={() => setSearchOpen(true)}
              />
              <span className="hidden sm:flex items-center gap-1 px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                <Command size={12} /> K
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {darkMode ? (
                <Sun size={20} className="text-gray-400" />
              ) : (
                <Moon size={20} className="text-gray-400" />
              )}
            </motion.button>

            {/* User Profile Dropdown */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500" />
              <span className="text-sm font-medium text-white hidden sm:inline">John</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto bg-[#0F1117]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </div>
  );
}

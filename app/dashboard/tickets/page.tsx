'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, ChevronDown } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';
import { StatCard, KanbanBoard } from '@/app/components/dashboards/dashboard-widgets';

export default function TicketsPage() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const ticketStats = [
    { title: 'Open Tickets', value: '24', change: 3, gradient: 'from-blue-500 to-cyan-500', icon: '🎫' },
    { title: 'In Progress', value: '12', change: -2, gradient: 'from-purple-500 to-pink-500', icon: '⚙️' },
    { title: 'Resolved Today', value: '8', change: 8, gradient: 'from-green-500 to-emerald-500', icon: '✅' },
    { title: 'Average Response', value: '4m', change: -12, gradient: 'from-orange-500 to-red-500', icon: '⏱️' },
  ];

  const kanbanColumns = [
    {
      id: 'new',
      title: 'New Requests',
      color: 'bg-blue-500',
      cards: [
        { id: '1', title: 'System not responding', description: 'User unable to access dashboard' },
        { id: '2', title: 'Password reset request', description: 'Employee John Doe' },
        { id: '3', title: 'Software installation', description: 'Install Adobe Suite for marketing team' },
      ],
    },
    {
      id: 'assigned',
      title: 'Assigned',
      color: 'bg-purple-500',
      cards: [
        { id: '4', title: 'Network connectivity issue', description: 'Intermittent disconnection' },
        { id: '5', title: 'Email configuration', description: 'Setup Outlook for new staff' },
      ],
    },
    {
      id: 'progress',
      title: 'In Progress',
      color: 'bg-yellow-500',
      cards: [
        { id: '6', title: 'VPN setup', description: 'Configure remote access' },
        { id: '7', title: 'Hardware replacement', description: 'Replace faulty laptop' },
        { id: '8', title: 'Database backup', description: 'Automated daily backup setup' },
      ],
    },
    {
      id: 'resolved',
      title: 'Resolved',
      color: 'bg-green-500',
      cards: [
        { id: '9', title: 'Printer drivers', description: 'Installed on Windows 10' },
        { id: '10', title: 'Account unlock', description: 'Employee access restored' },
      ],
    },
  ];

  const tickets = [
    {
      id: 'TKT-001',
      title: 'System Performance Degradation',
      priority: 'high',
      status: 'open',
      assignee: 'John Smith',
      created: '2 hours ago',
    },
    {
      id: 'TKT-002',
      title: 'Email Configuration Issue',
      priority: 'medium',
      status: 'progress',
      assignee: 'Sarah Connor',
      created: '4 hours ago',
    },
    {
      id: 'TKT-003',
      title: 'Password Reset Request',
      priority: 'low',
      status: 'open',
      assignee: 'Mike Johnson',
      created: '6 hours ago',
    },
  ];

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const statusColors = {
    open: 'bg-blue-500/20 text-blue-400',
    progress: 'bg-purple-500/20 text-purple-400',
    resolved: 'bg-green-500/20 text-green-400',
  };

  return (
    <ModernDashboardLayout currentPage="tickets">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Support Tickets</h1>
          <p className="text-gray-400">Manage and track all customer support requests.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all"
        >
          <Plus size={18} />
          New Ticket
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {ticketStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              change={Math.abs(stat.change)}
              trend={stat.change > 0 ? 'up' : 'down'}
              icon={<span className="text-2xl">{stat.icon}</span>}
              gradient={stat.gradient}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* View Toggle & Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2">
          {['kanban', 'list'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v as 'kanban' | 'list')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                view === v
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search tickets..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-40"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg transition-all"
          >
            <Filter size={18} className="text-gray-500" />
            <ChevronDown size={16} className="text-gray-500" />
          </motion.button>
        </div>
      </motion.div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <KanbanBoard columns={kanbanColumns} />
        </motion.div>
      )}

      {/* List View */}
      {view === 'list' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/2">
                  <th className="px-6 py-4 text-left font-semibold text-gray-400">Ticket ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-400">Title</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-400">Priority</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-400">Assignee</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-400">Created</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    className="border-b border-white/5 transition-all"
                  >
                    <td className="px-6 py-4 font-mono text-white font-semibold">{ticket.id}</td>
                    <td className="px-6 py-4 text-white">{ticket.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${priorityColors[ticket.priority as keyof typeof priorityColors]}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[ticket.status as keyof typeof statusColors]}`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{ticket.assignee}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{ticket.created}</td>
                    <td className="px-6 py-4 text-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} className="text-gray-500" />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </ModernDashboardLayout>
  );
}

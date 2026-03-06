'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Ticket, TrendingUp } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';
import { 
  StatCard, 
  ChartCard, 
  ActivityFeed, 
  KanbanBoard,
  TeamGrid 
} from '@/app/components/dashboards/dashboard-widgets';

export default function ModernDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const recentActivity = [
    {
      title: 'Ticket #TKT-2024-001 Resolved',
      description: 'High priority ticket resolved by John Smith',
      timestamp: '2 minutes ago',
      type: 'success' as const,
    },
    {
      title: 'New Team Member Added',
      description: 'Sarah joined the Engineering team',
      timestamp: '1 hour ago',
      type: 'info' as const,
    },
    {
      title: 'Inventory Alert',
      description: 'Stock level low for Item #INV-042',
      timestamp: '3 hours ago',
      type: 'warning' as const,
    },
    {
      title: 'System Update',
      description: 'Database optimization completed',
      timestamp: '5 hours ago',
      type: 'success' as const,
    },
  ];

  const kanbanColumns = [
    {
      id: 'new',
      title: 'New Requests',
      color: 'bg-blue-500',
      cards: [
        { id: '1', title: 'Setup new workstation', description: 'For new employee Sarah' },
        { id: '2', title: 'Update software license', description: 'Renew Adobe Creative Suite' },
      ],
    },
    {
      id: 'progress',
      title: 'In Progress',
      color: 'bg-purple-500',
      cards: [
        { id: '3', title: 'Fix login issue', description: 'Users unable to reset password' },
        { id: '4', title: 'Network upgrade', description: 'Replace outdated switches' },
      ],
    },
    {
      id: 'review',
      title: 'Review',
      color: 'bg-yellow-500',
      cards: [
        { id: '5', title: 'Security audit', description: 'Complete penetration testing' },
      ],
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'bg-green-500',
      cards: [
        { id: '6', title: 'VPN setup', description: 'Configured for remote access' },
        { id: '7', title: 'Backup system', description: 'Daily backup automated' },
      ],
    },
  ];

  const teamMembers = [
    { name: 'John Smith', role: 'Lead Engineer', status: 'online' as const },
    { name: 'Sarah Connor', role: 'Support Agent', status: 'online' as const },
    { name: 'Mike Johnson', role: 'Manager', status: 'away' as const },
    { name: 'Emma Davis', role: 'Administrator', status: 'offline' as const },
  ];

  return (
    <ModernDashboardLayout currentPage="dashboard">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your performance overview.</p>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-8"
      >
        {['day', 'week', 'month', 'year'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              selectedPeriod === period
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <StatCard
          title="Total Tickets"
          value="1,248"
          change={12}
          trend="up"
          icon={<Ticket size={24} className="text-white" />}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Active Users"
          value="156"
          change={8}
          trend="up"
          icon={<Users size={24} className="text-white" />}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          title="Performance"
          value="94.2%"
          change={5.3}
          trend="up"
          icon={<TrendingUp size={24} className="text-white" />}
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Revenue"
          value="$125.4K"
          change={23.8}
          trend="up"
          icon={<BarChart3 size={24} className="text-white" />}
          gradient="from-orange-500 to-red-500"
        />
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
      >
        <ChartCard
          title="Revenue Trend"
          subtitle="Last 7 days"
          footer="Updated 2 minutes ago"
        >
          <div className="h-64 bg-gradient-to-br from-white/5 to-white/2 rounded-xl flex items-end justify-between px-4 py-6 gap-2">
            {[65, 78, 45, 89, 56, 92, 78].map((height, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Team Workload"
          subtitle="Current distribution"
          footer="4 team members active"
        >
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#ffffff10" strokeWidth="8" />
                <motion.circle
                  initial={{ strokeDashoffset: 282 }}
                  animate={{ strokeDashoffset: 100 }}
                  transition={{ delay: 0.3, duration: 1 }}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#grad)"
                  strokeWidth="8"
                  strokeDasharray="282"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">78%</span>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Top Performers"
          subtitle="This month"
          footer="Based on ticket resolution"
        >
          <div className="space-y-4">
            {[
              { name: 'John Smith', percentage: 92 },
              { name: 'Sarah Connor', percentage: 88 },
              { name: 'Mike Johnson', percentage: 85 },
              { name: 'Emma Davis', percentage: 78 },
            ].map((person) => (
              <div key={person.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-300">{person.name}</p>
                  <p className="text-sm font-semibold text-white">{person.percentage}%</p>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${person.percentage}%` }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </motion.div>

      {/* Kanban Board */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold text-white mb-4">Ticket Pipeline</h2>
        <KanbanBoard columns={kanbanColumns} />
      </motion.div>

      {/* Activity and Team Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <ActivityFeed items={recentActivity} />
        
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-white/10 transition-all duration-300"
        >
          <h3 className="text-white font-bold text-lg mb-6">Team Members</h3>
          <TeamGrid members={teamMembers} />
        </motion.div>
      </motion.div>
    </ModernDashboardLayout>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';
import { StatCard, ChartCard } from '@/app/components/dashboards/dashboard-widgets';

export default function ComplaintsPage() {
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);

  const complaintStats = [
    { title: 'Total Complaints', value: '127', change: -8, gradient: 'from-red-500 to-pink-500', icon: '⚠️' },
    { title: 'Open', value: '34', change: -5, gradient: 'from-orange-500 to-red-500', icon: '🔴' },
    { title: 'In Progress', value: '23', change: 2, gradient: 'from-yellow-500 to-orange-500', icon: '⏳' },
    { title: 'Resolved', value: '70', change: 15, gradient: 'from-green-500 to-emerald-500', icon: '✅' },
  ];

  const complaints = [
    {
      id: '1',
      title: 'Account Access Issues',
      description: 'User unable to log into their account for 2 days',
      category: 'Technical',
      priority: 'high',
      status: 'open',
      submittedBy: 'James Wilson',
      date: '2024-03-07',
      responses: 3,
    },
    {
      id: '2',
      title: 'Poor Response Time',
      description: 'Website loading very slowly during peak hours',
      category: 'Performance',
      priority: 'high',
      status: 'progress',
      submittedBy: 'Lisa Brown',
      date: '2024-03-06',
      responses: 5,
    },
    {
      id: '3',
      title: 'Missing Features',
      description: 'Export to CSV functionality not working',
      category: 'Feature',
      priority: 'medium',
      status: 'progress',
      submittedBy: 'David Lee',
      date: '2024-03-05',
      responses: 2,
    },
    {
      id: '4',
      title: 'Billing Discrepancy',
      description: 'Charged twice for same subscription',
      category: 'Billing',
      priority: 'high',
      status: 'resolved',
      submittedBy: 'Maria Garcia',
      date: '2024-03-03',
      responses: 7,
    },
    {
      id: '5',
      title: 'Documentation Outdated',
      description: 'API documentation does not match current version',
      category: 'Documentation',
      priority: 'low',
      status: 'open',
      submittedBy: 'Tom Johnson',
      date: '2024-03-02',
      responses: 1,
    },
  ];

  const complaintsByCategory = [
    { name: 'Technical', count: 45, percentage: 35.4 },
    { name: 'Performance', count: 28, percentage: 22.1 },
    { name: 'Feature', count: 18, percentage: 14.2 },
    { name: 'Billing', count: 22, percentage: 17.3 },
    { name: 'Other', count: 14, percentage: 11.0 },
  ];

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const statusColors = {
    open: 'text-orange-400',
    progress: 'text-yellow-400',
    resolved: 'text-green-400',
  };

  const statusIcons = {
    open: <AlertCircle size={16} />,
    progress: <Clock size={16} />,
    resolved: <CheckCircle size={16} />,
  };

  return (
    <ModernDashboardLayout currentPage="complaints">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Complaints & Feedback</h1>
          <p className="text-gray-400">Track and resolve customer complaints effectively.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all"
        >
          <Plus size={18} />
          New Report
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {complaintStats.map((stat, i) => (
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
              trend={stat.change < 0 ? 'down' : 'up'}
              icon={<span className="text-2xl">{stat.icon}</span>}
              gradient={stat.gradient}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Complaints by Category */}
        <ChartCard
          title="Complaints by Category"
          subtitle="Distribution of complaint types"
          footer="Last 30 days"
        >
          <div className="space-y-4">
            {complaintsByCategory.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{category.name}</p>
                  <p className="text-sm text-gray-400">{category.count}</p>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{category.percentage}% of total</p>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        {/* Resolution Rate */}
        <ChartCard
          title="Resolution Metrics"
          subtitle="Performance indicators"
          footer="Calculated weekly"
        >
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Avg Resolution Time</p>
                <p className="text-lg font-bold text-white">2.4 days</p>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-60 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Customer Satisfaction</p>
                <p className="text-lg font-bold text-white">4.2/5</p>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-52 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Resolution Rate</p>
                <p className="text-lg font-bold text-white">89%</p>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-56 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
              </div>
            </div>
          </div>
        </ChartCard>
      </motion.div>

      {/* Complaints List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-bold text-white mb-4">Recent Complaints</h2>
        {complaints.map((complaint, index) => (
          <motion.div
            key={complaint.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            onClick={() => setSelectedComplaint(complaint.id)}
            className={`group p-5 rounded-xl border transition-all cursor-pointer ${
              selectedComplaint === complaint.id
                ? 'bg-purple-500/20 border-purple-500/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{complaint.title}</p>
                <p className="text-gray-400 text-sm mt-1">{complaint.description}</p>
              </div>
              <div className={`flex-shrink-0 ml-4 ${statusColors[complaint.status as keyof typeof statusColors]}`}>
                {statusIcons[complaint.status as keyof typeof statusIcons]}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${priorityColors[complaint.priority as keyof typeof priorityColors]}`}>
                {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)} Priority
              </span>
              
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400">
                {complaint.category}
              </span>

              <span className="text-gray-500 text-xs">
                {complaint.date}
              </span>

              <span className="text-gray-500 text-xs">
                By {complaint.submittedBy}
              </span>

              <div className="flex items-center gap-1 text-gray-500 text-xs ml-auto">
                <MessageSquare size={14} />
                {complaint.responses} responses
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </ModernDashboardLayout>
  );
}

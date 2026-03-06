'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Filter, MoreVertical, TrendingUp } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';
import { StatCard, ChartCard } from '@/app/components/dashboards/dashboard-widgets';

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('month');

  const analyticsMetrics = [
    {
      title: 'Total Requests',
      value: '24,521',
      change: 12.5,
      gradient: 'from-blue-500 to-cyan-500',
      icon: '📊',
    },
    {
      title: 'Resolved',
      value: '21,842',
      change: 8.3,
      gradient: 'from-green-500 to-emerald-500',
      icon: '✅',
    },
    {
      title: 'Pending',
      value: '2,679',
      change: -5.2,
      gradient: 'from-orange-500 to-red-500',
      icon: '⏳',
    },
    {
      title: 'Avg Resolution Time',
      value: '4.2h',
      change: -15.8,
      gradient: 'from-purple-500 to-pink-500',
      icon: '⏱️',
    },
  ];

  const topCategories = [
    { name: 'Network Issues', count: 4520, percentage: 18.4 },
    { name: 'Software Support', count: 3890, percentage: 15.8 },
    { name: 'Hardware Issues', count: 3245, percentage: 13.2 },
    { name: 'Account Issues', count: 2876, percentage: 11.7 },
    { name: 'Other', count: 9990, percentage: 40.9 },
  ];

  const monthlyData = [
    { month: 'Jan', requests: 2100, resolved: 1890, pending: 210 },
    { month: 'Feb', requests: 2300, resolved: 2100, pending: 200 },
    { month: 'Mar', requests: 2450, resolved: 2250, pending: 200 },
    { month: 'Apr', requests: 2200, resolved: 2000, pending: 200 },
    { month: 'May', requests: 2800, resolved: 2550, pending: 250 },
    { month: 'Jun', requests: 2600, resolved: 2400, pending: 200 },
    { month: 'Jul', requests: 2450, resolved: 2100, pending: 350 },
  ];

  return (
    <ModernDashboardLayout currentPage="analytics">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Detailed insights into your support operations.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all"
        >
          <Download size={18} />
          Export
        </motion.button>
      </motion.div>

      {/* Date Range Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-8"
      >
        {['week', 'month', 'quarter', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              dateRange === range
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {analyticsMetrics.map((metric, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <StatCard
              title={metric.title}
              value={metric.value}
              change={Math.abs(metric.change)}
              trend={metric.change > 0 ? 'up' : 'down'}
              icon={<span className="text-2xl">{metric.icon}</span>}
              gradient={metric.gradient}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {/* Trend Chart */}
        <ChartCard
          title="Request Trends"
          subtitle="Monthly overview"
          footer="Showing last 7 months of data"
        >
          <div className="h-80 flex items-end justify-between px-2 gap-2">
            {monthlyData.map((data, i) => {
              const maxValue = Math.max(...monthlyData.map(d => d.requests));
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.requests / maxValue) * 100}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.6 }}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg hover:from-purple-600 hover:to-blue-600 transition-all relative group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.requests}
                  </div>
                  <div className="text-xs text-white/60 absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    {data.month}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ChartCard>

        {/* Category Distribution */}
        <ChartCard
          title="Category Distribution"
          subtitle="Request breakdown"
          footer="5 primary categories"
        >
          <div className="space-y-4">
            {topCategories.map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white">{category.name}</p>
                  <p className="text-sm text-gray-400">{category.count.toLocaleString()}</p>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{category.percentage}% of total</p>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </motion.div>

      {/* Comparison Charts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <ChartCard
          title="Status Breakdown"
          subtitle="Current distribution"
          footer="Real-time data"
        >
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#ffffff10" strokeWidth="6" />
                <motion.circle
                  initial={{ strokeDashoffset: 251 }}
                  animate={{ strokeDashoffset: 88 }}
                  transition={{ delay: 0.3, duration: 1 }}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray="251"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 251 }}
                  animate={{ strokeDashoffset: 125 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="6"
                  strokeDasharray="125"
                  strokeDashoffset="88"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">89%</p>
                  <p className="text-xs text-gray-400">Resolved</p>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Team Performance"
          subtitle="Average metrics"
          footer="Top 3 performers"
        >
          <div className="space-y-4">
            {[
              { name: 'John Smith', score: 94, icon: '🏆' },
              { name: 'Sarah Connor', score: 91, icon: '⭐' },
              { name: 'Mike Johnson', score: 87, icon: '📈' },
            ].map((person, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{person.icon}</span>
                  <p className="text-sm font-medium text-white">{person.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${person.score}%` }}
                      transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    />
                  </div>
                  <p className="text-sm font-semibold text-white w-8 text-right">{person.score}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Satisfaction Score"
          subtitle="Customer feedback"
          footer="Last 30 days average"
        >
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 mb-4">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#ffffff10" strokeWidth="10" />
                <motion.circle
                  initial={{ strokeDashoffset: 565 }}
                  animate={{ strokeDashoffset: 113 }}
                  transition={{ delay: 0.3, duration: 1.2 }}
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#scoreGrad)"
                  strokeWidth="10"
                  strokeDasharray="565"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">4.8</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">out of 5.0</p>
          </div>
        </ChartCard>
      </motion.div>
    </ModernDashboardLayout>
  );
}

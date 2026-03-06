'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, TrendingUp, Calendar, Filter } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';
import { ChartCard } from '@/app/components/dashboards/dashboard-widgets';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('summary');

  const reports = [
    {
      id: '1',
      title: 'Monthly Performance Summary',
      description: 'Overview of team performance and KPIs',
      type: 'summary',
      date: '2024-03-07',
      pages: 12,
    },
    {
      id: '2',
      title: 'Ticket Resolution Analysis',
      description: 'Detailed breakdown of resolved tickets by category',
      type: 'analysis',
      date: '2024-03-01',
      pages: 8,
    },
    {
      id: '3',
      title: 'Customer Satisfaction Report',
      description: 'Feedback analysis and satisfaction trends',
      type: 'feedback',
      date: '2024-02-28',
      pages: 6,
    },
    {
      id: '4',
      title: 'Team Productivity Review',
      description: 'Individual and team productivity metrics',
      type: 'summary',
      date: '2024-02-21',
      pages: 15,
    },
  ];

  const trendData = [
    { month: 'Jan', tickets: 245, resolved: 198, satisfaction: 4.2 },
    { month: 'Feb', tickets: 267, resolved: 225, satisfaction: 4.4 },
    { month: 'Mar', tickets: 289, resolved: 256, satisfaction: 4.6 },
  ];

  const filteredReports = reportType === 'all' 
    ? reports 
    : reports.filter(r => r.type === reportType);

  return (
    <ModernDashboardLayout currentPage="reports">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Reports</h1>
          <p className="text-gray-400">Generate and download comprehensive business reports.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all"
        >
          <FileText size={18} />
          Generate Report
        </motion.button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <ChartCard title="Total Reports" subtitle="Generated this year">
          <div className="text-5xl font-bold text-white">47</div>
          <p className="text-gray-400 text-sm mt-2">+12 from last month</p>
        </ChartCard>

        <ChartCard title="Most Downloaded" subtitle="Report type">
          <div className="text-3xl font-bold text-white mb-2">Summary Reports</div>
          <p className="text-gray-400 text-sm">34 downloads this month</p>
        </ChartCard>

        <ChartCard title="Export Formats" subtitle="Available options">
          <div className="flex flex-wrap gap-2">
            {['PDF', 'Excel', 'CSV', 'JSON'].map(format => (
              <span key={format} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-semibold">
                {format}
              </span>
            ))}
          </div>
        </ChartCard>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 mb-6"
      >
        {['all', 'summary', 'analysis', 'feedback'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              reportType === type
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {type === 'all' ? 'All Reports' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Reports Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="group bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-white/10 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                <FileText size={24} className="text-white" />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Download size={18} className="text-gray-400" />
              </motion.button>
            </div>

            <h3 className="text-white font-bold text-lg mb-2">{report.title}</h3>
            <p className="text-gray-400 text-sm mb-4">{report.description}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Calendar size={14} />
                  {report.date}
                </div>
                <span className="text-gray-500 text-xs">{report.pages} pages</span>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold">
                {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trends */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-6 backdrop-blur-xl"
      >
        <h2 className="text-lg font-bold text-white mb-6">Quarterly Trends</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tickets Trend */}
          <div>
            <p className="text-gray-400 text-sm mb-4">Tickets Received</p>
            <div className="h-40 flex items-end justify-between gap-2">
              {trendData.map((data, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.tickets / 289) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg hover:from-purple-600 hover:to-blue-600 transition-all relative group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-white/10 rounded px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.tickets}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              {trendData.map(d => <span key={d.month}>{d.month}</span>)}
            </div>
          </div>

          {/* Resolution Trend */}
          <div>
            <p className="text-gray-400 text-sm mb-4">Tickets Resolved</p>
            <div className="h-40 flex items-end justify-between gap-2">
              {trendData.map((data, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.resolved / 256) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-green-500 to-emerald-500 rounded-t-lg hover:from-green-600 hover:to-emerald-600 transition-all relative group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-white/10 rounded px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.resolved}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              {trendData.map(d => <span key={d.month}>{d.month}</span>)}
            </div>
          </div>

          {/* Satisfaction Trend */}
          <div>
            <p className="text-gray-400 text-sm mb-4">Satisfaction Score</p>
            <div className="h-40 flex items-end justify-between gap-2">
              {trendData.map((data, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.satisfaction / 5) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-orange-500 to-yellow-500 rounded-t-lg hover:from-orange-600 hover:to-yellow-600 transition-all relative group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-white/10 rounded px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.satisfaction}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              {trendData.map(d => <span key={d.month}>{d.month}</span>)}
            </div>
          </div>
        </div>
      </motion.div>
    </ModernDashboardLayout>
  );
}

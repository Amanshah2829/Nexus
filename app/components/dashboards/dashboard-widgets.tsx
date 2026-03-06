'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
  icon?: React.ReactNode;
  gradient?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  trend = 'up',
  icon,
  gradient = 'from-purple-500 to-blue-500'
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-white text-2xl lg:text-3xl font-bold">{value}</h3>
        </div>
        {icon && (
          <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3 opacity-80 group-hover:opacity-100 transition-opacity`}>
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
            trend === 'up' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {trend === 'up' ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownLeft size={14} />
            )}
            <span className="text-xs font-semibold">{Math.abs(change)}%</span>
          </div>
          <span className="text-gray-500 text-xs">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, footer }: ChartCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-white/10 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-white font-bold text-lg">{title}</h3>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
          <MoreVertical size={18} className="text-gray-500" />
        </button>
      </div>
      <div className="mb-6">{children}</div>
      {footer && (
        <div className="pt-6 border-t border-white/5 text-gray-400 text-xs">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

interface ActivityItemProps {
  title: string;
  description: string;
  timestamp: string;
  avatar?: string;
  type?: 'success' | 'warning' | 'error' | 'info';
}

export function ActivityFeed({ items }: { items: ActivityItemProps[] }) {
  const typeColors = {
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-white/10 transition-all duration-300"
    >
      <h3 className="text-white font-bold text-lg mb-6">Recent Activity</h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4 pb-4 border-b border-white/5 last:border-0"
          >
            {item.avatar && (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm">{item.title}</p>
              <p className="text-gray-400 text-xs mt-1">{item.description}</p>
              <p className="text-gray-500 text-xs mt-2">{item.timestamp}</p>
            </div>
            {item.type && (
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${typeColors[item.type]}`}>
                {item.type}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

interface KanbanBoardProps {
  columns: {
    id: string;
    title: string;
    color: string;
    cards: { id: string; title: string; description: string }[];
  }[];
}

export function KanbanBoard({ columns }: KanbanBoardProps) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-min">
        {columns.map((column) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0 w-80"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="text-white font-bold text-sm">{column.title}</h3>
              <span className="ml-auto text-gray-500 text-xs">{column.cards.length}</span>
            </div>
            <div className="space-y-3">
              {column.cards.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -2 }}
                  className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all cursor-grab active:cursor-grabbing"
                >
                  <p className="text-white font-medium text-sm">{card.title}</p>
                  <p className="text-gray-400 text-xs mt-2">{card.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface TeamMemberProps {
  name: string;
  role: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
}

export function TeamGrid({ members }: { members: TeamMemberProps[] }) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {members.map((member) => (
        <motion.div
          key={member.name}
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all text-center"
        >
          <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 mx-auto mb-3">
            {member.status && (
              <div className={`absolute bottom-0 right-0 w-3 h-3 ${statusColors[member.status] || 'bg-gray-500'} rounded-full border-2 border-[#161A23]`} />
            )}
          </div>
          <p className="text-white font-medium text-sm">{member.name}</p>
          <p className="text-gray-400 text-xs mt-1">{member.role}</p>
        </motion.div>
      ))}
    </div>
  );
}

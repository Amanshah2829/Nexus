'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Archive, Flag, Search, MoreVertical, Circle } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';

export default function InboxPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const messages = [
    {
      id: '1',
      from: 'Sarah Johnson',
      email: 'sarah@example.com',
      subject: 'Urgent: System downtime report',
      preview: 'We have experienced a 15-minute outage starting at 2:30 PM...',
      time: '5 minutes ago',
      unread: true,
      flagged: true,
      avatar: '📧',
    },
    {
      id: '2',
      from: 'Mike Chen',
      email: 'mike@example.com',
      subject: 'Re: Database optimization',
      preview: 'Thanks for the update. The performance improvements look great...',
      time: '2 hours ago',
      unread: true,
      flagged: false,
      avatar: '💬',
    },
    {
      id: '3',
      from: 'Emma Wilson',
      email: 'emma@example.com',
      subject: 'Team meeting notes',
      preview: 'Here are the notes from today team meeting...',
      time: '5 hours ago',
      unread: false,
      flagged: false,
      avatar: '📝',
    },
    {
      id: '4',
      from: 'John Davis',
      email: 'john@example.com',
      subject: 'New feature deployment',
      preview: 'The new analytics dashboard has been deployed to production...',
      time: '1 day ago',
      unread: false,
      flagged: false,
      avatar: '🚀',
    },
  ];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <ModernDashboardLayout currentPage="inbox">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Inbox</h1>
          <p className="text-gray-400">You have 12 new messages</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search messages..."
              className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48"
            />
          </div>
        </div>
      </motion.div>

      {/* Messages List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
              message.unread
                ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {/* Checkbox */}
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedIds.includes(message.id)}
                onChange={() => toggleSelect(message.id)}
                className="w-5 h-5 rounded border-2 border-gray-500 cursor-pointer appearance-none checked:bg-gradient-to-r checked:from-purple-500 checked:to-blue-500 checked:border-0 transition-all"
              />
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 text-lg">
              {message.avatar}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className={`font-semibold ${message.unread ? 'text-white' : 'text-gray-300'}`}>
                  {message.from}
                </p>
                {message.unread && (
                  <Circle size={8} className="fill-purple-500 text-purple-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-gray-400 text-sm truncate">{message.subject}</p>
              <p className="text-gray-500 text-xs mt-1 truncate">{message.preview}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {message.flagged && (
                <Flag size={16} className="text-yellow-500 fill-yellow-500" />
              )}
              <span className="text-gray-500 text-sm whitespace-nowrap">{message.time}</span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <MoreVertical size={16} className="text-gray-500" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </ModernDashboardLayout>
  );
}

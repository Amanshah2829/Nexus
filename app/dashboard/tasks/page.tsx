'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CheckCircle2, Circle, Trash2, Edit2, Calendar, User } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';
import { StatCard } from '@/app/components/dashboards/dashboard-widgets';

export default function TasksPage() {
  const [filter, setFilter] = useState('all');
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Review customer feedback',
      description: 'Analyze feedback from last sprint',
      priority: 'high',
      completed: false,
      dueDate: '2024-03-10',
      assignee: 'John Smith',
    },
    {
      id: '2',
      title: 'Update documentation',
      description: 'Add new API endpoints docs',
      priority: 'medium',
      completed: true,
      dueDate: '2024-03-08',
      assignee: 'Sarah Connor',
    },
    {
      id: '3',
      title: 'Fix critical bug #4521',
      description: 'Users unable to login on mobile',
      priority: 'high',
      completed: false,
      dueDate: '2024-03-09',
      assignee: 'Mike Johnson',
    },
    {
      id: '4',
      title: 'Team training session',
      description: 'Prepare and conduct training',
      priority: 'low',
      completed: false,
      dueDate: '2024-03-15',
      assignee: 'Emma Davis',
    },
    {
      id: '5',
      title: 'Prepare Q2 roadmap',
      description: 'Plan features and improvements',
      priority: 'medium',
      completed: false,
      dueDate: '2024-03-12',
      assignee: 'John Smith',
    },
  ]);

  const stats = [
    { title: 'Total Tasks', value: tasks.length.toString(), change: 2, gradient: 'from-blue-500 to-cyan-500', icon: '📋' },
    { title: 'Completed', value: tasks.filter(t => t.completed).length.toString(), change: 5, gradient: 'from-green-500 to-emerald-500', icon: '✅' },
    { title: 'In Progress', value: tasks.filter(t => !t.completed).length.toString(), change: -1, gradient: 'from-purple-500 to-pink-500', icon: '⚙️' },
    { title: 'High Priority', value: tasks.filter(t => t.priority === 'high' && !t.completed).length.toString(), change: 3, gradient: 'from-red-500 to-orange-500', icon: '🔥' },
  ];

  const filteredTasks = filter === 'all' 
    ? tasks 
    : filter === 'completed' 
    ? tasks.filter(t => t.completed)
    : tasks.filter(t => !t.completed);

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <ModernDashboardLayout currentPage="tasks">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-gray-400">Manage and track all team tasks.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all"
        >
          <Plus size={18} />
          New Task
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, i) => (
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

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 mb-6"
      >
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
              task.completed
                ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {/* Checkbox */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTask(task.id)}
              className="flex-shrink-0 text-gray-500 hover:text-white transition-colors"
            >
              {task.completed ? (
                <CheckCircle2 size={24} className="text-green-500" />
              ) : (
                <Circle size={24} />
              )}
            </motion.button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold transition-all ${
                task.completed ? 'text-gray-400 line-through' : 'text-white'
              }`}>
                {task.title}
              </p>
              <p className="text-gray-500 text-sm mt-1">{task.description}</p>

              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Calendar size={14} />
                  {new Date(task.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <User size={14} />
                  {task.assignee}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-blue-500/20 rounded-lg transition-all"
              >
                <Edit2 size={16} className="text-blue-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
              >
                <Trash2 size={16} className="text-red-400" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="text-6xl mb-4">✨</div>
          <p className="text-white font-semibold mb-2">No tasks found</p>
          <p className="text-gray-400">All caught up! Create a new task to get started.</p>
        </motion.div>
      )}
    </ModernDashboardLayout>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, BookOpen, MessageSquare, ThumbsUp, Eye, ArrowRight } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const articles = [
    {
      id: '1',
      title: 'Getting Started with the Dashboard',
      description: 'Learn the basics of navigating and using the support dashboard',
      category: 'Getting Started',
      views: 1240,
      helpful: 892,
      comments: 34,
      updated: '2024-03-05',
    },
    {
      id: '2',
      title: 'Managing Support Tickets',
      description: 'Complete guide on creating, assigning, and resolving support tickets',
      category: 'Tickets',
      views: 987,
      helpful: 756,
      comments: 23,
      updated: '2024-03-03',
    },
    {
      id: '3',
      title: 'Team Management Best Practices',
      description: 'How to effectively manage your support team and track performance',
      category: 'Team',
      views: 654,
      helpful: 521,
      comments: 12,
      updated: '2024-02-28',
    },
    {
      id: '4',
      title: 'API Documentation & Integration',
      description: 'Technical guide for integrating with our API',
      category: 'Technical',
      views: 1523,
      helpful: 1102,
      comments: 45,
      updated: '2024-02-20',
    },
    {
      id: '5',
      title: 'Analytics and Reporting',
      description: 'Understanding reports and performance metrics',
      category: 'Analytics',
      views: 745,
      helpful: 612,
      comments: 18,
      updated: '2024-02-15',
    },
    {
      id: '6',
      title: 'Security and Access Control',
      description: 'Security best practices and managing user permissions',
      category: 'Security',
      views: 432,
      helpful: 378,
      comments: 8,
      updated: '2024-02-10',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Articles' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'tickets', name: 'Tickets' },
    { id: 'team', name: 'Team' },
    { id: 'technical', name: 'Technical' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'security', name: 'Security' },
  ];

  const filteredArticles = articles.filter(article =>
    (selectedCategory === 'all' || article.category.toLowerCase() === selectedCategory) &&
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ModernDashboardLayout currentPage="knowledge">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Knowledge Base</h1>
        <p className="text-gray-400">Find answers and learn how to use the platform.</p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-purple-500 transition-all">
          <Search size={20} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
          />
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2"
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </motion.div>

      {/* Articles Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="group bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-6 backdrop-blur-xl hover:border-white/10 hover:shadow-xl transition-all cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                <BookOpen size={24} className="text-purple-400" />
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/20 text-blue-400">
                {article.category}
              </span>
            </div>

            {/* Content */}
            <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">
              {article.title}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{article.description}</p>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  {article.views}
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp size={14} />
                  {article.helpful}
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} />
                  {article.comments}
                </div>
              </div>
              <motion.div
                whileHover={{ x: 4 }}
                className="text-gray-500 group-hover:text-purple-400 transition-colors"
              >
                <ArrowRight size={18} />
              </motion.div>
            </div>

            {/* Updated */}
            <p className="text-gray-600 text-xs mt-4">Updated {article.updated}</p>
          </motion.div>
        ))}
      </motion.div>

      {filteredArticles.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="text-6xl mb-4">📚</div>
          <p className="text-white font-semibold mb-2">No articles found</p>
          <p className="text-gray-400">Try searching with different keywords</p>
        </motion.div>
      )}
    </ModernDashboardLayout>
  );
}

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, AlertTriangle, Package, TrendingDown, DollarSign } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';
import { StatCard } from '@/app/components/dashboards/dashboard-widgets';

export default function InventoryPage() {
  const [sortBy, setSortBy] = useState('name');

  const inventoryStats = [
    { title: 'Total Items', value: '1,247', change: 12, gradient: 'from-blue-500 to-cyan-500', icon: '📦' },
    { title: 'Low Stock', value: '23', change: 5, gradient: 'from-orange-500 to-red-500', icon: '⚠️' },
    { title: 'Inventory Value', value: '$487.2K', change: 8, gradient: 'from-green-500 to-emerald-500', icon: '💰' },
    { title: 'Reorder Rate', value: '3.2%', change: -2, gradient: 'from-purple-500 to-pink-500', icon: '📊' },
  ];

  const items = [
    {
      id: '1',
      name: 'Laptop Computer',
      sku: 'LAP-001',
      category: 'Hardware',
      quantity: 45,
      minStock: 10,
      unitPrice: 1200,
      status: 'healthy',
    },
    {
      id: '2',
      name: 'Monitor 27"',
      sku: 'MON-001',
      category: 'Hardware',
      quantity: 8,
      minStock: 15,
      unitPrice: 350,
      status: 'low',
    },
    {
      id: '3',
      name: 'Keyboard',
      sku: 'KEY-001',
      category: 'Peripherals',
      quantity: 156,
      minStock: 20,
      unitPrice: 89,
      status: 'healthy',
    },
    {
      id: '4',
      name: 'Mouse',
      sku: 'MSE-001',
      category: 'Peripherals',
      quantity: 3,
      minStock: 25,
      unitPrice: 45,
      status: 'critical',
    },
    {
      id: '5',
      name: 'USB-C Cable',
      sku: 'CAB-001',
      category: 'Cables',
      quantity: 542,
      minStock: 100,
      unitPrice: 12,
      status: 'healthy',
    },
    {
      id: '6',
      name: 'HDMI Cable',
      sku: 'CAB-002',
      category: 'Cables',
      quantity: 12,
      minStock: 50,
      unitPrice: 8,
      status: 'low',
    },
  ];

  const statusColors = {
    healthy: 'bg-green-500/20 text-green-400',
    low: 'bg-yellow-500/20 text-yellow-400',
    critical: 'bg-red-500/20 text-red-400',
  };

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'stock') return a.quantity - b.quantity;
    if (sortBy === 'value') return (a.quantity * a.unitPrice) - (b.quantity * b.unitPrice);
    return 0;
  });

  return (
    <ModernDashboardLayout currentPage="inventory">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Inventory</h1>
          <p className="text-gray-400">Track and manage company assets and equipment.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-xl font-semibold transition-all"
        >
          <Plus size={18} />
          New Item
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {inventoryStats.map((stat, i) => (
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

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search items..."
            className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-48"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 transition-all"
        >
          <option value="name">Sort by Name</option>
          <option value="stock">Sort by Stock Level</option>
          <option value="value">Sort by Total Value</option>
        </select>
      </motion.div>

      {/* Inventory Table */}
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
                <th className="px-6 py-4 text-left font-semibold text-gray-400">Item Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-400">Category</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-400">Current Stock</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-400">Unit Price</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-400">Total Value</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((item) => {
                const totalValue = item.quantity * item.unitPrice;
                return (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    className="border-b border-white/5 transition-all"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-gray-500 text-xs">{item.sku}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{item.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{item.quantity}</span>
                        {item.quantity <= item.minStock && (
                          <AlertTriangle size={16} className="text-orange-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">${item.unitPrice}</td>
                    <td className="px-6 py-4 text-white font-semibold">${totalValue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${statusColors[item.status as keyof typeof statusColors]}`}>
                        {item.status === 'healthy' && '✓ Healthy'}
                        {item.status === 'low' && '! Low Stock'}
                        {item.status === 'critical' && '⚠ Critical'}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Low Stock Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <AlertTriangle size={24} className="text-orange-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-bold mb-2">Low Stock Alert</h3>
            <p className="text-orange-400 text-sm mb-3">The following items are below minimum stock levels:</p>
            <div className="space-y-2">
              {items.filter(i => i.quantity <= i.minStock).map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{item.name}</span>
                  <span className="text-orange-400 font-semibold">{item.quantity} / {item.minStock}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </ModernDashboardLayout>
  );
}

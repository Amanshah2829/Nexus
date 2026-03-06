
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Bell, Lock, Users, Shield, Key, LogOut, Upload, Mail, Check, X } from 'lucide-react';
import { ModernDashboardLayout } from '@/app/components/dashboards/modern-dashboard-layout';
import { ChartCard } from '@/app/components/dashboards/dashboard-widgets';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'account', label: 'Account Settings', icon: <Users size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'security', label: 'Security', icon: <Shield size={20} /> },
    { id: 'api', label: 'API Keys', icon: <Key size={20} /> },
    { id: 'team', label: 'Team Management', icon: <Users size={20} /> },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  return (
    <ModernDashboardLayout currentPage="settings">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account, security, and preferences.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-white/5"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-purple-500 text-white'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Account Settings Tab */}
      {activeTab === 'account' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>
            
            <div className="flex items-end gap-6 mb-8">
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex-shrink-0" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                <Upload size={18} />
                Change Avatar
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="John Smith"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="john.smith@example.com"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="+1 (555) 123-4567"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Role</label>
                <select className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-all">
                  <option>Administrator</option>
                  <option>Manager</option>
                  <option>Support Agent</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={isSaving}
              className="mt-6 flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>

          {/* Password Change */}
          <div className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-semibold transition-all"
            >
              <Lock size={18} />
              Update Password
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-8 backdrop-blur-xl"
        >
          <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
          
          <div className="space-y-4">
            {[
              { title: 'Ticket Assignments', description: 'Get notified when a ticket is assigned to you' },
              { title: 'Ticket Comments', description: 'Receive updates when someone comments on your tickets' },
              { title: 'System Alerts', description: 'Important system notifications and updates' },
              { title: 'Email Digest', description: 'Weekly summary of activities' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div>
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
                </label>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6">Two-Factor Authentication</h2>
            
            <div className="flex items-start justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-6">
              <div className="flex items-start gap-3">
                <Check className="text-green-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <p className="text-white font-medium">2FA Enabled</p>
                  <p className="text-green-400 text-sm mt-1">Your account is protected with two-factor authentication</p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all"
            >
              <Lock size={18} />
              Manage 2FA
            </motion.button>
          </div>

          <div className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white mb-6">Active Sessions</h2>
            
            <div className="space-y-3">
              {[
                { device: 'Chrome on Windows', location: 'New York, USA', lastActive: 'Now' },
                { device: 'Safari on macOS', location: 'San Francisco, USA', lastActive: '2 hours ago' },
                { device: 'Mobile App on iOS', location: 'Los Angeles, USA', lastActive: '1 day ago' },
              ].map((session, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl"
                >
                  <div>
                    <p className="text-white font-medium">{session.device}</p>
                    <p className="text-gray-400 text-sm">{session.location} • {session.lastActive}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    <LogOut size={18} className="text-gray-400 hover:text-red-400" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">API Keys</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold"
            >
              <Key size={18} />
              Generate New Key
            </motion.button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Production API Key', created: '2 months ago', lastUsed: '5 minutes ago' },
              { name: 'Development API Key', created: '1 month ago', lastUsed: '2 hours ago' },
            ].map((key, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-medium">{key.name}</p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="p-1 hover:bg-red-500/20 rounded"
                  >
                    <X size={16} className="text-gray-400 hover:text-red-400" />
                  </motion.button>
                </div>
                <div className="font-mono text-gray-400 text-sm mb-3 p-2 bg-black/20 rounded break-all">
                  sk_prod_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Created: {key.created}</span>
                  <span>Last used: {key.lastUsed}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Team Management Tab */}
      {activeTab === 'team' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1C1F2B] to-[#161A23] border border-white/5 rounded-2xl p-8 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Team Members</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold"
            >
              <Users size={18} />
              Invite Member
            </motion.button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'John Smith', role: 'Admin', email: 'john@example.com', status: 'active' },
              { name: 'Sarah Connor', role: 'Editor', email: 'sarah@example.com', status: 'active' },
              { name: 'Mike Johnson', role: 'Viewer', email: 'mike@example.com', status: 'invited' },
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500" />
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select className="px-3 py-1 bg-white/5 border border-white/10 rounded text-white text-sm">
                    <option>Admin</option>
                    <option>Editor</option>
                    <option>Viewer</option>
                  </select>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${
                    member.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {member.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </ModernDashboardLayout>
  );
}

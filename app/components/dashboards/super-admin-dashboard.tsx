'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  Users,
  Settings,
  TrendingUp,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Tenant {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  usersCount: number;
  complaintsCount: number;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  storageUsed: number;
  storageLimit: number;
}

export function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tenants');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/tenants', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTenants(data);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTenants(tenants.filter((t) => t.id !== tenantId));
      }
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };

  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'pro':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Stats cards
  const stats = [
    {
      title: 'Total Tenants',
      value: tenants.length,
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Active Users',
      value: tenants.reduce((sum, t) => sum + t.usersCount, 0),
      icon: Users,
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    {
      title: 'Total Complaints',
      value: tenants.reduce((sum, t) => sum + t.complaintsCount, 0),
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Storage Used',
      value: `${(tenants.reduce((sum, t) => sum + t.storageUsed, 0) / 1024).toFixed(1)} GB`,
      icon: Settings,
      color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">System Administration</h1>
          <p className="text-muted-foreground mt-1">
            Manage all tenants and system settings
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Tenant
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        {['tenants', 'settings', 'audit-logs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors capitalize',
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tenants Tab */}
      {activeTab === 'tenants' && (
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tenants</CardTitle>
                <CardDescription>Manage all organization tenants</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading tenants...
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tenants found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead>Tenant Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead className="text-right">Users</TableHead>
                      <TableHead className="text-right">Tickets</TableHead>
                      <TableHead className="text-right">Storage</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTenants.map((tenant) => (
                      <TableRow key={tenant.id} className="border-border hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">{tenant.name}</p>
                            <p className="text-xs text-muted-foreground">{tenant.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tenant.status)}
                            <span className="capitalize text-sm">{tenant.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSubscriptionColor(tenant.subscriptionTier)}>
                            {tenant.subscriptionTier}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {tenant.usersCount}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {tenant.complaintsCount}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {(
                            (tenant.storageUsed / tenant.storageLimit) *
                            100
                          ).toFixed(1)}
                          %
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedTenant(tenant)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteTenant(tenant.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure system-wide settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Email Configuration
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Configure email settings for system notifications
                </p>
                <Button variant="outline" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Configure Email
                </Button>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Backup & Restore
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Manage system backups
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    Create Backup
                  </Button>
                  <Button variant="outline" className="gap-2">
                    View Backups
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit-logs' && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>System activity and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Audit logs feature coming soon...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Utility function (move to shared utils)
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

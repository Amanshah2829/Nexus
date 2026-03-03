'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Trash2, Edit2 } from 'lucide-react';

const mockAssets = [
  {
    id: '1',
    name: 'Dell Laptop',
    serialNumber: 'DELL-2024-001',
    category: 'Equipment',
    status: 'active',
    location: 'Building A',
    assignedTo: 'John Doe',
    purchaseDate: '2023-01-15',
    value: '$1,200',
  },
  {
    id: '2',
    name: 'HP Desktop',
    serialNumber: 'HP-2024-002',
    category: 'Equipment',
    status: 'inactive',
    location: 'Storage',
    assignedTo: 'Unassigned',
    purchaseDate: '2022-06-20',
    value: '$900',
  },
  {
    id: '3',
    name: 'Network Switch',
    serialNumber: 'CISCO-2024-001',
    category: 'Network',
    status: 'active',
    location: 'Server Room',
    assignedTo: 'Tech Team',
    purchaseDate: '2023-03-10',
    value: '$2,500',
  },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [view, setView] = useState<'grid' | 'list'>('list');

  const filteredAssets = mockAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'secondary';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-2">Manage your assets and equipment</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">247</div>
              <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">198</div>
              <p className="text-xs text-muted-foreground mt-1">80% utilization</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning">35</div>
              <p className="text-xs text-muted-foreground mt-1">In storage</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$187K</div>
              <p className="text-xs text-muted-foreground mt-1">Estimated worth</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or serial number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Assets</CardTitle>
            <CardDescription>{filteredAssets.length} assets found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Name</th>
                    <th className="text-left py-3 px-4 font-medium">Serial Number</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Assigned To</th>
                    <th className="text-left py-3 px-4 font-medium">Value</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => (
                    <tr key={asset.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium">{asset.name}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{asset.serialNumber}</td>
                      <td className="py-3 px-4">{asset.category}</td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusColor(asset.status)}>
                          {asset.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{asset.location}</td>
                      <td className="py-3 px-4">{asset.assignedTo}</td>
                      <td className="py-3 px-4 font-medium">{asset.value}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredAssets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No assets found matching your search.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

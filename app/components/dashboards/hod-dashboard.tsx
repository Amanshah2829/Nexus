'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DepartmentStats {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  avgResolutionTime: number;
  teamSize: number;
  departmentName: string;
}

interface TeamPerformance {
  engineer: string;
  resolved: number;
  pending: number;
  avgTime: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function HODDashboard() {
  const [stats, setStats] = useState<DepartmentStats>({
    totalComplaints: 156,
    resolvedComplaints: 112,
    pendingComplaints: 44,
    avgResolutionTime: 48,
    teamSize: 8,
    departmentName: 'IT Support',
  });

  const [teamPerformance] = useState<TeamPerformance[]>([
    { engineer: 'John Doe', resolved: 24, pending: 3, avgTime: 45 },
    { engineer: 'Jane Smith', resolved: 28, pending: 2, avgTime: 42 },
    { engineer: 'Bob Wilson', resolved: 20, pending: 5, avgTime: 52 },
    { engineer: 'Alice Brown', resolved: 22, pending: 4, avgTime: 48 },
    { engineer: 'Charlie Davis', resolved: 18, pending: 6, avgTime: 55 },
  ]);

  const chartData = [
    { month: 'Jan', complaints: 32, resolved: 28 },
    { month: 'Feb', complaints: 28, resolved: 24 },
    { month: 'Mar', complaints: 35, resolved: 30 },
    { month: 'Apr', complaints: 42, resolved: 38 },
    { month: 'May', complaints: 38, resolved: 35 },
    { month: 'Jun', complaints: 45, resolved: 40 },
  ];

  const statusData = [
    { name: 'Resolved', value: stats.resolvedComplaints, fill: '#10b981' },
    { name: 'Pending', value: stats.pendingComplaints, fill: '#f59e0b' },
  ];

  const summaryStats = [
    {
      title: 'Total Complaints',
      value: stats.totalComplaints,
      icon: AlertTriangle,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      trend: '+12%',
    },
    {
      title: 'Resolved',
      value: stats.resolvedComplaints,
      icon: CheckCircle,
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
      trend: '+8%',
    },
    {
      title: 'Pending',
      value: stats.pendingComplaints,
      icon: Clock,
      color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      trend: '-5%',
    },
    {
      title: 'Avg Resolution',
      value: `${stats.avgResolutionTime}h`,
      icon: TrendingUp,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      trend: '-3%',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {stats.departmentName} Department
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor team performance and department metrics
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
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
                    <p className="text-xs text-success mt-2">{stat.trend}</p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints Trend */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Complaints Trend</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="month" stroke="rgba(0,0,0,0.5)" />
                <YAxis stroke="rgba(0,0,0,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="complaints"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Created"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Resolved"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Performance</CardTitle>
              <CardDescription>Individual engineer metrics</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead>Engineer</TableHead>
                  <TableHead className="text-right">Resolved</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Avg Time (h)</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamPerformance.map((member) => {
                  const resolutionRate = (
                    (member.resolved / (member.resolved + member.pending)) *
                    100
                  ).toFixed(0);
                  return (
                    <TableRow key={member.engineer} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <p className="font-medium text-foreground">{member.engineer}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          {member.resolved}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                          {member.pending}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-foreground">
                        {member.avgTime}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${resolutionRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {resolutionRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Complaints</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

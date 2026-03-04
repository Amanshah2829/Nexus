'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Download, MoreVertical } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Sample analytics data
const ticketTrendData = [
  { date: 'Mon', created: 12, resolved: 8, pending: 4 },
  { date: 'Tue', created: 15, resolved: 10, pending: 5 },
  { date: 'Wed', created: 18, resolved: 14, pending: 4 },
  { date: 'Thu', created: 16, resolved: 12, pending: 4 },
  { date: 'Fri', created: 20, resolved: 18, pending: 2 },
  { date: 'Sat', created: 14, resolved: 12, pending: 2 },
  { date: 'Sun', created: 10, resolved: 10, pending: 0 },
];

const priorityDistribution = [
  { name: 'Low', value: 35, color: '#10b981' },
  { name: 'Medium', value: 45, color: '#f59e0b' },
  { name: 'High', value: 15, color: '#ef4444' },
  { name: 'Critical', value: 5, color: '#991b1b' },
];

const teamPerformance = [
  { engineer: 'John Doe', resolved: 28, pending: 3, satisfaction: 4.8 },
  { engineer: 'Jane Smith', resolved: 25, pending: 5, satisfaction: 4.6 },
  { engineer: 'Bob Johnson', resolved: 18, pending: 8, satisfaction: 4.2 },
  { engineer: 'Alice Williams', resolved: 22, pending: 4, satisfaction: 4.7 },
];

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');
  const { data: stats } = useSWR('/api/analytics/stats', fetcher);

  const metrics = [
    {
      title: 'Total Tickets',
      value: '248',
      change: '+12%',
      description: 'Last 30 days',
    },
    {
      title: 'Avg Resolution Time',
      value: '4.2h',
      change: '-8%',
      description: 'Faster than last month',
    },
    {
      title: 'Customer Satisfaction',
      value: '4.6/5.0',
      change: '+0.3',
      description: 'Based on 156 reviews',
    },
    {
      title: 'First Response Time',
      value: '12m',
      change: '-5m',
      description: 'Average across team',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground mt-1">Monitor performance and track key metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm font-medium">{metric.title}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-sm font-semibold text-green-600">{metric.change}</p>
                </div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket Trends</CardTitle>
            <CardDescription>Created vs Resolved tickets over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ticketTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tickets by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Engineer productivity and satisfaction metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="engineer" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="resolved" fill="#10b981" />
              <Bar dataKey="pending" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SLA Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance</CardTitle>
            <CardDescription>Service Level Agreement adherence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { level: 'Critical - 1h', compliance: 98 },
              { level: 'High - 4h', compliance: 94 },
              { level: 'Medium - 8h', compliance: 91 },
              { level: 'Low - 24h', compliance: 96 },
            ].map((sla, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{sla.level}</span>
                  <span className="text-sm font-bold text-green-600">{sla.compliance}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${sla.compliance}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Trends</CardTitle>
            <CardDescription>Customer feedback over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ticketTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={() => 4.6}
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Satisfaction"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

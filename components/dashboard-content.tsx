'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Mock data
const kpiData = [
  {
    title: 'Open Tickets',
    value: '42',
    change: '+12%',
    trend: 'up',
    icon: AlertCircle,
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900',
  },
  {
    title: 'Resolved Today',
    value: '18',
    change: '+8%',
    trend: 'up',
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100 dark:bg-green-900',
  },
  {
    title: 'Avg Response Time',
    value: '12m',
    change: '-15%',
    trend: 'down',
    icon: Clock,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
  },
  {
    title: 'Satisfaction Rate',
    value: '94%',
    change: '+2%',
    trend: 'up',
    icon: Users,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
  },
];

const chartData = [
  { name: 'Mon', tickets: 24, resolved: 18, pending: 6 },
  { name: 'Tue', tickets: 28, resolved: 22, pending: 6 },
  { name: 'Wed', tickets: 32, resolved: 25, pending: 7 },
  { name: 'Thu', tickets: 35, resolved: 28, pending: 7 },
  { name: 'Fri', tickets: 40, resolved: 35, pending: 5 },
  { name: 'Sat', tickets: 20, resolved: 18, pending: 2 },
  { name: 'Sun', tickets: 16, resolved: 14, pending: 2 },
];

const statusData = [
  { name: 'Resolved', value: 160, color: '#10b981' },
  { name: 'In Progress', value: 45, color: '#3b82f6' },
  { name: 'Pending', value: 35, color: '#f59e0b' },
  { name: 'Blocked', value: 12, color: '#ef4444' },
];

const recentActivity = [
  {
    id: 1,
    action: 'Ticket #1234 resolved',
    user: 'John Engineer',
    time: '2 minutes ago',
    type: 'resolved',
  },
  {
    id: 2,
    action: 'Remote session started',
    user: 'Sarah Smith',
    time: '15 minutes ago',
    type: 'session',
  },
  {
    id: 3,
    action: 'New complaint created',
    user: 'Customer Portal',
    time: '1 hour ago',
    type: 'complaint',
  },
  {
    id: 4,
    action: 'SLA milestone reached',
    user: 'System',
    time: '2 hours ago',
    type: 'sla',
  },
  {
    id: 5,
    action: 'Team member online',
    user: 'Mike Johnson',
    time: '3 hours ago',
    type: 'user',
  },
];

export function DashboardContent() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your support platform overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          const TrendIcon = kpi.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          const trendColor = kpi.trend === 'up' ? 'text-green-600' : 'text-red-600';

          return (
            <Card key={kpi.title} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                    <h3 className="text-2xl font-bold mt-2">{kpi.value}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                      <span className={`text-xs ${trendColor} font-medium`}>{kpi.change}</span>
                      <span className="text-xs text-muted-foreground">vs last week</span>
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tickets Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ticket Activity</CardTitle>
            <CardDescription>Weekly ticket trends and resolution rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="tickets" fill="var(--color-primary)" name="Total Tickets" />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Current ticket statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-background)',
                    border: '1px solid var(--color-border)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {statusData.map((status) => (
                <div key={status.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span>{status.name}</span>
                  </div>
                  <span className="font-medium">{status.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest actions across your support platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-3 hover:bg-muted rounded-lg transition-colors"
              >
                <div className="mt-1">
                  {activity.type === 'resolved' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  {activity.type === 'session' && <Zap className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'complaint' && (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  {activity.type === 'sla' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                  {activity.type === 'user' && <Users className="w-5 h-5 text-indigo-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.user} • {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Button className="w-full">Create New Ticket</Button>
            <Button variant="outline" className="w-full">
              View All Tickets
            </Button>
            <Button variant="outline" className="w-full">
              Team Performance
            </Button>
            <Button variant="outline" className="w-full">
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

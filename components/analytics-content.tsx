'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'Jan', complaints: 40, resolved: 24, pending: 16 },
  { name: 'Feb', complaints: 50, resolved: 38, pending: 12 },
  { name: 'Mar', complaints: 45, resolved: 32, pending: 13 },
  { name: 'Apr', complaints: 60, resolved: 48, pending: 12 },
  { name: 'May', complaints: 55, resolved: 45, pending: 10 },
  { name: 'Jun', complaints: 70, resolved: 58, pending: 12 },
];

const categoryData = [
  { name: 'Technical', value: 45, color: 'var(--primary)' },
  { name: 'Billing', value: 25, color: 'var(--accent)' },
  { name: 'Service', value: 20, color: 'var(--success)' },
  { name: 'Other', value: 10, color: 'var(--warning)' },
];

const resolutionData = [
  { time: '0-1h', count: 45 },
  { time: '1-4h', count: 32 },
  { time: '4-8h', count: 28 },
  { time: '8-24h', count: 15 },
  { time: '>24h', count: 8 },
];

export default function AnalyticsContent() {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3" /> +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3" /> +2.1% improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3.2h</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
              <TrendingDown className="h-3 w-3" /> -15 mins improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.7/5</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3" /> +0.3 points
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Complaints Trend</CardTitle>
              <CardDescription>Monthly complaint and resolution statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="complaints" stroke="var(--primary)" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" stroke="var(--success)" strokeWidth={2} />
                  <Line type="monotone" dataKey="pending" stroke="var(--warning)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Complaints by Category</CardTitle>
                <CardDescription>Distribution across complaint types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Resolution Time Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Resolution Time Distribution</CardTitle>
                <CardDescription>How long it takes to resolve complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={resolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.5rem',
                      }}
                    />
                    <Bar dataKey="count" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-primary pl-4 py-2">
                <h4 className="font-semibold">Resolution Rate Improving</h4>
                <p className="text-sm text-muted-foreground">94.2% of complaints resolved, up 2.1% from last month</p>
              </div>
              <div className="border-l-4 border-accent pl-4 py-2">
                <h4 className="font-semibold">Peak Complaints Time</h4>
                <p className="text-sm text-muted-foreground">9-11 AM and 2-4 PM see highest complaint volumes</p>
              </div>
              <div className="border-l-4 border-success pl-4 py-2">
                <h4 className="font-semibold">Top Category</h4>
                <p className="text-sm text-muted-foreground">Technical issues account for 45% of all complaints</p>
              </div>
              <div className="border-l-4 border-warning pl-4 py-2">
                <h4 className="font-semibold">Response Time</h4>
                <p className="text-sm text-muted-foreground">Average first response time: 12 minutes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

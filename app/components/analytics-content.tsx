"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Progress } from "@/app/components/ui/progress"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  RefreshCw,
  Target,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Leaf,
  Power,
  Lightbulb,
  Users,
} from "lucide-react"
import { IComplaint } from "@/app/models/Complaint";
import { IUser } from "@/app/models/User";
import { LoadingAnimation } from "@/app/components/ui/loading-animation";
import { IAsset } from "@/app/models/Asset";
import { IAssetLog } from "@/app/models/AssetLog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { cn } from "@/app/lib/utils";
import { MonthlyTrendsChart, FailureRateChart, GreenITChart } from "./charts-isolated";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";


const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
});

export function AnalyticsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedView, setSelectedView] = useState("overview")

  const { data: complaints, error: complaintsError } = useSWR<IComplaint[]>('/api/complaints?status=all', fetcher);
  const { data: users, error: usersError } = useSWR<IUser[]>('/api/users', fetcher);
  const { data: assets, error: assetsError } = useSWR<IAsset[]>('/api/inventory/assets?status=all', fetcher);
  const { data: assetLogs, error: assetLogError } = useSWR<IAssetLog[]>('/api/inventory/logs', fetcher);

  const isLoading = !complaints || !users || !assets || !assetLogs;
  const isDataValid = Array.isArray(complaints) && Array.isArray(users) && Array.isArray(assets) && Array.isArray(assetLogs);

  if (isLoading) {
    return <div className="flex h-full w-full items-center justify-center p-20 bg-background"><LoadingAnimation /></div>
  }

  if (complaintsError || usersError || assetsError || assetLogError || !isDataValid) {
    return <div className="flex h-full w-full items-center justify-center text-destructive p-20 bg-background">Error loading data. Please verify your connection.</div>
  }
  
  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'closed').length;
  const pendingComplaints = totalComplaints - resolvedComplaints;
  
  const analyticsData = {
    overview: {
      totalComplaints,
      resolvedComplaints,
      pendingComplaints,
      averageResolutionTime: 2.4, 
      trendsComparison: {
        complaints: 12, 
        resolution: -8,
      },
    },
    complaintsByStatus: [
      { status: "Created", count: complaints.filter(c => c.status === 'created').length, color: "bg-blue-500" },
      { status: "Scheduled", count: complaints.filter(c => c.status === 'scheduled').length, color: "bg-yellow-500" },
      { status: "Visited", count: complaints.filter(c => c.status === 'visited').length, color: "bg-purple-500" },
      { status: "Observation", count: complaints.filter(c => c.status === 'observation').length, color: "bg-orange-500" },
      { status: "Follow-up", count: complaints.filter(c => c.status === 'follow-up').length, color: "bg-indigo-500" },
      { status: "Closed", count: complaints.filter(c => c.status === 'closed').length, color: "bg-green-500" },
    ],
    complaintsByPriority: [
      { priority: "Critical", count: complaints.filter(c => c.priority === 'critical').length, color: "var(--color-destructive)", percentage: totalComplaints > 0 ? (complaints.filter(c => c.priority === 'critical').length / totalComplaints) * 100 : 0 },
      { priority: "High", count: complaints.filter(c => c.priority === 'high').length, color: "var(--color-chart-5)", percentage: totalComplaints > 0 ? (complaints.filter(c => c.priority === 'high').length / totalComplaints) * 100 : 0 },
      { priority: "Medium", count: complaints.filter(c => c.priority === 'medium').length, color: "var(--color-chart-2)", percentage: totalComplaints > 0 ? (complaints.filter(c => c.priority === 'medium').length / totalComplaints) * 100 : 0 },
      { priority: "Low", count: complaints.filter(c => c.priority === 'low').length, color: "var(--color-chart-1)", percentage: totalComplaints > 0 ? (complaints.filter(c => c.priority === 'low').length / totalComplaints) * 100 : 0 },
    ],
    complaintsByCategory: Array.from(new Set(complaints.map(c => c.category || 'uncategorized'))).map(category => ({
        category: category,
        count: complaints.filter(c => (c.category || 'uncategorized') === category).length,
        percentage: totalComplaints > 0 ? (complaints.filter(c => (c.category || 'uncategorized') === category).length / totalComplaints) * 100 : 0
    })).sort((a,b) => b.count - a.count),
    engineerPerformance: users.filter(u => u.role === 'engineer').map(engineer => {
      const assignedComplaints = complaints.filter(c => (c.assignedTo as any)?._id?.toString() === engineer._id.toString() || (c.assignedTo as any)?.toString() === engineer._id.toString());
      const resolved = assignedComplaints.filter(c => c.status === 'closed').length;
      return {
        id: engineer._id,
        name: engineer.name,
        avatar: engineer.avatar || `https://avatar.vercel.sh/${engineer.name}.png`,
        assignedComplaints: assignedComplaints.length,
        resolvedComplaints: resolved,
        averageResolutionTime: 2.1, 
        satisfactionScore: 4.5, 
        efficiency: assignedComplaints.length > 0 ? (resolved / assignedComplaints.length) * 100 : 0,
      }
    }),
    monthlyTrends: [
      { month: "Jan", complaints: 45, resolved: 38, satisfaction: 4.1 },
      { month: "Feb", complaints: 52, resolved: 44, satisfaction: 4.0 },
      { month: "Mar", complaints: 48, resolved: 42, satisfaction: 4.2 },
      { month: "Apr", complaints: 38, resolved: 35, satisfaction: 4.3 },
      { month: "May", complaints: 42, resolved: 39, satisfaction: 4.1 },
      { month: "Jun", complaints: 35, resolved: 33, satisfaction: 4.4 },
    ],
    locationAnalytics: Array.from(new Set(complaints.map(c => c.building))).filter(Boolean).map(location => {
      const locationComplaints = complaints.filter(c => c.building === location);
      return {
        location,
        complaints: locationComplaints.length,
        resolved: locationComplaints.filter(c => c.status === 'closed').length,
        avgTime: 2.2 
      }
    }).sort((a,b) => b.complaints - a.complaints),
    assetHealth: {
        assets: assets,
        logs: assetLogs
    }
  }


  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="p-4 sm:p-6 md:p-8 border-b border-border/50 bg-gradient-to-r from-card via-card to-muted/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
              <p className="text-muted-foreground text-base">Monitor key metrics, track trends, and measure team performance in real-time.</p>
            </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36 text-xs h-9 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9" onClick={() => {
              mutate('/api/complaints?status=all');
              mutate('/api/users');
              mutate('/api/inventory/assets?status=all');
              mutate('/api/inventory/logs');
            }}>
              <RefreshCw className="h-3.5 w-3.5 mr-2" />
              Refresh
            </Button>
            <Button size="sm" className="h-9">
              <Download className="h-3.5 w-3.5 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
       <div className="flex-1 overflow-auto p-4 sm:p-6">
        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList className="mb-4 bg-muted p-1 rounded-full border border-border">
            <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-primary">Overview</TabsTrigger>
            <TabsTrigger value="performance" className="rounded-full data-[state=active]:bg-primary">Performance</TabsTrigger>
            <TabsTrigger value="trends" className="rounded-full data-[state=active]:bg-primary">Trends</TabsTrigger>
            <TabsTrigger value="locations" className="rounded-full data-[state=active]:bg-primary">Locations</TabsTrigger>
            <TabsTrigger value="assetHealth" className="rounded-full data-[state=active]:bg-primary">Predictive</TabsTrigger>
            <TabsTrigger value="greenIT" className="rounded-full data-[state=active]:bg-primary">Green IT</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab data={analyticsData} />
          </TabsContent>
          <TabsContent value="performance">
            <PerformanceTab data={analyticsData} />
          </TabsContent>
          <TabsContent value="trends">
            <TrendsTab data={analyticsData} />
          </TabsContent>
          <TabsContent value="locations">
            <LocationsTab data={analyticsData} />
          </TabsContent>
          <TabsContent value="assetHealth">
            <AssetHealthTab data={analyticsData.assetHealth} />
          </TabsContent>
           <TabsContent value="greenIT">
            <GreenITTab data={analyticsData.assetHealth} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function OverviewTab({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Total Complaints" value={data.overview.totalComplaints} icon={BarChart3} trend={data.overview.trendsComparison.complaints} color="blue" />
        <KpiCard title="Resolved" value={data.overview.resolvedComplaints} icon={CheckCircle} color="green" />
        <KpiCard title="Pending" value={data.overview.pendingComplaints} icon={Clock} color="yellow" />
        <KpiCard title="Avg Resolution" value={`${data.overview.averageResolutionTime}d`} icon={Target} trend={data.overview.trendsComparison.resolution} color="purple" reverseTrend />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Complaints by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.complaintsByStatus.map((item: any) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.count}</span>
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: data.overview.totalComplaints > 0 ? `${(item.count / data.overview.totalComplaints) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Complaints by Category</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-3">
              {data.complaintsByCategory.map((item: any) => (
                <div key={item.category} className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium capitalize truncate">{item.category}</p>
                    <Progress value={item.percentage} className="h-1.5" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{item.count} <span className="text-xs">({item.percentage.toFixed(1)}%)</span></p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Complaints by Priority</CardTitle>
        </CardHeader>
        <CardContent>
            {data.overview.totalComplaints > 0 ? (
                 <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-center">
                    {data.complaintsByPriority.map((item: any) => (
                        <div key={item.priority} className="flex-1 space-y-1 min-w-[100px]">
                            <div className="text-3xl font-bold" style={{color: item.color}}>{item.count}</div>
                            <div className="text-sm font-medium capitalize flex items-center justify-center gap-1.5">
                               <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}/>
                               {item.priority}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No data to display.</p>
            )}
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({ title, value, icon: Icon, trend, color, reverseTrend }: any) {
  const isPositive = trend > 0;
  const trendColor = reverseTrend ? (isPositive ? "text-destructive" : "text-green-500") : (isPositive ? "text-green-500" : "text-destructive");
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center bg-muted")}>
            <Icon className={cn("h-6 w-6 text-primary")} />
          </div>
        </div>
        {trend !== undefined && (
          <div className="flex items-center mt-2 text-sm">
            <TrendIcon className={`h-4 w-4 ${trendColor} mr-1`} />
            <span className={trendColor}>{Math.abs(trend)}%</span>
            <span className="text-muted-foreground ml-1">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PerformanceTab({ data }: { data: any }) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-primary"><Users className="h-5 w-5"/>Engineer Performance</CardTitle>
      </CardHeader>
      <CardContent>
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Engineer</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Resolved</TableHead>
              <TableHead>Avg. Resolution</TableHead>
              <TableHead>Satisfaction</TableHead>
              <TableHead className="text-right w-[200px]">Efficiency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.engineerPerformance.map((engineer: any) => (
              <TableRow key={engineer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={engineer.avatar} />
                      <AvatarFallback>{engineer.name.split(' ').map((n:string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{engineer.name}</div>
                  </div>
                </TableCell>
                <TableCell>{engineer.assignedComplaints}</TableCell>
                <TableCell>{engineer.resolvedComplaints}</TableCell>
                <TableCell>{engineer.averageResolutionTime}d</TableCell>
                <TableCell>{engineer.satisfactionScore}/5</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-medium text-sm w-12">{engineer.efficiency.toFixed(1)}%</span>
                    <Progress value={engineer.efficiency} className="w-24 h-2" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function TrendsTab({ data }: { data: any }) {
  return (
    <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg text-primary">Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
            <MonthlyTrendsChart data={data.monthlyTrends} />
        </CardContent>
      </Card>
  )
}

function LocationsTab({ data }: { data: any }) {
  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-primary">Location Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.locationAnalytics.map((location: any) => (
            <div key={location.location} className="p-4 bg-muted rounded-lg border border-border hover:bg-accent transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{location.location}</p>
                  <p className="text-sm text-muted-foreground">
                    {location.resolved}/{location.complaints} resolved
                  </p>
                </div>
                <Badge variant="outline" className="border-primary text-primary">{location.avgTime}d avg</Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-background rounded-full h-2">
                  <div
                    className="h-2 bg-gradient-to-r from-orange-500 to-green-500 rounded-full"
                    style={{ width: location.complaints > 0 ? `${(location.resolved / location.complaints) * 100}%` : '0%' }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {location.complaints > 0 ? Math.round((location.resolved / location.complaints) * 100) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function AssetHealthTab({ data }: { data: { assets: IAsset[], logs: IAssetLog[] } }) {
    
    // 1. Calculate failure rates by model
    const failureLogs = data.logs.filter(log => log.action === 'status_change' && (log.details?.to === 'defective' || log.details?.to === 'damaged'));
    const assetsByModel = data.assets.reduce((acc, asset) => {
        const model = asset.model || 'Unknown';
        if (!acc[model]) {
            acc[model] = { total: 0, failures: 0 };
        }
        acc[model].total++;
        return acc;
    }, {} as Record<string, { total: number, failures: number }>);

    failureLogs.forEach(log => {
        const asset = data.assets.find(a => a._id.toString() === (log.asset as any).toString());
        if (asset && asset.model) {
            if (assetsByModel[asset.model]) {
                assetsByModel[asset.model].failures++;
            }
        }
    });

    const failureRateByModel = Object.entries(assetsByModel)
        .map(([model, { total, failures }]) => ({
            model,
            failureRate: total > 0 ? (failures / total) * 100 : 0
        }))
        .sort((a, b) => b.failureRate - a.failureRate);

    // 2. Calculate health score for each asset
    const getAssetHealthScore = (asset: IAsset) => {
        let score = 100;
        // Age penalty: -10 points per year
        if (asset.purchaseDate) {
            const ageInYears = (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
            score -= Math.min(ageInYears * 10, 40); // Max 40 points penalty for age
        }
        // Personal failure history penalty: -20 points per failure
        const personalFailures = failureLogs.filter(log => (log.asset as any).toString() === asset._id.toString()).length;
        score -= personalFailures * 20;

        // Model failure rate penalty
        const modelFailureInfo = failureRateByModel.find(m => m.model === asset.model);
        if (modelFailureInfo) {
            score -= modelFailureInfo.failureRate; // 1% failure rate = 1 point penalty
        }

        return Math.max(0, Math.round(score));
    };

    const assetHealthData = data.assets.map(asset => ({
        ...asset,
        healthScore: getAssetHealthScore(asset),
    })).sort((a,b) => a.healthScore - b.healthScore);
    
    const atRiskAssets = assetHealthData.filter(a => a.healthScore < 60).length;

    return (
        <div className="space-y-6 bg-background">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 bg-card">
                    <CardHeader>
                        <CardTitle className="text-primary">Maintenance Risk</CardTitle>
                        <p className="text-sm text-muted-foreground">Proactive asset health monitoring and risk assessment.</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-destructive/20 rounded-lg border border-destructive">
                            <div>
                                <p className="text-sm font-medium">Assets at Risk</p>
                                <p className="text-3xl font-bold text-destructive">{atRiskAssets}</p>
                            </div>
                            <ShieldAlert className="h-8 w-8 text-destructive"/>
                        </div>
                         <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-lg border border-green-500">
                            <div>
                                <p className="text-sm font-medium">Healthy Assets</p>
                                <p className="text-3xl font-bold text-green-500">{data.assets.length - atRiskAssets}</p>
                            </div>
                            <ShieldCheck className="h-8 w-8 text-green-500"/>
                        </div>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-full font-bold">Schedule Proactive Checkup</Button>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 bg-card">
                    <CardHeader>
                        <CardTitle className="text-primary">Failure Rate by Model</CardTitle>
                    </CardHeader>
                     <CardContent>
                         <FailureRateChart data={failureRateByModel.slice(0, 10)} />
                    </CardContent>
                </Card>
            </div>
            
            <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="text-primary">Asset Health Scores</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset No.</TableHead>
                                <TableHead>Serial Number</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Health Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assetHealthData.map(asset => (
                                <TableRow key={asset._id}>
                                    <TableCell>{asset.assetNo}</TableCell>
                                    <TableCell className="font-medium font-mono">{asset.serialNumber}</TableCell>
                                    <TableCell>{asset.model}</TableCell>
                                    <TableCell><Badge variant="outline" className="border-primary text-primary bg-background">{asset.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={cn(
                                                "font-bold",
                                                asset.healthScore > 80 && "text-green-500",
                                                asset.healthScore <= 80 && asset.healthScore > 60 && "text-yellow-500",
                                                asset.healthScore <= 60 && "text-destructive"
                                            )}>{asset.healthScore}</span>
                                            <Progress value={asset.healthScore} className="w-24 h-2"/>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function GreenITTab({ data }: { data: { assets: IAsset[] } }) {
    // Mock data for power consumption (Watts)
    const powerData: Record<string, number> = {
        'MacBook Pro M3': 60,
        'Precision 7875': 150,
        'Meraki MX68': 15,
        'EX4100-F': 40,
        'FortiGate 60F': 12,
        'LaserJet Enterprise': 25,
        'Rally Bar': 30,
        'Default': 30,
    };

    const costPerKwh = 0.12; 
    const co2Factor = 0.4; 

    let totalPower = 0;
    const consumptionByCategory: Record<string, { power: number, count: number }> = {};
    const highConsumptionAssets: (IAsset & { power: number })[] = [];

    data.assets.forEach(asset => {
        const model = asset.model || 'Unknown';
        const power = powerData[model] || powerData['Default'];
        totalPower += power;

        const category = asset.make || 'Other';
        if (!consumptionByCategory[category]) {
            consumptionByCategory[category] = { power: 0, count: 0 };
        }
        consumptionByCategory[category].power += power;
        consumptionByCategory[category].count++;

        if (power > 50) { 
            highConsumptionAssets.push({ ...asset, power });
        }
    });

    const yearlyKwh = (totalPower * 24 * 365) / 1000;
    const yearlyCost = yearlyKwh * costPerKwh;
    const yearlyCo2 = (yearlyKwh * co2Factor) / 1000; 

    const categoryChartData = Object.entries(consumptionByCategory).map(([name, { power, count }]) => ({
        name,
        power,
        count
    })).sort((a,b) => b.power - a.power);

    const optimizationTarget = highConsumptionAssets.sort((a, b) => b.power - a.power)[0];
    const optimizationSavings = optimizationTarget ? (optimizationTarget.power - 20) * 24 * 365 / 1000 * costPerKwh * highConsumptionAssets.filter(a => a.model === optimizationTarget.model).length : 0;


    return (
        <div className="space-y-6 bg-background">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Power Consumption</CardTitle>
                        <Power className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{yearlyKwh.toFixed(0)} kWh/year</div>
                        <p className="text-xs text-muted-foreground">Est. yearly cost: ${yearlyCost.toFixed(0)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{yearlyCo2.toFixed(2)} tCO₂e/year</div>
                        <p className="text-xs text-muted-foreground">Based on global grid averages</p>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Efficiency Index</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">B+</div>
                        <p className="text-xs text-muted-foreground">78% of assets Energy Star rated</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3 bg-card">
                    <CardHeader>
                        <CardTitle className="text-primary">Consumption by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GreenITChart data={categoryChartData} />
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2 bg-card">
                    <CardHeader>
                        <CardTitle className="text-primary">Optimization AI</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted border-l-4 border-primary rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="h-6 w-6 text-primary mt-1 shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-foreground">Upgrade Target Identified</h4>
                                    {optimizationTarget && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Replacing {highConsumptionAssets.filter(a => a.model === optimizationTarget.model).length} units of <strong>{optimizationTarget.model}</strong> could save <strong>${optimizationSavings.toFixed(0)}/yr</strong>.
                                        </p>
                                    )}
                                    <Button size="sm" variant="link" className="p-0 h-auto mt-2 text-primary font-bold">Analyze Options</Button>
                                </div>
                            </div>
                        </div>
                         <div className="p-4 bg-muted border-l-4 border-border rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <Zap className="h-6 w-6 text-muted-foreground mt-1 shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-foreground">Policy Recommendation</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Deploy automated "Sleep Policy" for idle desktops to reduce idle drain by 35%.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

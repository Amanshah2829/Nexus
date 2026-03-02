'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus, Clock, Zap, TrendingUp } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Engineer',
    role: 'Senior Support Engineer',
    email: 'sarah@company.com',
    status: 'online',
    avatar: 'SE',
    tickets: 12,
    resolved: 145,
    avgResolutionTime: '45m',
    satisfaction: '95%',
  },
  {
    id: 2,
    name: 'Mike Johnson',
    role: 'Support Engineer',
    email: 'mike@company.com',
    status: 'online',
    avatar: 'MJ',
    tickets: 8,
    resolved: 98,
    avgResolutionTime: '52m',
    satisfaction: '92%',
  },
  {
    id: 3,
    name: 'Lisa Chen',
    role: 'Technical Support',
    email: 'lisa@company.com',
    status: 'online',
    avatar: 'LC',
    tickets: 15,
    resolved: 167,
    avgResolutionTime: '38m',
    satisfaction: '97%',
  },
  {
    id: 4,
    name: 'Tom Davis',
    role: 'Support Specialist',
    email: 'tom@company.com',
    status: 'away',
    avatar: 'TD',
    tickets: 5,
    resolved: 67,
    avgResolutionTime: '60m',
    satisfaction: '88%',
  },
  {
    id: 5,
    name: 'Emma Wilson',
    role: 'Support Engineer',
    email: 'emma@company.com',
    status: 'offline',
    avatar: 'EW',
    tickets: 0,
    resolved: 89,
    avgResolutionTime: '48m',
    satisfaction: '93%',
  },
  {
    id: 6,
    name: 'John Smith',
    role: 'Team Lead',
    email: 'john@company.com',
    status: 'online',
    avatar: 'JS',
    tickets: 3,
    resolved: 234,
    avgResolutionTime: '35m',
    satisfaction: '96%',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusText = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export function TeamContent() {
  const onlineMembers = teamMembers.filter((m) => m.status === 'online').length;
  const totalResolved = teamMembers.reduce((sum, m) => sum + m.resolved, 0);
  const avgSatisfaction =
    (teamMembers.reduce((sum, m) => parseFloat(m.satisfaction), 0) / teamMembers.length).toFixed(
      1
    ) + '%';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor your support team</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Online Members</p>
                <h3 className="text-2xl font-bold mt-2">{onlineMembers}</h3>
                <p className="text-xs text-muted-foreground mt-2">Out of {teamMembers.length} total</p>
              </div>
              <div className="rounded-lg p-3 bg-green-100 dark:bg-green-900">
                <Users className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Resolved</p>
                <h3 className="text-2xl font-bold mt-2">{totalResolved}</h3>
                <p className="text-xs text-muted-foreground mt-2">This month</p>
              </div>
              <div className="rounded-lg p-3 bg-blue-100 dark:bg-blue-900">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Avg Satisfaction</p>
                <h3 className="text-2xl font-bold mt-2">{avgSatisfaction}</h3>
                <p className="text-xs text-muted-foreground mt-2">Team average</p>
              </div>
              <div className="rounded-lg p-3 bg-purple-100 dark:bg-purple-900">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Your support team performance and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{member.avatar}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{member.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getStatusText(member.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">{member.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 flex-1 sm:flex-none sm:w-72">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Tickets</p>
                    <p className="text-lg font-semibold mt-1">{member.tickets}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Resolved Total</p>
                    <p className="text-lg font-semibold mt-1">{member.resolved}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Resolution</p>
                    <p className="text-lg font-semibold mt-1">{member.avgResolutionTime}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Satisfaction</p>
                    <p className="text-lg font-semibold mt-1">{member.satisfaction}</p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

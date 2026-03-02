'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, Filter, Plus, Search, AlertCircle, CheckCircle, Clock as ClockIcon } from 'lucide-react';

const mockTickets = [
  {
    id: 'TKT-001',
    title: 'Unable to login to account',
    customer: 'John Doe',
    priority: 'high',
    status: 'open',
    created: '2 hours ago',
    lastUpdate: '30 minutes ago',
    assignee: 'Sarah Engineer',
  },
  {
    id: 'TKT-002',
    title: 'Feature request: Dark mode',
    customer: 'Jane Smith',
    priority: 'medium',
    status: 'in-progress',
    created: '5 hours ago',
    lastUpdate: '1 hour ago',
    assignee: 'Mike Johnson',
  },
  {
    id: 'TKT-003',
    title: 'Payment processing error',
    customer: 'Alex Johnson',
    priority: 'critical',
    status: 'open',
    created: '10 minutes ago',
    lastUpdate: '5 minutes ago',
    assignee: 'Unassigned',
  },
  {
    id: 'TKT-004',
    title: 'Product not showing in search',
    customer: 'Emma Wilson',
    priority: 'medium',
    status: 'resolved',
    created: '1 day ago',
    lastUpdate: '12 hours ago',
    assignee: 'Tom Davis',
  },
  {
    id: 'TKT-005',
    title: 'Bulk import fails with large CSV',
    customer: 'Admin User',
    priority: 'high',
    status: 'in-progress',
    created: '6 hours ago',
    lastUpdate: '2 hours ago',
    assignee: 'Lisa Chen',
  },
  {
    id: 'TKT-006',
    title: 'API rate limiting issues',
    customer: 'Developer Portal',
    priority: 'high',
    status: 'open',
    created: '3 hours ago',
    lastUpdate: '1 hour ago',
    assignee: 'John Smith',
  },
  {
    id: 'TKT-007',
    title: 'Email notifications not received',
    customer: 'Robert Brown',
    priority: 'low',
    status: 'pending',
    created: '2 days ago',
    lastUpdate: '1 day ago',
    assignee: 'Sarah Engineer',
  },
  {
    id: 'TKT-008',
    title: 'Database backup failed',
    customer: 'DevOps Team',
    priority: 'critical',
    status: 'in-progress',
    created: '45 minutes ago',
    lastUpdate: '20 minutes ago',
    assignee: 'Database Admin',
  },
];

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'resolved':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'open':
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    case 'in-progress':
      return <ClockIcon className="w-4 h-4 text-blue-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'open':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export function TicketsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTickets = mockTickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground mt-1">Manage and track all support tickets</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, title, or customer..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Tickets ({filteredTickets.length})
          </CardTitle>
          <CardDescription>View and manage support tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono font-medium">{ticket.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground">Updated {ticket.lastUpdate}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ticket.customer}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.charAt(0).toUpperCase() +
                              ticket.status.slice(1).replace('-', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {ticket.assignee === 'Unassigned' ? (
                            <span className="text-muted-foreground italic">{ticket.assignee}</span>
                          ) : (
                            ticket.assignee
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ticket.created}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No tickets found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client"

import React, { useState, useMemo } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
    PlusCircle, ListFilter, DollarSign, Users, Target, MoreVertical, Edit, Trash2, Building, 
    ArrowUp, ArrowDown, BarChart2, PieChart, TrendingUp, ChevronRight, LayoutDashboard,
    Globe, Briefcase, Zap, Search
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { LoadingAnimation } from "./ui/loading-animation";
import { ILead } from "@/models/Lead";
import { IUser } from "@/models/User";
import { ITenant } from "@/models/Tenant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, PieChart as RePieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/app/lib/utils";

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
});

const leadStatuses = {
    new: { label: "New", color: "bg-blue-500" },
    contacted: { label: "Contacted", color: "bg-yellow-500" },
    qualified: { label: "Qualified", color: "bg-orange-500" },
    proposal: { label: "Proposal", color: "bg-purple-500" },
    negotiation: { label: "Negotiation", color: "bg-indigo-500" },
    'closed-won': { label: "Won", color: "bg-green-500" },
    'closed-lost': { label: "Lost", color: "bg-red-500" },
};

export default function SuperAdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 bg-background p-4 md:p-8">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                        <Globe className="h-6 w-6" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        Global Command
                    </h1>
                </div>
                <p className="text-muted-foreground text-lg font-medium">Enterprise ecosystem overview and sales intelligence.</p>
            </header>

            <Tabs defaultValue="tenants" className="space-y-8">
                <TabsList className="bg-card p-1 rounded-full border border-border h-14 w-auto inline-flex shadow-xl">
                    <TabsTrigger value="tenants" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base transition-all font-bold">
                        <Building className="h-4 w-4 mr-2" /> Tenant Ecosystem
                    </TabsTrigger>
                    <TabsTrigger value="sales" className="rounded-full px-10 h-12 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-base transition-all font-bold">
                        <Zap className="h-4 w-4 mr-2" /> Sales Pipeline
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sales" className="mt-0">
                    <SalesCrmDashboard />
                </TabsContent>
                <TabsContent value="tenants" className="mt-0">
                    <TenantManagementDashboard />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function SalesCrmDashboard() {
    const { data: leads, isLoading: isLoadingLeads } = useSWR<ILead[]>('/api/leads', fetcher);
    const { data: users, isLoading: isLoadingUsers } = useSWR<IUser[]>('/api/users', fetcher);
    const { toast } = useToast();

    const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<ILead | null>(null);

    const leadsArray = Array.isArray(leads) ? leads : [];
    const usersArray = Array.isArray(users) ? users : [];

    const handleFormSubmit = async (formData: Partial<ILead>) => {
        const isEditing = !!editingLead;
        const url = isEditing ? `/api/leads/${editingLead._id}` : '/api/leads';
        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to process lead");
            toast({ title: "Success", description: `Lead ${isEditing ? 'updated' : 'created'}.` });
            mutate('/api/leads');
            setIsAddLeadOpen(false);
            setEditingLead(null);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    };
    
    if (isLoadingLeads || isLoadingUsers) return <LoadingAnimation />;
    
    const pipelineValue = leadsArray.filter(l => l.status !== 'closed-won' && l.status !== 'closed-lost').reduce((acc, l) => acc + (l.value || 0), 0);
    const wonLeads = leadsArray.filter(l => l.status === 'closed-won').length;

    const leadsByStatus = Object.entries(leadStatuses).map(([key, { label }]) => ({
        name: label,
        value: leadsArray.filter(l => l.status === key).length,
    }));

    const weeklyTrendData = [
        { date: "Mon", leads: 4, won: 1 },
        { date: "Tue", leads: 5, won: 0 },
        { date: "Wed", leads: 3, won: 2 },
        { date: "Thu", leads: 7, won: 1 },
        { date: "Fri", leads: 6, won: 3 },
        { date: "Sat", leads: 2, won: 0 },
        { date: "Sun", leads: 1, won: 0 },
    ];

    const COLORS = ["#00E5FF", "#8884d8", "#FFC658", "#FF8042", "#FF0055", "#00FF88", "#0088FF"];

    return (
        <div className="space-y-8 bg-background">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <KpiStat title="Pipeline Value" value={`$${pipelineValue.toLocaleString()}`} icon={DollarSign} trend="+12.5%" />
                 <KpiStat title="Active Leads" value={leadsArray.length} icon={Users} trend="-2%" />
                 <KpiStat title="Win Rate" value={`${((wonLeads / (leadsArray.length || 1)) * 100).toFixed(1)}%`} icon={Target} trend="+0.8%" />
                 <KpiStat title="New Accounts" value={wonLeads} icon={TrendingUp} trend="+3" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card border-border shadow-2xl">
                    <CardHeader className="border-b border-border pb-6">
                        <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                            <BarChart2 className="h-5 w-5 text-primary"/> Performance Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                       <ResponsiveContainer width="100%" height={300}>
                             <AreaChart data={weeklyTrendData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#444" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis stroke="#444" fontSize={12} tickLine={false} axisLine={false}/>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }}/>
                                <Area type="monotone" dataKey="leads" stroke="var(--color-primary)" fill="url(#colorLeads)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border shadow-2xl">
                    <CardHeader className="border-b border-border pb-6">
                        <CardTitle className="text-xl flex items-center gap-2 text-foreground">
                            <PieChart className="h-5 w-5 text-primary"/> Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                         <ResponsiveContainer width="100%" height={300}>
                            <RePieChart>
                                <Pie data={leadsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} label>
                                    {leadsByStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }}/>
                            </RePieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card border-border shadow-2xl overflow-hidden">
                 <CardHeader className="bg-muted border-b border-border py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-foreground">Enterprise Pipeline</CardTitle>
                            <CardDescription>Real-time status of high-value deals.</CardDescription>
                        </div>
                        <Button className="rounded-full shadow-lg" onClick={() => setIsAddLeadOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Lead
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted">
                            <TableRow>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Entity</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Deal Value</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground">Strategist</th>
                                <th className="px-6 py-4 font-bold text-xs uppercase tracking-widest text-muted-foreground text-right">Control</th>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leadsArray.map((lead) => (
                                <TableRow key={lead._id} className="hover:bg-accent transition-colors group bg-card">
                                    <TableCell className="px-6 py-5">
                                        <div>
                                            <p className="font-bold text-base group-hover:text-primary transition-colors text-foreground">{lead.company}</p>
                                            <p className="text-xs text-muted-foreground">{lead.contactName}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 font-mono text-primary font-bold">
                                        ${(lead.value || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <Badge style={{ backgroundColor: leadStatuses[lead.status as keyof typeof leadStatuses]?.color }} className="text-white rounded-full px-3">
                                            {leadStatuses[lead.status as keyof typeof leadStatuses]?.label}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-[8px] bg-muted text-foreground">SA</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium text-foreground">Account Owner</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-5 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuItem onClick={() => { setEditingLead(lead); setIsAddLeadOpen(true); }}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:bg-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            {(isAddLeadOpen || editingLead) && 
                <LeadFormDialog 
                    isOpen={isAddLeadOpen || !!editingLead} 
                    onClose={() => { setIsAddLeadOpen(false); setEditingLead(null); }}
                    onSubmit={handleFormSubmit}
                    lead={editingLead}
                    users={usersArray}
                />
            }
        </div>
    );
}

function TenantManagementDashboard() {
    const { data: tenants, isLoading } = useSWR<ITenant[]>('/api/tenants', fetcher);
    const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
    const { toast } = useToast();
    
    if (isLoading) return <LoadingAnimation />;
    
    const tenantsArray = Array.isArray(tenants) ? tenants : [];

    return (
        <div className="space-y-8 bg-background">
            <header className="flex items-center justify-between">
                 <div>
                    <h2 className="text-2xl font-black tracking-tight text-foreground">Active Ecosystem</h2>
                    <p className="text-muted-foreground font-medium">Provisioning and resource monitoring for all customer nodes.</p>
                </div>
                <Button size="lg" className="rounded-full shadow-xl" onClick={() => setIsCreateTenantOpen(true)}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Provision New Tenant
                </Button>
            </header>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tenantsArray.map(tenant => (
                    <Card key={tenant._id} className="bg-card border-border hover:scale-[1.02] transition-all group shadow-xl">
                        <CardHeader className="border-b border-border">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="capitalize text-[10px] font-bold tracking-widest border-primary text-primary px-3 rounded-full">
                                    {tenant.subscriptionPlan} Node
                                </Badge>
                                <div className={cn("h-2 w-2 rounded-full", tenant.status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-destructive')} />
                            </div>
                            <CardTitle className="text-2xl pt-4 group-hover:text-primary transition-colors text-foreground">{tenant.name}</CardTitle>
                            <CardDescription className="font-mono text-[10px]">{tenant._id}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center bg-muted p-3 rounded-xl">
                                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Revenue</span>
                                <span className="font-bold text-primary">${tenant.monthlyCost || 0}/mo</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Renewal Date</p>
                                    <p className="text-sm font-medium text-foreground">{tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Status</p>
                                    <p className="text-sm font-medium capitalize text-foreground">{tenant.subscriptionStatus}</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted p-4">
                            <Button variant="ghost" className="w-full rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all" asChild>
                                <Link href={`/tenants/${tenant._id}`}>Manage Ecosystem <ChevronRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
             </div>
             
             <CreateTenantDialog isOpen={isCreateTenantOpen} onClose={() => setIsCreateTenantOpen(false)} onSubmit={(d) => console.log(d)}/>
        </div>
    )
}

function KpiStat({ title, value, icon: Icon, trend, danger }: any) {
    return (
        <Card className={cn(
            "bg-card border-border shadow-lg hover:scale-[1.02] transition-transform",
            danger && "border-destructive/20"
        )}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center",
                        danger ? "bg-destructive text-destructive-foreground" : "bg-muted text-primary"
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center text-xs font-bold px-2 py-1 rounded-full",
                            trend.startsWith('+') ? "text-green-500 bg-green-500/10" : "text-destructive bg-destructive/10"
                        )}>
                            {trend}
                        </div>
                    )}
                </div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{title}</p>
                <p className="text-3xl font-black tracking-tight mt-1 text-foreground">{value}</p>
            </CardContent>
        </Card>
    );
}

function CreateTenantDialog({ isOpen, onClose, onSubmit }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl rounded-3xl border-border bg-card">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-foreground">Provision New Node</DialogTitle>
                    <DialogDescription>Initialize a new tenant environment and primary administrative access.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 pt-6">
                     <div className="space-y-4">
                        <Label className="text-primary uppercase tracking-widest text-[10px] font-black">Organization Identity</Label>
                        <Input placeholder="Enter company name..." className="h-12 rounded-xl bg-muted" />
                    </div>
                     <div className="space-y-4">
                        <Label className="text-primary uppercase tracking-widest text-[10px] font-black">Root Administrator</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="Admin Name" className="h-12 rounded-xl bg-muted" />
                            <Input placeholder="Admin Email" type="email" className="h-12 rounded-xl bg-muted" />
                        </div>
                        <Input placeholder="Temporary Password" type="password" className="h-12 rounded-xl bg-muted" />
                    </div>
                </div>
                <DialogFooter className="pt-8">
                    <Button variant="ghost" onClick={onClose} className="rounded-full px-8 text-foreground">Discard</Button>
                    <Button className="rounded-full px-10 shadow-lg" onClick={() => {}}>Initialize Infrastructure</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function LeadFormDialog({ isOpen, onClose, onSubmit, lead, users }: { isOpen: boolean, onClose: () => void, onSubmit: (data: any) => void, lead: ILead | null, users: IUser[] }) {
    const [formData, setFormData] = useState({
        company: lead?.company || "",
        contactName: lead?.contactName || "",
        email: lead?.email || "",
        phone: lead?.phone || "",
        value: lead?.value || 0,
        status: lead?.status || "new",
        source: lead?.source || "",
        owner: lead?.owner || "",
    });

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] rounded-3xl border-border bg-card">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-foreground">{lead ? "Modify Strategic Lead" : "Initialize New Lead"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6 pt-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-foreground">Company</Label><Input value={formData.company} onChange={e => handleInputChange('company', e.target.value)} required className="h-11 rounded-xl bg-muted" /></div>
                        <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-foreground">Lead Contact</Label><Input value={formData.contactName} onChange={e => handleInputChange('contactName', e.target.value)} required className="h-11 rounded-xl bg-muted" /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-foreground">Email Address</Label><Input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="h-11 rounded-xl bg-muted" /></div>
                        <div className="space-y-2"><Label className="text-[10px] uppercase font-bold text-foreground">Phone Number</Label><Input value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="h-11 rounded-xl bg-muted" /></div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-foreground">Est. Deal Value ($)</Label>
                            <Input type="number" value={formData.value} onChange={e => handleInputChange('value', Number(e.target.value))} className="h-11 rounded-xl bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-foreground">Pipeline Stage</Label>
                             <Select value={formData.status} onValueChange={v => handleInputChange('status', v)}>
                                <SelectTrigger className="h-11 rounded-xl bg-muted text-foreground"><SelectValue /></SelectTrigger>
                                <SelectContent>{Object.entries(leadStatuses).map(([key, { label }]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button variant="ghost" type="button" onClick={onClose} className="rounded-full text-foreground">Cancel</Button>
                        <Button type="submit" className="rounded-full px-8 shadow-lg">{lead ? "Commit Changes" : "Create Asset"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}



"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import useSWR, { mutate } from "swr"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Edit, Trash2, Eye, UserPlus, Crown, User, Wrench, Loader2, Save, Key, Mail, FileText, Info, Plus, MapPin, DollarSign, List, LifeBuoy, Building, Bell, ChevronLeft, Search, Users, Timer, Settings, GitMerge, CreditCard, UserCheck, Palette } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { IUser } from "@/app/models/User"
import { useToast } from "@/hooks/use-toast"
import { LoadingAnimation } from "@/components/ui/loading-animation"
import { ITenant } from "@/app/models/Tenant"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/app/lib/utils"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDesc, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useIsMobile } from "@/hooks/use-mobile"


const fetcher = (url: string) => fetch(url).then((res) => {
    if (res.status === 403 || res.status === 401) {
        throw new Error('Unauthorized');
    }
    return res.json();
});

const roles = [
  { id: "super-admin", name: "Super Admin", description: "Full system access, manages tenants and billing.", color: "bg-red-500", icon: Crown, permissions: ["all"] },
  { id: "micro-admin", name: "Micro Admin", description: "Manages tenant configurations and support.", color: "bg-fuchsia-500", icon: GitMerge, permissions: ["manage_tenants", "view_analytics_global"] },
  { id: "nano-admin", name: "Nano Admin", description: "Read-only access for platform-level support.", color: "bg-violet-500", icon: LifeBuoy, permissions: ["view_tenants", "view_logs"] },
  { id: "admin", name: "Tenant Admin", description: "Full access within a single tenant.", color: "bg-purple-500", icon: Shield, permissions: ["manage_users", "manage_settings", "manage_complaints", "view_analytics"] },
  { id: "hod", name: "HOD / Authority", description: "Approves purchases, scraps, and high-cost work.", color: "bg-orange-500", icon: UserCheck, permissions: ["approve_requests", "view_complaints"] },
  { id: "engineer", name: "Engineer", description: "Resolves complaints and manages assigned assets.", color: "bg-blue-500", icon: Wrench, permissions: ["update_complaints", "view_assigned_complaints"] },
  { id: "user", name: "End User", description: "Submits and tracks their own tickets.", color: "bg-gray-500", icon: User, permissions: ["submit_complaints"] },
  { id: "sales", name: "Sales", description: "Manages leads and sales pipeline.", color: "bg-teal-500", icon: DollarSign, permissions: ["manage_leads"] },
  { id: "viewer", name: "Viewer", description: "Read-only access to tenant data.", color: "bg-green-500", icon: Eye, permissions: ["view_complaints", "view_analytics_limited"] },
]

const permissions = [
  { id: "users:manage", name: "Manage Users" },
  { id: "roles:assign", name: "Assign Roles" },
  { id: "complaints:create", name: "Create Complaints" },
  { id: "complaints:update", name: "Update Complaints" },
  { id: "complaints:assign", name: "Assign Complaints" },
  { id: "complaints:view_all", name: "View All Complaints" },
  { id: "assets:manage", name: "Manage Assets" },
  { id: "assets:approve", name: "Approve Purchases/Scrap" },
  { id: "settings:tenant", name: "Manage Tenant Settings" },
  { id: "analytics:view_tenant", name: "View Tenant Analytics" },
  { id: "billing:manage", name: "Manage Billing" },
  { id: "tenants:manage", name: "Manage All Tenants" },
]


function generateTemporaryPassword(length = 10) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}

function SettingsContentComponent() {
  const { data: currentUser, error: currentUserError } = useSWR<IUser>('/api/users/me', fetcher);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const [mobileContentVisible, setMobileContentVisible] = useState(false);
  
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
        setActiveTab(tab);
        if (isMobile) setMobileContentVisible(true);
    } else {
        if (isMobile) setMobileContentVisible(false);
    }
  }, [searchParams, isMobile]);

  const navItems = useMemo(() => {
      if (!currentUser) return [];
      
      return [
        { id: 'profile', label: 'My Profile', icon: User, roles: ['admin', 'super-admin', 'engineer', 'viewer', 'user', 'sales', 'hod', 'micro-admin', 'nano-admin'] },
        { id: 'organization', label: 'My Organization', icon: Building, roles: ['admin'] },
        { id: 'subscription', label: 'My Subscription', icon: CreditCard, roles: ['admin'] },
        { id: 'branding', label: 'Branding', icon: Palette, roles: ['admin'] },
        { id: 'general', label: 'General', icon: Settings, roles: ['admin', 'super-admin'] },
        { id: 'email', label: 'Email Config', icon: Mail, roles: ['admin', 'super-admin', 'engineer'] },
        { id: 'templates', label: 'Email Hub', icon: FileText, roles: ['admin', 'super-admin'] },
        { id: 'users', label: 'User Management', icon: Users, roles: ['admin', 'super-admin'] },
        { id: 'roles', label: 'Roles & Permissions', icon: Shield, roles: ['admin', 'super-admin'] },
        { id: 'sla', label: 'SLA Policies', icon: Timer, roles: ['admin', 'super-admin'] },
        { id: 'security', label: 'Security', icon: Key, roles: ['super-admin'] },
        { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'super-admin'] },
        { id: 'support', label: 'Support', icon: LifeBuoy, roles: ['admin'] },
      ].filter(item => item.roles.includes(currentUser.role));
  }, [currentUser]);
  
  const filteredNavItems = useMemo(() => {
    if (!searchQuery) return navItems;
    return navItems.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [navItems, searchQuery]);

  const selectedTab = filteredNavItems.find(item => item.id === activeTab) ? activeTab : (filteredNavItems[0]?.id || 'profile');


  if (currentUserError) {
      return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p>You must be logged in to view settings.</p>
            </div>
        </div>
      );
  }
  
  if (!currentUser) {
      return <div className="flex h-full w-full items-center justify-center"><LoadingAnimation /></div>;
  }
  
  const renderContent = () => {
    switch (selectedTab) {
        case 'profile': return <ProfileSettingsTab />;
        case 'organization': return <OrganizationSettingsTab />;
        case 'subscription': return <SubscriptionTab />;
        case 'branding': return <BrandingSettingsTab />;
        case 'general': return <GeneralSettingsTab />;
        case 'email': return <EmailConfigTab />;
        case 'templates': return <TemplatesTab />;
        case 'users': return <UsersTab roles={roles} currentUser={currentUser} />;
        case 'roles': return <RolesTab roles={roles} permissions={permissions} currentUser={currentUser} />;
        case 'sla': return <SlaSettingsTab />;
        case 'security': return <SecurityTab />;
        case 'notifications': return <NotificationsTab />;
        case 'support': return <SupportTab />;
        default: return <ProfileSettingsTab />;
    }
  }
  
   if (isMobile) {
        return (
            <div className="p-4">
                {mobileContentVisible ? (
                    <div>
                        <Button variant="ghost" onClick={() => setMobileContentVisible(false)} className="mb-4">
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back to Settings Menu
                        </Button>
                        {renderContent()}
                    </div>
                ) : (
                    <div className="space-y-4">
                         <h2 className="font-semibold text-lg p-2">Settings</h2>
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search settings..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="flex-1 space-y-1">
                            {filteredNavItems.map(item => (
                                <Button
                                    key={item.id}
                                    variant={selectedTab === item.id ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-3 h-12 text-base"
                                    onClick={() => { setActiveTab(item.id); setMobileContentVisible(true); }}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
   }

  return (
    <div className={cn("grid h-full transition-all duration-300", isSidebarCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[280px_1fr]")}>
        {/* Settings Sidebar */}
        <aside className="flex flex-col border-r border-border bg-card/50 h-full">
            <div className={cn("flex items-center p-4 h-16 border-b", isSidebarCollapsed ? "justify-center" : "justify-between")}>
                {!isSidebarCollapsed && <h2 className="font-semibold text-lg">Settings</h2>}
                <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                    <ChevronLeft className={cn("h-4 w-4 transition-transform", isSidebarCollapsed && "rotate-180")} />
                </Button>
            </div>
            <div className="p-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search settings..." className={cn("pl-10 transition-all", isSidebarCollapsed && "w-0 p-0 border-none")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                 <TooltipProvider delayDuration={0}>
                    {filteredNavItems.map(item => (
                        <Tooltip key={item.id}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={selectedTab === item.id ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start gap-3", isSidebarCollapsed && "justify-center w-auto h-12")}
                                    onClick={() => setActiveTab(item.id)}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {!isSidebarCollapsed && item.label}
                                </Button>
                            </TooltipTrigger>
                            {isSidebarCollapsed && <TooltipContent side="right"><p>{item.label}</p></TooltipContent>}
                        </Tooltip>
                    ))}
                 </TooltipProvider>
            </div>
        </aside>

        {/* Main Content */}
        <main className="overflow-y-auto">
            <div className="p-6 md:p-8 space-y-8">
                {renderContent()}
            </div>
        </main>
    </div>
  )
}

export function SettingsContent() {
    return (
        <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><LoadingAnimation /></div>}>
            <SettingsContentComponent/>
        </Suspense>
    )
}

function ProfileSettingsTab() {
    const { toast } = useToast();
    const { data: user, error, mutate } = useSWR<IUser>('/api/users/me', fetcher);
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState('');
    
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isPasswordSaving, setIsPasswordSaving] = useState(false);

    useEffect(() => {
        if (user) setName(user.name);
    }, [user]);
    
    if (error) return <div className="text-destructive">Failed to load your profile.</div>;
    if (!user) return <LoadingAnimation />;

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await fetch(`/api/users/${user._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            toast({ title: "Success", description: "Your profile has been updated." });
            mutate();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: "New passwords do not match." });
            return;
        }
        setIsPasswordSaving(true);
        try {
             const response = await fetch('/api/users/me/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message || 'Failed to change password.');
             toast({ title: "Success", description: "Your password has been changed." });
             setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: ''});
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsPasswordSaving(false);
        }
    }

    return (
        <div className="space-y-8">
            <form onSubmit={handleProfileSave}>
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>Manage your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                             <Avatar className="h-16 w-16">
                                <AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.name}.png`} />
                                <AvatarFallback>{user.name?.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <Button variant="outline">Change Photo</Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="profileName">Full Name</Label><Input id="profileName" value={name} onChange={e => setName(e.target.value)} /></div>
                            <div><Label htmlFor="profileEmail">Email</Label><Input id="profileEmail" value={user.email} disabled readOnly /></div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-end bg-muted/30 py-3 px-6"><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Changes</Button></CardFooter>
                </Card>
            </form>

             <form onSubmit={handlePasswordChange}>
                <Card className="glass-card">
                    <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>For security, you must provide your current password.</CardDescription></CardHeader>
                    <CardContent className="space-y-4">
                         <div><Label htmlFor="currentPassword">Current Password</Label><Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} required/></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} required/></div>
                             <div><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} required/></div>
                        </div>
                    </CardContent>
                     <CardFooter className="justify-end bg-muted/30 py-3 px-6"><Button type="submit" disabled={isPasswordSaving}>{isPasswordSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Change Password</Button></CardFooter>
                </Card>
            </form>
        </div>
    );
}

function OrganizationSettingsTab() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const { data: tenant, mutate } = useSWR<ITenant>('/api/tenants/me', fetcher);
    const [locations, setLocations] = useState<string[]>([]);
    const [newLocation, setNewLocation] = useState('');
    const [tenantName, setTenantName] = useState('');

    useEffect(() => {
        if (tenant) {
            setLocations(tenant.locations || []);
            setTenantName(tenant.name || '');
        }
    }, [tenant]);

    const handleAddLocation = () => {
        if (newLocation && !locations.includes(newLocation)) {
            setLocations([...locations, newLocation]);
            setNewLocation('');
        }
    };
    
    const handleRemoveLocation = (locToRemove: string) => setLocations(locations.filter(loc => loc !== locToRemove));

    const handleSave = async () => {
      setIsSaving(true);
      try {
        await fetch('/api/tenants/me', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: tenantName, locations }),
        });
        toast({ title: 'Success', description: 'Organization details have been updated.' });
        mutate();
      } catch (err) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
      } finally {
        setIsSaving(false);
      }
    };
  
    return (
        <div className="space-y-8">
             <Card className="glass-card">
                <CardHeader><CardTitle>Organization Details</CardTitle><CardDescription>Manage your organization's name and contact info.</CardDescription></CardHeader>
                <CardContent>
                     <div className="space-y-2">
                        <Label htmlFor="tenantName">Organization Name</Label>
                        <Input id="tenantName" value={tenantName} onChange={(e) => setTenantName(e.target.value)} />
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader><CardTitle>Site Locations</CardTitle><CardDescription>Manage the list of buildings and locations for your organization. This list will be used in complaint forms.</CardDescription></CardHeader>
                <CardContent>
                    <div className="space-y-2 mb-4">
                        {locations.map((loc, index) => (
                            <div key={index} className="flex items-center justify-between p-2 pl-4 bg-muted/50 rounded-md">
                                <span className="text-sm">{loc}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemoveLocation(loc)}><Trash2 className="h-4 w-4 text-muted-foreground"/></Button>
                            </div>
                        ))}
                    </div>
                     <div className="flex items-center gap-2">
                        <Input value={newLocation} onChange={e => setNewLocation(e.target.value)} placeholder="Add a new location"/>
                        <Button onClick={handleAddLocation}><Plus className="h-4 w-4 mr-2"/>Add</Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Organization Settings
                </Button>
            </div>
      </div>
    );
}

function SubscriptionTab() {
  const { data: tenant, error } = useSWR<ITenant>('/api/tenants/me', fetcher);
  const { toast } = useToast();
  
  if (error) return <p className="text-destructive">Could not load subscription details.</p>;
  if (!tenant) return <LoadingAnimation />;

  const billingHistory = [
    { id: 'INV-1234', date: 'June 1, 2024', amount: '$49.00', status: 'Paid' },
    { id: 'INV-1233', date: 'May 1, 2024', amount: '$49.00', status: 'Paid' },
    { id: 'INV-1232', date: 'April 1, 2024', amount: '$49.00', status: 'Paid' },
  ];
  
  const handleAction = (action: string) => {
      // In a real application, this would trigger an API call to a payment provider like Stripe
      toast({
          title: "Action Required",
          description: `You would now be redirected to your payment provider to ${action}. This is a demo.`,
      });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Subscription</CardTitle>
          <CardDescription>Manage your billing and plan details.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-muted/50 rounded-lg border">
            <h3 className="text-lg font-semibold capitalize mb-2">{tenant.subscriptionPlan} Plan</h3>
            <p className="text-5xl font-bold">
              ${tenant.monthlyCost || 0}<span className="text-lg font-normal text-muted-foreground">/month</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
                Your plan renews on {tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString() : 'N/A'}.
            </p>
             <Badge className="mt-4 capitalize">{tenant.subscriptionStatus}</Badge>
          </div>
           <div className="space-y-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full">Change Plan</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Change Subscription Plan</AlertDialogTitle><AlertDialogDesc>This will redirect you to our secure billing portal to select a new plan.</AlertDialogDesc></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAction('change your plan')}>Continue</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">Update Payment Method</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Update Payment Method</AlertDialogTitle><AlertDialogDesc>This will redirect you to our secure billing portal to update your payment details.</AlertDialogDesc></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAction('update your payment method')}>Continue</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">Cancel Subscription</Button>
                </AlertDialogTrigger>
                 <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Are you sure you want to cancel?</AlertDialogTitle><AlertDialogDesc>Your subscription will be cancelled at the end of the current billing period. This action cannot be undone.</AlertDialogDesc></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Keep Subscription</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleAction('cancel your subscription')}>Yes, Cancel</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
           </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {billingHistory.map(item => (
                    <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.date}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                        <TableCell><Badge variant="secondary">{item.status}</Badge></TableCell>
                        <TableCell className="text-right"><Button variant="outline" size="sm">Download</Button></TableCell>
                    </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandingSettingsTab() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const { data: tenant, mutate } = useSWR<ITenant>('/api/tenants/me', fetcher);
    const [formData, setFormData] = useState<ITenant['branding']>({ enabled: false });

     useEffect(() => {
        if (tenant?.branding) {
            setFormData(tenant.branding);
        }
    }, [tenant]);

     const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/tenants/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branding: formData }),
            });
            toast({ title: 'Success', description: 'Branding settings have been updated.' });
            mutate();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    if (!tenant) return <LoadingAnimation />;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Branding & Customization</CardTitle>
                        <CardDescription>Customize the look and feel of the application for your users.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="enable-branding">Enable Custom Branding</Label>
                        <Switch id="enable-branding" checked={formData?.enabled} onCheckedChange={(v) => handleInputChange('enabled', v)} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Company Name</Label>
                            <Input placeholder={tenant.name} value={formData?.companyName} onChange={e => handleInputChange('companyName', e.target.value)} disabled={!formData?.enabled} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tagline</Label>
                            <Input placeholder="e.g., Excellence in Education" value={formData?.tagline} onChange={e => handleInputChange('tagline', e.target.value)} disabled={!formData?.enabled} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Logo URL</Label>
                        <Input placeholder="https://example.com/logo.png" value={formData?.logoUrl} onChange={e => handleInputChange('logoUrl', e.target.value)} disabled={!formData?.enabled} />
                    </div>
                     <div className="space-y-2">
                        <Label>Theme Colors (HSL format)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                             <Input placeholder="Primary (e.g., 240 5.9% 10%)" value={formData?.primaryColor} onChange={e => handleInputChange('primaryColor', e.target.value)} disabled={!formData?.enabled} />
                             <Input placeholder="Accent (e.g., 240 4% 96%)" value={formData?.accentColor} onChange={e => handleInputChange('accentColor', e.target.value)} disabled={!formData?.enabled} />
                             <Input placeholder="Background (e.g., 0 0% 100%)" value={formData?.backgroundColor} onChange={e => handleInputChange('backgroundColor', e.target.value)} disabled={!formData?.enabled} />
                        </div>
                         <p className="text-xs text-muted-foreground">Enter colors in HSL format without `hsl()` wrapper. Example: `240 5.9% 10%`.</p>
                    </div>
                </CardContent>
                <CardFooter className="justify-end bg-muted/30 py-3 px-6">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Branding
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}


function GeneralSettingsTab() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const { data: settingsData, mutate } = useSWR('/api/settings', fetcher);
    
    const [duration, setDuration] = useState(8 * 60 * 60);
    const [defaultPriority, setDefaultPriority] = useState('medium');
    const [defaultCategory, setDefaultCategory] = useState('uncategorized');


    useEffect(() => {
        if (settingsData && Array.isArray(settingsData)) {
            const durationSetting = settingsData.find(s => s.key === 'engineerSessionDuration');
            if (durationSetting) setDuration(durationSetting.value);

            const prioritySetting = settingsData.find(s => s.key === 'defaultTicketPriority');
            if (prioritySetting) setDefaultPriority(prioritySetting.value);

            const categorySetting = settingsData.find(s => s.key === 'defaultTicketCategory');
            if (categorySetting) setDefaultCategory(categorySetting.value);
        }
    }, [settingsData]);
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'engineerSessionDuration', value: duration }) }),
                fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'defaultTicketPriority', value: defaultPriority }) }),
                fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'defaultTicketCategory', value: defaultCategory }) }),
            ]);
            toast({ title: 'Success', description: 'General settings updated successfully.'});
            mutate();
        } catch(err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsSaving(false);
        }
    }

    return (
         <Card className="glass-card">
            <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Manage application-wide settings for your organization.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Engineer Session Duration</Label>
                        <p className="text-sm text-muted-foreground">Set how long an engineer's login session lasts.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={String(duration)} onValueChange={v => setDuration(Number(v))}>
                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={String(1 * 60 * 60)}>1 Hour</SelectItem>
                                <SelectItem value={String(4 * 60 * 60)}>4 Hours</SelectItem>
                                <SelectItem value={String(8 * 60 * 60)}>8 Hours</SelectItem>
                                <SelectItem value={String(12 * 60 * 60)}>12 Hours</SelectItem>
                                <SelectItem value={String(24 * 60 * 60)}>24 Hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                        <Label>Default Ticket Priority</Label>
                        <p className="text-sm text-muted-foreground">The default priority for newly created tickets.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                        <Label>Default Ticket Category</Label>
                        <p className="text-sm text-muted-foreground">The default category for newly created tickets.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input value={defaultCategory} onChange={e => setDefaultCategory(e.target.value)} className="w-48" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end bg-muted/30 py-3 px-6">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save General Settings
                </Button>
            </CardFooter>
        </Card>
    );
}

function SlaSettingsTab() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [slaPolicies, setSlaPolicies] = useState([
    { priority: 'critical', durationInHours: 4 },
    { priority: 'high', durationInHours: 24 },
    { priority: 'medium', durationInHours: 72 },
    { priority: 'low', durationInHours: 168 },
  ]);

  const { data, error, mutate } = useSWR('/api/settings/sla', fetcher);

  useEffect(() => {
    if (data) {
      setSlaPolicies(data);
    }
  }, [data]);
  
  if (error) return <p className="text-destructive">Failed to load SLA policies.</p>;
  if (!data) return <LoadingAnimation />;
  
  const handleDurationChange = (priority: string, value: string) => {
    const duration = parseInt(value, 10);
    if (!isNaN(duration)) {
      setSlaPolicies(policies =>
        policies.map(p => (p.priority === priority ? { ...p, durationInHours: duration } : p))
      );
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/settings/sla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slaPolicies),
      });
      toast({ title: 'Success', description: 'SLA policies have been updated.' });
      mutate();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save SLA policies.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>SLA Policies</CardTitle>
        <CardDescription>Define the resolution time targets for each ticket priority level.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {slaPolicies.map(policy => (
          <div key={policy.priority} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="font-medium capitalize">{policy.priority} Priority</div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="w-24"
                value={policy.durationInHours}
                onChange={(e) => handleDurationChange(policy.priority, e.target.value)}
              />
              <span className="text-sm text-muted-foreground">Hours</span>
            </div>
          </div>
        ))}
      </CardContent>
       <CardFooter className="justify-end bg-muted/30 py-3 px-6">
        <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save SLA Policies
        </Button>
      </CardFooter>
    </Card>
  );
}


function EmailConfigTab() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { data: user, error, mutate: mutateUser } = useSWR<IUser>('/api/users/me', fetcher);
  const [config, setConfig] = useState({ imapHost: '', imapPort: 993, imapUser: '', imapPassword: '', smtpHost: '', smtpPort: 465, smtpUser: '', smtpPassword: '' });

  useEffect(() => {
    if (user?.emailConfig) {
      setConfig({
        imapHost: user.emailConfig.imapHost || '', imapPort: user.emailConfig.imapPort || 993, imapUser: user.emailConfig.imapUser || '', imapPassword: '',
        smtpHost: user.emailConfig.smtpHost || '', smtpPort: user.emailConfig.smtpPort || 465, smtpUser: user.emailConfig.smtpUser || '', smtpPassword: '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | number) => setConfig(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload: any = { ...config };
    if (!payload.imapPassword) delete payload.imapPassword;
    if (!payload.smtpPassword) delete payload.smtpPassword;

    try {
      const response = await fetch(`/api/users/${user?._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailConfig: payload }),
      });
      if (!response.ok) throw new Error('Failed to save email configuration.');
      toast({ title: 'Success', description: 'Email configuration saved successfully.' });
      mutateUser();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (error) return <div className="text-destructive">Failed to load your user data.</div>;
  if (!user) return <LoadingAnimation />;

  return (
    <form className="space-y-8" onSubmit={handleSave}>
      <Card className="glass-card">
        <CardHeader><CardTitle>IMAP Configuration (Incoming)</CardTitle><CardDescription>Used to fetch emails into the Inbox for the email-to-ticket pipeline.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label htmlFor="imapUser">IMAP Username</Label><Input id="imapUser" value={config.imapUser} onChange={e => handleInputChange('imapUser', e.target.value)} placeholder="your.email@example.com" /></div>
            <div><Label htmlFor="imapPassword">IMAP Password</Label><Input id="imapPassword" type="password" value={config.imapPassword} onChange={e => handleInputChange('imapPassword', e.target.value)} placeholder="Leave blank to keep unchanged" /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label htmlFor="imapHost">IMAP Host</Label><Input id="imapHost" value={config.imapHost} onChange={e => handleInputChange('imapHost', e.target.value)} placeholder="imap.example.com" /></div>
            <div><Label htmlFor="imapPort">IMAP Port</Label><Input id="imapPort" type="number" value={config.imapPort} onChange={e => handleInputChange('imapPort', parseInt(e.target.value))} placeholder="993" /></div>
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card">
        <CardHeader><CardTitle>SMTP Configuration (Outgoing)</CardTitle><CardDescription>Used to send replies and notifications from your account.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
           <div className="grid md:grid-cols-2 gap-4">
            <div><Label htmlFor="smtpUser">SMTP Username</Label><Input id="smtpUser" value={config.smtpUser} onChange={e => handleInputChange('smtpUser', e.target.value)} placeholder="your.email@example.com" /></div>
            <div><Label htmlFor="smtpPassword">SMTP Password</Label><Input id="smtpPassword" type="password" value={config.smtpPassword} onChange={e => handleInputChange('smtpPassword', e.target.value)} placeholder="Leave blank to keep unchanged" /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label htmlFor="smtpHost">SMTP Host</Label><Input id="smtpHost" value={config.smtpHost} onChange={e => handleInputChange('smtpHost', e.target.value)} placeholder="smtp.example.com" /></div>
            <div><Label htmlFor="smtpPort">SMTP Port</Label><Input id="smtpPort" type="number" value={config.smtpPort} onChange={e => handleInputChange('smtpPort', parseInt(e.target.value))} placeholder="465" /></div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Email Settings</Button></div>
    </form>
  )
}

function TemplatesTab() {
    const { toast } = useToast();
    const { data: templatesData, error, mutate } = useSWR('/api/settings/templates', fetcher);
    const { data: signatureData, mutate: mutateSignature } = useSWR('/api/settings?key=emailSignature', fetcher);
    const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher);
    const templates = Array.isArray(templatesData) ? templatesData : [];
    
    const [isSaving, setIsSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [signature, setSignature] = useState('');

    useEffect(() => {
        if(signatureData && typeof signatureData.value === 'string') {
            setSignature(signatureData.value);
        }
    }, [signatureData])

    const handleSave = async (templateData: any) => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/settings/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(templateData),
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to save template.'); }
            toast({ title: 'Success', description: 'Email template saved.' });
            mutate();
            setIsDialogOpen(false); setSelectedTemplate(null);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSaveSignature = async () => {
        setIsSaving(true);
         try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'emailSignature', value: signature }),
            });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to save signature.'); }
            toast({ title: 'Success', description: 'Email signature updated.' });
            mutateSignature();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (key: string) => {
        if (!currentUser?.tenant) return;
        const shortKey = key.replace(`tenant_${currentUser.tenant}_`, '');
        if (!window.confirm(`Are you sure you want to delete template "${shortKey}"? This will revert it to the system default.`)) return;
        try {
            const response = await fetch(`/api/settings/templates/${shortKey}`, { method: 'DELETE' });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to delete template'); }
            toast({ title: 'Success', description: 'Template reset to default.' });
            mutate();
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        }
    };
    
    if (error) return <div className="text-destructive">Failed to load templates.</div>;
    if (!templatesData) return <LoadingAnimation />;

    return (
        <div className="space-y-6">
             <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Email Signature</CardTitle>
                    <CardDescription>Define a global email signature for all outgoing system notifications from your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        value={signature}
                        onChange={(e) => setSignature(e.target.value)}
                        rows={6}
                        placeholder="--&#10;Network Support, ICT Section&#10;Your University Name&#10;Contact Info..."
                    />
                </CardContent>
                <CardFooter className="justify-end bg-muted/30 py-3 px-6">
                    <Button onClick={handleSaveSignature} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Signature
                    </Button>
                </CardFooter>
            </Card>
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between"><CardTitle>Email Templates</CardTitle><Button onClick={() => { setSelectedTemplate(null); setIsDialogOpen(true); }}><Plus className="h-4 w-4 mr-2" />Add Template</Button></div>
                    <CardDescription>Manage email templates for system notifications. Use placeholders like `{{variableName}}"}`.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {templates.map((template: any) => (
                        <div key={template.key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                                <p className="font-medium text-sm">{template.value.name || template.key}</p>
                                <p className="text-xs text-muted-foreground">{template.value.description}</p>
                            </div>
                            <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedTemplate(template); setIsDialogOpen(true); }}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(template.key)}><Trash2 className="h-4 w-4" /></Button></div>
                        </div>
                    ))}
                     {templates.length === 0 && <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg"><FileText className="h-10 w-10 mx-auto mb-2"/><p>No email templates found.</p></div>}
                </CardContent>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent className="max-w-3xl"><DialogHeader><DialogTitle>{selectedTemplate ? 'Edit' : 'Add'} Email Template</DialogTitle></DialogHeader><TemplateForm template={selectedTemplate} onSave={handleSave} isSaving={isSaving} onClose={() => setIsDialogOpen(false)}/></DialogContent></Dialog>
        </div>
    );
}

function TemplateForm({ template, onSave, isSaving, onClose }: { template?: any, onSave: (data: any) => void, isSaving: boolean, onClose: () => void }) {
    const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher);
    const getShortKey = (fullKey?: string) => (fullKey && currentUser?.tenant) ? fullKey.replace(`tenant_${currentUser.tenant}_`, '') : '';

    const [key, setKey] = useState(getShortKey(template?.key));
    const [name, setName] = useState(template?.value.name || '');
    const [description, setDescription] = useState(template?.value.description || '');
    const [subject, setSubject] = useState(template?.value.subject || '');
    const [body, setBody] = useState(template?.value.body || '');
    const [cc, setCc] = useState(template?.value.cc || '');

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ key, value: { name, description, subject, body, cc } }); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div><Label htmlFor="templateKey">Template Key</Label><Input id="templateKey" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g., userWelcome" required disabled={!!template}/><p className="text-xs text-muted-foreground mt-1">A unique identifier for this template.</p></div>
            <div><Label htmlFor="templateName">Template Name</Label><Input id="templateName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., User Welcome Email" required /></div>
            <div><Label htmlFor="templateDescription">Description</Label><Input id="templateDescription" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this email is for" /></div>
            <div><Label htmlFor="templateSubject">Subject</Label><Input id="templateSubject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Welcome to our platform!" required /></div>
            <div><Label htmlFor="templateCc">CC</Label><Input id="templateCc" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@example.com, another@example.com" /><p className="text-xs text-muted-foreground mt-1">Comma-separated list of emails. Placeholders are supported.</p></div>
            <div><Label htmlFor="templateBody">Body</Label><Textarea id="templateBody" value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="font-mono text-xs" placeholder="Hello {{user.name}}, welcome!"/>
                 <div className="p-2 mt-2 bg-muted/50 rounded-md"><p className="text-xs font-semibold flex items-center gap-1"><Info className="h-3 w-3" />Available Placeholders:</p><p className="text-xs text-muted-foreground font-mono">`{"{{user.name}}"}`, `{"{{complaint.id}}"}`, `{"{{password}}"}`, etc.</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-4"><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Template</Button></div>
        </form>
    );
}

function UsersTab({ roles, currentUser }: { roles: any[]; currentUser?: IUser }) {
    const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
    const { data: users, error, isLoading, mutate: mutateUsers } = useSWR<IUser[]>( (currentUser?.role === 'admin' || currentUser?.role === 'super-admin') ? '/api/users' : null, fetcher);
    const { toast } = useToast();
    const getRoleInfo = (roleId: string) => roles.find((r) => r.id === roleId);

    const handleAddUser = async (formData: any) => {
        try {
            const response = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to create user'); }
            mutateUsers(); setIsAddUserDialogOpen(false);
            toast({ title: "Success", description: `New user ${formData.name} has been added.` });
        } catch (err: any) { toast({ variant: "destructive", title: "Error", description: err.message }); }
    };

    const handleUpdateUser = async (userId: string, formData: any) => {
        try {
            const response = await fetch(`/api/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to update user'); }
            mutateUsers(); setSelectedUser(null);
            toast({ title: "Success", description: `User has been updated.` });
        } catch (err: any) { toast({ variant: "destructive", title: "Error", description: err.message }); }
    };

    const handleDeleteUser = async (user: IUser) => {
        if (window.confirm(`Are you sure you want to delete user ${user.name}? This action cannot be undone.`)) {
            try {
                const response = await fetch(`/api/users/${user._id}`, { method: 'DELETE' });
                if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to delete user'); }
                mutateUsers(); toast({ title: "Success", description: `User ${user.name} has been deleted.` });
            } catch (err: any) { toast({ variant: "destructive", title: "Error", description: err.message }); }
        }
    };
    return (
        <div className="space-y-6">
            <Card className="glass-card">
                <CardHeader>
                    <div className="flex items-center justify-between"><CardTitle>User Management</CardTitle><Button onClick={() => setIsAddUserDialogOpen(true)}><UserPlus className="h-4 w-4 mr-2" />Add User</Button></div>
                    <CardDescription>Add, edit, or remove users from your organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <LoadingAnimation /> : (
                        <div className="space-y-2">
                        {users?.map((user) => {
                            const roleInfo = getRoleInfo(user.role); const RoleIcon = roleInfo?.icon || User;
                            return (
                            <div key={user._id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10"><AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.name}.png`} /><AvatarFallback>{user.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback></Avatar>
                                <div>
                                    <p className="font-medium text-sm">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${roleInfo?.color}`} /><span className="text-xs font-medium">{roleInfo?.name}</span></div>
                                <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{user.status}</Badge>
                                <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedUser(user)}><Edit className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user)} disabled={currentUser?._id === user._id}><Trash2 className="h-4 w-4" /></Button></div>
                            </div>);
                        })}
                        </div>
                    )}
                </CardContent>
            </Card>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader><AddUserForm roles={roles} onClose={() => setIsAddUserDialogOpen(false)} onSubmit={handleAddUser} /></DialogContent></Dialog>
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>{selectedUser && <EditUserForm user={selectedUser} roles={roles} onClose={() => setSelectedUser(null)} onSubmit={handleUpdateUser} />}</DialogContent></Dialog>
        </div>
    );
}

function RolesTab({ roles, permissions, currentUser }: { roles: any[], permissions: any[], currentUser?: IUser }) {
    const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const { data: users } = useSWR<IUser[]>('/api/users', fetcher);
    const displayedRoles = currentUser?.role === 'super-admin' ? roles : roles.filter(role => role.id !== 'super-admin' && role.id !== 'micro-admin' && role.id !== 'nano-admin');

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedRoles.map((role) => {
                    const RoleIcon = role.icon;
                    const userCount = users?.filter((u) => u.role === role.id).length || 0;
                    return (
                        <Card key={role.id} className="glass-card flex flex-col">
                            <CardHeader>
                                <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg ${role.color} flex items-center justify-center`}><RoleIcon className="h-5 w-5 text-white" /></div><div><CardTitle>{role.name}</CardTitle><p className="text-sm text-muted-foreground">{userCount} users</p></div></div><Button variant="outline" size="sm" onClick={() => { setSelectedRole(role); setIsEditRoleDialogOpen(true); }} disabled={role.id !== 'engineer'}><Edit className="h-4 w-4" /></Button></div>
                            </CardHeader>
                            <CardContent className="flex-1"><p className="text-sm text-muted-foreground mb-4">{role.description}</p><div className="space-y-1"><p className="text-xs font-semibold">Permissions:</p><div className="flex flex-wrap gap-1">{role.permissions && role.permissions.includes("all") ? <Badge>All Permissions</Badge> : role.permissions?.map((permId: string) => <Badge key={permId} variant="outline" className="text-xs">{permissions.find(p => p.id === permId)?.name || permId}</Badge>)}</div></div></CardContent>
                        </Card>
                    );
                })}
            </div>
            <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}><DialogContent className="max-w-2xl"><DialogHeader><DialogTitle>Edit Role Permissions</DialogTitle></DialogHeader>{selectedRole && <EditRoleForm role={selectedRole} permissions={permissions} onClose={() => setIsEditRoleDialogOpen(false)} />}</DialogContent></Dialog>
        </div>
    );
}

function SecurityTab() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const { data: signupSetting, mutate } = useSWR('/api/settings?key=signupEnabled', fetcher);
    const [isSignupEnabled, setIsSignupEnabled] = useState(true);

    useEffect(() => { if(signupSetting) setIsSignupEnabled(signupSetting.value); }, [signupSetting]);

    const handleSignupToggle = async (enabled: boolean) => {
        setIsSaving(true);
        try {
            await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'signupEnabled', value: enabled }) });
            toast({ title: 'Success', description: `Public sign-up has been ${enabled ? 'enabled' : 'disabled'}.` });
            setIsSignupEnabled(enabled); mutate();
        } catch (err) { toast({ variant: 'destructive', title: 'Error', description: 'Failed to update setting.' });
        } finally { setIsSaving(false); }
    }

    return (
        <div className="space-y-6"><Card className="glass-card"><CardHeader><CardTitle>Access Control</CardTitle></CardHeader><CardContent><div className="flex items-center justify-between"><div><p className="font-medium">Enable Public Sign-up</p><p className="text-sm text-muted-foreground">Allow new users to register for a trial from the login page.</p></div><Switch checked={isSignupEnabled} onCheckedChange={handleSignupToggle} disabled={isSaving}/></div></CardContent></Card></div>
    );
}

function NotificationsTab() {
  return (
    <div className="space-y-6"><Card className="glass-card"><CardHeader><CardTitle>Email Notifications</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between"><div><p className="font-medium">New complaint notifications</p><p className="text-sm text-muted-foreground">Notify admins when new complaints are created</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div><p className="font-medium">Assignment notifications</p><p className="text-sm text-muted-foreground">Notify engineers when assigned to complaints</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div><p className="font-medium">Status update notifications</p><p className="text-sm text-muted-foreground">Notify reporters of complaint status changes</p></div><Switch defaultChecked /></div><div className="flex items-center justify-between"><div><p className="font-medium">Daily summary reports</p><p className="text-sm text-muted-foreground">Send daily complaint summary to admins</p></div><Switch /></div></CardContent></Card></div>
  );
}

function SupportTab() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      // This would be an API call to a ticketing system like Zendesk or Jira, or your internal tool
      await new Promise(res => setTimeout(res, 1000)); // Simulate API call
      toast({ title: 'Ticket Submitted', description: 'Our support team will get back to you shortly.' });
      setSubject(''); setDescription('');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
    } finally { setIsSubmitting(false); }
  };

  return (
    <Card className="glass-card">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <LifeBuoy className="h-6 w-6 text-primary" />
                Contact Vynsec Creations Support
            </CardTitle>
            <CardDescription>
                If you're experiencing issues with the platform or have a billing question, submit a ticket here.
            </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="support-subject">Subject</Label>
                    <Input
                        id="support-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g., Issue with billing invoice"
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="support-description">Description</Label>
                    <Textarea
                        id="support-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please provide a detailed description..."
                        rows={8}
                        required
                    />
                </div>
            </CardContent>
            <CardFooter className="justify-end bg-muted/30 py-3 px-6">
                <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Submit Support Ticket
                </Button>
            </CardFooter>
        </form>
    </Card>
  );
}


function AddUserForm({ roles, onClose, onSubmit }: { roles: any[]; onClose: () => void, onSubmit: (data: any) => Promise<void> }) {
    const [formData, setFormData] = useState({ name: '', email: '', role: 'engineer', status: 'active' });
    const [sendEmail, setSendEmail] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setIsSubmitting(true); await onSubmit({ ...formData, password: generateTemporaryPassword(), sendEmail: sendEmail }); setIsSubmitting(false); };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required/></div><div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required/></div></div>
            <div><Label htmlFor="role">Role</Label><Select value={formData.role} onValueChange={v => handleInputChange('role', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.filter(r=>r.id !== 'super-admin').map((role) => <SelectItem key={role.id} value={role.id}><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded ${role.color}`}/>{role.name}</div></SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center space-x-2"><Switch id="sendEmail" checked={sendEmail} onCheckedChange={setSendEmail} /><Label htmlFor="sendEmail">Send welcome email with credentials</Label></div>
            <DialogFooter><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Add User</Button></DialogFooter>
        </form>
    );
}

function EditUserForm({ user, roles, onClose, onSubmit }: { user: IUser; roles: any[]; onClose: () => void; onSubmit: (userId: string, data: any) => Promise<void> }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({ name: user.name, email: user.email, role: user.role, status: user.status });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleInputChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
    const handleSubmit = async (e: React.FormEvent) => { e.preventDefault(); setIsSubmitting(true); await onSubmit(user._id, formData); setIsSubmitting(false); };

    const handleResetPassword = async () => {
        setIsResetting(true);
        try {
            const response = await fetch(`/api/users/${user._id}/reset-password`, { method: 'POST' });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to send password reset email.'); }
            toast({ title: "Password Reset Email Sent", description: `New credentials have been sent to ${user.email}.` });
        } catch(err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="name">Full Name</Label><Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required/></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required/></div>
            <div><Label htmlFor="role">Role</Label><Select value={formData.role} onValueChange={v => handleInputChange('role', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roles.filter(r=>r.id !== 'super-admin').map((role) => <SelectItem key={role.id} value={role.id}><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded ${role.color}`}/>{role.name}</div></SelectItem>)}</SelectContent></Select></div>
            <div><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={v => handleInputChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="on-leave">On Leave</SelectItem></SelectContent></Select></div>
            <DialogFooter className="!justify-between"><Button variant="outline" type="button" onClick={handleResetPassword} disabled={isResetting}>{isResetting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Reset Password</Button><div className="flex gap-2"><Button variant="outline" type="button" onClick={onClose}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update User</Button></div></DialogFooter>
        </form>
    );
}

function EditRoleForm({ role, permissions, onClose }: { role: any; permissions: any[]; onClose: () => void }) {
  const { data: tenant, mutate } = useSWR<ITenant>('/api/tenants/me', fetcher);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tenant?.permissions?.engineer) setSelectedPermissions(tenant.permissions.engineer);
    else setSelectedPermissions(roles.find(r => r.id === 'engineer')?.permissions || []);
  }, [tenant]);

  const handlePermissionChange = (permId: string, checked: boolean) => setSelectedPermissions(prev => checked ? [...prev, permId] : prev.filter(p => p !== permId));

  const handleSave = async () => {
    setIsSaving(true);
    try {
        await fetch('/api/tenants/me', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissions: { engineer: selectedPermissions } }),
        });
        toast({ title: 'Success', description: 'Engineer permissions updated.' }); mutate(); onClose();
    } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally { setIsSaving(false); }
  };

  const engineerPermissions = permissions.filter(p => p.id !== 'users:manage' && p.id !== 'settings:tenant');

  return (
    <div className="space-y-4">
      <div><Label>Role Name</Label><Input defaultValue={role.name} disabled /></div>
      <div><Label>Description</Label><Textarea defaultValue={role.description} disabled /></div>
      <div><Label>Permissions</Label><div className="space-y-2 mt-2 max-h-60 overflow-y-auto pr-2">{engineerPermissions.map((permission) => <div key={permission.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><div><p className="font-medium text-sm">{permission.name}</p></div><Checkbox checked={selectedPermissions.includes(permission.id)} onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)}/></div>)}</div></div>
      <DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Update Role</Button></DialogFooter>
    </div>
  );
}

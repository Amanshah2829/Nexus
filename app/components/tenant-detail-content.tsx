
"use client"

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Building, DollarSign, Users, Calendar, Edit, Save, Loader2, BarChart, Bell, Mail, Shield, ChevronLeft, UserPlus, Key, FileText, Trash2, Tag, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ITenant } from "@/models/Tenant";
import { IUser } from "@/models/User";
import { LoadingAnimation } from "./ui/loading-animation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Switch } from "./ui/switch";


const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
});


function generateTemporaryPassword(length = 12) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}

export function TenantDetailContent({ tenantId, onBack }: { tenantId: string, onBack: () => void }) {
    const { data: tenant, error: tenantError, mutate: mutateTenant } = useSWR<ITenant>(`/api/tenants/${tenantId}`, fetcher);
    const { data: users, error: usersError, mutate: mutateUsers } = useSWR<IUser[]>(tenantId ? `/api/users?tenant=${tenantId}` : null, fetcher);
    const router = useRouter();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [isQuotationOpen, setIsQuotationOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<ITenant>>({});
    const { toast } = useToast();

    useEffect(() => {
        if (tenant) {
            setFormData({
                name: tenant.name,
                status: tenant.status,
                subscriptionPlan: tenant.subscriptionPlan,
                subscriptionStatus: tenant.subscriptionStatus,
                monthlyCost: tenant.monthlyCost,
                subscriptionEndDate: tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toISOString().split('T')[0] : '',
                branding: tenant.branding || { enabled: false, companyName: '', tagline: '', logoUrl: '', primaryColor: '', accentColor: '', backgroundColor: '' }
            });
        }
    }, [tenant]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/tenants/${tenantId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to update tenant');
            const updatedTenant = await res.json();
            toast({ title: "Success", description: `Tenant ${updatedTenant.name} has been updated.` });
            setIsEditing(false);
            mutateTenant(); // Re-fetch tenant data to update UI
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleAddAdmin = async (adminData: any) => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...adminData,
                    tenant: tenantId,
                    role: 'admin',
                    sendEmail: true,
                    password: generateTemporaryPassword(),
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create admin');
            }
            toast({ title: "Success", description: `New admin ${adminData.name} created and welcome email sent.` });
            mutateUsers();
            setIsAddAdminOpen(false);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    };
    
    const handleResetPassword = async (user: IUser) => {
        if (!window.confirm(`Are you sure you want to reset the password for ${user.name}? A new temporary password will be emailed to them.`)) {
            return;
        }

        try {
             const response = await fetch(`/api/users/${user._id}/reset-password`, {
                method: 'POST',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset password.');
            }
            toast({ title: 'Success', description: `Password reset email has been sent to ${user.name}.` });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err.message });
        }
    }
    
    const handleDeleteTenant = async () => {
        try {
            const res = await fetch(`/api/tenants/${tenantId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete tenant');
            toast({ title: "Success", description: "Tenant has been permanently deleted." });
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
             toast({ variant: 'destructive', title: "Error", description: error.message });
        }
    }

    if (tenantError || usersError) return <div className="p-6 text-destructive">Failed to load tenant data.</div>;
    if (!tenant || !users) return <div className="flex h-full w-full items-center justify-center"><LoadingAnimation /></div>;
    
    const tenantAdmins = users.filter(u => u.role === 'admin');

    return (
        <div className="p-4 md:p-8 space-y-6">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" onClick={onBack}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{tenant.name}</h1>
                    <p className="text-muted-foreground">Manage this customer's account and subscription.</p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${tenant.monthlyCost || 0}</div>
                        <p className="text-xs text-muted-foreground capitalize">{tenant.subscriptionPlan} plan</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">{tenantAdmins.length} admins</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{tenant.status}</div>
                         <p className="text-xs text-muted-foreground">Joined: {new Date(tenant.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Subscription End</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString() : 'N/A'}</div>
                        <p className="text-xs text-muted-foreground capitalize">Status: {tenant.subscriptionStatus}</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Subscription & Billing</CardTitle>
                                <CardDescription>Manage the tenant's subscription plan and status.</CardDescription>
                            </div>
                            {!isEditing && <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>}
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <Label>Internal Tenant Name</Label>
                                     {isEditing ? (
                                        <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                    ) : <p className="font-medium">{tenant.name}</p>}
                                </div>
                                <div>
                                    <Label>Tenant Status</Label>
                                     {isEditing ? (
                                        <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as any})}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : <p className="font-medium capitalize">{tenant.status}</p>}
                                </div>
                                 <div>
                                    <Label>Monthly Cost</Label>
                                     {isEditing ? (
                                        <Input type="number" value={formData.monthlyCost || 0} onChange={e => setFormData({...formData, monthlyCost: Number(e.target.value)})} />
                                    ) : <p className="font-medium">${tenant.monthlyCost || 0}</p>}
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                    <Label>Subscription Plan</Label>
                                    {isEditing ? (
                                        <Select value={formData.subscriptionPlan} onValueChange={v => setFormData({...formData, subscriptionPlan: v as any})}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="trial">Trial</SelectItem>
                                                <SelectItem value="basic">Basic</SelectItem>
                                                <SelectItem value="pro">Pro</SelectItem>
                                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : <p className="font-medium capitalize">{tenant.subscriptionPlan}</p>}
                                </div>
                                <div>
                                    <Label>Subscription Status</Label>
                                     {isEditing ? (
                                        <Select value={formData.subscriptionStatus} onValueChange={v => setFormData({...formData, subscriptionStatus: v as any})}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="trialing">Trialing</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="past_due">Past Due</SelectItem>
                                                <SelectItem value="canceled">Canceled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : <p className="font-medium capitalize">{tenant.subscriptionStatus}</p>}
                                </div>
                                 <div>
                                    <Label>Subscription End Date</Label>
                                    {isEditing ? (
                                        <Input type="date" value={formData.subscriptionEndDate as string} onChange={e => setFormData({...formData, subscriptionEndDate: e.target.value})} />
                                    ) : <p className="font-medium">{tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString() : 'N/A'}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle>Branding & Customization</CardTitle>
                                <CardDescription>Manage this tenant's custom branding settings.</CardDescription>
                            </div>
                             <Switch
                                checked={formData.branding?.enabled}
                                onCheckedChange={(checked) => setFormData(prev => ({...prev, branding: {...prev.branding, enabled: checked}}))}
                                disabled={!isEditing}
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground"/>Company Name</Label>
                                    <Input 
                                        placeholder="e.g., Acme University" 
                                        value={formData.branding?.companyName || ''} 
                                        onChange={e => setFormData(prev => ({...prev, branding: {...prev.branding, companyName: e.target.value}}))} 
                                        disabled={!isEditing || !formData.branding?.enabled}
                                    />
                                </div>
                                <div>
                                     <Label className="flex items-center gap-2"><Tag className="h-4 w-4 text-muted-foreground"/>Tagline</Label>
                                    <Input 
                                        placeholder="e.g., Excellence in Education" 
                                        value={formData.branding?.tagline || ''} 
                                        onChange={e => setFormData(prev => ({...prev, branding: {...prev.branding, tagline: e.target.value}}))} 
                                        disabled={!isEditing || !formData.branding?.enabled}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="flex items-center gap-2"><Palette className="h-4 w-4 text-muted-foreground"/>Theme Colors (HSL)</Label>
                                <div className="grid sm:grid-cols-3 gap-2">
                                     <Input 
                                        placeholder="Primary: 240 5.9% 10%" 
                                        value={formData.branding?.primaryColor || ''} 
                                        onChange={e => setFormData(prev => ({...prev, branding: {...prev.branding, primaryColor: e.target.value}}))} 
                                        disabled={!isEditing || !formData.branding?.enabled}
                                    />
                                     <Input 
                                        placeholder="Accent: 240 4% 96%" 
                                        value={formData.branding?.accentColor || ''} 
                                        onChange={e => setFormData(prev => ({...prev, branding: {...prev.branding, accentColor: e.target.value}}))} 
                                        disabled={!isEditing || !formData.branding?.enabled}
                                    />
                                     <Input 
                                        placeholder="Background: 0 0% 100%" 
                                        value={formData.branding?.backgroundColor || ''} 
                                        onChange={e => setFormData(prev => ({...prev, branding: {...prev.branding, backgroundColor: e.target.value}}))} 
                                        disabled={!isEditing || !formData.branding?.enabled}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                     {isEditing && (
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    )}
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Tenant Admins</CardTitle>
                                <CardDescription>Primary points of contact for this tenant.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setIsAddAdminOpen(true)}>
                                <UserPlus className="h-4 w-4 mr-2" /> Add Admin
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tenantAdmins.map(admin => (
                                        <TableRow key={admin._id}>
                                            <TableCell>{admin.name}</TableCell>
                                            <TableCell>{admin.email}</TableCell>
                                            <TableCell><Badge variant={admin.status === 'active' ? 'default' : 'secondary'}>{admin.status}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleResetPassword(admin)}>
                                                    <Key className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                         <CardHeader>
                            <CardTitle>Communication</CardTitle>
                            <CardDescription>Send messages directly to this tenant's admins.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start" variant="outline" onClick={() => setIsInvoiceOpen(true)}><FileText className="mr-2 h-4 w-4" /> Create Invoice</Button>
                            <Button className="w-full justify-start" variant="outline" onClick={() => setIsQuotationOpen(true)}><FileText className="mr-2 h-4 w-4" /> Create Quotation</Button>
                            <Button className="w-full justify-start" variant="ghost"><Mail className="mr-2 h-4 w-4" /> Send Announcement</Button>
                            <Button className="w-full justify-start" variant="ghost"><Bell className="mr-2 h-4 w-4" /> Send Renewal Reminder</Button>
                             <Button className="w-full justify-start" variant="ghost"><BarChart className="mr-2 h-4 w-4" /> View Usage Analytics</Button>
                        </CardContent>
                    </Card>
                     <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Critical and irreversible actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full justify-start"><Trash2 className="mr-2 h-4 w-4" /> Delete Tenant</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the tenant <strong>{tenant.name}</strong> and all of its associated data, including users, complaints, and assets.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteTenant} className="bg-destructive hover:bg-destructive/90">Delete Tenant</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <AddAdminDialog 
                isOpen={isAddAdminOpen}
                onClose={() => setIsAddAdminOpen(false)}
                onAdd={handleAddAdmin}
            />

            <CommunicationDialog
                isOpen={isInvoiceOpen}
                onClose={() => setIsInvoiceOpen(false)}
                title="Create Invoice"
                description={`Create and send an invoice to ${tenant.name}.`}
                onSubmit={(data) => {
                    console.log("Invoice Data:", data);
                    toast({ title: "Invoice Sent", description: "The invoice has been successfully sent." });
                    setIsInvoiceOpen(false);
                }}
            />
            <CommunicationDialog
                isOpen={isQuotationOpen}
                onClose={() => setIsQuotationOpen(false)}
                title="Create Quotation"
                description={`Create and send a quotation to ${tenant.name}.`}
                onSubmit={(data) => {
                    console.log("Quotation Data:", data);
                    toast({ title: "Quotation Sent", description: "The quotation has been successfully sent." });
                    setIsQuotationOpen(false);
                }}
            />

        </div>
    )
}

function AddAdminDialog({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (data: any) => Promise<void> }) {
    const [formData, setFormData] = useState({ name: "", email: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onAdd(formData);
        setIsSubmitting(false);
        setFormData({ name: "", email: "" }); // Reset form
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>Create a new administrator account for this tenant. A welcome email with a temporary password will be sent.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <Label htmlFor="adminName">Admin Full Name</Label>
                        <Input id="adminName" placeholder="Jane Smith" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input id="adminEmail" type="email" placeholder="admin@client.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                            Create Admin
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CommunicationDialog({ isOpen, onClose, title, description, onSubmit }: { isOpen: boolean, onClose: () => void, title: string, description: string, onSubmit: (data: any) => void }) {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        // Simulate network delay
        await new Promise(res => setTimeout(res, 1000));
        onSubmit({ subject, body });
        setIsSending(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <Label htmlFor="comm-subject">Subject</Label>
                        <Input id="comm-subject" value={subject} onChange={e => setSubject(e.target.value)} required />
                    </div>
                    <div>
                        <Label htmlFor="comm-body">Body</Label>
                        <Textarea id="comm-body" value={body} onChange={e => setBody(e.target.value)} required rows={8} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSending}>
                            {isSending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Send
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

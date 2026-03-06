
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Switch } from '@/app/components/ui/switch';
import { Badge } from '@/app/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Separator } from '@/app/components/ui/separator';
import {
  Shield,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Crown,
  User,
  Wrench,
  Loader2,
  Save,
  Key,
  Mail,
  FileText,
  Info,
  Plus,
  MapPin,
  DollarSign,
  List,
  LifeBuoy,
  Building,
  Bell,
  ChevronLeft,
  Search,
  Users,
  Timer,
  Settings,
  GitMerge,
  CreditCard,
  UserCheck,
  Palette,
  ChevronRight,
  Globe,
  Lock,
  Download,
  Send,
  Fingerprint,
  Server,
  KeyRound
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip';
import { IUser } from '@/app/models/User';
import { useToast } from '@/hooks/use-toast';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { ITenant } from '@/app/models/Tenant';
import { Checkbox } from '@/app/components/ui/checkbox';
import { cn } from '@/app/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDesc,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (res.status === 403 || res.status === 401) {
      throw new Error('Unauthorized');
    }
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

const roles = [
  { id: 'super-admin', name: 'Super Admin', icon: Globe, color: 'bg-indigo-600', description: 'Total system authority across all tenants.' },
  { id: 'admin', name: 'Tenant Admin', icon: Shield, color: 'bg-rose-600', description: 'Full administrative control over this organization.' },
  { id: 'hod', name: 'Head of Dept', icon: Crown, color: 'bg-amber-600', description: 'Departmental oversight and approval authority.' },
  { id: 'engineer', name: 'Field Engineer', icon: Wrench, color: 'bg-sky-600', description: 'Technical resolution and on-site support.' },
  { id: 'user', name: 'General User', icon: User, color: 'bg-emerald-600', description: 'Can log and track personal complaints.' },
];

const permissions = [
  { id: 'tickets:create', name: 'Create Tickets' },
  { id: 'tickets:edit', name: 'Edit Tickets' },
  { id: 'tickets:close', name: 'Resolve Tickets' },
  { id: 'inventory:view', name: 'View Inventory' },
  { id: 'inventory:manage', name: 'Manage Inventory' },
  { id: 'users:manage', name: 'User Management' },
  { id: 'settings:tenant', name: 'Org Settings' },
];

export function SettingsContent() {
  const { data: currentUser, error: currentUserError } = useSWR<IUser>('/api/users/me', fetcher);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
      setMobileMenuOpen(false);
    }
  }, [searchParams]);

  const navGroups = useMemo(() => {
    if (!currentUser) return [];

    const allItems = [
      {
        group: 'Personal',
        items: [
          {
            id: 'profile',
            label: 'Account Profile',
            icon: User,
            roles: ['admin', 'super-admin', 'engineer', 'viewer', 'user', 'sales', 'hod'],
          },
          { id: 'security', label: 'Security & Access', icon: Lock, roles: ['super-admin', 'admin'] },
        ],
      },
      {
        group: 'Organization',
        items: [
          { id: 'organization', label: 'Organization Info', icon: Building, roles: ['admin'] },
          { id: 'authentication', label: 'Single Sign-On', icon: Fingerprint, roles: ['admin'] },
          { id: 'subscription', label: 'Billing & Plan', icon: CreditCard, roles: ['admin'] },
          { id: 'branding', label: 'White-labeling', icon: Palette, roles: ['admin'] },
          { id: 'general', label: 'Preferences', icon: Settings, roles: ['admin', 'super-admin'] },
        ],
      },
      {
        group: 'Support Desk',
        items: [
          { id: 'email', label: 'Email Config', icon: Mail, roles: ['admin', 'super-admin', 'engineer'] },
          { id: 'templates', label: 'Notification Hub', icon: FileText, roles: ['admin', 'super-admin'] },
          { id: 'sla', label: 'SLA Policies', icon: Timer, roles: ['admin', 'super-admin'] },
        ],
      },
      {
        group: 'Team',
        items: [
          { id: 'users', label: 'Team Members', icon: Users, roles: ['admin', 'super-admin'] },
          { id: 'roles', label: 'Permissions', icon: Shield, roles: ['admin', 'super-admin'] },
        ],
      },
      {
        group: 'Help',
        items: [
          { id: 'support', label: 'Help & Support', icon: LifeBuoy, roles: ['admin', 'user', 'engineer'] },
        ],
      },
    ];

    return allItems
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.roles.includes(currentUser.role)),
      }))
      .filter((group) => group.items.length > 0);
  }, [currentUser]);

  const handleTabSelect = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    const params = new URLSearchParams(searchParams);
    params.set('tab', id);
    router.replace(`/settings?${params.toString()}`);
  };

  if (currentUserError) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center p-12">
        <div className="text-center space-y-4 max-w-sm bg-card border border-border p-8 rounded-2xl shadow-xl">
          <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-muted-foreground text-sm">
            Your current session has expired or you do not have permission to view these settings.
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettingsTab />;
      case 'organization':
        return <OrganizationSettingsTab />;
      case 'authentication':
        return <AuthenticationSettingsTab />;
      case 'subscription':
        return <SubscriptionTab />;
      case 'branding':
        return <BrandingSettingsTab />;
      case 'general':
        return <GeneralSettingsTab />;
      case 'email':
        return <EmailConfigTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'users':
        return <UsersTab currentUser={currentUser} />;
      case 'roles':
        return <RolesTab currentUser={currentUser} />;
      case 'sla':
        return <SlaSettingsTab />;
      case 'security':
        return <SecurityTab />;
      case 'support':
        return <SupportTab />;
      default:
        return <ProfileSettingsTab />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Page Header */}
      <div className="shrink-0 p-6 md:px-8 border-b border-border bg-card/50 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Global Settings</h1>
            <p className="text-sm text-muted-foreground">Manage account, organization, and system-wide configurations.</p>
          </div>
          <Button variant="outline" className="hidden md:flex gap-2" onClick={() => router.push('/dashboard')}>
            <ChevronLeft className="h-4 w-4" /> Exit to Dashboard
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Navigation Sidebar */}
        <aside
          className={cn(
            'w-full md:w-72 shrink-0 border-r border-border bg-card/20 flex flex-col',
            isMobile && !mobileMenuOpen && 'hidden',
            isMobile && mobileMenuOpen && 'absolute inset-0 z-50 bg-background'
          )}
        >
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find a setting..."
                className="pl-9 h-9 bg-background border-none ring-1 ring-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            {navGroups.map((group) => (
              <div key={group.group} className="space-y-1">
                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 mb-2">
                  {group.group}
                </h3>
                {group.items
                  .filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleTabSelect(item.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 h-10 rounded-xl text-sm transition-all group',
                        activeTab === item.id
                          ? 'bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn('h-4 w-4 shrink-0', activeTab === item.id ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary')} />
                        {item.label}
                      </div>
                      {activeTab === item.id && <ChevronRight className="h-3 w-3" />}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className={cn('flex-1 overflow-y-auto bg-background/50 relative', isMobile && mobileMenuOpen && 'hidden')}>
          <div className="p-6 md:p-8 lg:p-12 animate-in fade-in slide-in-from-right-4 duration-500 max-w-4xl">
            {isMobile && !mobileMenuOpen && (
              <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground" onClick={() => setMobileMenuOpen(true)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> All Settings
              </Button>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

function AuthenticationSettingsTab() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { data: tenant, mutate } = useSWR<ITenant>('/api/tenants/me', fetcher);
  
  const [authConfig, setAuthConfig] = useState<ITenant['authConfiguration']>({
    method: 'local',
    enabled: false,
    saml: { entryPoint: '', issuer: '', cert: '' },
    oidc: { issuer: '', clientId: '', clientSecret: '' },
    ldap: { url: '', baseDn: '', bindDn: '', searchFilter: '' },
  });

  useEffect(() => {
    if (tenant?.authConfiguration) {
      setAuthConfig(tenant.authConfiguration);
    }
  }, [tenant]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/tenants/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authConfiguration: authConfig })
      });
      if (!res.ok) throw new Error('Failed to update authentication settings');
      toast({ title: 'Protocol Updated', description: 'Enterprise authentication settings have been applied.' });
      mutate();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const updateNestedField = (path: string, value: any) => {
    const keys = path.split('.');
    setAuthConfig((prev: any) => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };

  if (!tenant) return <LoadingAnimation />;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Enterprise Authentication</h2>
        <p className="text-sm text-muted-foreground">Configure Single Sign-On (SSO) and Directory Integrations.</p>
      </div>

      <Card className="border-border bg-card/50 shadow-lg">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">Authentication Protocol</CardTitle>
              <CardDescription>Choose how your organization members authenticate.</CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-full border">
              <Label htmlFor="enable-sso" className="text-xs font-black uppercase tracking-widest">Active</Label>
              <Switch id="enable-sso" checked={authConfig?.enabled} onCheckedChange={(v) => updateNestedField('enabled', v)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Method</Label>
            <RadioGroup 
              value={authConfig?.method} 
              onValueChange={(v) => updateNestedField('method', v)} 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              disabled={!authConfig?.enabled}
            >
              <Label htmlFor="method-local" className="flex flex-col items-center justify-between rounded-xl border-2 border-border bg-background p-4 hover:bg-muted cursor-pointer [&:has([data-state=checked])]:border-primary transition-all">
                <RadioGroupItem value="local" id="method-local" className="sr-only" />
                <User className="h-6 w-6 mb-2 text-primary" />
                <span className="font-bold text-xs uppercase">Internal</span>
              </Label>
              <Label htmlFor="method-saml" className="flex flex-col items-center justify-between rounded-xl border-2 border-border bg-background p-4 hover:bg-muted cursor-pointer [&:has([data-state=checked])]:border-primary transition-all">
                <RadioGroupItem value="saml" id="method-saml" className="sr-only" />
                <KeyRound className="h-6 w-6 mb-2 text-primary" />
                <span className="font-bold text-xs uppercase">SAML 2.0</span>
              </Label>
              <Label htmlFor="method-oidc" className="flex flex-col items-center justify-between rounded-xl border-2 border-border bg-background p-4 hover:bg-muted cursor-pointer [&:has([data-state=checked])]:border-primary transition-all">
                <RadioGroupItem value="oidc" id="method-oidc" className="sr-only" />
                <Shield className="h-6 w-6 mb-2 text-primary" />
                <span className="font-bold text-xs uppercase">OIDC</span>
              </Label>
              <Label htmlFor="method-ldap" className="flex flex-col items-center justify-between rounded-xl border-2 border-border bg-background p-4 hover:bg-muted cursor-pointer [&:has([data-state=checked])]:border-primary transition-all">
                <RadioGroupItem value="ldap" id="method-ldap" className="sr-only" />
                <Server className="h-6 w-6 mb-2 text-primary" />
                <span className="font-bold text-xs uppercase">LDAP/AD</span>
              </Label>
            </RadioGroup>
          </div>

          <Separator className="border-border/50" />

          {/* Conditional Forms Based on Method */}
          {authConfig?.method === 'saml' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-sm font-bold flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> SAML 2.0 Configuration</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">SSO Entry Point URL</Label>
                  <Input 
                    value={authConfig.saml?.entryPoint} 
                    onChange={e => updateNestedField('saml.entryPoint', e.target.value)} 
                    placeholder="https://idp.example.com/saml/sso" 
                    className="h-11 rounded-xl bg-background" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Issuer / Entity ID</Label>
                  <Input 
                    value={authConfig.saml?.issuer} 
                    onChange={e => updateNestedField('saml.issuer', e.target.value)} 
                    placeholder="nexus-sp-entity-id" 
                    className="h-11 rounded-xl bg-background" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Public Certificate (Base64)</Label>
                  <Textarea 
                    value={authConfig.saml?.cert} 
                    onChange={e => updateNestedField('saml.cert', e.target.value)} 
                    placeholder="-----BEGIN CERTIFICATE----- ..." 
                    rows={6} 
                    className="rounded-xl bg-background font-mono text-xs" 
                  />
                </div>
              </div>
            </div>
          )}

          {authConfig?.method === 'oidc' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-sm font-bold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> OpenID Connect Configuration</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Discovery / Issuer URL</Label>
                  <Input 
                    value={authConfig.oidc?.issuer} 
                    onChange={e => updateNestedField('oidc.issuer', e.target.value)} 
                    placeholder="https://accounts.google.com" 
                    className="h-11 rounded-xl bg-background" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Client ID</Label>
                    <Input 
                      value={authConfig.oidc?.clientId} 
                      onChange={e => updateNestedField('oidc.clientId', e.target.value)} 
                      placeholder="client-id-xyz" 
                      className="h-11 rounded-xl bg-background" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">Client Secret</Label>
                    <Input 
                      type="password"
                      value={authConfig.oidc?.clientSecret} 
                      onChange={e => updateNestedField('oidc.clientSecret', e.target.value)} 
                      placeholder="••••••••••••" 
                      className="h-11 rounded-xl bg-background" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {authConfig?.method === 'ldap' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h3 className="text-sm font-bold flex items-center gap-2"><Server className="h-4 w-4 text-primary" /> LDAP / Active Directory Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Server URL</Label>
                  <Input 
                    value={authConfig.ldap?.url} 
                    onChange={e => updateNestedField('ldap.url', e.target.value)} 
                    placeholder="ldaps://ldap.company.com:636" 
                    className="h-11 rounded-xl bg-background" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Base DN</Label>
                  <Input 
                    value={authConfig.ldap?.baseDn} 
                    onChange={e => updateNestedField('ldap.baseDn', e.target.value)} 
                    placeholder="dc=example,dc=com" 
                    className="h-11 rounded-xl bg-background" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">Bind DN (Service Account)</Label>
                  <Input 
                    value={authConfig.ldap?.bindDn} 
                    onChange={e => updateNestedField('ldap.bindDn', e.target.value)} 
                    placeholder="cn=admin,dc=example,dc=com" 
                    className="h-11 rounded-xl bg-background" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">User Search Filter</Label>
                  <Input 
                    value={authConfig.ldap?.searchFilter} 
                    onChange={e => updateNestedField('ldap.searchFilter', e.target.value)} 
                    placeholder="(sAMAccountName={{username}})" 
                    className="h-11 rounded-xl bg-background font-mono text-xs" 
                  />
                </div>
              </div>
            </div>
          )}

          {authConfig?.method === 'local' && (
            <div className="p-12 text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Standard Database Authentication</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">Users will authenticate using their email and password stored securely in the Nexus local database.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-end bg-muted/20 border-t p-4 px-6">
          <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-10 shadow-lg font-black h-11">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} UPDATE PROTOCOL
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch(`/api/users/${user?._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      toast({ title: 'Profile Updated', description: 'Your changes have been saved.' });
      mutate();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Update Failed', description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Mismatch', description: 'New passwords do not match.' });
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
      if (!response.ok) throw new Error(resData.message || 'Incorrect current password.');
      toast({ title: 'Security Updated', description: 'Your password has been changed successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (!user) return <LoadingAnimation />;

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Personal Information</h2>
          <p className="text-sm text-muted-foreground">Manage how your profile appears across the platform.</p>
        </div>
        <Card className="border-border bg-card/50 overflow-hidden shadow-sm">
          <form onSubmit={handleProfileSave}>
            <CardContent className="p-6 space-y-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-background shadow-xl">
                  <AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.name}.png`} />
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {user.name?.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button type="button" variant="outline" size="sm">Change Photo</Button>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">JPG, PNG OR GIF. MAX 5MB.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="profileName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  <Input id="profileName" value={name} onChange={(e) => setName(e.target.value)} className="bg-background border-border h-11 rounded-xl focus:ring-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileEmail" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Identity</Label>
                  <Input id="profileEmail" value={user.email} disabled readOnly className="bg-muted h-11 rounded-xl text-muted-foreground border-border" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end bg-muted/20 border-t p-4 px-6">
              <Button type="submit" disabled={isSaving} className="rounded-full px-8 shadow-lg font-black tracking-tight">
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} UPDATE PROFILE
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>

      <Separator />

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Password & Security</h2>
          <p className="text-sm text-muted-foreground">Keep your account safe by using a strong, unique password.</p>
        </div>
        <Card className="border-border bg-card/50 overflow-hidden shadow-sm">
          <form onSubmit={handlePasswordChange}>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Password</Label>
                <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required className="bg-background h-11 rounded-xl border-border" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</Label>
                  <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required className="bg-background h-11 rounded-xl border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required className="bg-background h-11 rounded-xl border-border" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end bg-muted/20 border-t p-4 px-6">
              <Button type="submit" disabled={isPasswordSaving} variant="secondary" className="rounded-full px-8 shadow-md font-black tracking-tight">
                {isPasswordSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} CHANGE PASSWORD
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>
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

  const handleRemoveLocation = (locToRemove: string) => setLocations(locations.filter((loc) => loc !== locToRemove));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/tenants/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tenantName, locations }),
      });
      toast({ title: 'Identity Updated', description: 'Organization settings have been locked in.' });
      mutate();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!tenant) return <LoadingAnimation />;

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Organization Identity</h2>
          <p className="text-sm text-muted-foreground">Manage your company name and primary location.</p>
        </div>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="space-y-2">
              <Label htmlFor="tenantName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Public Entity Name</Label>
              <Input id="tenantName" value={tenantName} onChange={(e) => setTenantName(e.target.value)} className="h-11 rounded-xl bg-background border-border font-bold" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Campus & Site Locations</h2>
          <p className="text-sm text-muted-foreground">Define buildings and floor IDs for precise ticket routing.</p>
        </div>
        <Card className="glass-card">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locations.map((loc, index) => (
                <div key={index} className="flex items-center justify-between p-3 pl-4 bg-muted/50 rounded-xl border border-border group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <span className="text-sm font-semibold">{loc}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveLocation(loc)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <Input value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Technology Park - Wing B" className="h-11 rounded-xl bg-background" onKeyDown={(e) => e.key === 'Enter' && handleAddLocation()} />
              <Button variant="outline" onClick={handleAddLocation} className="h-11 rounded-xl border-primary text-primary hover:bg-primary/10 font-bold px-6">
                <Plus className="h-4 w-4 mr-2" /> ADD SITE
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-10 shadow-xl font-black tracking-tight h-12">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} COMMIT ORGANIZATION CHANGES
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
    { id: 'INV-1234', date: 'June 1, 2024', amount: '$1,299.00', status: 'Paid' },
    { id: 'INV-1233', date: 'May 1, 2024', amount: '$1,299.00', status: 'Paid' },
    { id: 'INV-1232', date: 'April 1, 2024', amount: '$1,299.00', status: 'Paid' },
  ];

  const handleAction = (action: string) => {
    toast({
      title: 'Portal Redirect',
      description: `In a production environment, you would be redirected to the secure billing portal to ${action}.`,
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Billing & Usage</h2>
        <p className="text-sm text-muted-foreground">Manage your enterprise plan, payment methods, and invoices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-primary/20 bg-primary/[0.02]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 rounded-full px-4 py-1 uppercase tracking-widest text-[10px] font-black">
                {tenant.subscriptionPlan} PLAN
              </Badge>
              <Badge className="bg-green-500 text-white font-bold">{tenant.subscriptionStatus}</Badge>
            </div>
            <div className="pt-6">
              <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">Monthly Cost</p>
              <h3 className="text-5xl font-black text-foreground">
                ${tenant.monthlyCost || 0}
                <span className="text-lg font-medium text-muted-foreground ml-2">USD</span>
              </h3>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="p-4 bg-background border rounded-2xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Next Renewal Date</span>
                <span className="font-bold">{tenant.subscriptionEndDate ? new Date(tenant.subscriptionEndDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="flex items-center gap-2 font-bold"><CreditCard className="h-4 w-4" /> VISA •••• 4242</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 bg-muted/30 p-6">
            <Button className="flex-1 rounded-full font-black shadow-lg" onClick={() => handleAction('upgrade or change your plan')}>CHANGE PLAN</Button>
            <Button variant="outline" className="flex-1 rounded-full font-bold bg-background border-border" onClick={() => handleAction('update your payment details')}>UPDATE BILLING</Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Resource Usage</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase"><span className="text-muted-foreground">Users</span> <span>12 / 50</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-[24%]" /></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase"><span className="text-muted-foreground">Storage</span> <span>4.2GB / 100GB</span></div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary w-[4%]" /></div>
              </div>
            </CardContent>
          </Card>
          <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 font-bold" onClick={() => handleAction('cancel your subscription')}>CANCEL SUBSCRIPTION</Button>
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="bg-muted/50 border-b"><CardTitle>Billing History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="px-6 font-bold uppercase text-[10px] tracking-widest">Invoice ID</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Date</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Amount</TableHead>
                <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                <TableHead className="text-right px-6 font-bold uppercase text-[10px] tracking-widest">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.id} className="hover:bg-accent/50 transition-colors">
                  <TableCell className="px-6 font-mono font-bold text-primary">{item.id}</TableCell>
                  <TableCell className="text-sm font-medium">{item.date}</TableCell>
                  <TableCell className="text-sm font-bold">{item.amount}</TableCell>
                  <TableCell><Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none font-bold uppercase text-[10px]">{item.status}</Badge></TableCell>
                  <TableCell className="text-right px-6"><Button variant="ghost" size="sm" className="font-bold text-xs"><Download className="h-3.5 w-3.5 mr-2" />PDF</Button></TableCell>
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      <div className="space-y-1">
        <h2 className="text-xl font-bold">White-labeling & Branding</h2>
        <p className="text-sm text-muted-foreground">Customize the interface to match your corporate identity.</p>
      </div>

      <Card className={cn('border-border bg-card/50 transition-all shadow-lg', formData?.enabled && 'ring-2 ring-primary/20')}>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-6">
          <div className="space-y-1">
            <CardTitle className="text-lg">Brand Customization</CardTitle>
            <CardDescription>Enable custom logos and color schemes for your users.</CardDescription>
          </div>
          <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-full border">
            <Label htmlFor="enable-branding" className="text-xs font-black uppercase tracking-widest">Active</Label>
            <Switch id="enable-branding" checked={formData?.enabled} onCheckedChange={(v) => handleInputChange('enabled', v)} />
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Company Name</Label>
              <Input placeholder={tenant.name} value={formData?.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} disabled={!formData?.enabled} className="h-11 rounded-xl bg-background" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform Tagline</Label>
              <Input placeholder="e.g., Campus Support Portal" value={formData?.tagline} onChange={(e) => handleInputChange('tagline', e.target.value)} disabled={!formData?.enabled} className="h-11 rounded-xl bg-background" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Header Logo URL</Label>
            <div className="flex gap-3">
              <Input placeholder="https://example.com/logo.png" value={formData?.logoUrl} onChange={(e) => handleInputChange('logoUrl', e.target.value)} disabled={!formData?.enabled} className="h-11 rounded-xl bg-background flex-1" />
              <Button variant="outline" className="h-11 rounded-xl px-6" disabled={!formData?.enabled}><Upload className="h-4 w-4 mr-2" /> Upload</Button>
            </div>
          </div>
          <div className="space-y-4 p-6 bg-muted/30 rounded-2xl border border-border/50">
            <h3 className="text-sm font-bold flex items-center gap-2"><Palette className="h-4 w-4 text-primary" /> Visual Identity (HSL)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Primary Color</Label>
                <div className="flex gap-2">
                  <div className="w-11 h-11 rounded-xl border shrink-0" style={{ backgroundColor: `hsl(${formData?.primaryColor || '240 5.9% 10%'})` }} />
                  <Input placeholder="240 5.9% 10%" value={formData?.primaryColor} onChange={(e) => handleInputChange('primaryColor', e.target.value)} disabled={!formData?.enabled} className="h-11 rounded-xl bg-background font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Accent Color</Label>
                <div className="flex gap-2">
                  <div className="w-11 h-11 rounded-xl border shrink-0" style={{ backgroundColor: `hsl(${formData?.accentColor || '240 4.8% 95.9%'})` }} />
                  <Input placeholder="240 4.8% 95.9%" value={formData?.accentColor} onChange={(e) => handleInputChange('accentColor', e.target.value)} disabled={!formData?.enabled} className="h-11 rounded-xl bg-background font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground">Background</Label>
                <div className="flex gap-2">
                  <div className="w-11 h-11 rounded-xl border shrink-0" style={{ backgroundColor: `hsl(${formData?.backgroundColor || '0 0% 100%'})` }} />
                  <Input placeholder="0 0% 100%" value={formData?.backgroundColor} onChange={(e) => handleInputChange('backgroundColor', e.target.value)} disabled={!formData?.enabled} className="h-11 rounded-xl bg-background font-mono text-xs" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground italic">Note: Use space-separated HSL values (e.g. "240 5.9% 10%").</p>
          </div>
        </CardContent>
        <CardFooter className="justify-end bg-muted/20 border-t p-4 px-6">
          <Button onClick={handleSave} disabled={isSaving || !formData?.enabled} className="rounded-full px-10 shadow-lg font-black h-11">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} APPLY BRANDING
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
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
      const durationSetting = settingsData.find((s) => s.key === 'engineerSessionDuration');
      if (durationSetting) setDuration(durationSetting.value);

      const prioritySetting = settingsData.find((s) => s.key === 'defaultTicketPriority');
      if (prioritySetting) setDefaultPriority(prioritySetting.value);

      const categorySetting = settingsData.find((s) => s.key === 'defaultTicketCategory');
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
      toast({ title: 'Success', description: 'General preferences updated.' });
      mutate();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">System Preferences</h2>
        <p className="text-sm text-muted-foreground">Default behavior and organizational defaults.</p>
      </div>
      <Card className="glass-card shadow-lg">
        <CardContent className="p-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/30">
            <div className="space-y-1">
              <Label className="text-sm font-bold">Engineer Session Expiry</Label>
              <p className="text-xs text-muted-foreground">Maximum duration for an engineer's authenticated session.</p>
            </div>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger className="w-full md:w-48 h-11 rounded-xl bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={String(1 * 60 * 60)}>1 Hour</SelectItem>
                <SelectItem value={String(4 * 60 * 60)}>4 Hours</SelectItem>
                <SelectItem value={String(8 * 60 * 60)}>8 Hours</SelectItem>
                <SelectItem value={String(12 * 60 * 60)}>12 Hours</SelectItem>
                <SelectItem value={String(24 * 60 * 60)}>24 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Priority</Label>
              <Select value={defaultPriority} onValueChange={setDefaultPriority}>
                <SelectTrigger className="h-11 rounded-xl bg-background border-border font-bold"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Default Category</Label>
              <Input value={defaultCategory} onChange={(e) => setDefaultCategory(e.target.value)} className="h-11 rounded-xl bg-background border-border font-bold" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end bg-muted/20 border-t p-4 px-6">
          <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-10 shadow-lg font-black h-11">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} UPDATE PREFERENCES
          </Button>
        </CardFooter>
      </Card>
    </div>
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
      setSlaPolicies((policies) =>
        policies.map((p) => (p.priority === priority ? { ...p, durationInHours: duration } : p))
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
      toast({ title: 'Policies Updated', description: 'Service Level Agreement targets have been saved.' });
      mutate();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save SLA policies.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Service Level Agreements (SLA)</h2>
        <p className="text-sm text-muted-foreground">Define resolution time targets based on ticket priority.</p>
      </div>
      <Card className="glass-card shadow-lg">
        <CardContent className="p-6 space-y-4">
          {slaPolicies.map((policy) => (
            <div key={policy.priority} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 group hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={cn('w-2.5 h-2.5 rounded-full', policy.priority === 'critical' ? 'bg-destructive' : 'bg-primary')} />
                <span className="font-bold capitalize text-foreground">{policy.priority} Priority Target</span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  className="w-24 h-10 rounded-xl bg-background font-mono text-center font-bold"
                  value={policy.durationInHours}
                  onChange={(e) => handleDurationChange(policy.priority, e.target.value)}
                />
                <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">Hours</span>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="justify-end bg-muted/20 border-t p-4 px-6">
          <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-10 shadow-lg font-black h-11">
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} LOCK IN SLA TARGETS
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function EmailConfigTab() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { data: user, error, mutate: mutateUser } = useSWR<IUser>('/api/users/me', fetcher);
  const [config, setConfig] = useState({
    imapHost: '',
    imapPort: 993,
    imapUser: '',
    imapPassword: '',
    smtpHost: '',
    smtpPort: 465,
    smtpUser: '',
    smtpPassword: '',
  });

  useEffect(() => {
    if (user?.emailConfig) {
      setConfig({
        imapHost: user.emailConfig.imapHost || '',
        imapPort: user.emailConfig.imapPort || 993,
        imapUser: user.emailConfig.imapUser || '',
        imapPassword: '',
        smtpHost: user.emailConfig.smtpHost || '',
        smtpPort: user.emailConfig.smtpPort || 465,
        smtpUser: user.emailConfig.smtpUser || '',
        smtpPassword: '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string | number) => setConfig((prev) => ({ ...prev, [field]: value }));

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
      toast({ title: 'Success', description: 'Mail servers configured successfully.' });
      mutateUser();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: (err as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return <LoadingAnimation />;

  return (
    <form className="space-y-10" onSubmit={handleSave}>
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Incoming Mail (IMAP)</h2>
          <p className="text-sm text-muted-foreground">Configure the connection to your support inbox.</p>
        </div>
        <Card className="glass-card shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">IMAP User</Label>
                <Input value={config.imapUser} onChange={(e) => handleInputChange('imapUser', e.target.value)} placeholder="support@yourdomain.com" className="h-11 rounded-xl bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">App Password</Label>
                <Input type="password" value={config.imapPassword} onChange={(e) => handleInputChange('imapPassword', e.target.value)} placeholder="Leave blank to keep current" className="h-11 rounded-xl bg-background" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Server Host</Label>
                <Input value={config.imapHost} onChange={(e) => handleInputChange('imapHost', e.target.value)} placeholder="imap.gmail.com" className="h-11 rounded-xl bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Port</Label>
                <Input type="number" value={config.imapPort} onChange={(e) => handleInputChange('imapPort', parseInt(e.target.value))} placeholder="993" className="h-11 rounded-xl bg-background font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Outgoing Mail (SMTP)</h2>
          <p className="text-sm text-muted-foreground">Configure the server used to send replies and alerts.</p>
        </div>
        <Card className="glass-card shadow-md">
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">SMTP User</Label>
                <Input value={config.smtpUser} onChange={(e) => handleInputChange('smtpUser', e.target.value)} placeholder="notifications@yourdomain.com" className="h-11 rounded-xl bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">App Password</Label>
                <Input type="password" value={config.smtpPassword} onChange={(e) => handleInputChange('smtpPassword', e.target.value)} placeholder="Leave blank to keep current" className="h-11 rounded-xl bg-background" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Server Host</Label>
                <Input value={config.smtpHost} onChange={(e) => handleInputChange('smtpHost', e.target.value)} placeholder="smtp.gmail.com" className="h-11 rounded-xl bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Port</Label>
                <Input type="number" value={config.smtpPort} onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))} placeholder="465" className="h-11 rounded-xl bg-background font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" className="rounded-full px-8 h-11 font-bold">TEST CONNECTION</Button>
        <Button type="submit" disabled={isSaving} className="rounded-full px-10 shadow-lg font-black h-11">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} SAVE EMAIL CONFIG
        </Button>
      </div>
    </form>
  );
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
    if (signatureData && typeof signatureData.value === 'string') {
      setSignature(signatureData.value);
    }
  }, [signatureData]);

  const handleSave = async (templateData: any) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save template.');
      }
      toast({ title: 'Template Saved', description: 'System notification updated.' });
      mutate();
      setIsDialogOpen(false);
      setSelectedTemplate(null);
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save signature.');
      }
      toast({ title: 'Signature Locked', description: 'Global signature has been updated.' });
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete template');
      }
      toast({ title: 'Success', description: 'Template reset to system default.' });
      mutate();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  if (!templatesData) return <LoadingAnimation />;

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Global Email Signature</h2>
          <p className="text-sm text-muted-foreground">Appended to all outgoing system emails from your organization.</p>
        </div>
        <Card className="glass-card shadow-md">
          <CardContent className="p-6">
            <Textarea value={signature} onChange={(e) => setSignature(e.target.value)} rows={6} className="font-mono text-sm bg-background p-4 rounded-xl border-border" placeholder="--&#10;Network Support, ICT Section&#10;Your University Name..." />
          </CardContent>
          <CardFooter className="justify-end bg-muted/20 border-t p-4 px-6">
            <Button onClick={handleSaveSignature} disabled={isSaving} className="rounded-full px-8 shadow-lg font-black h-11">
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} UPDATE SIGNATURE
            </Button>
          </CardFooter>
        </Card>
      </section>

      <Separator />

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Notification Templates</h2>
            <p className="text-sm text-muted-foreground">Customize the content of automated system notifications.</p>
          </div>
          <Button onClick={() => { setSelectedTemplate(null); setIsDialogOpen(true); }} className="rounded-full shadow-lg h-11 px-6 font-black"><Plus className="h-4 w-4 mr-2" /> ADD TEMPLATE</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template: any) => (
            <Card key={template.key} className="bg-card border-border hover:border-primary/30 transition-all group overflow-hidden shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-bold text-sm text-foreground">{template.value.name || template.key}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{template.value.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-all" onClick={() => { setSelectedTemplate(template); setIsDialogOpen(true); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" onClick={() => handleDelete(template.key)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {templates.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-16 border-2 border-dashed rounded-3xl bg-muted/20">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-xs">No custom templates defined</p>
            </div>
          )}
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl rounded-3xl overflow-hidden border-border bg-card">
          <DialogHeader className="bg-muted/50 p-6 border-b">
            <DialogTitle className="text-xl font-black">{selectedTemplate ? 'Modify' : 'Initialize'} Notification Template</DialogTitle>
            <DialogDescription>Define logic and variables for this system event.</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <TemplateForm template={selectedTemplate} onSave={handleSave} isSaving={isSaving} onClose={() => setIsDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TemplateForm({ template, onSave, isSaving, onClose }: { template?: any; onSave: (data: any) => void; isSaving: boolean; onClose: () => void }) {
  const { data: currentUser } = useSWR<IUser>('/api/users/me', fetcher);
  const getShortKey = (fullKey?: string) => (fullKey && currentUser?.tenant ? fullKey.replace(`tenant_${currentUser.tenant}_`, '') : '');

  const [key, setKey] = useState(getShortKey(template?.key));
  const [name, setName] = useState(template?.value.name || '');
  const [description, setDescription] = useState(template?.value.description || '');
  const [subject, setSubject] = useState(template?.value.subject || '');
  const [body, setBody] = useState(template?.value.body || '');
  const [cc, setCc] = useState(template?.value.cc || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ key, value: { name, description, subject, body, cc } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-sidebar-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Logic Identifier (Key)</Label>
          <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g., ticketResolved" required disabled={!!template} className="h-11 rounded-xl bg-background" />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Display Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Ticket Resolution Email" required className="h-11 rounded-xl bg-background" />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Subject Line</Label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ticket {{complaint.id}} has been resolved" required className="h-11 rounded-xl bg-background font-bold" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Static CC List</Label>
        <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="manager@company.com, support-archive@company.com" className="h-11 rounded-xl bg-background font-mono text-xs" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest">Template Body (Markdown/Text)</Label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className="font-mono text-xs bg-background p-4 rounded-xl" placeholder="Dear {{user.name}}, your ticket is closed..." />
        <div className="p-4 mt-4 bg-muted/50 rounded-2xl border border-border/50">
          <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mb-2 text-primary">
            <Info className="h-3 w-3" /> System Variables
          </p>
          <div className="flex flex-wrap gap-2">
            {['user.name', 'user.email', 'complaint.id', 'complaint.title', 'complaint.status', 'password'].map((v) => (
              <code key={v} className="bg-background px-2 py-1 rounded text-[10px] border border-border">
                {`{{${v}}}`}
              </code>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-card pb-2">
        <Button variant="ghost" type="button" onClick={onClose} className="rounded-full px-8 font-bold">Discard</Button>
        <Button type="submit" disabled={isSaving} className="rounded-full px-10 shadow-xl font-black h-11">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} {template ? 'COMMIT CHANGES' : 'CREATE TEMPLATE'}
        </Button>
      </div>
    </form>
  );
}

function UsersTab({ currentUser }: { currentUser?: IUser }) {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const { data: users, error, isLoading, mutate: mutateUsers } = useSWR<IUser[]>(currentUser?.role === 'admin' || currentUser?.role === 'super-admin' ? '/api/users' : null, fetcher);
  const { toast } = useToast();
  const getRoleInfo = (roleId: string) => roles.find((r) => r.id === roleId);

  const handleAddUser = async (formData: any) => {
    try {
      const response = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }
      mutateUsers();
      setIsAddUserDialogOpen(false);
      toast({ title: 'User Identity Initialized', description: `Team member ${formData.name} has been provisioned.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleUpdateUser = async (userId: string, formData: any) => {
    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }
      mutateUsers();
      setSelectedUser(null);
      toast({ title: 'Success', description: `User profile updated.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    }
  };

  const handleDeleteUser = async (user: IUser) => {
    if (window.confirm(`Are you sure you want to delete user ${user.name}? This action is irreversible.`)) {
      try {
        const response = await fetch(`/api/users/${user._id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete user');
        }
        mutateUsers();
        toast({ title: 'Access Revoked', description: `User ${user.name} has been removed from the organization.` });
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold">Organization Roster</h2>
          <p className="text-sm text-muted-foreground">Manage identities and workspace access for your team.</p>
        </div>
        <Button onClick={() => setIsAddUserDialogOpen(true)} className="rounded-full shadow-lg h-11 px-6 font-black"><UserPlus className="h-4 w-4 mr-2" /> ADD MEMBER</Button>
      </div>

      <Card className="glass-card shadow-lg overflow-hidden border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50 border-b">
                <TableRow>
                  <TableHead className="px-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Identity</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Functional Role</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Account Status</TableHead>
                  <TableHead className="text-right px-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center"><LoadingAnimation /></TableCell>
                  </TableRow>
                )}
                {users?.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <TableRow key={user._id} className="hover:bg-accent/30 transition-colors border-border/50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 ring-2 ring-background shadow-md">
                            <AvatarImage src={user.avatar || `https://avatar.vercel.sh/${user.name}.png`} />
                            <AvatarFallback className="bg-muted text-foreground font-bold">{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className={cn('w-2 h-2 rounded-full', roleInfo?.color)} />
                          <span className="text-xs font-black uppercase tracking-tighter text-foreground">{roleInfo?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-none">{user.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right px-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => setSelectedUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(user)} disabled={currentUser?._id === user._id}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card shadow-2xl">
          <DialogHeader className="p-2">
            <DialogTitle className="text-xl font-black uppercase tracking-widest">Provision Member</DialogTitle>
            <DialogDescription>Initialize a new system identity for your organization.</DialogDescription>
          </DialogHeader>
          <AddUserForm onClose={() => setIsAddUserDialogOpen(false)} onSubmit={handleAddUser} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card shadow-2xl">
          <DialogHeader className="p-2">
            <DialogTitle className="text-xl font-black uppercase tracking-widest">Modify Member Profile</DialogTitle>
            <DialogDescription>Update permissions or status for this identity.</DialogDescription>
          </DialogHeader>
          {selectedUser && <EditUserForm user={selectedUser} onClose={() => setSelectedUser(null)} onSubmit={handleUpdateUser} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RolesTab({ currentUser }: { currentUser?: IUser }) {
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const { data: users } = useSWR<IUser[]>('/api/users', fetcher);
  const displayedRoles = currentUser?.role === 'super-admin' ? roles : roles.filter((role) => role.id !== 'super-admin' && role.id !== 'micro-admin' && role.id !== 'nano-admin');

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Functional Permissions</h2>
        <p className="text-sm text-muted-foreground">Review decision boundaries and access levels for each organizational role.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedRoles.map((role) => {
          const RoleIcon = role.icon;
          const userCount = users?.filter((u) => u.role === role.id).length || 0;
          return (
            <Card key={role.id} className="bg-card border-border hover:border-primary/20 transition-all group flex flex-col shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg', role.color)}>
                      <RoleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{userCount} ACTIVE IDENTITIES</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full group-hover:bg-background transition-all" onClick={() => { setSelectedRole(role); setIsEditRoleDialogOpen(true); }} disabled={role.id !== 'engineer'}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{role.description}</p>
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Authority Scope:</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions && role.permissions.includes('all') ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg px-3 py-1 font-bold">FULL SYSTEM ACCESS</Badge>
                    ) : (
                      role.permissions?.map((permId: string) => (
                        <Badge key={permId} variant="outline" className="text-[10px] px-2 py-0.5 rounded-lg font-bold border-border bg-background uppercase tracking-tighter">
                          {permissions.find((p) => p.id === permId)?.name || permId}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-border bg-card shadow-2xl">
          <DialogHeader className="p-2">
            <DialogTitle className="text-xl font-black uppercase tracking-widest">Adjust Authority: {selectedRole?.name}</DialogTitle>
            <DialogDescription>Modify granular permissions for this role across the tenant ecosystem.</DialogDescription>
          </DialogHeader>
          {selectedRole && <EditRoleForm role={selectedRole} onClose={() => setIsEditRoleDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SecurityTab() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const { data: signupSetting, mutate } = useSWR('/api/settings?key=signupEnabled', fetcher);
  const [isSignupEnabled, setIsSignupEnabled] = useState(true);

  useEffect(() => {
    if (signupSetting) setIsSignupEnabled(signupSetting.value);
  }, [signupSetting]);

  const handleSignupToggle = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: 'signupEnabled', value: enabled }) });
      toast({ title: 'Security Protocol Updated', description: `Public sign-up gateway has been ${enabled ? 'opened' : 'closed'}.` });
      setIsSignupEnabled(enabled);
      mutate();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update setting.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Platform-wide Security</h2>
        <p className="text-sm text-muted-foreground">Manage global access policies and authentication guardrails.</p>
      </div>
      <Card className="glass-card shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/30 border border-border/50">
            <div className="space-y-1">
              <p className="font-bold text-lg">Public Sign-up Gateway</p>
              <p className="text-sm text-muted-foreground">Allow new visitors to initialize trial environments directly from the landing page.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isSignupEnabled ? 'default' : 'secondary'} className={cn('font-black uppercase text-[10px] px-3', isSignupEnabled ? 'bg-green-500' : '')}>
                {isSignupEnabled ? 'OPEN' : 'RESTRICTED'}
              </Badge>
              <Switch checked={isSignupEnabled} onCheckedChange={handleSignupToggle} disabled={isSaving} className="data-[state=checked]:bg-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SupportTab() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 1500));
      toast({ title: 'Intelligence Dispatched', description: 'Our technical strategist will review your report shortly.' });
      setSubject('');
      setDescription('');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Platform Intelligence & Support</h2>
        <p className="text-sm text-muted-foreground">Encountered an anomaly or need system-level assistance?</p>
      </div>
      <Card className="glass-card shadow-2xl border-primary/20 overflow-hidden">
        <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
              <LifeBuoy className="h-7 w-7 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black">Open Support Channel</CardTitle>
              <CardDescription className="text-foreground/70 font-medium">Direct line to Vynsec Creations core developers.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="support-subject" className="text-xs font-black uppercase text-primary tracking-[0.2em]">Subject of Inquiry</Label>
              <Input id="support-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Performance anomaly in analytics engine" required className="h-12 rounded-xl bg-background border-border shadow-sm font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support-description" className="text-xs font-black uppercase text-primary tracking-[0.2em]">Situational Description</Label>
              <Textarea id="support-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide full context, including steps to reproduce or billing reference numbers..." rows={10} required className="rounded-xl bg-background border-border p-4 font-medium" />
            </div>
          </CardContent>
          <CardFooter className="justify-end bg-muted/30 py-6 px-8 border-t">
            <Button type="submit" disabled={isSubmitting} className="rounded-full px-12 h-12 shadow-2xl shadow-primary/30 font-black tracking-tight text-lg">
              {isSubmitting ? <Loader2 className="h-5 w-5 mr-3 animate-spin" /> : <Send className="h-5 w-5 mr-3" />}
              DISPATCH TICKET
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function AddUserForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'engineer', status: 'active' });
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit({ ...formData, password: generateTemporaryPassword(), sendEmail: sendEmail });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-border" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Corporate Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-border" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">functional Designation</Label>
        <Select value={formData.role} onValueChange={(v) => handleInputChange('role', v)}>
          <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border bg-card shadow-2xl">
            {roles
              .filter((r) => !['super-admin', 'micro-admin', 'nano-admin'].includes(r.id))
              .map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', role.color)} />
                    {role.name}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
        <div className="space-y-0.5">
          <p className="text-sm font-bold">Auto-Onboard Dispatch</p>
          <p className="text-[10px] text-muted-foreground">Email secure welcome credentials immediately.</p>
        </div>
        <Switch id="sendEmail" checked={sendEmail} onCheckedChange={setSendEmail} />
      </div>
      <DialogFooter className="pt-4 gap-2">
        <Button variant="ghost" type="button" onClick={onClose} className="rounded-full px-6 font-bold">Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="rounded-full px-8 shadow-xl font-black">
          {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
          PROVISION MEMBER
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditUserForm({ user, onClose, onSubmit }: { user: IUser; onClose: () => void; onSubmit: (userId: string, data: any) => Promise<void> }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: user.name, email: user.email, role: user.role, status: user.status });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleInputChange = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(user._id, formData);
    setIsSubmitting(false);
  };

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(`/api/users/${user._id}/reset-password`, { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email.');
      }
      toast({ title: 'Identity Reset', description: `New secure credentials dispatched to ${user.email}.` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-border font-bold" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Corporate Email</Label>
        <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} required className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-border" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">functional Designation</Label>
          <Select value={formData.role} onValueChange={(v) => handleInputChange('role', v)}>
            <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-border font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-card shadow-2xl">
              {roles
                .filter((r) => !['super-admin', 'micro-admin', 'nano-admin'].includes(r.id))
                .map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', role.color)} />
                      {role.name}
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity Status</Label>
          <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
            <SelectTrigger className="h-11 rounded-xl bg-muted/50 border-none ring-1 ring-border font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-border bg-card shadow-2xl">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter className="pt-6 sm:justify-between flex-col-reverse sm:flex-row gap-3 border-t">
        <Button variant="outline" type="button" onClick={handleResetPassword} disabled={isResetting} className="rounded-full border-primary/30 text-primary hover:bg-primary/5">
          {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />} RESET PASSWORD
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" type="button" onClick={onClose} className="rounded-full font-bold">Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="rounded-full px-8 shadow-xl font-black">
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} SAVE MEMBER
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
}

function EditRoleForm({ role, onClose }: { role: any; onClose: () => void }) {
  const { data: tenant, mutate } = useSWR<ITenant>('/api/tenants/me', fetcher);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (tenant?.permissions?.engineer) setSelectedPermissions(tenant.permissions.engineer);
    else setSelectedPermissions(roles.find((r) => r.id === 'engineer')?.permissions || []);
  }, [tenant]);

  const handlePermissionChange = (permId: string, checked: boolean) => setSelectedPermissions((prev) => (checked ? [...prev, permId] : prev.filter((p) => p !== permId)));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/tenants/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: { engineer: selectedPermissions } }),
      });
      toast({ title: 'Policies Updated', description: 'Engineer decision boundaries have been recalibrated.' });
      mutate();
      onClose();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const engineerPermissions = permissions.filter((p) => p.id !== 'users:manage' && p.id !== 'settings:tenant');

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground">Identity Handle</Label>
          <Input defaultValue={role.name} disabled className="h-11 rounded-xl bg-muted border-none ring-1 ring-border font-bold" />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase text-muted-foreground">Primary Directive</Label>
          <Input defaultValue={role.description} disabled className="h-11 rounded-xl bg-muted border-none ring-1 ring-border" />
        </div>
      </div>
      <div className="space-y-3">
        <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Enabled Action Capabilites</Label>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-sidebar-scrollbar border rounded-2xl p-4 bg-muted/20">
          {engineerPermissions.map((permission) => (
            <div key={permission.id} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border/50 group hover:border-primary/30 transition-all">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">{permission.name}</p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{permission.id}</p>
              </div>
              <Checkbox checked={selectedPermissions.includes(permission.id)} onCheckedChange={(checked) => handlePermissionChange(permission.id, !!checked)} className="h-5 w-5 rounded-md" />
            </div>
          ))}
        </div>
      </div>
      <DialogFooter className="pt-6 border-t">
        <Button variant="ghost" onClick={onClose} className="rounded-full px-8 font-bold">Discard</Button>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-10 shadow-xl font-black h-11">
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} UPDATE ROLE AUTHORITY
        </Button>
      </DialogFooter>
    </div>
  );
}

'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function SettingsPage() {
  const [email, setEmail] = useState('john@example.com');
  const [name, setName] = useState('John Doe');
  const [timezone, setTimezone] = useState('UTC');
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                      <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="IST">IST (Indian Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {saved && (
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle className="h-5 w-5" />
                      <span className="text-sm">Changes saved successfully</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">In-App Notifications</h4>
                    <p className="text-sm text-muted-foreground">Receive notifications within the application</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Alerts</h4>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>

                <div className="pt-4 border-t space-y-4">
                  <h4 className="font-medium">Email Notification Types</h4>
                  <div className="space-y-3">
                    {['New Tickets', 'Remote Support Requests', 'Team Updates', 'System Alerts'].map((type) => (
                      <div key={type} className="flex items-center gap-3">
                        <input type="checkbox" id={type} defaultChecked className="h-4 w-4" />
                        <Label htmlFor={type} className="font-normal cursor-pointer">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    Keep your account secure by regularly updating your password and enabling two-factor authentication.
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Change Password</Label>
                  <Button variant="outline" className="w-full">
                    Update Password
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Two-Factor Authentication</Label>
                  <Button variant="outline" className="w-full">
                    Enable Two-Factor Authentication
                  </Button>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Active Sessions</h4>
                  <div className="space-y-3">
                    {['Chrome on Windows', 'Safari on iPhone', 'Chrome on Mac'].map((session) => (
                      <div key={session} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{session}</p>
                          <p className="text-xs text-muted-foreground">Last active 2 hours ago</p>
                        </div>
                        <Button variant="ghost" size="sm">Sign Out</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

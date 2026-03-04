import { getSession } from '@/app/lib/session';
import { redirect } from 'next/navigation';
import { SuperAdminDashboard } from '@/app/components/dashboards/super-admin-dashboard';
import { TenantAdminDashboard } from '@/app/components/dashboards/tenant-admin-dashboard';
import { HODDashboard } from '@/app/components/dashboards/hod-dashboard';

export const metadata = {
  title: 'Admin Dashboard | Nexus',
  description: 'Manage your organization and team',
};

export default async function AdminPage(req: any) {
  const session = await getSession(req);

  // Redirect unauthenticated users
  if (!session) {
    redirect('/login');
  }

  // Redirect non-admin users
  const allowedRoles = ['super-admin', 'admin', 'tenant-admin', 'hod'];
  if (!allowedRoles.includes(session.role)) {
    redirect('/dashboard');
  }

  // Render appropriate dashboard based on role
  if (session.role === 'super-admin') {
    return <SuperAdminDashboard />;
  }

  if (session.role === 'admin' || session.role === 'tenant-admin') {
    return <TenantAdminDashboard />;
  }

  if (session.role === 'hod') {
    return <HODDashboard />;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground mt-2">
        Your role does not have access to admin features.
      </p>
    </div>
  );
}

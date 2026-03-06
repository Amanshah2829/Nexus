"use client";

import * as React from "react";
import useSWR from 'swr';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { OfflineIndicator } from "@/components/offline-indicator";
import { PWAInstallProvider } from "@/components/pwa-install-provider";
import { PWAInstallDialog } from "@/components/pwa-install-dialog";
import { Analytics } from "@vercel/analytics/react";
import { ITenant } from "./models/Tenant";
import { IUser } from "./models/User";
import { TenantStatusOverlay } from "@/components/tenant-status-overlay";

const fetcher = (url: string) => fetch(url).then(res => res.json());

function DynamicBranding() {
    const { data: user } = useSWR<IUser>('/api/users/me', fetcher);
    const { data: tenant } = useSWR<ITenant>(user?.tenant ? `/api/tenants/${user.tenant}` : null, fetcher);
    
    React.useEffect(() => {
        const root = document.documentElement;
        if (tenant?.branding?.enabled) {
            if (tenant.branding.backgroundColor) {
                root.style.setProperty('--background', tenant.branding.backgroundColor);
                root.style.setProperty('--card', tenant.branding.backgroundColor);
                root.style.setProperty('--popover', tenant.branding.backgroundColor);
                
                const [h, s, l] = tenant.branding.backgroundColor.split(' ').map(v => parseFloat(v));
                if (l < 50) {
                    root.style.setProperty('--foreground', '210 40% 98%');
                    root.style.setProperty('--card-foreground', '210 40% 98%');
                    root.style.setProperty('--border', '240 3.7% 15.9%');
                    root.style.setProperty('--primary-foreground', '222.2 84% 4.9%');
                } else {
                    root.style.setProperty('--foreground', '222.2 84% 4.9%');
                    root.style.setProperty('--card-foreground', '222.2 84% 4.9%');
                    root.style.setProperty('--border', '214.3 31.8% 91.4%');
                    root.style.setProperty('--primary-foreground', '210 40% 98%');
                }
            }
            if (tenant.branding.primaryColor) {
                root.style.setProperty('--primary', tenant.branding.primaryColor);
            }
            if (tenant.branding.accentColor) root.style.setProperty('--accent', tenant.branding.accentColor);
        } else {
             root.style.removeProperty('--background');
             root.style.removeProperty('--card');
             root.style.removeProperty('--popover');
             root.style.removeProperty('--foreground');
             root.style.removeProperty('--card-foreground');
             root.style.removeProperty('--border');
             root.style.removeProperty('--primary');
             root.style.removeProperty('--accent');
             root.style.removeProperty('--primary-foreground');
        }
    }, [tenant]);

    return null;
}

function TenantStatusChecker() {
    const { data: user } = useSWR<IUser>('/api/users/me', fetcher);
    const { data: tenant, error, isLoading } = useSWR<ITenant>(user?.tenant ? `/api/tenants/me` : null, fetcher, {
        revalidateOnFocus: true,
        revalidateIfStale: true,
    });

    if (!user || ['super-admin', 'sales', 'micro-admin', 'nano-admin'].includes(user.role)) {
        return null;
    }

    if (!user.tenant) {
        return null;
    }

    if (isLoading) {
        return null;
    }
    
    if (error) {
        return null;
    }

    if (tenant && tenant.status !== 'active') {
        return <TenantStatusOverlay status={tenant.status} subscriptionStatus={tenant.subscriptionStatus} />;
    }

    return null;
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PWAInstallProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <DynamicBranding />
        {children}
        <TenantStatusChecker />
        <OfflineIndicator />
        <Toaster />
        <PWAInstallDialog />
        <Analytics />
      </ThemeProvider>
    </PWAInstallProvider>
  );
}


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
            if (tenant.branding.backgroundColor) root.style.setProperty('--background', tenant.branding.backgroundColor);
            if (tenant.branding.primaryColor) root.style.setProperty('--primary', tenant.branding.primaryColor);
            if (tenant.branding.accentColor) root.style.setProperty('--accent', tenant.branding.accentColor);
        } else {
            // Reset to default if branding is disabled or not present
             root.style.removeProperty('--background');
             root.style.removeProperty('--primary');
             root.style.removeProperty('--accent');
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

    // Don't block super admins or other global roles
    if (!user || ['super-admin', 'sales', 'micro-admin', 'nano-admin'].includes(user.role)) {
        return null;
    }

    // Don't block users without a tenant (should only be super admins, but as a safeguard)
    if (!user.tenant) {
        return null;
    }

    if (isLoading) {
        return null; // Don't show overlay during initial load
    }
    
    // Don't show if there's a network error fetching tenant status
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

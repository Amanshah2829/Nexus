
"use client";

import { ShieldAlert, LifeBuoy } from "lucide-react";
import { Button } from "./ui/button";
import { ITenant } from "@/models/Tenant";

interface TenantStatusOverlayProps {
    status: ITenant['status'];
    subscriptionStatus: ITenant['subscriptionStatus'];
}

export function TenantStatusOverlay({ status, subscriptionStatus }: TenantStatusOverlayProps) {
    let title = "Organization Restricted";
    let description = "Your organization's account does not currently have active access to the platform. For assistance, please contact your organization's administrator or reach out to our support team.";

    if (status === 'inactive') {
        title = "Organization Account Inactive";
        description = "Your organization's subscription may have expired or is currently inactive. Please contact your account administrator to renew the subscription or contact our support team for assistance.";
    }
    
    if (status === 'suspended') {
        title = "Organization Account Suspended";
        description = "This account has been suspended due to a policy violation or billing issue. Please contact our support team immediately to resolve this matter.";
    }

    // Special case for expired trial
    if (subscriptionStatus === 'trialing' && status === 'inactive') {
        title = "Your Trial Has Expired";
        description = "Thank you for trying Vynsec Nexus! Your 30-day free trial has ended. To continue using our platform and retain your data, please upgrade to a paid plan.";
    }

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-lg mx-auto">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                    <ShieldAlert className="h-10 w-10 text-destructive" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                    {title}
                </h1>
                <p className="text-muted-foreground">
                    {description}
                </p>
                <Button onClick={() => window.location.href = 'mailto:support@vynsec.com'}>
                    <LifeBuoy className="h-4 w-4 mr-2" />
                    Contact Support
                </Button>
            </div>
        </div>
    );
}

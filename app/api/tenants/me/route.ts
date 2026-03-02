
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Tenant from '@/app/models/Tenant';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

// Get the current user's tenant details
export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session || !session.tenant) {
            return NextResponse.json({ message: 'Unauthorized or no tenant found' }, { status: 403 });
        }
        await dbConnect();
        const tenant = await Tenant.findById(session.tenant);
        if (!tenant) {
            return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
        }
        return NextResponse.json(tenant);
    } catch (error) {
        console.error('Failed to fetch tenant:', error);
        return NextResponse.json({ message: 'Failed to fetch tenant' }, { status: 500 });
    }
}

// Update the current user's tenant details
export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session || !session.tenant || session.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        
        await dbConnect();
        const body = await request.json();

        // Prevent non-super-admins from changing subscription details if they are in the body
        if (session.role !== 'super-admin') {
            delete body.subscriptionPlan;
            delete body.subscriptionStatus;
            delete body.monthlyCost;
            delete body.subscriptionStartDate;
            delete body.subscriptionEndDate;
            delete body.status;
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(session.tenant, body, { new: true });

        if (!updatedTenant) {
            return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTenant);

    } catch (error: any) {
        console.error('Failed to update tenant:', error);
        return NextResponse.json({ message: 'Failed to update tenant', details: error.toString() }, { status: 500 });
    }
}

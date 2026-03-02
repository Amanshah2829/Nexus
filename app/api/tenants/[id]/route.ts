
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Tenant from '@/app/models/Tenant';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

// Get a single tenant's details
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Allow super-admin to see any tenant, or any user to see their own tenant.
        if (session.role !== 'super-admin' && session.tenant !== params.id) {
             return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await dbConnect();
        const tenant = await Tenant.findById(params.id);
        if (!tenant) {
            return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
        }
        return NextResponse.json(tenant);
    } catch (error) {
        console.error('Failed to fetch tenant:', error);
        return NextResponse.json({ message: 'Failed to fetch tenant' }, { status: 500 });
    }
}

// Update a tenant's details
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        // Allow super-admin or an admin of that specific tenant
        if (!session || (session.role !== 'super-admin' && (session.role !== 'admin' || session.tenant !== params.id))) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        
        await dbConnect();
        const body = await request.json();

        // Only super-admin can change subscription details
        if (session.role !== 'super-admin') {
            delete body.subscriptionPlan;
            delete body.subscriptionStatus;
            delete body.monthlyCost;
            delete body.subscriptionStartDate;
            delete body.subscriptionEndDate;
            delete body.status;
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(params.id, body, { new: true });

        if (!updatedTenant) {
            return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTenant);

    } catch (error: any) {
        console.error('Failed to update tenant:', error);
        return NextResponse.json({ message: 'Failed to update tenant', details: error.toString() }, { status: 500 });
    }
}

// Delete a tenant
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        if (!session || session.role !== 'super-admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const deletedTenant = await Tenant.findByIdAndDelete(params.id);
        if (!deletedTenant) {
            return NextResponse.json({ message: 'Tenant not found' }, { status: 404 });
        }
        // Also need to handle deleting associated users, complaints, etc.
        // This is a destructive action and should be handled with care.
        return NextResponse.json({ message: 'Tenant deleted successfully' });
    } catch (error: any) {
        console.error('Failed to delete tenant:', error);
        return NextResponse.json({ message: 'Failed to delete tenant', details: error.toString() }, { status: 500 });
    }
}


import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Tenant from '@/app/models/Tenant';
import User from '@/app/models/User';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

// Get all tenants
export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        
        // Explicitly check for super-admin role.
        if (!session || session.role !== 'super-admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        
        await dbConnect();
        const tenants = await Tenant.find({}).sort({ createdAt: -1 });
        return NextResponse.json(tenants);

    } catch (error: any) {
        console.error('Failed to fetch tenants:', error);
        return NextResponse.json({ message: 'Failed to fetch tenants', details: error.toString() }, { status: 500 });
    }
}

// Create a new tenant and its first admin user
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession(request);
        if (!session || session.role !== 'super-admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        
        const { tenantName, adminName, adminEmail, adminPassword } = await request.json();

        if (!tenantName || !adminName || !adminEmail || !adminPassword) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Create the new tenant
        const newTenant = new Tenant({
            name: tenantName,
            status: 'active',
            subscriptionPlan: 'trial',
            subscriptionStatus: 'trialing'
        });
        await newTenant.save();

        // Create the admin user for this tenant
        const newUser = new User({
            name: adminName,
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            status: 'active',
            tenant: newTenant._id,
        });
        await newUser.save(); // This will trigger the pre-save hook to hash the password

        const userObject = newUser.toObject();
        delete userObject.password;


        return NextResponse.json({
            message: 'Tenant and admin user created successfully',
            tenant: newTenant,
            user: userObject,
        }, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ message: 'A tenant or user with this name/email already exists' }, { status: 409 });
        }
        console.error('Failed to create tenant:', error);
        return NextResponse.json({ message: 'Failed to create tenant', details: error.toString() }, { status: 500 });
    }
}

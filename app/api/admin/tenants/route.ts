import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/app/lib/session';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import Tenant from '@/app/models/Tenant';

/**
 * GET /api/admin/tenants
 * Retrieve all tenants (super-admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    // Only super-admin can access
    if (!session || session.role !== 'super-admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Super-admin access required.' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Fetch all tenants with aggregated data
    const tenants = await Tenant.find({})
      .select('-apiKey -secrets')
      .lean()
      .exec();

    // Enrich with user and complaint counts
    const enrichedTenants = await Promise.all(
      tenants.map(async (tenant) => {
        const usersCount = await User.countDocuments({ tenant: tenant._id });

        return {
          id: tenant._id.toString(),
          name: tenant.name,
          email: tenant.email,
          status: tenant.status || 'active',
          createdAt: tenant.createdAt,
          usersCount,
          complaintsCount: 0, // This would come from Complaint model
          subscriptionTier: tenant.subscriptionTier || 'free',
          storageUsed: 0,
          storageLimit: 10240, // 10GB default
        };
      })
    );

    return NextResponse.json(enrichedTenants);
  } catch (error) {
    console.error('[Admin API] Error fetching tenants:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tenants' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tenants
 * Create a new tenant (super-admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || session.role !== 'super-admin') {
      return NextResponse.json(
        { message: 'Unauthorized. Super-admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    await dbConnect();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({ email: body.email });
    if (existingTenant) {
      return NextResponse.json(
        { message: 'Tenant with this email already exists' },
        { status: 409 }
      );
    }

    // Create new tenant
    const newTenant = new Tenant({
      name: body.name,
      email: body.email,
      status: 'active',
      subscriptionTier: body.subscriptionTier || 'free',
    });

    await newTenant.save();

    return NextResponse.json(
      {
        id: newTenant._id.toString(),
        name: newTenant.name,
        email: newTenant.email,
        status: newTenant.status,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin API] Error creating tenant:', error);
    return NextResponse.json(
      { message: 'Failed to create tenant' },
      { status: 500 }
    );
  }
}

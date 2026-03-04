import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/app/lib/session';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';

/**
 * GET /api/admin/team-members
 * Retrieve all team members for tenant (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    // Verify user is admin or tenant-admin
    if (!session || !['admin', 'tenant-admin'].includes(session.role)) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Fetch team members for this tenant
    const members = await User.find({
      tenant: session.tenant,
    })
      .select('-password -resetToken -verificationToken -apiKeys')
      .lean()
      .exec();

    const formattedMembers = members.map((member) => ({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      status: member.isActive ? 'active' : 'inactive',
      joinedAt: member.createdAt,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('[Admin API] Error fetching team members:', error);
    return NextResponse.json(
      { message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/team-members/invite
 * Invite a new team member
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !['admin', 'tenant-admin'].includes(session.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { message: 'Email and role are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      email,
      tenant: session.tenant,
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists in this organization' },
        { status: 409 }
      );
    }

    // Create pending user (invitation)
    const newUser = new User({
      email,
      name: email.split('@')[0],
      role,
      tenant: session.tenant,
      isActive: false, // User becomes active after accepting invitation
      emailVerified: false,
    });

    await newUser.save();

    // TODO: Send invitation email

    return NextResponse.json(
      {
        id: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
        status: 'invited',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin API] Error inviting team member:', error);
    return NextResponse.json(
      { message: 'Failed to invite team member' },
      { status: 500 }
    );
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/app/lib/session';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';

/**
 * GET /api/admin/team-members/[id]
 * Get team member details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request);

    if (!session || !['admin', 'tenant-admin'].includes(session.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();

    const member = await User.findOne({
      _id: params.id,
      tenant: session.tenant,
    })
      .select('-password -resetToken -verificationToken')
      .lean()
      .exec();

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      status: member.isActive ? 'active' : 'inactive',
      joinedAt: member.createdAt,
    });
  } catch (error) {
    console.error('[Admin API] Error fetching team member:', error);
    return NextResponse.json(
      { message: 'Failed to fetch team member' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/team-members/[id]
 * Update team member
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request);

    if (!session || !['admin', 'tenant-admin'].includes(session.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    await dbConnect();

    const member = await User.findOneAndUpdate(
      {
        _id: params.id,
        tenant: session.tenant,
      },
      {
        ...(body.role && { role: body.role }),
        ...(body.department && { department: body.department }),
        ...(typeof body.isActive !== 'undefined' && { isActive: body.isActive }),
      },
      { new: true }
    )
      .select('-password -resetToken -verificationToken')
      .lean()
      .exec();

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: member._id.toString(),
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      status: member.isActive ? 'active' : 'inactive',
      joinedAt: member.createdAt,
    });
  } catch (error) {
    console.error('[Admin API] Error updating team member:', error);
    return NextResponse.json(
      { message: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/team-members/[id]
 * Remove team member
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(request);

    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can remove team members' },
        { status: 403 }
      );
    }

    await dbConnect();

    const member = await User.findOneAndDelete({
      _id: params.id,
      tenant: session.tenant,
    });

    if (!member) {
      return NextResponse.json({ message: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Team member removed successfully' });
  } catch (error) {
    console.error('[Admin API] Error deleting team member:', error);
    return NextResponse.json(
      { message: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}

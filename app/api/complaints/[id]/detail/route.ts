import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import { getSession } from '@/app/lib/session';
import { NotFoundError } from '@/app/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const complaint = await Complaint.findOne({
      $or: [
        { _id: params.id },
        { id: params.id },
        { ticketNumber: params.id },
      ],
      ...(session.role !== 'super-admin' && { tenant: session.tenant }),
    }).populate('assignedTo', 'name avatar email');

    if (!complaint) {
      return NextResponse.json(
        { message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint);
  } catch (error: any) {
    console.error('Failed to fetch complaint detail:', error);
    return NextResponse.json(
      { message: 'Failed to fetch complaint', details: error.toString() },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const complaint = await Complaint.findOneAndUpdate(
      {
        $or: [
          { _id: params.id },
          { id: params.id },
          { ticketNumber: params.id },
        ],
        ...(session.role !== 'super-admin' && { tenant: session.tenant }),
      },
      {
        ...body,
        updatedAt: new Date(),
        $push: {
          history: {
            action: body.action || 'Updated',
            user: session.userId,
            timestamp: new Date(),
            changes: body.changes,
          },
        },
      },
      { new: true }
    ).populate('assignedTo', 'name avatar email');

    if (!complaint) {
      return NextResponse.json(
        { message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint);
  } catch (error: any) {
    console.error('Failed to update complaint:', error);
    return NextResponse.json(
      { message: 'Failed to update complaint', details: error.toString() },
      { status: 500 }
    );
  }
}

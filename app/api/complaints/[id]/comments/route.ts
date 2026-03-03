import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import { getSession } from '@/app/lib/session';

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
    });

    if (!complaint) {
      return NextResponse.json(
        { message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(complaint.comments || []);
  } catch (error: any) {
    console.error('Failed to fetch comments:', error);
    return NextResponse.json(
      { message: 'Failed to fetch comments', details: error.toString() },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { message: 'Comment text cannot be empty' },
        { status: 400 }
      );
    }

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
        $push: {
          comments: {
            author: session.userId,
            text: text.trim(),
            createdAt: new Date(),
          },
        },
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!complaint) {
      return NextResponse.json(
        { message: 'Complaint not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      complaint.comments[complaint.comments.length - 1],
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Failed to create comment:', error);
    return NextResponse.json(
      { message: 'Failed to create comment', details: error.toString() },
      { status: 500 }
    );
  }
}

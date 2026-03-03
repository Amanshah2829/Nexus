import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import { getSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Mock notifications - in production, fetch from database
    const notifications = [
      {
        id: '1',
        type: 'remote-request',
        title: 'Remote Support Request',
        description: 'Engineer John requested remote access to your device',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
        actionUrl: '/remote-sessions/pending',
      },
      {
        id: '2',
        type: 'complaint-update',
        title: 'Complaint Updated',
        description: 'Your complaint CMP-001 has been updated',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        actionUrl: '/complaints/1',
      },
      {
        id: '3',
        type: 'system-alert',
        title: 'System Maintenance',
        description: 'Scheduled maintenance on Sunday 2 AM',
        timestamp: new Date(Date.now() - 2 * 3600000),
        read: true,
        actionUrl: null,
      },
    ];

    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { message: 'Failed to fetch notifications', details: error.toString() },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, read } = await request.json();

    // Mark notification as read - in production, update database
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update notification:', error);
    return NextResponse.json(
      { message: 'Failed to update notification', details: error.toString() },
      { status: 500 }
    );
  }
}

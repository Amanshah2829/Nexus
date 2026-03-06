import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import RemoteSession from '@/app/models/RemoteSession';
import Complaint from '@/app/models/Complaint';
import User from '@/app/models/User';
import { cookies } from 'next/headers';
import { SessionData } from '@/app/lib/session';
import { randomUUID } from 'crypto';

// GET: List remote sessions
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let sessionData: SessionData;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const complaintId = searchParams.get('complaintId');
    const userId = searchParams.get('userId');

    let query: any = {};
    
    // Non-super-admins only see their tenant's sessions
    if (sessionData.role !== 'super-admin') {
      query.tenant = sessionData.tenant;
    }

    if (status) {
      query.status = status;
    }
    if (complaintId) {
      query.complaint = complaintId;
    }
    if (userId) {
      query.$or = [
        { engineer: userId },
        { complainer: userId },
      ];
    }

    const sessions = await RemoteSession.find(query)
      .populate('engineer', 'name email')
      .populate('complainer', 'name email')
      .populate('complaint', 'title ticketNumber')
      .sort({ requestedAt: -1 })
      .limit(100);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching remote sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create remote session request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let sessionData: SessionData;
    try {
      sessionData = JSON.parse(sessionCookie);
    } catch {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Personnel (Engineer, Admin, Super Admin) can request remote support
    const allowedRoles = ['engineer', 'super-admin', 'admin', 'tenant-admin'];
    if (!allowedRoles.includes(sessionData.role)) {
      return NextResponse.json(
        { error: 'Only authorized personnel can request remote sessions' },
        { status: 403 }
      );
    }

    const { complaintId, reason, estimatedDuration } = await request.json();

    if (!complaintId) {
      return NextResponse.json(
        { error: 'complaintId is required' },
        { status: 400 }
      );
    }

    // Get complaint and validate
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Verify tenant access for non-super-admins
    if (sessionData.role !== 'super-admin' && complaint.tenant.toString() !== sessionData.tenant) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Find the reporter user to set as the complainer in the session
    const complainerUser = await User.findOne({ email: complaint.reporterEmail });
    if (!complainerUser) {
      return NextResponse.json(
        { error: 'The reporter of this complaint does not have a user account required for remote support.' },
        { status: 400 }
      );
    }

    // Check if there's already an active session for this complaint
    const existingSession = await RemoteSession.findOne({
      complaint: complaintId,
      status: { $in: ['pending', 'approved', 'active'] },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: 'An active remote session already exists for this complaint' },
        { status: 409 }
      );
    }

    // Create new session
    const newSession = new RemoteSession({
      id: randomUUID(),
      tenant: complaint.tenant,
      complaint: complaintId,
      engineer: sessionData.userId,
      complainer: complainerUser._id,
      reason,
      estimatedDuration: estimatedDuration || 15,
      status: 'pending',
      controlLevel: 'view-only',
      canShareScreen: true,
      canShareAudio: true,
      allowRemoteInput: false,
      allowScreenRecording: true,
      chatMessages: [],
      actionsLog: [
        {
          action: 'session_requested',
          timestamp: new Date(),
          details: { requestedBy: sessionData.userId },
        },
      ],
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // Expires in 30 minutes if not approved
    });

    await newSession.save();

    // Update complaint history so it shows up in notifications for the user
    await Complaint.findByIdAndUpdate(complaintId, {
      $push: {
        history: {
          action: 'Remote Support Requested',
          user: sessionData.name,
          timestamp: new Date(),
          details: { message: reason }
        }
      }
    });

    // Populate references
    await newSession.populate('engineer', 'name email');
    await newSession.populate('complainer', 'name email');
    await newSession.populate('complaint', 'title ticketNumber');

    return NextResponse.json(
      { 
        message: 'Remote session request created',
        session: newSession 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating remote session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
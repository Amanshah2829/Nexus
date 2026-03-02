import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import RemoteSession from '@/app/models/RemoteSession';
import { cookies } from 'next/headers';
import { SessionData } from '@/app/lib/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const remoteSession = await RemoteSession.findById(params.id);

    if (!remoteSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Only the complainer can approve
    if (remoteSession.complainer.toString() !== sessionData.userId) {
      return NextResponse.json(
        { error: 'Only the complainer can approve this session' },
        { status: 403 }
      );
    }

    if (remoteSession.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only approve pending sessions' },
        { status: 409 }
      );
    }

    const { timeLimit } = await request.json();

    remoteSession.status = 'approved';
    remoteSession.approvedAt = new Date();
    remoteSession.startedAt = new Date();
    remoteSession.status = 'active'; // Auto-start when approved

    // Set session expiry if time limit is provided
    if (timeLimit) {
      remoteSession.expiresAt = new Date(Date.now() + timeLimit * 60 * 1000);
    }

    remoteSession.actionsLog.push({
      action: 'session_approved',
      timestamp: new Date(),
      details: { approvedBy: sessionData.userId },
    });

    remoteSession.chatMessages.push({
      sender: sessionData.userId as any,
      senderName: 'System',
      message: 'Remote session approved and started',
      timestamp: new Date(),
      messageType: 'system',
    });

    await remoteSession.save();

    await remoteSession.populate('engineer', 'name email');
    await remoteSession.populate('complainer', 'name email');

    return NextResponse.json({
      message: 'Session approved and started',
      session: remoteSession,
    });
  } catch (error) {
    console.error('Error approving remote session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

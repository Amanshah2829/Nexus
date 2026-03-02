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

    // Only the complainer can deny
    if (remoteSession.complainer.toString() !== sessionData.userId) {
      return NextResponse.json(
        { error: 'Only the complainer can deny this session' },
        { status: 403 }
      );
    }

    if (remoteSession.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only deny pending sessions' },
        { status: 409 }
      );
    }

    const { reason } = await request.json();

    remoteSession.status = 'rejected';
    remoteSession.rejectedAt = new Date();

    remoteSession.actionsLog.push({
      action: 'session_rejected',
      timestamp: new Date(),
      details: { 
        rejectedBy: sessionData.userId,
        reason: reason || 'No reason provided',
      },
    });

    remoteSession.chatMessages.push({
      sender: sessionData.userId as any,
      senderName: 'System',
      message: `Remote session rejected${reason ? ': ' + reason : ''}`,
      timestamp: new Date(),
      messageType: 'system',
    });

    await remoteSession.save();

    await remoteSession.populate('engineer', 'name email');
    await remoteSession.populate('complainer', 'name email');

    return NextResponse.json({
      message: 'Session rejected',
      session: remoteSession,
    });
  } catch (error) {
    console.error('Error rejecting remote session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

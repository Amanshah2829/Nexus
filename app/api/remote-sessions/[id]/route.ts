import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import RemoteSession from '@/app/models/RemoteSession';
import { cookies } from 'next/headers';
import { SessionData } from '@/app/lib/session';

export async function GET(
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

    const remoteSession = await RemoteSession.findById(params.id)
      .populate('engineer', 'name email role')
      .populate('complainer', 'name email')
      .populate('complaint', 'title ticketNumber description');

    if (!remoteSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Authorization: user must be engineer or complainer in the session
    if (
      remoteSession.engineer.toString() !== sessionData.userId &&
      remoteSession.complainer.toString() !== sessionData.userId
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ session: remoteSession });
  } catch (error) {
    console.error('Error fetching remote session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: End or cancel a remote session
export async function DELETE(
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

    // Authorization
    if (
      remoteSession.engineer.toString() !== sessionData.userId &&
      remoteSession.complainer.toString() !== sessionData.userId
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Update session status
    const newStatus =
      remoteSession.status === 'active' ? 'completed' : 'cancelled';

    remoteSession.status = newStatus;
    remoteSession.endedAt = new Date();

    // Calculate actual duration if started
    if (remoteSession.startedAt) {
      const durationMs = new Date().getTime() - new Date(remoteSession.startedAt).getTime();
      remoteSession.actualDuration = Math.ceil(durationMs / (1000 * 60)); // in minutes
    }

    remoteSession.actionsLog.push({
      action: `session_${newStatus}`,
      timestamp: new Date(),
      details: { endedBy: sessionData.userId },
    });

    await remoteSession.save();

    return NextResponse.json({
      message: `Session ${newStatus}`,
      session: remoteSession,
    });
  } catch (error) {
    console.error('Error ending remote session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

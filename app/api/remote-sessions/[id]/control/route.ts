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

    // Only complainer can modify control permissions
    if (remoteSession.complainer.toString() !== sessionData.userId) {
      return NextResponse.json(
        { error: 'Only the complainer can modify control permissions' },
        { status: 403 }
      );
    }

    if (remoteSession.status !== 'active') {
      return NextResponse.json(
        { error: 'Can only modify permissions for active sessions' },
        { status: 409 }
      );
    }

    const {
      controlLevel,
      allowRemoteInput,
      allowScreenRecording,
      canShareScreen,
      canShareAudio,
    } = await request.json();

    // Update control level
    if (controlLevel && ['view-only', 'mouse-only', 'full-control'].includes(controlLevel)) {
      remoteSession.controlLevel = controlLevel;
    }

    // Update individual permissions
    if (allowRemoteInput !== undefined) {
      remoteSession.allowRemoteInput = allowRemoteInput;
    }
    if (allowScreenRecording !== undefined) {
      remoteSession.allowScreenRecording = allowScreenRecording;
    }
    if (canShareScreen !== undefined) {
      remoteSession.canShareScreen = canShareScreen;
    }
    if (canShareAudio !== undefined) {
      remoteSession.canShareAudio = canShareAudio;
    }

    remoteSession.actionsLog.push({
      action: 'control_permissions_updated',
      timestamp: new Date(),
      details: {
        updatedBy: sessionData.userId,
        controlLevel,
        allowRemoteInput,
        allowScreenRecording,
      },
    });

    remoteSession.chatMessages.push({
      sender: sessionData.userId as any,
      senderName: 'System',
      message: `Control permissions updated to ${controlLevel || 'same level'}`,
      timestamp: new Date(),
      messageType: 'system',
    });

    await remoteSession.save();

    await remoteSession.populate('engineer', 'name email');
    await remoteSession.populate('complainer', 'name email');

    return NextResponse.json({
      message: 'Control permissions updated',
      session: remoteSession,
    });
  } catch (error) {
    console.error('Error updating control permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

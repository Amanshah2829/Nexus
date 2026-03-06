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

    // Authorization: User must be a participant in the session
    // Using string comparison for robustness
    const isEngineer = remoteSession.engineer.toString() === sessionData.userId;
    const isComplainer = remoteSession.complainer.toString() === sessionData.userId;

    if (!isEngineer && !isComplainer) {
      return NextResponse.json(
        { error: 'Only session participants can modify control permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      controlLevel,
      allowRemoteInput,
      allowScreenRecording,
      canShareScreen,
      canShareAudio,
      isBroadcasting,
    } = body;

    // Only complainer (staff) can modify security/privacy permissions and broadcast state
    if (isComplainer) {
      if (controlLevel && ['view-only', 'mouse-only', 'full-control'].includes(controlLevel)) {
        remoteSession.controlLevel = controlLevel;
      }
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
      if (isBroadcasting !== undefined) {
        remoteSession.isBroadcasting = isBroadcasting;
        if (isBroadcasting) {
          remoteSession.streamStartedAt = new Date();
          
          // Add a system message only when broadcasting starts
          remoteSession.chatMessages.push({
            sender: sessionData.userId as any,
            senderName: 'System',
            message: 'Live stream broadcast started',
            timestamp: new Date(),
            messageType: 'system',
          });
        } else {
          remoteSession.chatMessages.push({
            sender: sessionData.userId as any,
            senderName: 'System',
            message: 'Live stream broadcast ended',
            timestamp: new Date(),
            messageType: 'system',
          });
        }
      }
    }

    remoteSession.actionsLog.push({
      action: 'session_updated',
      timestamp: new Date(),
      details: {
        updatedBy: sessionData.userId,
        ...body
      },
    });

    await remoteSession.save();

    await remoteSession.populate('engineer', 'name email');
    await remoteSession.populate('complainer', 'name email');

    return NextResponse.json({
      message: 'Session updated',
      session: remoteSession,
    });
  } catch (error) {
    console.error('Error updating remote session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
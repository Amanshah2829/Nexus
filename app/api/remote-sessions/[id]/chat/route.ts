import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import RemoteSession from '@/app/models/RemoteSession';
import User from '@/app/models/User';
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

    return NextResponse.json({ messages: remoteSession.chatMessages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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

    if (remoteSession.status !== 'active') {
      return NextResponse.json(
        { error: 'Can only send messages in active sessions' },
        { status: 409 }
      );
    }

    const { message } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Get user name
    const user = await User.findById(sessionData.userId);
    const senderName = user?.name || 'Unknown User';

    // Add message to chat
    const newMessage = {
      sender: sessionData.userId as any,
      senderName,
      message: message.trim(),
      timestamp: new Date(),
      messageType: 'text' as const,
    };

    remoteSession.chatMessages.push(newMessage);

    remoteSession.actionsLog.push({
      action: 'message_sent',
      timestamp: new Date(),
      details: {
        sentBy: sessionData.userId,
        messageLength: message.length,
      },
    });

    await remoteSession.save();

    return NextResponse.json({
      message: 'Message sent',
      newMessage,
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

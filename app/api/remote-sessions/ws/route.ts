import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import RemoteSession from '@/app/models/RemoteSession';

export const runtime = 'nodejs';

// Store active WebSocket connections
const sessionConnections = new Map<
  string,
  {
    engineer?: WebSocket;
    complainer?: WebSocket;
  }
>();

export async function GET(request: NextRequest) {
  try {
    // Check if client is requesting WebSocket upgrade
    if (request.headers.get('upgrade') !== 'websocket') {
      return NextResponse.json(
        { error: 'WebSocket upgrade required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userType = searchParams.get('userType'); // 'engineer' or 'complainer'

    if (!sessionId || !userType) {
      return NextResponse.json(
        { error: 'sessionId and userType required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const session = await RemoteSession.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'active' && session.status !== 'approved') {
      return NextResponse.json(
        { error: 'Session is not active' },
        { status: 403 }
      );
    }

    // Note: In a real implementation with Next.js, you'd typically use a library like:
    // - ws for raw WebSocket handling
    // - Socket.io for higher-level abstraction
    // - Pusher or similar third-party service
    // 
    // For now, we're setting up the structure and validation.
    // The actual WebSocket connection would be handled by a dedicated service.

    return NextResponse.json({
      message: 'WebSocket endpoint ready',
      sessionId,
      userType,
      note: 'Use Socket.io or similar library to handle actual WebSocket connections',
    });
  } catch (error) {
    console.error('WebSocket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to broadcast messages to session participants
export async function broadcastToSession(
  sessionId: string,
  message: any,
  excludeUserType?: string
) {
  const connection = sessionConnections.get(sessionId);
  if (!connection) return;

  if (excludeUserType !== 'engineer' && connection.engineer) {
    try {
      connection.engineer.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending to engineer:', error);
    }
  }

  if (excludeUserType !== 'complainer' && connection.complainer) {
    try {
      connection.complainer.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending to complainer:', error);
    }
  }
}

// Helper to remove connection
export function removeSessionConnection(sessionId: string, userType: string) {
  const connection = sessionConnections.get(sessionId);
  if (!connection) return;

  if (userType === 'engineer') {
    connection.engineer = undefined;
  } else if (userType === 'complainer') {
    connection.complainer = undefined;
  }

  // Clean up if both disconnected
  if (!connection.engineer && !connection.complainer) {
    sessionConnections.delete(sessionId);
  }
}

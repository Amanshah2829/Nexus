
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { logSuccess } from '@/app/lib/audit';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    // Log logout event before clearing session
    if (session) {
      await logSuccess(
        session.userId,
        'LOGOUT',
        'USER',
        session.userId,
        undefined,
        request
      );
    }

    // Clear the session cookie
    cookies().delete('session');

    return NextResponse.json({ 
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Logout failed:', error);
    
    // Still clear the cookie even if logging fails
    cookies().delete('session');
    
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

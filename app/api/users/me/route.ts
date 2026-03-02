
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import { decrypt } from '@/app/lib/crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    
    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;

    if (!userId) {
      return NextResponse.json({ message: 'Invalid session' }, { status: 401 });
    }

    const user = await User.findById(userId).select('+emailConfig');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userObject = user.toObject();

    if (userObject.emailConfig?.imapPassword) {
      userObject.emailConfig.imapPassword = decrypt(userObject.emailConfig.imapPassword);
    }
    if (userObject.emailConfig?.smtpPassword) {
      userObject.emailConfig.smtpPassword = decrypt(userObject.emailConfig.smtpPassword);
    }

    return NextResponse.json(userObject);
  } catch (error: any) {
    console.error('Failed to fetch current user:', error);
    return NextResponse.json(
      { message: 'Failed to fetch current user', details: error.toString() },
      { status: 500 }
    );
  }
}

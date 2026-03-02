
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const session = await getSession(request);

        if (!session || !session.userId) {
            return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ message: 'Current and new passwords are required' }, { status: 400 });
        }
        
        const user = await User.findById(session.userId).select('+password');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        const isPasswordMatch = await user.comparePassword(currentPassword);

        if (!isPasswordMatch) {
            return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
        }
        
        user.password = newPassword;
        await user.save();

        return NextResponse.json({ message: 'Password updated successfully' });

    } catch (error: any) {
        console.error('Failed to change password:', error);
        return NextResponse.json(
            { message: 'An internal server error occurred.', details: error.toString() },
            { status: 500 }
        );
    }
}

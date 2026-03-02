
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';

function generateTemporaryToken() {
    return require('crypto').randomBytes(32).toString('hex');
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
        }
        
        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (user.isVerified) {
             return NextResponse.json({ message: 'User already verified' }, { status: 400 });
        }

        if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
        }

        user.isVerified = true;
        
        // If user has no tenant, they need to go through onboarding.
        // Otherwise, they are just verifying their account and can now log in.
        if (!user.tenant) {
            user.status = 'active'; // Temporarily active to proceed to onboarding
            // Create a temporary token for the onboarding step
            const tempToken = generateTemporaryToken();
            user.otp = tempToken; // repurposing OTP field for temp token
            user.otpExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour to complete onboarding
            await user.save();
            return NextResponse.json({ message: 'Email verified successfully. Proceed to onboarding.', token: tempToken });
        } else {
            // User already belongs to a tenant, just verify them.
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            return NextResponse.json({ message: 'Email verified successfully. You can now log in.' });
        }


    } catch (error: any) {
        console.error('OTP verification failed:', error);
        return NextResponse.json({ message: 'An internal server error occurred.', details: error.toString() }, { status: 500 });
    }
}

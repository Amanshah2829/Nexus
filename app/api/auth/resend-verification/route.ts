
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import nodemailer from 'nodemailer';
import { getAndRenderTemplate } from '@/app/lib/templates';
import Setting from '@/app/models/Setting';

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getSystemSmtpConfig() {
    const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
    for (const key of requiredEnv) {
        if (!process.env[key]) {
            throw new Error(`System mailer is not configured. Missing environment variable: ${key}`);
        }
    }
    return {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT!),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        tls: { rejectUnauthorized: false }
    };
}

async function getSignature(tenantId: string | null) {
  if (!tenantId) return '';
  try {
    await dbConnect();
    const signatureSetting = await Setting.findOne({ tenant: tenantId, key: 'emailSignature' });
    return signatureSetting ? signatureSetting.value : '';
  } catch (error) {
    console.error("Failed to fetch signature, using default:", error);
    return '';
  }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // To prevent user enumeration, we don't reveal if the user exists.
            // But for a "resend" flow, it's arguably better UX to say user not found.
            return NextResponse.json({ message: 'User with this email not found.' }, { status: 404 });
        }
        
        if (user.isVerified) {
             return NextResponse.json({ message: 'This account is already verified.' }, { status: 400 });
        }

        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;

        await user.save();
        
        // Send OTP email
        const smtpConfig = getSystemSmtpConfig();
        const transporter = nodemailer.createTransport(smtpConfig);

        const tenantId = user.tenant ? user.tenant.toString() : null;
        const signature = await getSignature(tenantId);
        const { subject, body } = await getAndRenderTemplate(tenantId, 'emailVerification', { user, otp });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject,
            text: `${body}\n\n${signature}`,
        };
        await transporter.sendMail(mailOptions);
        
        return NextResponse.json({ message: 'A new verification OTP has been sent.' }, { status: 200 });

    } catch (error: any) {
        console.error('Failed to resend verification:', error);
        return NextResponse.json({ message: 'An internal server error occurred.', details: error.toString() }, { status: 500 });
    }
}


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
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }
        
        const otp = generateOtp();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = new User({
            name,
            email,
            password, // Hashed in pre-save hook
            role: 'admin', // Will be an admin of their new tenant
            status: 'inactive', // inactive until verified and onboarded
            isVerified: false,
            otp,
            otpExpires,
        });

        await newUser.save();
        
        // Send OTP email
        const smtpConfig = getSystemSmtpConfig();
        const transporter = nodemailer.createTransport(smtpConfig);

        const signature = await getSignature(null); // No tenant yet
        const { subject, body } = await getAndRenderTemplate(null, 'emailVerification', { user: newUser, otp });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: newUser.email,
            subject,
            text: `${body}\n\n${signature}`,
        };
        await transporter.sendMail(mailOptions);
        
        return NextResponse.json({ message: 'User registered. Please check email for OTP.' }, { status: 201 });

    } catch (error: any) {
        console.error('Signup failed:', error);
        return NextResponse.json({ message: 'An internal server error occurred.', details: error.toString() }, { status: 500 });
    }
}

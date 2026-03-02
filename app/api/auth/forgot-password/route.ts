
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import nodemailer from 'nodemailer';
import Setting from '@/app/models/Setting';
import { getAndRenderTemplate } from '@/app/lib/templates';
import Tenant from '@/app/models/Tenant';
import { decrypt } from '@/app/lib/crypto';

// This API is public, so it can't use a logged-in user's config.
// It MUST use environment variables as a system-wide mailer.
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

function generateTemporaryPassword(length = 10) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { email } = await request.json();
        
        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email }).select('+password').populate('tenant');
        
        if (user) {
            const temporaryPassword = generateTemporaryPassword();
            user.password = temporaryPassword;
            await user.save();
            
            const tenantId = user.tenant?._id?.toString() || null;
            const signature = await getSignature(tenantId);
            const { subject, body, cc } = await getAndRenderTemplate(tenantId, 'forgotPassword', { user, password: temporaryPassword });
            
            const smtpConfig = getSystemSmtpConfig();
            const transporter = nodemailer.createTransport(smtpConfig);
            
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: user.email,
                cc,
                subject,
                text: `${body}\n\n${signature}`
            };

            await transporter.sendMail(mailOptions);
        }

        return NextResponse.json({ message: 'If an account with that email exists, a password reset email has been sent.' });

    } catch (error: any) {
        console.error('Failed to process forgot password request:', error);
        return NextResponse.json(
            { message: 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}

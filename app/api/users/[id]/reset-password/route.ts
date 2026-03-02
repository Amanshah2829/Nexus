
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import Setting from '@/app/models/Setting';
import { getAndRenderTemplate } from '@/app/lib/templates';
import { getSession } from '@/app/lib/session';
import { decrypt } from '@/app/lib/crypto';

export const dynamic = 'force-dynamic';

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

function getSystemSmtpConfig() {
    const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
    for (const key of requiredEnv) {
        if (!process.env[key]) return null;
    }

    return {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT!),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
        from: process.env.EMAIL_FROM,
        tls: { rejectUnauthorized: false }
    };
}

async function getAdminSmtpConfig(adminUserId: string) {
    await dbConnect();
    const adminUser = await User.findById(adminUserId).select('+emailConfig');
    
    if (!adminUser || !adminUser.emailConfig) {
      return null;
    }

    const { smtpHost, smtpPort, smtpUser, smtpPassword } = adminUser.emailConfig;
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
        return null;
    }
    
    return {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
            user: smtpUser,
            pass: decrypt(smtpPassword),
        },
        from: smtpUser,
        tls: { rejectUnauthorized: false }
    };
}


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        
        if (!mongoose.Types.ObjectId.isValid(params.id)) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        const userToReset = await User.findById(params.id).select('+password').populate('tenant');
        
        if (!userToReset) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (session.role !== 'super-admin' && (session.role !== 'admin' || session.tenant?.toString() !== userToReset.tenant?._id?.toString())) {
             return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const temporaryPassword = generateTemporaryPassword();
        userToReset.password = temporaryPassword; 
        await userToReset.save();
        
        const tenantId = userToReset.tenant?._id?.toString() || null;
        
        let smtpConfig = await getAdminSmtpConfig(session.userId);
        let fromEmail;

        if (smtpConfig) {
            fromEmail = smtpConfig.from;
        } else {
            const systemConfig = getSystemSmtpConfig();
            if (!systemConfig) {
                throw new Error('Email service is not configured. Please contact support.');
            }
            smtpConfig = systemConfig;
            fromEmail = systemConfig.from;
        }
        
        const signature = await getSignature(tenantId);
        const { subject, body, cc } = await getAndRenderTemplate(tenantId, 'adminResetPassword', { user: userToReset, password: temporaryPassword });

        const transporter = nodemailer.createTransport(smtpConfig);
        
        const mailOptions = {
            from: fromEmail,
            to: userToReset.email,
            cc,
            subject,
            text: `${body}\n\n${signature}`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Password reset email sent successfully' });

    } catch (error: any) {
        console.error('Failed to reset password:', error);
        return NextResponse.json(
            { message: `Failed to reset password: ${error.message}`, details: error.toString() },
            { status: 500 }
        );
    }
}

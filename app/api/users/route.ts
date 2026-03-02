
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import nodemailer from 'nodemailer';
import Setting from '@/app/models/Setting';
import { getSession } from '@/app/lib/session';
import { getAndRenderTemplate } from '@/app/lib/templates';
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


export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || (session.role !== 'admin' && session.role !== 'super-admin')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant');
    
    const query: any = {};

    if (session.role === 'super-admin' && tenantId) {
      query.tenant = tenantId;
    } else if (session.role !== 'super-admin') {
      query.tenant = session.tenant;
    }

    const users = await User.find(query);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, role, sendEmail } = body;
    let { password } = body;
    
    const session = await getSession(request);

    let tenantId;

    if (session) {
      if (session.role === 'super-admin') {
        tenantId = body.tenant;
      } else {
        tenantId = session.tenant;
      }
    } else {
      const signupEnabledSetting = await Setting.findOne({ key: 'signupEnabled' });
      const signupEnabled = signupEnabledSetting ? signupEnabledSetting.value : true;
      if (!signupEnabled) {
        return NextResponse.json({ message: 'Unauthorized: Sign-ups are disabled.' }, { status: 403 });
      }
      tenantId = body.tenant; 
    }
    
    if (!tenantId && role !== 'super-admin') {
        return NextResponse.json({ message: 'Tenant ID is required for non-super-admin user creation.' }, { status: 400 });
    }


    if (!password) {
      password = generateTemporaryPassword();
    }

    const newUser = new User({
        name,
        email,
        password, 
        role,
        tenant: tenantId,
    });
    
    await newUser.save();

    if (sendEmail) {
        let smtpConfig;
        let fromEmail;

        if (session) {
            smtpConfig = await getAdminSmtpConfig(session.userId);
            if (smtpConfig) {
                fromEmail = smtpConfig.from;
            } else {
                // Fallback to system config
                const systemConfig = getSystemSmtpConfig();
                if (!systemConfig) {
                    throw new Error('Email configuration is missing. Please configure your email settings or contact support.');
                }
                smtpConfig = systemConfig;
                fromEmail = systemConfig.from;
            }

            const signature = await getSignature(tenantId);
            const { subject, body: emailBody, cc } = await getAndRenderTemplate(tenantId, 'userWelcome', { user: newUser, password });
            
            const transporter = nodemailer.createTransport(smtpConfig);
            
            const mailOptions = {
                from: fromEmail,
                to: newUser.email,
                cc,
                subject,
                text: `${emailBody}\n\n${signature}`,
            };

            await transporter.sendMail(mailOptions);
        }
    }
    
    const userObject = newUser.toObject();
    delete userObject.password;

    return NextResponse.json(userObject, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create user:', error);
    if (error.code === 11000) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: `Failed to create user: ${error.message}`, details: error.toString() }, { status: 500 });
  }
}

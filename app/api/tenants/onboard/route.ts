
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Tenant from '@/app/models/Tenant';
import User from '@/app/models/User';
import { cookies } from 'next/headers';
import { SessionData } from '@/app/lib/session';
import { getAndRenderTemplate } from '@/app/lib/templates';
import nodemailer from 'nodemailer';

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


async function getSuperAdmins() {
    return await User.find({ role: 'super-admin' });
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        
        const authToken = request.headers.get('authorization')?.split('Bearer ')[1];
        if (!authToken) {
            return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
        }
        
        const user = await User.findOne({ otp: authToken, otpExpires: { $gt: new Date() } });
        
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized: Invalid or expired token' }, { status: 401 });
        }

        const { tenantName, industry, companySize, address } = await request.json();

        if (!tenantName) {
            return NextResponse.json({ message: 'Organization name is required' }, { status: 400 });
        }

        // Create the new tenant
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        const newTenant = new Tenant({
            name: tenantName,
            status: 'active',
            subscriptionPlan: 'trial',
            subscriptionStatus: 'trialing',
            subscriptionEndDate: trialEndDate,
            companySize,
            industry,
            address,
        });
        await newTenant.save();

        // Update the user who signed up
        user.tenant = newTenant._id;
        user.role = 'admin'; // They are now the admin of their tenant
        user.status = 'active'; // Finalize user status
        user.otp = undefined; // Clear the temp token
        user.otpExpires = undefined;
        await user.save();
        
        // --- Send Emails ---
        const smtpConfig = getSystemSmtpConfig();
        const transporter = nodemailer.createTransport(smtpConfig);

        // 1. Send welcome email to the new tenant admin
        const { subject: welcomeSubject, body: welcomeBody } = await getAndRenderTemplate(null, 'newTenantWelcome', { user, tenant: newTenant });
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: welcomeSubject,
            text: welcomeBody,
        });
        
        // 2. Send notification to all super admins
        const superAdmins = await getSuperAdmins();
        const { subject: notifySubject, body: notifyBody } = await getAndRenderTemplate(null, 'superAdminNewTenantNotification', { user, tenant: newTenant });
        for (const admin of superAdmins) {
             await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: admin.email,
                subject: notifySubject,
                text: notifyBody,
            });
        }


        // Log the user in by setting the session cookie
        const sessionToken: SessionData = {
          userId: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          tenant: newTenant._id.toString(),
        };

        cookies().set('session', JSON.stringify(sessionToken), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 8, // 8 hours
            path: '/',
        });

        return NextResponse.json({
            message: 'Onboarding complete! Tenant created and user logged in.',
            tenant: newTenant,
        }, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ message: 'A tenant with this name already exists' }, { status: 409 });
        }
        console.error('Failed to create tenant:', error);
        return NextResponse.json({ message: 'Failed to create tenant', details: error.toString() }, { status: 500 });
    }
}

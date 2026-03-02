
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import Setting from '@/app/models/Setting';
import { cookies } from 'next/headers';
import { SessionData } from '@/app/lib/session';
import Tenant from '@/app/models/Tenant';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    
    const user = await User.findOne({ email }).select('+password').populate('tenant');

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Tenant check for non-super-admins
    if (user.role !== 'super-admin' && user.tenant) {
        const tenant = user.tenant as any;
        
        // Check for subscription expiry if an end date exists
        if (tenant.subscriptionEndDate) {
            const expiryDate = new Date(tenant.subscriptionEndDate);
            const now = new Date();
            
            if (expiryDate < now) {
                if (tenant.status !== 'inactive') {
                    // Update tenant status to inactive in DB
                    await Tenant.findByIdAndUpdate(tenant._id, { status: 'inactive' });
                    tenant.status = 'inactive';
                }
            }
        }

        if (tenant.status !== 'active') {
            return NextResponse.json({ 
                message: 'Your organization\'s account is inactive or suspended. Please contact your admin.',
                details: `Tenant status: ${tenant.status}`
            }, { status: 403 });
        }
    }
    
    const sessionToken: SessionData = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      tenant: user.role === 'super-admin' ? null : (user.tenant?._id?.toString() || null),
    };

    let sessionDuration = 60 * 60 * 8; // Default 8 hours

    if (user.role === 'engineer' && user.tenant) {
        const durationSetting = await Setting.findOne({ tenant: user.tenant._id, key: 'engineerSessionDuration' });
        if (durationSetting && typeof durationSetting.value === 'number') {
            sessionDuration = durationSetting.value;
        }
    }


    cookies().set('session', JSON.stringify(sessionToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: sessionDuration, 
        path: '/',
    });

    return NextResponse.json({ message: 'Login successful', role: user.role });

  } catch (error: any) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.', details: error.toString() },
      { status: 500 }
    );
  }
}

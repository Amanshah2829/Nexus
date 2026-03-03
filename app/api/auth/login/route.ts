
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import User from '@/app/models/User';
import Setting from '@/app/models/Setting';
import { cookies } from 'next/headers';
import { SessionData } from '@/app/lib/session';
import Tenant from '@/app/models/Tenant';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/app/lib/validation';
import { logFailure, logSuccess, getIpAddress } from '@/app/lib/audit';
import { sanitizeEmail } from '@/app/lib/sanitize';
import { checkRateLimit } from '@/app/lib/api-helpers';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const ipAddress = getIpAddress(request);

    // Rate limit by IP address (5 attempts per minute)
    if (!checkRateLimit(`auth:${ipAddress}`, 5, 60000)) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Validate request body
    const body = await request.json();
    
    if (!body.email || !body.password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(body.email);
    if (!sanitizedEmail) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    const user = await User.findOne({ email: sanitizedEmail }).select('+password').populate('tenant');

    if (!user) {
      // Log failed authentication attempt
      await logFailure(
        'unknown',
        'LOGIN',
        'USER',
        sanitizedEmail,
        'User not found',
        request
      );

      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    // Check if account is locked
    if (user.isAccountLocked?.()) {
      await logFailure(
        user._id.toString(),
        'LOGIN',
        'USER',
        user._id.toString(),
        'Account locked due to multiple failed login attempts',
        request
      );

      return NextResponse.json(
        { 
          message: 'Account is locked. Please try again later or contact support.' 
        },
        { status: 403 }
      );
    }
    
    const isPasswordMatch = await bcrypt.compare(body.password, user.password);

    if (!isPasswordMatch) {
      // Record failed login attempt
      if (user.recordFailedLogin) {
        await user.recordFailedLogin();
      }

      await logFailure(
        user._id.toString(),
        'LOGIN',
        'USER',
        user._id.toString(),
        'Invalid password',
        request
      );

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
            await logFailure(
              user._id.toString(),
              'LOGIN',
              'USER',
              user._id.toString(),
              `Tenant status: ${tenant.status}`,
              request
            );

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

    // Reset login attempts on successful login
    if (user.resetLoginAttempts) {
      await user.resetLoginAttempts();
    }

    // Log successful login
    await logSuccess(
      user._id.toString(),
      'LOGIN',
      'USER',
      user._id.toString(),
      undefined,
      request
    );

    cookies().set('session', JSON.stringify(sessionToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: sessionDuration, 
        path: '/',
    });

    return NextResponse.json({ 
      message: 'Login successful', 
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });

  } catch (error: any) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { message: 'An internal server error occurred.', details: error.toString() },
      { status: 500 }
    );
  }
}

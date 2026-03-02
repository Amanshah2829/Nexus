
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Setting from '@/app/models/Setting';
import { getSession } from '@/app/lib/session';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);
    if (!session) return new NextResponse('Unauthorized', { status: 401 });
    
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    let query: any = {};
    
    // For signupEnabled, it's a global setting, so no tenant filter
    if (key === 'signupEnabled') {
      query.tenant = null;
    } else if (session.role !== 'super-admin' && session.tenant) {
      // Non-super-admins should only see settings for their own tenant
      query.tenant = new mongoose.Types.ObjectId(session.tenant);
    } else if (session.role === 'super-admin' && searchParams.get('tenantId')) {
      // Super admin can query for a specific tenant
      query.tenant = new mongoose.Types.ObjectId(searchParams.get('tenantId')!);
    }


    if (key) {
      query.key = key;
      const setting = await Setting.findOne(query);
      
      if (!setting) {
        // Provide a safe default for signupEnabled if it's not in the DB yet
        if (key === 'signupEnabled') return NextResponse.json({ key: 'signupEnabled', value: true });
        return NextResponse.json({ message: 'Setting not found' }, { status: 404 });
      }
      return NextResponse.json(setting);
    }

    // If no key is provided, return all settings for the context (either global or tenant)
    const settings = await Setting.find(query);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ message: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await getSession(request);
    if (!session || (session.role !== 'admin' && session.role !== 'super-admin')) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;
    
    let query: any = { key };
    let update: any = { value, key };

    if (key === 'signupEnabled' && session.role === 'super-admin') {
      // Global setting
      query.tenant = null;
      update.tenant = null;
    } else if (session.tenant) {
      // Tenant-specific setting
      const tenantObjectId = new mongoose.Types.ObjectId(session.tenant);
      query.tenant = tenantObjectId;
      update.tenant = tenantObjectId;
    } else {
        return NextResponse.json({ message: 'User is not associated with a tenant or lacks permission.' }, { status: 400 });
    }

    const setting = await Setting.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, upsert: true }
    );

    return NextResponse.json(setting, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update setting:', error);
    return NextResponse.json({ message: 'Failed to update setting', details: error.toString() }, { status: 500 });
  }
}


import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Setting from '@/app/models/Setting';
import { getSession } from '@/app/lib/session';
import { initializeDefaultTemplates } from '@/app/lib/templates';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Fetch all email templates for the current user's tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || (session.role !== 'admin' && session.role !== 'super-admin' && session.role !== 'engineer')) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    if (!session.tenant || !mongoose.Types.ObjectId.isValid(session.tenant)) {
      return NextResponse.json({ message: 'No valid tenant association found.' }, { status: 400 });
    }
    
    await dbConnect();

    // Ensure default templates exist for this tenant before fetching
    await initializeDefaultTemplates(session.tenant); 
    
    const tenantTemplateKeyPrefix = `tenant_${session.tenant}_`;
    const templates = await Setting.find({ key: { $regex: `^${tenantTemplateKeyPrefix}` } }).sort({ 'value.name': 1 });
    
    return NextResponse.json(templates);
  } catch (error: any) {
    console.error('Failed to fetch email templates:', error);
    return NextResponse.json({ message: 'Failed to fetch email templates', details: error.toString() }, { status: 500 });
  }
}

// Create or Update an email template for the current user's tenant
export async function POST(request: NextRequest) {
    try {
      await dbConnect();
      const session = await getSession(request);
      if (!session || (session.role !== 'admin' && session.role !== 'super-admin')) {
        return new NextResponse('Unauthorized', { status: 403 });
      }

      if (!session.tenant) {
        return NextResponse.json({ message: 'No tenant association found.' }, { status: 400 });
      }
  
      const body = await request.json();
      const { key, value } = body;

      if (!key || !value) {
        return NextResponse.json({ message: 'Template key and value are required.' }, { status: 400 });
      }

      const fullKey = `tenant_${session.tenant}_${key}`;
      
      const tenantObjectId = new mongoose.Types.ObjectId(session.tenant);
  
      const setting = await Setting.findOneAndUpdate(
        { key: fullKey },
        { value, key: fullKey, tenant: tenantObjectId },
        { new: true, upsert: true, runValidators: true }
      );
  
      return NextResponse.json(setting, { status: 200 });
    } catch (error: any) {
      console.error('Failed to update template:', error);
      return NextResponse.json({ message: 'Failed to update template', details: error.toString() }, { status: 500 });
    }
}

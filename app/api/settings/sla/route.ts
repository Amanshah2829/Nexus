
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Setting from '@/app/models/Setting';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

const SLA_SETTING_KEY = 'slaPolicies';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const session = await getSession(request);
    if (!session || (session.role !== 'admin' && session.role !== 'super-admin')) {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    let slaSetting = await Setting.findOne({ key: SLA_SETTING_KEY, tenant: session.tenant });
    
    if (!slaSetting) {
        // Create default SLA if not exists
        const defaultSla = {
            key: SLA_SETTING_KEY,
            tenant: session.tenant,
            value: [
                { priority: 'critical', durationInHours: 4 },
                { priority: 'high', durationInHours: 24 },
                { priority: 'medium', durationInHours: 72 },
                { priority: 'low', durationInHours: 168 },
            ]
        };
        slaSetting = new Setting(defaultSla);
        await slaSetting.save();
    }

    return NextResponse.json(slaSetting.value);
  } catch (error) {
    console.error('Failed to fetch SLA settings:', error);
    return NextResponse.json({ message: 'Failed to fetch SLA settings' }, { status: 500 });
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

    const setting = await Setting.findOneAndUpdate(
      { key: SLA_SETTING_KEY, tenant: session.tenant },
      { value: body, tenant: session.tenant },
      { new: true, upsert: true }
    );

    return NextResponse.json(setting, { status: 200 });
  } catch (error: any) {
    console.error('Failed to update SLA settings:', error);
    return NextResponse.json({ message: 'Failed to update SLA settings', details: error.toString() }, { status: 500 });
  }
}

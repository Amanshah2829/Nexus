
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Lead from '@/app/models/Lead';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'super-admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const leads = await Lead.find({}).sort({ createdAt: -1 });
        return NextResponse.json(leads);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to fetch leads', details: error.toString() }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'super-admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const body = await request.json();
        const newLead = new Lead(body);
        await newLead.save();
        return NextResponse.json(newLead, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to create lead', details: error.toString() }, { status: 500 });
    }
}

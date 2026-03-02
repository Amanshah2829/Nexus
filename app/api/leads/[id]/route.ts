
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Lead from '@/app/models/Lead';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'super-admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const body = await request.json();
        const updatedLead = await Lead.findByIdAndUpdate(params.id, body, { new: true });
        if (!updatedLead) {
            return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
        }
        return NextResponse.json(updatedLead);
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to update lead', details: error.toString() }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'super-admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const deletedLead = await Lead.findByIdAndDelete(params.id);
        if (!deletedLead) {
            return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Lead deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: 'Failed to delete lead', details: error.toString() }, { status: 500 });
    }
}

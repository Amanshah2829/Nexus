
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Setting from '@/app/models/Setting';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, { params }: { params: { key: string } }) {
    try {
        await dbConnect();
        const session = await getSession(request);
        if (session?.role !== 'admin' && session?.role !== 'super-admin') {
            return new NextResponse('Unauthorized', { status: 403 });
        }
        
        if (!session.tenant) {
            return NextResponse.json({ message: 'No tenant association found.' }, { status: 400 });
        }

        const { key } = params;
        const fullKey = `tenant_${session.tenant}_${key}`;

        const result = await Setting.deleteOne({ key: fullKey });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Template not found' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Template deleted successfully' });

    } catch (error: any) {
        console.error('Failed to delete template:', error);
        return NextResponse.json({ message: 'Failed to delete template', details: error.toString() }, { status: 500 });
    }
}

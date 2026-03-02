
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Asset from '@/app/models/Asset';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'admin' && session?.role !== 'super-admin' && session?.role !== 'engineer') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const updatedAsset = await Asset.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });

        if (!updatedAsset) {
            return NextResponse.json({ message: 'Asset not found' }, { status: 404 });
        }

        return NextResponse.json(updatedAsset);
    } catch (error: any) {
        console.error('Failed to update asset:', error);
        return NextResponse.json({ message: 'Failed to update asset', details: error.toString() }, { status: 500 });
    }
}


import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import AssetLog from '@/app/models/AssetLog';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'admin' && session?.role !== 'super-admin' && session?.role !== 'engineer') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const assetId = searchParams.get('assetId');

        const query: any = {};
        if (assetId) {
            query.asset = assetId;
        }
        
        const logs = await AssetLog.find(query).populate('asset').sort({ timestamp: -1 });
        
        return NextResponse.json(logs);
    } catch (error) {
        console.error('Failed to fetch inventory logs:', error);
        return NextResponse.json({ message: 'Failed to fetch inventory logs' }, { status: 500 });
    }
}

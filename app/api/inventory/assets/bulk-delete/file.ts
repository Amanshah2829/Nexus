
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Asset from '@/app/models/Asset';
import AssetLog from '@/app/models/AssetLog';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'admin' && session?.role !== 'super-admin' && session?.role !== 'engineer') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const body = await request.json();
        const { assetIds } = body;

        if (!Array.isArray(assetIds) || assetIds.length === 0) {
            return NextResponse.json({ message: 'No asset IDs provided' }, { status: 400 });
        }
        
        const query = { _id: { $in: assetIds }, tenant: session.tenant };

        // Also delete any associated logs for the assets being deleted to maintain data integrity
        await AssetLog.deleteMany({ asset: { $in: assetIds }, tenant: session.tenant });
        const result = await Asset.deleteMany(query);

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'No assets found to delete' }, { status: 404 });
        }

        return NextResponse.json({ message: `${result.deletedCount} assets deleted successfully.` });

    } catch (error: any) {
        console.error('Failed to bulk delete assets:', error);
        return NextResponse.json({ message: 'Failed to delete assets', details: error.toString() }, { status: 500 });
    }
}

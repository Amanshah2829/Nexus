
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Asset from '@/app/models/Asset';
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
        const { assets } = body;

        if (!Array.isArray(assets) || assets.length === 0) {
            return NextResponse.json({ message: 'No assets to import' }, { status: 400 });
        }
        
        const assetsWithTenant = assets.map(asset => ({...asset, tenant: session.tenant, status: 'available' }));
        const result = await Asset.insertMany(assetsWithTenant, { ordered: false });

        return NextResponse.json({ message: `${result.length} assets imported successfully.` }, { status: 201 });

    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ message: 'Some assets were duplicates and were not imported.', details: error.writeErrors }, { status: 409 });
        }
        console.error('Failed to import assets:', error);
        return NextResponse.json({ message: 'Failed to import assets', details: error.toString() }, { status: 500 });
    }
}

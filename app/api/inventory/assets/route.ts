
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Asset, { IAsset } from '@/app/models/Asset';
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
        const status = searchParams.get('status');
        const sortKey = searchParams.get('sortKey') || 'serialNumber';
        const sortDirection = searchParams.get('sortDirection') === 'desc' ? -1 : 1;
        
        const query: any = {};
        if (status && status !== 'all') {
            query.status = status;
        }

        if (session.role !== 'super-admin') {
            query.tenant = session.tenant;
        }


        const sortOptions: { [key: string]: any } = {};
        sortOptions[sortKey] = sortDirection;

        const assets = await Asset.find(query).sort(sortOptions);
        return NextResponse.json(assets);
    } catch (error) {
        console.error('Failed to fetch assets:', error);
        return NextResponse.json({ message: 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (!session || (session.role !== 'admin' && session.role !== 'super-admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const body = await request.json();

        if (!body.serialNumber) {
            return NextResponse.json({ message: 'Serial number is required' }, { status: 400 });
        }

        const newAsset = new Asset({ 
            ...body, 
            tenant: session.tenant, 
            status: 'available' 
        });
        await newAsset.save();

        await new AssetLog({
            asset: newAsset._id,
            tenant: session.tenant,
            action: 'created',
            user: session.name,
            details: { message: 'Asset created manually.' }
        }).save();


        return NextResponse.json(newAsset, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return NextResponse.json({ message: `Asset with this ${field} already exists` }, { status: 409 });
        }
        console.error('Failed to create asset:', error);
        return NextResponse.json({ message: 'Failed to create asset', details: error.toString() }, { status: 500 });
    }
}

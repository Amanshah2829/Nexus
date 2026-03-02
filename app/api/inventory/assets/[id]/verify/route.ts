
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Asset from '@/app/models/Asset';
import AssetLog from '@/app/models/AssetLog';
import { getSession } from '@/app/lib/session';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'admin' && session?.role !== 'super-admin' && session?.role !== 'engineer') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const assetId = params.id;
        
        const asset = await Asset.findById(assetId);
        if (!asset) {
            return NextResponse.json({ message: 'Asset not found' }, { status: 404 });
        }
        
        const { discrepancies = [], verificationResult, notes, roomStatus, photo } = body;

        // 1. Handle Photo Upload
        let photoUrl: string | undefined = undefined;
        if (photo) {
            const matches = photo.match(/^data:(image\/jpeg);base64,(.*)$/);
            if(matches && matches[1]) {
                const imageBuffer = Buffer.from(matches[1], 'base64');
                const directory = path.join(process.cwd(), 'public', 'asset-verification');
                
                if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory, { recursive: true });
                }

                const filename = `${assetId}-${new Date().getTime()}.jpg`;
                const filepath = path.join(directory, filename);
                fs.writeFileSync(filepath, imageBuffer);
                photoUrl = `/asset-verification/${filename}`;
            }
        }
        
        // 2. Create the AssetLog with new compliance fields
        const newLog = new AssetLog({
            asset: assetId,
            tenant: session.tenant,
            action: 'verification',
            user: session.name, // This is the 'verifiedBy' user
            timestamp: new Date(),
            
            verificationResult: verificationResult,
            discrepancies: discrepancies,
            details: { // General info for display
                notes: notes,
                roomStatus: roomStatus,
                photoUrl: photoUrl
            },
            
            // Set review status if there are issues
            reviewStatus: discrepancies.length > 0 ? 'pending' : 'approved',
        });

        await newLog.save();
        
        // 3. Update the parent asset's verification dates
        const verificationValidUntil = new Date();
        // Set validity for 180 days by default
        verificationValidUntil.setDate(verificationValidUntil.getDate() + 180);

        asset.lastVerifiedAt = new Date();
        asset.verificationValidUntil = verificationValidUntil;
        
        // As per spec, do not update asset status directly. This must be a separate admin action.
        await asset.save();
        
        return NextResponse.json({ message: 'Verification logged successfully.' });
    } catch (error: any) {
        console.error('Failed to log verification:', error);
        return NextResponse.json({ message: 'Failed to log verification', details: error.toString() }, { status: 500 });
    }
}

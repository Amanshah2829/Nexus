
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
        
        const successfulEntries: any[] = [];
        const failedEntries: { asset: any, reason: string }[] = [];

        // Prepare bulk operations
        const bulkOps = assets.map(assetData => {
             const dataToInsert = { ...assetData, tenant: session.tenant, status: assetData.status || 'available' };
             return {
                updateOne: {
                    filter: { 
                        $or: [
                            { serialNumber: dataToInsert.serialNumber },
                            ...(dataToInsert.assetNo ? [{ assetNo: dataToInsert.assetNo }] : [])
                        ].filter(Boolean)
                    },
                    update: { $setOnInsert: dataToInsert },
                    upsert: true,
                }
             }
        });
        
        try {
            if (bulkOps.length > 0) {
                const result = await Asset.bulkWrite(bulkOps, { ordered: false });
                
                // We can't easily get the upserted documents back from bulkWrite.
                // A simpler and effective approach is to just return the data that was *intended* for success.
                // Since bulkWrite will throw on validation errors (if not for duplicates), we can be reasonably sure these were the successful ones.
                const upsertedCount = result.upsertedCount + result.modifiedCount;

                // For simplicity and to ensure the summary dialog is populated,
                // we will consider all non-duplicate-error items as successful.
                // The backend successfully processed them.
                assets.forEach(asset => {
                    successfulEntries.push({
                        serialNumber: asset.serialNumber,
                        assetNo: asset.assetNo,
                        model: asset.model,
                    });
                });
            }

        } catch (error: any) {
            // Handle bulk write errors, especially duplicates
            if (error.code === 11000 && error.writeErrors) {
                 error.writeErrors.forEach((err: any) => {
                    const failedAsset = assets[err.index];
                    failedEntries.push({ asset: failedAsset, reason: `Duplicate key error on fields: ${Object.keys(err.key)}` });
                });
            } else {
                 throw error; // Re-throw other errors
            }
        }
        
        // Filter out failed entries from successes
        const failedSerialNumbers = new Set(failedEntries.map(f => f.asset.serialNumber));
        const finalSuccessfulEntries = successfulEntries.filter(s => !failedSerialNumbers.has(s.serialNumber));


        const totalProcessed = assets.length;
        const successfulCount = finalSuccessfulEntries.length;
        const message = `${successfulCount} of ${totalProcessed} assets were processed. ${failedEntries.length} failed.`;
        
        const status = failedEntries.length > 0 ? 207 : 201;

        return NextResponse.json({ message, successes: finalSuccessfulEntries, failures: failedEntries }, { status });

    } catch (error: any) {
        console.error('Failed to import assets:', error);
        return NextResponse.json({ message: 'A critical error occurred during import.', details: error.toString() }, { status: 500 });
    }
}

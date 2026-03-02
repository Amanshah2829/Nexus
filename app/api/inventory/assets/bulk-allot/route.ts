
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Asset from '@/app/models/Asset';
import AssetLog from '@/app/models/AssetLog';
import { getSession } from '@/app/lib/session';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession(request);
        if (session?.role !== 'admin' && session?.role !== 'super-admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();

        const body = await request.json();
        const { allotmentsToUpdate, allotmentsForNewAssets, createMissing } = body;
        
        const results = {
            successes: [] as any[],
            failures: [] as any[],
            createdCount: 0,
            updatedCount: 0,
        };
        const assetLogsToCreate: any[] = [];
        const now = new Date();

        // 1. Bulk Create New Assets if requested
        if (createMissing && Array.isArray(allotmentsForNewAssets) && allotmentsForNewAssets.length > 0) {
            const newAssetsData = allotmentsForNewAssets.map(assetData => ({
                serialNumber: assetData.serialNumber?.trim(),
                status: 'available',
                tenant: session.tenant,
                model: assetData.model,
                macAddress: assetData.macAddress,
                make: assetData.make,
                assetNo: assetData.assetNo?.trim() || assetData.serialNumber?.trim(),
                notes: `Created via bulk import on ${now.toLocaleDateString()}`,
                allottedTo: assetData.allottedTo
            }));
            
            try {
                const createdAssets = await Asset.insertMany(newAssetsData, { ordered: false });
                results.createdCount = createdAssets.length;
                
                const logsForNewAssets = createdAssets.map(asset => ({
                    asset: asset._id,
                    action: 'created' as const,
                    user: session.name,
                    details: { message: 'Asset created during bulk allotment process.' },
                    tenant: session.tenant,
                }));
                assetLogsToCreate.push(...logsForNewAssets);
                
                // Add the newly created assets to the main update list
                allotmentsToUpdate.push(...allotmentsForNewAssets);

            } catch (error: any) {
                 if (error.code === 11000 && error.writeErrors) {
                    error.writeErrors.forEach((err: any) => {
                         results.failures.push({ allotment: err.op, reason: `Failed to create asset: Duplicate key ${Object.keys(err.key)}` });
                    });
                } else {
                     results.failures.push({ allotment: 'Multiple new assets', reason: `Failed to create new assets: ${error.message}` });
                }
            }
        }
        
        // 2. Bulk Update existing assets
        if (Array.isArray(allotmentsToUpdate) && allotmentsToUpdate.length > 0) {
            const serialNumbers = allotmentsToUpdate.map(a => a.serialNumber?.trim()).filter(Boolean);
            const existingAssets = await Asset.find({ serialNumber: { $in: serialNumbers }, tenant: session.tenant });
            const existingAssetsMap = new Map(existingAssets.map(a => [a.serialNumber, a]));
            
            const bulkOps = [];

            for (const allotmentData of allotmentsToUpdate) {
                const serialNumber = allotmentData.serialNumber?.trim();
                const asset = existingAssetsMap.get(serialNumber);

                if (!asset) {
                    // This case should not happen if createMissing is false, but as a safeguard.
                    if (!createMissing) {
                        results.failures.push({ allotment: allotmentData, reason: `Asset with S/N ${serialNumber} not found.` });
                    }
                    continue;
                }

                // Prepare update
                asset.status = allotmentData.status?.toLowerCase() || 'allotted';
                if (asset.status === 'issued') asset.status = 'allotted'; // Alias
                if (allotmentData.assetNo) asset.assetNo = allotmentData.assetNo.trim();
                if (allotmentData.model) asset.model = allotmentData.model;
                if (allotmentData.macAddress) asset.macAddress = allotmentData.macAddress;
                if (allotmentData.make) asset.make = allotmentData.make;
                
                asset.allottedTo = { ...asset.allottedTo, ...allotmentData.allottedTo };
                asset.notes = `Allotted via bulk import on ${now.toLocaleDateString()}`;
                
                if (allotmentData.complaintId) asset.complaintId = allotmentData.complaintId;

                // Handle date parsing
                let allotmentDate = now;
                if (allotmentData.allotmentDate) {
                    const parsedDate = new Date(allotmentData.allotmentDate);
                    if (!isNaN(parsedDate.getTime())) {
                        allotmentDate = parsedDate;
                    }
                }
                asset.allotmentDate = allotmentDate;

                bulkOps.push({
                    updateOne: {
                        filter: { _id: asset._id },
                        update: { $set: asset.toObject() }
                    }
                });
                
                results.successes.push({
                    serialNumber: asset.serialNumber,
                    allottedTo: asset.allottedTo?.name,
                    location: `${asset.allottedTo?.building || ''} ${asset.allottedTo?.roomNumber || ''}`,
                });
                
                if (asset.status === 'allotted') {
                    assetLogsToCreate.push({
                        asset: asset._id,
                        action: 'issued' as const,
                        user: session.name,
                        details: {
                            allottedTo: asset.allottedTo,
                            complaintId: asset.complaintId,
                            message: asset.notes,
                        },
                        timestamp: asset.allotmentDate,
                        tenant: session.tenant,
                    });
                }
            }

            if (bulkOps.length > 0) {
                 const bulkResult = await Asset.bulkWrite(bulkOps, { ordered: false });
                 results.updatedCount = bulkResult.modifiedCount;
            }
        }
        
        // 3. Insert all logs in one go
        if (assetLogsToCreate.length > 0) {
            await AssetLog.insertMany(assetLogsToCreate, { ordered: false });
        }
        
        const message = `Allotment process finished. ${results.successes.length} successful, ${results.failures.length} failed.`;
        
        return NextResponse.json({ success: true, message, ...results });

    } catch (error: any) {
        console.error('Bulk Allotment Error:', error);
        return NextResponse.json({ success: false, message: 'A critical server error occurred during bulk processing.', reason: error.message }, { status: 500 });
    }
}

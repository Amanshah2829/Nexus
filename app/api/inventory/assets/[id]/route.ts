
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Asset from '@/app/models/Asset';
import AssetLog from '@/app/models/AssetLog';
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
        const assetId = params.id;
        
        const query: any = { _id: assetId };
        if (session.role !== 'super-admin') {
            query.tenant = session.tenant;
        }

        const originalAsset = await Asset.findOne(query);
        if (!originalAsset) {
            return NextResponse.json({ message: 'Asset not found' }, { status: 404 });
        }

        const newStatus = body.status;
        const originalStatus = originalAsset.status;

        // If status is being changed to 'available', clear allotment info
        if (newStatus && newStatus === 'available' && newStatus !== originalStatus) {
            body.allottedTo = {};
            body.complaintId = null;
            body.allotmentDate = null;
        }

        const updatedAsset = await Asset.findByIdAndUpdate(assetId, body, { new: true, runValidators: true });

        if (!updatedAsset) {
            return NextResponse.json({ message: 'Asset not found' }, { status: 404 });
        }
        
        // Log the change
        if (newStatus && newStatus !== originalStatus) {
            let action: 'issued' | 'returned' | 'status_change' = 'status_change';
            let details: any = { 
                from: originalStatus, 
                to: newStatus,
                message: `Status changed from ${originalStatus} to ${newStatus}`
            };

            if (newStatus === 'allotted') {
                action = 'issued';
                details.allottedTo = updatedAsset.allottedTo;
                details.complaintId = updatedAsset.complaintId;
                details.message = `Asset issued to ${updatedAsset.allottedTo?.name}.`;
            } else if (originalStatus === 'allotted' && (newStatus === 'available' || newStatus === 'defective')) {
                action = 'returned';
                details.allottedTo = originalAsset.allottedTo; // Log who it was returned from
                details.complaintId = originalAsset.complaintId;
                details.message = `Asset returned from ${originalAsset.allottedTo?.name} and marked as ${newStatus}.`;
            }

            await new AssetLog({
                asset: assetId,
                tenant: session.tenant,
                action: action,
                user: session.name,
                details: details,
                timestamp: new Date(),
            }).save();
        } else if (body.action === 'Extender Required' || body.action === 'Hardware Replaced') { // Special actions
             await new AssetLog({
                asset: assetId,
                tenant: session.tenant,
                action: 'issued',
                user: session.name,
                details: {
                    allottedTo: updatedAsset.allottedTo,
                    complaintId: updatedAsset.complaintId,
                    message: body.notes || `${body.action}.`,
                },
                timestamp: updatedAsset.allotmentDate,
            }).save();
        }


        return NextResponse.json(updatedAsset);
    } catch (error: any) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return NextResponse.json({ message: `An asset with this ${field} already exists.` }, { status: 409 });
        }
        console.error('Failed to update asset:', error);
        return NextResponse.json({ message: 'Failed to update asset', details: error.toString() }, { status: 500 });
    }
}

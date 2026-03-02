
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import IssueReturnLog from '@/app/models/IssueReturnLog';
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
        const { logs } = body;

        if (!Array.isArray(logs) || logs.length === 0) {
            return NextResponse.json({ message: 'No logs to import' }, { status: 400 });
        }

        const logsToInsert = await Promise.all(logs.map(async (log) => {
            const asset = await Asset.findOne({ serialNumber: log.assetSerialNumber });
            if (!asset) {
                // Or handle as an error
                console.warn(`Asset with S/N ${log.assetSerialNumber} not found. Skipping log entry.`);
                return null;
            }
            return {
                asset: asset._id,
                action: log.action,
                issuedTo: {
                    name: log.name,
                    email: log.email,
                    registrationNumber: log.registrationNumber,
                    mobileNumber: log.mobileNumber,
                },
                complaintId: log.complaintId,
                timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
                notes: log.notes,
            };
        }));
        
        const validLogs = logsToInsert.filter(log => log !== null);

        if (validLogs.length > 0) {
            await IssueReturnLog.insertMany(validLogs);
        }

        const skippedCount = logs.length - validLogs.length;
        let message = `${validLogs.length} logs imported successfully.`;
        if (skippedCount > 0) {
            message += ` ${skippedCount} logs were skipped due to missing asset serial numbers.`;
        }

        return NextResponse.json({ message }, { status: 201 });

    } catch (error: any) {
        console.error('Failed to import logs:', error);
        return NextResponse.json({ message: 'Failed to import logs', details: error.toString() }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import { getSession } from '@/app/lib/session';
import { logSuccess, logFailure } from '@/app/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check authorization - only admins and above can export
    if (!['admin', 'super-admin'].includes(session.role)) {
      await logFailure(
        session.userId,
        'EXPORT',
        'COMPLAINT',
        'unauthorized',
        'Insufficient permissions',
        request
      );

      return NextResponse.json(
        { message: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');

    // Build filter
    const filter: any = {};
    if (session.role !== 'super-admin' && session.tenant) {
      filter.tenant = session.tenant;
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Fetch complaints
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv') {
      content = generateCSV(complaints);
      contentType = 'text/csv';
      filename = `complaints-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (format === 'json') {
      content = JSON.stringify(complaints, null, 2);
      contentType = 'application/json';
      filename = `complaints-${new Date().toISOString().split('T')[0]}.json`;
    } else {
      return NextResponse.json(
        { message: 'Unsupported export format' },
        { status: 400 }
      );
    }

    // Log export
    await logSuccess(
      session.userId,
      'EXPORT',
      'COMPLAINT',
      `bulk_export_${complaints.length}`,
      { format, count: complaints.length, filter },
      request
    );

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('[Export Error]', error);
    return NextResponse.json(
      { message: 'Export failed', details: error.toString() },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV from complaints
 */
function generateCSV(complaints: any[]): string {
  if (complaints.length === 0) {
    return 'No complaints found';
  }

  // CSV headers
  const headers = [
    'ID',
    'Title',
    'Status',
    'Priority',
    'Category',
    'Reporter',
    'Email',
    'Phone',
    'Building',
    'Room',
    'Description',
    'Assigned To',
    'Created Date',
    'Updated Date',
  ];

  // CSV rows
  const rows = complaints.map(complaint => [
    complaint.id || complaint._id.toString(),
    `"${escapeCSV(complaint.title)}"`,
    complaint.status,
    complaint.priority,
    complaint.category,
    `"${escapeCSV(complaint.reporter)}"`,
    complaint.reporterEmail,
    complaint.phone,
    complaint.building,
    complaint.room,
    `"${escapeCSV(complaint.description)}"`,
    complaint.assignedTo || 'Unassigned',
    new Date(complaint.createdAt).toISOString(),
    new Date(complaint.updatedAt).toISOString(),
  ]);

  // Combine headers and rows
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csv;
}

/**
 * Escape special characters in CSV
 */
function escapeCSV(value: string): string {
  if (!value) return '';
  return value.replace(/"/g, '""');
}

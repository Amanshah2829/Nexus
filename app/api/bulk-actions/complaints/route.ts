import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import { getSession } from '@/app/lib/session';
import { logSuccess, logFailure } from '@/app/lib/audit';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, complaintIds, data } = body;

    if (!action || !complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Limit bulk operations to 100 items
    if (complaintIds.length > 100) {
      return NextResponse.json(
        { message: 'Maximum 100 items per bulk operation' },
        { status: 400 }
      );
    }

    // Tenant isolation
    const filter: any = { _id: { $in: complaintIds } };
    if (session.role !== 'super-admin' && session.tenant) {
      filter.tenant = session.tenant;
    }

    let result: any;

    switch (action) {
      case 'update-status':
        result = await updateBulkStatus(filter, data.status, session);
        break;

      case 'update-priority':
        result = await updateBulkPriority(filter, data.priority, session);
        break;

      case 'assign':
        result = await updateBulkAssignment(filter, data.assignedTo, session);
        break;

      case 'delete':
        result = await deleteBulkComplaints(filter, session);
        break;

      case 'add-category':
        result = await updateBulkCategory(filter, data.category, session);
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        );
    }

    // Log bulk action
    await logSuccess(
      session.userId,
      'BULK_' + action.toUpperCase(),
      'COMPLAINT',
      `bulk_${action}_${complaintIds.length}`,
      { action, count: complaintIds.length, data },
      request
    );

    return NextResponse.json({
      message: `${action} applied to ${result.modifiedCount || result.deletedCount} complaints`,
      ...result,
    });
  } catch (error: any) {
    console.error('[Bulk Actions Error]', error);
    return NextResponse.json(
      { message: 'Bulk action failed', details: error.toString() },
      { status: 500 }
    );
  }
}

/**
 * Update status for multiple complaints
 */
async function updateBulkStatus(filter: any, status: string, session: any) {
  if (!['open', 'in-progress', 'pending', 'resolved', 'closed'].includes(status)) {
    throw new Error('Invalid status');
  }

  const result = await Complaint.updateMany(
    filter,
    {
      $set: { status, updatedAt: new Date() },
      $push: {
        history: {
          action: 'Status changed',
          user: session.userId,
          timestamp: new Date(),
          changes: { status },
        },
      },
    }
  );

  return result;
}

/**
 * Update priority for multiple complaints
 */
async function updateBulkPriority(filter: any, priority: string, session: any) {
  if (!['critical', 'high', 'medium', 'low'].includes(priority)) {
    throw new Error('Invalid priority');
  }

  const result = await Complaint.updateMany(
    filter,
    {
      $set: { priority, updatedAt: new Date() },
      $push: {
        history: {
          action: 'Priority changed',
          user: session.userId,
          timestamp: new Date(),
          changes: { priority },
        },
      },
    }
  );

  return result;
}

/**
 * Update assignment for multiple complaints
 */
async function updateBulkAssignment(filter: any, assignedTo: string, session: any) {
  const result = await Complaint.updateMany(
    filter,
    {
      $set: { assignedTo, updatedAt: new Date() },
      $push: {
        history: {
          action: 'Assigned',
          user: session.userId,
          timestamp: new Date(),
          changes: { assignedTo },
        },
      },
    }
  );

  return result;
}

/**
 * Update category for multiple complaints
 */
async function updateBulkCategory(filter: any, category: string, session: any) {
  const result = await Complaint.updateMany(
    filter,
    {
      $set: { category, updatedAt: new Date() },
      $push: {
        history: {
          action: 'Category changed',
          user: session.userId,
          timestamp: new Date(),
          changes: { category },
        },
      },
    }
  );

  return result;
}

/**
 * Delete multiple complaints (soft delete)
 */
async function deleteBulkComplaints(filter: any, session: any) {
  const result = await Complaint.updateMany(
    filter,
    {
      $set: {
        deleted: true,
        deletedAt: new Date(),
        deletedBy: session.userId,
        updatedAt: new Date(),
      },
      $push: {
        history: {
          action: 'Deleted',
          user: session.userId,
          timestamp: new Date(),
        },
      },
    }
  );

  return result;
}

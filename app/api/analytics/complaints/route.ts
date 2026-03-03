import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import { getSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const metric = url.searchParams.get('metric') || 'overview';

    // Build filter
    const filter: any = {};
    if (session.role !== 'super-admin' && session.tenant) {
      filter.tenant = session.tenant;
    }

    // Date filter
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    filter.createdAt = { $gte: startDate };

    let result: any;

    switch (metric) {
      case 'overview':
        result = await getOverviewMetrics(filter);
        break;

      case 'trends':
        result = await getTrendMetrics(filter, days);
        break;

      case 'by-category':
        result = await getByCategory(filter);
        break;

      case 'by-priority':
        result = await getByPriority(filter);
        break;

      case 'by-status':
        result = await getByStatus(filter);
        break;

      case 'by-engineer':
        result = await getByEngineer(filter);
        break;

      case 'resolution-time':
        result = await getResolutionTime(filter);
        break;

      default:
        return NextResponse.json(
          { message: 'Invalid metric' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      metric,
      days,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Analytics Error]', error);
    return NextResponse.json(
      { message: 'Analytics query failed', details: error.toString() },
      { status: 500 }
    );
  }
}

/**
 * Overview metrics
 */
async function getOverviewMetrics(filter: any) {
  const total = await Complaint.countDocuments(filter);
  
  const statusCounts = await Complaint.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const priorityCounts = await Complaint.aggregate([
    { $match: filter },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
  ]);

  const resolved = await Complaint.countDocuments({
    ...filter,
    status: { $in: ['resolved', 'closed'] },
  });

  const avgResolutionTime = await getAverageResolutionTime(filter);

  return {
    totalComplaints: total,
    resolvedComplaints: resolved,
    resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    averageResolutionTime: avgResolutionTime,
    byStatus: statusCounts.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byPriority: priorityCounts.reduce((acc: any, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };
}

/**
 * Trend metrics over time
 */
async function getTrendMetrics(filter: any, days: number) {
  const trends = await Complaint.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        count: { $sum: 1 },
        resolved: {
          $sum: {
            $cond: [
              { $in: ['$status', ['resolved', 'closed']] },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return trends;
}

/**
 * Breakdown by category
 */
async function getByCategory(filter: any) {
  return await Complaint.aggregate([
    { $match: filter },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
}

/**
 * Breakdown by priority
 */
async function getByPriority(filter: any) {
  return await Complaint.aggregate([
    { $match: filter },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    {
      $project: {
        _id: 1,
        count: 1,
        priority: '$_id',
      },
    },
  ]);
}

/**
 * Breakdown by status
 */
async function getByStatus(filter: any) {
  return await Complaint.aggregate([
    { $match: filter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
}

/**
 * Breakdown by assigned engineer
 */
async function getByEngineer(filter: any) {
  return await Complaint.aggregate([
    { $match: filter },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);
}

/**
 * Resolution time metrics
 */
async function getResolutionTime(filter: any) {
  const times = await Complaint.aggregate([
    {
      $match: {
        ...filter,
        status: { $in: ['resolved', 'closed'] },
        updatedAt: { $exists: true },
      },
    },
    {
      $project: {
        resolutionTime: {
          $subtract: ['$updatedAt', '$createdAt'],
        },
      },
    },
  ]);

  if (times.length === 0) {
    return {
      average: 0,
      minimum: 0,
      maximum: 0,
      median: 0,
    };
  }

  const millisecondsToDays = (ms: number) => Math.round(ms / (1000 * 60 * 60 * 24) * 10) / 10;

  const times_in_days = times
    .map((t: any) => t.resolutionTime)
    .filter((t: any) => t !== null)
    .sort((a: number, b: number) => a - b);

  const average = times_in_days.reduce((a: number, b: number) => a + b, 0) / times_in_days.length;
  const median = times_in_days[Math.floor(times_in_days.length / 2)];

  return {
    average: millisecondsToDays(average),
    minimum: millisecondsToDays(Math.min(...times_in_days)),
    maximum: millisecondsToDays(Math.max(...times_in_days)),
    median: millisecondsToDays(median),
  };
}

/**
 * Helper: Get average resolution time
 */
async function getAverageResolutionTime(filter: any): Promise<number> {
  const result = await Complaint.aggregate([
    {
      $match: {
        ...filter,
        status: { $in: ['resolved', 'closed'] },
      },
    },
    {
      $project: {
        resolutionTime: {
          $subtract: ['$updatedAt', '$createdAt'],
        },
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: '$resolutionTime' },
      },
    },
  ]);

  if (result.length === 0) return 0;

  // Convert milliseconds to days
  const avgMs = result[0].avg;
  return Math.round(avgMs / (1000 * 60 * 60 * 24) * 10) / 10;
}

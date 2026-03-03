import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import { getSession } from '@/app/lib/session';
import { sanitizeString } from '@/app/lib/sanitize';
import { checkRateLimit } from '@/app/lib/api-helpers';
import { getIpAddress } from '@/app/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const ipAddress = getIpAddress(request);
    if (!checkRateLimit(`search:${ipAddress}`, 30, 60000)) {
      return NextResponse.json(
        { message: 'Too many search requests' },
        { status: 429 }
      );
    }

    const url = new URL(request.url);
    const searchQuery = url.searchParams.get('q')?.trim() || '';
    const type = url.searchParams.get('type') || 'complaints';
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const category = url.searchParams.get('category');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);

    // Sanitize search query
    const sanitizedQuery = sanitizeString(searchQuery);

    if (searchQuery.length > 1000) {
      return NextResponse.json(
        { message: 'Search query too long' },
        { status: 400 }
      );
    }

    // Build search filters
    const filter: any = {};

    // Tenant isolation
    if (session.role !== 'super-admin' && session.tenant) {
      filter.tenant = session.tenant;
    }

    // Text search
    if (sanitizedQuery) {
      filter.$or = [
        { title: { $regex: sanitizedQuery, $options: 'i' } },
        { description: { $regex: sanitizedQuery, $options: 'i' } },
        { id: { $regex: sanitizedQuery, $options: 'i' } },
        { reporter: { $regex: sanitizedQuery, $options: 'i' } },
        { reporterEmail: { $regex: sanitizedQuery, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && ['open', 'in-progress', 'pending', 'resolved', 'closed'].includes(status)) {
      filter.status = status;
    }

    // Priority filter
    if (priority && ['critical', 'high', 'medium', 'low'].includes(priority)) {
      filter.priority = priority;
    }

    // Category filter
    if (category) {
      filter.category = sanitizeString(category);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute search
    let query = Complaint.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit);

    const results = await query.lean();
    const total = await Complaint.countDocuments(filter);

    // Build facets for filtering options
    const facets = await buildFacets(filter, session);

    return NextResponse.json({
      results,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      facets,
      query: sanitizedQuery,
    });
  } catch (error: any) {
    console.error('[Search Error]', error);
    return NextResponse.json(
      { message: 'Search failed', details: error.toString() },
      { status: 500 }
    );
  }
}

/**
 * Build facets for advanced filtering
 */
async function buildFacets(baseFilter: any, session: any) {
  try {
    const results = await Promise.all([
      // Status facet
      Complaint.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Priority facet
      Complaint.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      // Category facet
      Complaint.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      // Assigned engineer facet
      Complaint.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      status: results[0].reduce(
        (acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        },
        {}
      ),
      priority: results[1].reduce(
        (acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        },
        {}
      ),
      category: results[2].reduce(
        (acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        },
        {}
      ),
      assignedTo: results[3].reduce(
        (acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        },
        {}
      ),
    };
  } catch (error) {
    console.error('[Facet Error]', error);
    return {};
  }
}

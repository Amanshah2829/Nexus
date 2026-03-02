import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Solution from '@/app/models/Solution';
import { getSession } from '@/app/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    const query: any = { tenant: session.tenant };
    
    // Improved Text Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { resolution: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (category && category !== 'All') {
        query.category = category;
    }

    const solutions = await Solution.find(query)
      .populate('createdBy', 'name email role')
      .populate('complaintId', 'id title')
      .sort({ createdAt: -1 })
      .limit(50); // Safety limit

    return NextResponse.json(solutions);
  } catch (error: any) {
    console.error('Failed to fetch solutions:', error);
    return NextResponse.json({ message: 'Failed to fetch solutions', details: error.toString() }, { status: 500 });
  }
}

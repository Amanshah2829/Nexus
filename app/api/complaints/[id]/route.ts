
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import mongoose from 'mongoose';
import { getSession } from '@/app/lib/session';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const query: any = {};
    if (session.role !== 'super-admin') {
      query.tenant = session.tenant;
    }
    
    if (mongoose.Types.ObjectId.isValid(params.id)) {
      query._id = params.id;
    } else {
      query.id = params.id;
    }
    
    const complaint = await Complaint.findOne(query).populate('assignedTo');

    if (!complaint) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }

    // Security check: an engineer can only get complaints assigned to them
    if (session.role === 'engineer' && complaint.assignedTo?._id.toString() !== session.userId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }


    return NextResponse.json(complaint);
  } catch (error: any) {
    console.error('Failed to fetch complaint:', error);
    return NextResponse.json(
      { message: 'Failed to fetch complaint', details: error.toString() },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      await dbConnect();
      const session = await getSession(request);
      if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      const body = await request.json();
  
      const complaintId = params.id;
      
      const query: any = {};
      if (session.role !== 'super-admin') {
        query.tenant = session.tenant;
      }

      if (mongoose.Types.ObjectId.isValid(complaintId)) {
        query._id = complaintId;
      } else {
        query.id = complaintId;
      }

      const complaint = await Complaint.findOne(query);
      
      if (!complaint) {
        return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
      }

      // Security Check: Engineers can only update certain fields on their assigned tickets
      if (session.role === 'engineer') {
        if (complaint.assignedTo?.toString() !== session.userId) {
            return NextResponse.json({ message: 'Forbidden: You can only update complaints assigned to you.' }, { status: 403 });
        }
        // Prevent engineer from changing assignment or other critical fields
        delete body.assignedTo;
        delete body.priority;
      }


      const isHistoryUpdate = body.history && Array.isArray(body.history);

      // If the body contains a history array, it's a specific history update (like from communication tab or status change)
      if (isHistoryUpdate) {
        complaint.history.push(...body.history);
      }
      
      const updatedFields: { [key: string]: any } = {};
      const details: { [key: string]: any } = {};


      for (const field in body) {
        if (field !== 'history' && body.hasOwnProperty(field)) {
          if (String(complaint[field as keyof typeof complaint]) !== String(body[field])) {
              details[field] = { old: complaint[field as keyof typeof complaint], new: body[field] };
          }
          updatedFields[field] = body[field];
        }
      }
      
      Object.assign(complaint, updatedFields);

      // Generic update logging, only if it's not a specific history update from the client
      if (Object.keys(details).length > 0 && !isHistoryUpdate) {
        let action = 'Complaint Fields Updated';
        
        // Make the action more specific if possible
        if (details.status) {
          action = `Status changed to ${details.status.new}`;
        } else if (details.assignedTo) {
          action = `Assigned to new engineer`;
        }

        const historyEntry = {
          action: action,
          user: session.name, 
          timestamp: new Date(),
          details: details,
        };
        complaint.history.push(historyEntry);
      }


      await complaint.save();
  
      const populatedComplaint = await Complaint.findById(complaint._id).populate('assignedTo');

      return NextResponse.json(populatedComplaint);
    } catch (error: any) {
      console.error('Failed to update complaint:', error);
      return NextResponse.json(
        { message: 'Failed to update complaint', details: error.toString() },
        { status: 500 }
      );
    }
}

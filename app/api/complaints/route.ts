
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import Counter from '@/app/models/Counter';
import { getSession } from '@/app/lib/session';
import nodemailer from 'nodemailer';
import { getAndRenderTemplate } from '@/app/lib/templates';
import Setting from '@/app/models/Setting';
import { CreateComplaintSchema } from '@/app/lib/validators/schemas';
import { sanitizeObject, sanitizeArray } from '@/app/lib/security/sanitize-response';

export const dynamic = 'force-dynamic';

const defaultSignature = `
--
Network Support, ICT Section
Gujarat National Law University
Attalika Avenue, Knowledge Corridor, Koba,
Gandhinagar-382426, Gujarat, INDIA.
Tel: +91- 7923276611/12 | Website: www.gnlu.ac.in
`;

async function getSignature(tenantId: string | null) {
  if (!tenantId) return defaultSignature;
  try {
    await dbConnect();
    const signatureSetting = await Setting.findOne({ tenant: tenantId, key: 'emailSignature' });
    return signatureSetting ? signatureSetting.value : defaultSignature;
  } catch (error) {
    console.error("Failed to fetch signature, using default:", error);
    return defaultSignature;
  }
}

async function getNextSequence(name: string) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const engineerId = searchParams.get('engineerId');
    const brief = searchParams.get('brief');

    const query: any = {};

    // Scope all queries by tenant, unless user is a super-admin
    if (session.role !== 'super-admin') {
      query.tenant = session.tenant;
    }

    if (session?.role === 'engineer') {
        query.assignedTo = session.userId;
    }

    // if an engineerId is passed, this is for the engineer dashboard
    if (engineerId && (session?.userId === engineerId || session.role === 'admin' || session.role === 'super-admin')) {
        query.assignedTo = engineerId;
    }

    if (status && status !== 'all') {
      if (status === 'open') {
        query.status = { $ne: 'closed' };
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
        { ticketNumber: { $regex: search, $options: 'i' } },
      ];
    }

    let complaintQuery = Complaint.find(query);

    if (brief) {
      // Added history and updatedAt to ensure AuditDashboard works correctly
      complaintQuery.select('id title priority status assignedTo createdAt updatedAt history');
    }

    const complaints = await complaintQuery
      .populate('assignedTo', 'name avatar')
      .sort({ createdAt: -1 });

    // Sanitize response to prevent data exposure
    const sanitized = sanitizeArray(
      complaints.map(c => c.toObject()),
      'complaint',
      session.role
    );

    return NextResponse.json(sanitized);
  } catch (error: any) {
    console.error('Failed to fetch complaints:', error);
    return NextResponse.json(
      { message: 'Failed to fetch complaints', details: error.toString() },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await getSession(request);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const body = await request.json();

    // Validate input with Zod schema
    const validatedData = CreateComplaintSchema.parse(body);

    const nextId = await getNextSequence('complaintId');
    const padded = String(nextId).padStart(3, '0');
    
    const newId = `CMP-${padded}`;

    const complaintData = {
      tenant: session.tenant,
      id: newId,
      ticketNumber: `TKT-${new Date().getFullYear()}-${padded}`,
      title: validatedData.title,
      description: validatedData.description,
      type: 'complaint',
      reporter: session.email,
      reporterEmail: session.email,
      status: 'created',
      priority: validatedData.priority || 'medium',
      category: validatedData.category || 'uncategorized',
      building: body.building,
      room: body.room,
      phone: body.phone,
      assignedTo: body.assignedTo,
      attachments: validatedData.attachments || [],
      history: [
        {
          action: 'Complaint Created',
          userId: session.userId,
          timestamp: new Date(),
        },
      ],
      createdBy: session.userId,
      createdByTenant: session.tenant,
    };

    const newComplaint = new Complaint(complaintData);
    await newComplaint.save();

    // Send creation email
    const tenantId = session.tenant;
    const signature = await getSignature(tenantId);
    const { subject, body: emailBody, cc } = await getAndRenderTemplate(tenantId, 'complaintCreatedEmailTemplate', { complaint: newComplaint });

    try {
      const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || '587'),
          secure: (process.env.EMAIL_PORT || '587') === '465',
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
              rejectUnauthorized: false
          }
      });

      const mailOptions = {
          from: process.env.EMAIL_FROM,
          to: newComplaint.reporterEmail,
          cc,
          subject,
          text: `${emailBody}\n\n${signature}`,
      };
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the whole request if email fails
    }

    // Sanitize response before sending to client
    const sanitized = sanitizeObject(
      newComplaint.toObject(),
      'complaint',
      session.role
    );

    return NextResponse.json(sanitized, { status: 201 });
  } catch (error: any) {
    console.error('[Complaint Creation Error]', error);
    
    // Handle validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Failed to create complaint';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

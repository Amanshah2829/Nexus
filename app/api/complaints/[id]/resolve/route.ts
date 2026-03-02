
import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/app/lib/db';
import Complaint from '@/app/models/Complaint';
import Solution from '@/app/models/Solution';
import { getSession } from '@/app/lib/session';
import nodemailer from 'nodemailer';
import { getAndRenderTemplate } from '@/app/lib/templates';
import Setting from '@/app/models/Setting';

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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getSession(request);
        if (!session || (session.role !== 'admin' && session.role !== 'super-admin' && session.role !== 'engineer')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const body = await request.json();
        const { resolutionNotes, saveAsSolution } = body;
        const complaintId = params.id;

        const complaint = await Complaint.findById(complaintId);

        if (!complaint) {
            return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
        }

        // Update complaint
        complaint.status = 'closed';
        complaint.resolvedAt = new Date();
        const historyEntry = {
            action: 'Complaint Resolved',
            user: session.name || 'Engineer',
            timestamp: new Date(),
            details: { message: resolutionNotes }
        };
        complaint.history.push(historyEntry);
        await complaint.save();

        // Optionally create a solution
        if (saveAsSolution) {
            await new Solution({
                tenant: complaint.tenant,
                title: complaint.title,
                description: complaint.description,
                category: complaint.category,
                resolution: resolutionNotes,
                createdBy: session.userId,
                complaintId: complaint._id
            }).save();
        }

        // Send resolution email
        const tenantId = complaint.tenant?.toString() || null;
        const signature = await getSignature(tenantId);
        const { subject, body: emailBody, cc } = await getAndRenderTemplate(tenantId, 'complaintResolvedEmailTemplate', { complaint, notes: resolutionNotes });
        
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
            to: complaint.reporterEmail,
            cc,
            subject,
            text: `${emailBody}\n\n${signature}`,
        };
        await transporter.sendMail(mailOptions);


        return NextResponse.json(complaint);

    } catch (error: any) {
        console.error('Failed to resolve complaint:', error);
        return NextResponse.json({ message: 'Failed to resolve complaint', details: error.toString() }, { status: 500 });
    }
}

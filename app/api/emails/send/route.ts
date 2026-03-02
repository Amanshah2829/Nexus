
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dbConnect from '@/app/lib/db';
import Setting from '@/app/models/Setting';
import User from '@/app/models/User';
import { decrypt } from '@/app/lib/crypto';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getSignature() {
  try {
    await dbConnect();
    const signatureSetting = await Setting.findOne({ key: 'emailSignature' });
    if (signatureSetting) {
        return signatureSetting.value;
    }
  } catch (error) {
    console.error("Failed to fetch signature, using default:", error);
  }
  return `
--
Network Support, ICT Section
Gujarat National Law University
Attalika Avenue, Knowledge Corridor, Koba,
Gandhinagar-382426, Gujarat, INDIA.
Tel: +91- 7923276611/12 | Website: www.gnlu.ac.in
`;
}

async function getUserSmtpConfig() {
    await dbConnect();
    const sessionCookie = cookies().get('session');
    if (!sessionCookie) throw new Error('Not authenticated');

    const session = JSON.parse(sessionCookie.value);
    const userId = session.userId;
    if (!userId) throw new Error('Invalid session');

    const user = await User.findById(userId).select('+emailConfig');
    if (!user || !user.emailConfig) throw new Error('Email not configured for this user.');

    const { smtpHost, smtpPort, smtpUser, smtpPassword } = user.emailConfig;
    
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
        throw new Error('Incomplete SMTP configuration.');
    }
    
    return {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
            user: smtpUser,
            pass: decrypt(smtpPassword),
        },
        tls: { rejectUnauthorized: false }
    };
}


export async function POST(request: Request) {
  try {
    const smtpConfig = await getUserSmtpConfig();
    const fromEmail = smtpConfig.auth.user;
    
    const body = await request.json();
    const { to, cc, bcc, subject, text, attachments, inReplyTo, references } = body;

    const signature = await getSignature();

    const transporter = nodemailer.createTransport(smtpConfig);

    const mailOptions = {
      from: fromEmail,
      to,
      cc,
      bcc,
      subject,
      text: `${text}\n\n${signature}`,
      attachments,
      inReplyTo,
      references
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Failed to send email:', error.message);
    return NextResponse.json({ message: `Failed to send email: ${error.message}` }, { status: 500 });
  }
}

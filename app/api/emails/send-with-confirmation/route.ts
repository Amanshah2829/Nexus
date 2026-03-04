import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/app/lib/session';
import { emailService } from '@/app/lib/services/email-service';
import { ZodError, z } from 'zod';

const SendEmailSchema = z.object({
  recipientEmail: z.string().email('Invalid recipient email'),
  recipientName: z.string().optional(),
  senderEmail: z.string().email('Invalid sender email'),
  senderName: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  htmlContent: z.string().min(1, 'Email content is required'),
  ccEmails: z.array(z.string().email()).optional(),
  bccEmails: z.array(z.string().email()).optional(),
  attachments: z
    .array(
      z.object({
        name: z.string(),
        size: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = SendEmailSchema.parse(body);

    // Verify sender email matches user's email or is tenant email
    if (
      validatedData.senderEmail !== session.email &&
      validatedData.senderEmail !== process.env.EMAIL_FROM
    ) {
      return NextResponse.json(
        { message: 'You can only send emails from your account' },
        { status: 403 }
      );
    }

    // Log email attempt
    console.log('[Email API] Send request received:', {
      to: validatedData.recipientEmail,
      from: validatedData.senderEmail,
      subject: validatedData.subject,
      user: session.email,
      timestamp: new Date().toISOString(),
    });

    // Send email
    const result = await emailService.sendEmail({
      recipientEmail: validatedData.recipientEmail,
      recipientName: validatedData.recipientName,
      senderEmail: validatedData.senderEmail,
      senderName: validatedData.senderName,
      subject: validatedData.subject,
      htmlContent: validatedData.htmlContent,
      ccEmails: validatedData.ccEmails,
      bccEmails: validatedData.bccEmails,
      attachments: validatedData.attachments,
    });

    if (!result.success) {
      return NextResponse.json(
        { message: 'Failed to send email', error: result.error },
        { status: 500 }
      );
    }

    // Log successful send
    console.log('[Email API] Email sent successfully:', {
      messageId: result.messageId,
      to: validatedData.recipientEmail,
      user: session.email,
    });

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          message: 'Validation error',
          errors: error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Email API] Error sending email:', {
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'Failed to send email', error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Test email service
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || !['super-admin', 'admin'].includes(session.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const result = await emailService.testConnection();

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

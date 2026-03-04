import nodemailer from 'nodemailer';
import { EmailConfirmationData } from '@/app/components/dialogs/email-confirmation-dialog';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
      },
    };

    this.transporter = nodemailer.createTransport({
      ...config,
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  /**
   * Validate email before sending
   */
  validateEmail(data: EmailConfirmationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.recipientEmail) {
      errors.push('Recipient email is required');
    }

    if (!this.isValidEmail(data.recipientEmail)) {
      errors.push('Invalid recipient email format');
    }

    if (!data.subject || data.subject.trim().length === 0) {
      errors.push('Subject is required');
    }

    if (!data.htmlContent || data.htmlContent.trim().length === 0) {
      errors.push('Email content is required');
    }

    if (data.ccEmails) {
      data.ccEmails.forEach((email) => {
        if (!this.isValidEmail(email)) {
          errors.push(`Invalid CC email: ${email}`);
        }
      });
    }

    if (data.bccEmails) {
      data.bccEmails.forEach((email) => {
        if (!this.isValidEmail(email)) {
          errors.push(`Invalid BCC email: ${email}`);
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Send email with validation
   */
  async sendEmail(data: EmailConfirmationData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      // Validate email data
      const validation = this.validateEmail(data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join('; '),
        };
      }

      // Prepare email options
      const mailOptions = {
        from: data.senderEmail,
        to: data.recipientEmail,
        cc: data.ccEmails?.join(','),
        bcc: data.bccEmails?.join(','),
        subject: data.subject,
        html: data.htmlContent,
        replyTo: data.senderEmail,
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      // Log successful send
      console.log('[EmailService] Email sent successfully:', {
        messageId: info.messageId,
        to: data.recipientEmail,
        subject: data.subject,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[EmailService] Failed to send email:', {
        error: errorMessage,
        to: data.recipientEmail,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send email with template
   */
  async sendTemplatedEmail(
    recipientEmail: string,
    subject: string,
    templateName: string,
    templateData: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Import template rendering function
      const { renderTemplate } = await import('@/app/lib/templates');

      const htmlContent = await renderTemplate(templateName, templateData);

      return this.sendEmail({
        recipientEmail,
        senderEmail: process.env.EMAIL_USER || 'noreply@nexus.app',
        senderName: 'Nexus Support',
        subject,
        htmlContent,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Batch send emails
   */
  async sendBatchEmails(
    emails: EmailConfirmationData[]
  ): Promise<{ successful: number; failed: number; errors: string[] }> {
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const emailData of emails) {
      const result = await this.sendEmail(emailData);
      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push(`Failed to send to ${emailData.recipientEmail}: ${result.error}`);
      }
    }

    return results;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      await this.transporter.verify();
      console.log('[EmailService] SMTP connection verified');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[EmailService] SMTP connection failed:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;

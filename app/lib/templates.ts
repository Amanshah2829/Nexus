
/**
 * @fileoverview Centralized email template management.
 */

import dbConnect from '@/app/lib/db';
import Setting from '@/app/models/Setting';
import { IComplaint } from '@/app/models/Complaint';
import { IUser } from '@/app/models/User';
import mongoose from 'mongoose';
import { ITenant } from '@/app/models/Tenant';

type TemplateData = {
    complaint?: IComplaint;
    user?: IUser;
    tenant?: ITenant;
    [key: string]: any;
};

// Default templates to ensure the system works out-of-the-box
const defaultTemplates: { [key: string]: { name: string, description: string, subject: string, body: string, cc?: string } } = {
    emailVerification: {
        name: "New User Email Verification",
        description: "Sent to new users upon signup to verify their email address.",
        subject: "Verify your email address",
        body: `Dear {{user.name}},\n\nWelcome! Your verification code is: {{otp}}\n\nThis code will expire in 10 minutes. Please enter it on the verification page to complete your registration.`
    },
    newTenantWelcome: {
        name: "New Tenant Welcome",
        description: "Sent to a new tenant admin after successful onboarding.",
        subject: "Welcome to Complaint Manager! Your 30-Day Trial has Started",
        body: `Hi {{user.name}},\n\nWelcome aboard!\n\nYour account and organization '{{tenant.name}}' have been successfully created. Your 30-day free trial starts now and will end on {{tenant.subscriptionEndDate}}.\n\nDuring your trial, you have full access to all features, including:\n- Complaint Management\n- Email-to-Ticket Conversion\n- Inventory & Asset Tracking\n- User & Role Management\n\nWe recommend starting by adding your engineers and configuring your site locations in the settings.\n\nIf you have any questions, feel free to reply to this email.\n\nBest regards,\nThe Team`
    },
    superAdminNewTenantNotification: {
        name: "Super Admin: New Tenant Alert",
        description: "Notifies super admins when a new tenant signs up.",
        subject: "New Tenant Signup: {{tenant.name}}",
        body: `Hello Super Admin,\n\nA new tenant has just signed up for a free trial.\n\nOrganization: {{tenant.name}}\nAdmin Name: {{user.name}}\nAdmin Email: {{user.email}}\nIndustry: {{tenant.industry}}\nCompany Size: {{tenant.companySize}}\n\nThe trial will end on {{tenant.subscriptionEndDate}}.\n\nYou can manage this tenant from the Super Admin dashboard.`
    },
    userWelcome: {
        name: "New User Welcome",
        description: "Sent to new users when their account is created by an admin.",
        subject: "Welcome to the Campus Complaint Management System",
        body: `Dear {{user.name}},\n\nAn account has been created for you on the Campus Complaint Management system.\n\nYou can now log in using the following credentials:\nEmail: {{user.email}}\nTemporary Password: {{password}}\n\nPlease log in and change your password immediately from your profile settings.`
    },
    forgotPassword: {
        name: "Forgot Password",
        description: "Sent when a user requests a password reset from the login page.",
        subject: "Your Password has been Reset",
        body: `Dear {{user.name}},\n\nA password reset was requested for your account on the Campus Complaint Management system.\n\nYour new temporary password is: {{password}}\n\nPlease log in using this password and change it immediately from your profile settings.\n\nIf you did not request this change, please contact IT support.`
    },
    adminResetPassword: {
        name: "Admin Password Reset",
        description: "Sent to a user when an admin resets their password.",
        subject: "Your Password has been Reset by an Administrator",
        body: `Dear {{user.name}},\n\nYour password for the Campus Complaint Management system has been reset by an administrator.\n\nYour new temporary password is: {{password}}\n\nPlease log in using this password and change it immediately from your profile settings.\n\nIf you did not request this action, please contact IT support immediately.`
    },
    complaintCreated: {
        name: "Complaint Created",
        description: "Confirmation email sent to the reporter when a new complaint is successfully logged.",
        subject: "Complaint Received: {{complaint.title}} [{{complaint.id}}]",
        body: `Dear {{complaint.reporter}},\n\nThis is an automated message to confirm that we have received your complaint (ID: {{complaint.id}}).\n\nTitle: {{complaint.title}}\nDescription: {{complaint.description}}\n\nOur team will review your request and you will be notified of any updates. You can track the status of your complaint by replying to this email.`
    },
    complaintUpdated: {
        name: "Complaint Updated",
        description: "Generic notification sent when a complaint's details (e.g., status, priority) are updated.",
        subject: "Update on your complaint: {{complaint.title}} [{{complaint.id}}]",
        body: `Dear {{complaint.reporter}},\n\nThere has been an update on your complaint (ID: {{complaint.id}}).\n\nNew Status: {{complaint.status}}\n\n{{#if notes}}Engineer's Note: {{notes}}{{/if}}\n\nOur team is working on it.`
    },
    complaintResolved: {
        name: "Complaint Resolved/Closed",
        description: "Sent to the reporter when their complaint has been marked as resolved and closed.",
        subject: "Resolved: Your complaint '{{complaint.title}}' [{{complaint.id}}]",
        body: `Dear {{complaint.reporter}},\n\nWe are pleased to inform you that your complaint (ID: {{complaint.id}}) has been resolved.\n\nResolution Note: {{notes}}\n\nIf you feel the issue is not resolved, please reply to this email to reopen the ticket. Thank you for your patience.`
    },
    complaintReopened: {
        name: "Complaint Reopened",
        description: "Sent to the assigned engineer/admin when a user reopens a complaint by replying to a resolution email.",
        subject: "Complaint Reopened by User: {{complaint.title}} [{{complaint.id}}]",
        body: `Hello Team,\n\nThe user {{complaint.reporter}} has reopened the complaint (ID: {{complaint.id}}) by replying to the resolution email.\n\nUser's Message:\n{{notes}}\n\nPlease review the complaint and take necessary action.`
    },
    complaintFollowUp: {
        name: "Complaint Follow-up",
        description: "Used by engineers to request more information from a user or to provide an interim update.",
        subject: "Follow-up on your complaint: {{complaint.title}} [{{complaint.id}}]",
        body: `Dear {{complaint.reporter}},\n\nWe are following up on your complaint (ID: {{complaint.id}}).\n\n{{notes}}\n\nPlease reply to this email with the requested information.`
    },
    assetAllotted: {
        name: "Asset Allotment",
        description: "Email sent to a user when a new asset (like a WiFi extender) has been allotted to them.",
        subject: "Asset Allotted to You: {{asset.model}}",
        body: `Dear {{user.name}},\n\nAn asset has been allotted to you in relation to your complaint (ID: {{complaint.id}}).\n\nAsset: {{asset.make}} {{asset.model}}\nSerial Number: {{asset.serialNumber}}\n\n{{#if notes}}{{notes}}{{/if}}\n\nPlease keep this email for your records.`
    },
    assetReturned: {
        name: "Asset Return Confirmation",
        description: "Confirmation sent to a user after they have successfully returned an allotted asset.",
        subject: "Asset Return Confirmation: {{asset.model}}",
        body: `Dear {{user.name}},\n\nThis is to confirm that we have received the following asset from you:\n\nAsset: {{asset.make}} {{asset.model}}\nSerial Number: {{asset.serialNumber}}\n\nThank you.`
    },
    assetReturnReminder: {
        name: "Asset Return Reminder",
        description: "An automated reminder sent to a user if an asset has not been returned after a complaint is closed.",
        subject: "Reminder: Please Return Allotted Asset",
        body: `Dear {{user.name}},\n\nThis is a friendly reminder to please return the asset that was temporarily allotted to you for complaint (ID: {{complaint.id}}).\n\nAsset: {{asset.make}} {{asset.model}}\nSerial Number: {{asset.serialNumber}}\n\nPlease return it to the IT department at your earliest convenience.`
    },
};

/**
 * Fetches a template for a specific tenant, falling back to the default if not found in DB.
 * @param tenantId The ID of the tenant.
 * @param key The key of the template to fetch (without the tenant prefix).
 */
async function getTemplate(tenantId: string | null, key: string): Promise<{ subject: string; body: string; cc?: string; }> {
    await dbConnect();

    // Try to find a tenant-specific template first
    if (tenantId && mongoose.Types.ObjectId.isValid(tenantId)) {
        const fullKey = `tenant_${tenantId}_${key}`;
        const tenantSetting = await Setting.findOne({ key: fullKey });
        if (tenantSetting && typeof tenantSetting.value === 'object' && tenantSetting.value.subject && tenantSetting.value.body) {
            return tenantSetting.value;
        }
    }
    
    // Fallback to the hardcoded default
    const defaultTemplate = defaultTemplates[key];
    if (defaultTemplate) {
        return defaultTemplate;
    }

    throw new Error(`Email template with key "${key}" not found.`);
}


/**
 * Renders an email template with the given data.
 * @param template The template object with subject and body.
 * @param data The data to inject into the template.
 */
function renderTemplate(template: { subject: string; body: string; cc?: string; }, data: TemplateData): { subject: string; body: string; cc?: string; } {
    let renderedSubject = template.subject;
    let renderedBody = template.body;
    let renderedCc = template.cc;

    const regex = /\{\{\s*([\w\.]+)\s*\}\}/g;

    const replacer = (match: string, path: string) => {
        const keys = path.split('.');
        let value: any = data;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return match; // Return original placeholder if path is invalid
            }
        }
        
        // Format date if it's a date object
        if (value instanceof Date) {
            return value.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        return String(value);
    };

    renderedSubject = renderedSubject.replace(regex, replacer);
    renderedBody = renderedBody.replace(regex, replacer);
    if(renderedCc) {
        renderedCc = renderedCc.replace(regex, replacer);
    }
    
    // Simple conditional logic for notes
    if (data.notes) {
        renderedBody = renderedBody.replace(/\{\{#if notes\}\}(.*?)\{\{\/if\}\}/gs, '$1');
        renderedBody = renderedBody.replace(/\{\{notes\}\}/g, data.notes);
    } else {
        renderedBody = renderedBody.replace(/\{\{#if notes\}\}.*?\{\{\/if\}\}/gs, '');
    }

    return { subject: renderedSubject, body: renderedBody, cc: renderedCc };
}

/**
 * Main function to get and render an email template for a specific tenant.
 * @param tenantId The ID of the tenant.
 * @param key The key of the template.
 * @param data The data for rendering.
 */
export async function getAndRenderTemplate(tenantId: string | null, key: string, data: TemplateData): Promise<{ subject: string; body: string; cc?: string; }> {
    const templateKey = key.replace('EmailTemplate', '');
    const template = await getTemplate(tenantId, templateKey);
    return renderTemplate(template, data);
}

/**
 * Initializes default templates in the database for a given tenant if they don't exist.
 */
export async function initializeDefaultTemplates(tenantId: string) {
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
        console.error("Invalid tenantId for template initialization:", tenantId);
        return;
    }
    await dbConnect();
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    
    const operations = Object.entries(defaultTemplates).map(([key, value]) => {
        const fullKey = `tenant_${tenantId}_${key}`;
        return {
            updateOne: {
                filter: { key: fullKey },
                update: { $setOnInsert: { key: fullKey, value: value, tenant: tenantObjectId } },
                upsert: true
            }
        };
    });

    if (operations.length > 0) {
        await Setting.bulkWrite(operations);
    }
}

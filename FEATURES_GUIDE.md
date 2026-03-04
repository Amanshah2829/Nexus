# Comprehensive Features Guide

## Email Confirmation System

### Overview
The email confirmation system allows users to review and confirm email details before sending. This prevents accidental emails and provides transparency.

### Components

#### 1. Email Confirmation Dialog (`components/dialogs/email-confirmation-dialog.tsx`)
Displays a detailed preview of the email before sending.

**Features:**
- Sender information display
- Recipient details (primary, CC, BCC)
- Subject line preview
- Email content in HTML preview
- Attachment list
- Copy-to-clipboard functionality
- Safety warning

**Usage:**
```tsx
<EmailConfirmationDialog
  open={isDialogOpen}
  onOpenChange={setIsDialogOpen}
  emailData={emailData}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  loading={isLoading}
/>
```

#### 2. Email Service (`lib/services/email-service.ts`)
Handles email sending logic with validation.

**Key Methods:**
- `sendEmail()` - Send individual email with validation
- `sendBatchEmails()` - Send multiple emails
- `sendTemplatedEmail()` - Send using email templates
- `validateEmail()` - Validate email data before sending
- `testConnection()` - Test SMTP connection

**Usage:**
```typescript
import { emailService } from '@/app/lib/services/email-service';

const result = await emailService.sendEmail({
  recipientEmail: 'user@example.com',
  senderEmail: 'support@app.com',
  subject: 'Hello',
  htmlContent: '<p>Email content</p>',
});
```

#### 3. Email Hook (`hooks/use-email-confirmation.ts`)
React hook for managing email confirmation flow.

**State:**
- `isOpen` - Dialog open/closed state
- `isLoading` - Email sending state
- `emailData` - Current email data

**Methods:**
- `requestConfirmation()` - Show dialog with email data
- `sendEmail()` - Send email after confirmation
- `cancel()` - Close dialog and cancel

**Usage:**
```tsx
const {
  isOpen,
  emailData,
  requestConfirmation,
  sendEmail,
  cancel,
} = useEmailConfirmation({
  onSuccess: (messageId) => console.log('Sent:', messageId),
  onError: (error) => console.error('Error:', error),
});

// Request confirmation
requestConfirmation({
  recipientEmail: 'user@example.com',
  senderEmail: 'support@app.com',
  subject: 'Test',
  htmlContent: '<p>Content</p>',
});
```

### API Endpoint

#### POST `/api/emails/send-with-confirmation`
Sends email with validation.

**Request:**
```json
{
  "recipientEmail": "user@example.com",
  "senderEmail": "support@app.com",
  "senderName": "Support Team",
  "subject": "Test Email",
  "htmlContent": "<p>Email content</p>",
  "ccEmails": ["cc@example.com"],
  "bccEmails": ["bcc@example.com"]
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "message-id-123",
  "message": "Email sent successfully"
}
```

---

## Role-Based Admin Dashboards

### Super Admin Dashboard
**Path:** `components/dashboards/super-admin-dashboard.tsx`

**Access:** Super-admin users only

**Features:**
- View all tenants
- Tenant statistics (active, inactive, suspended)
- Tenant management (view, edit, delete)
- System settings
- Audit logs
- Search and filter capabilities
- Subscription tier management

### Tenant Admin Dashboard
**Path:** `components/dashboards/tenant-admin-dashboard.tsx`

**Access:** Tenant admins

**Features:**
- Team member management
- Role assignment (Admin, HOD, Engineer, User)
- Invite new members
- Remove team members
- Member status tracking
- Role configuration
- Email notification settings
- Organization profile management

### HOD Dashboard
**Path:** `components/dashboards/hod-dashboard.tsx`

**Access:** Heads of Department

**Features:**
- Department statistics
- Team performance tracking
- Complaint trends
- Status distribution charts
- Individual engineer metrics
- Resolution time tracking
- Performance progress bars

---

## Dark Mode Support

### Configuration
Dark mode is automatically applied based on system preferences and user selection.

**Features:**
- Automatic theme detection
- User preference persistence
- Smooth color transitions
- Consistent styling across all components

### Color Variables
All colors are defined in `globals.css` with separate light and dark variants:

**Light Mode:**
- Background: `#ffffff`
- Primary: `#2563eb`
- Accent: `#10b981`

**Dark Mode:**
- Background: `#0f172a`
- Primary: `#3b82f6`
- Accent: `#34d399`

### Component Support
All components automatically support dark mode through CSS variables and Tailwind's dark mode modifier.

---

## Admin API Routes

### Tenants Management

#### GET `/api/admin/tenants`
Fetch all tenants (super-admin only)

**Response:**
```json
[
  {
    "id": "tenant-1",
    "name": "Company A",
    "email": "admin@company-a.com",
    "status": "active",
    "usersCount": 25,
    "complaintsCount": 152,
    "subscriptionTier": "enterprise",
    "storageUsed": 2048,
    "storageLimit": 10240
  }
]
```

#### POST `/api/admin/tenants`
Create new tenant (super-admin only)

**Request:**
```json
{
  "name": "Company B",
  "email": "admin@company-b.com",
  "subscriptionTier": "pro"
}
```

---

### Team Members Management

#### GET `/api/admin/team-members`
Fetch team members (admin/tenant-admin)

**Response:**
```json
[
  {
    "id": "user-1",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "engineer",
    "department": "IT Support",
    "status": "active",
    "joinedAt": "2024-01-15T10:00:00Z"
  }
]
```

#### POST `/api/admin/team-members/invite`
Invite new team member

**Request:**
```json
{
  "email": "newuser@company.com",
  "role": "engineer"
}
```

#### PATCH `/api/admin/team-members/[id]`
Update team member

**Request:**
```json
{
  "role": "hod",
  "department": "IT",
  "isActive": true
}
```

#### DELETE `/api/admin/team-members/[id]`
Remove team member (admin only)

---

## Responsive Design

All pages and components are designed to work seamlessly across:
- **Mobile:** 320px - 640px
- **Tablet:** 641px - 1024px
- **Desktop:** 1025px+

### Key Responsive Features
- Flexible grid layouts
- Touch-friendly buttons and inputs
- Collapsible navigation
- Adaptive table views
- Responsive dialogs

---

## Security Features

### Data Protection
- Sensitive fields excluded from API responses
- Password hashing with bcrypt
- JWT authentication with refresh tokens
- Row-level security for multi-tenant data

### Input Validation
- Server-side validation with Zod schemas
- XSS prevention through HTML sanitization
- CSRF protection on all state-changing operations

### IDOR Prevention
- Tenant ownership verification on all requests
- Role-based access control
- Field-level permissions

---

## Integration Examples

### Using Email Confirmation in a Component

```tsx
'use client';

import { useState } from 'react';
import { EmailConfirmationDialog } from '@/app/components/dialogs/email-confirmation-dialog';
import { useEmailConfirmation } from '@/app/hooks/use-email-confirmation';

export function EmailExample() {
  const { isOpen, emailData, requestConfirmation, sendEmail, cancel } =
    useEmailConfirmation({
      onSuccess: () => console.log('Email sent!'),
      onError: (error) => console.error('Failed:', error),
    });

  const handleSendEmail = () => {
    requestConfirmation({
      recipientEmail: 'user@example.com',
      senderEmail: 'noreply@app.com',
      senderName: 'App Support',
      subject: 'Welcome to Our App',
      htmlContent: '<h1>Welcome!</h1><p>Your account is ready.</p>',
    });
  };

  return (
    <>
      <button onClick={handleSendEmail}>Send Email</button>

      {emailData && (
        <EmailConfirmationDialog
          open={isOpen}
          onOpenChange={() => {}}
          emailData={emailData}
          onConfirm={sendEmail}
          onCancel={cancel}
        />
      )}
    </>
  );
}
```

### Implementing Admin Dashboard

```tsx
import { SuperAdminDashboard } from '@/app/components/dashboards/super-admin-dashboard';
import { TenantAdminDashboard } from '@/app/components/dashboards/tenant-admin-dashboard';
import { HODDashboard } from '@/app/components/dashboards/hod-dashboard';

export default function AdminPage() {
  const { role } = useSession();

  if (role === 'super-admin') {
    return <SuperAdminDashboard />;
  }

  if (role === 'admin') {
    return <TenantAdminDashboard />;
  }

  if (role === 'hod') {
    return <HODDashboard />;
  }

  return <div>Access Denied</div>;
}
```

---

## Troubleshooting

### Email Not Sending
1. Check email credentials in `.env.local`
2. Verify SMTP connection: `GET /api/emails/send-with-confirmation`
3. Check email validation errors in response
4. Review email service logs

### Dark Mode Not Applying
1. Clear browser cache
2. Check theme provider in `providers.tsx`
3. Verify CSS variables in `globals.css`
4. Check for conflicting styles

### Admin Access Denied
1. Verify user role in database
2. Check tenant assignment
3. Ensure session is valid
4. Review role-based permissions

---

## Best Practices

1. **Always show confirmation dialog before sending emails** to prevent accidental sends
2. **Validate all inputs server-side** even if client-side validation passes
3. **Use proper error handling** and show user-friendly messages
4. **Log all admin actions** for audit trails
5. **Test email templates** in both light and dark modes
6. **Use role-based access control** consistently across all admin pages
7. **Monitor email sending metrics** for delivery issues
8. **Implement rate limiting** to prevent abuse

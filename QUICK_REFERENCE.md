# Quick Reference Guide

## Email Confirmation System

### For Using in Components
```typescript
import { useEmailConfirmation } from '@/app/hooks/use-email-confirmation';
import { EmailConfirmationDialog } from '@/app/components/dialogs/email-confirmation-dialog';

export function MyComponent() {
  const { isOpen, emailData, requestConfirmation, sendEmail, cancel } = 
    useEmailConfirmation({
      onSuccess: (messageId) => console.log('Sent:', messageId),
      onError: (error) => console.error('Error:', error),
    });

  const handleSend = () => {
    requestConfirmation({
      recipientEmail: 'user@example.com',
      senderEmail: 'support@app.com',
      subject: 'Hello',
      htmlContent: '<p>Content</p>',
    });
  };

  return (
    <>
      <button onClick={handleSend}>Send Email</button>
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

### For API Usage
```typescript
// Send email via API
const response = await fetch('/api/emails/send-with-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipientEmail: 'user@example.com',
    senderEmail: 'support@app.com',
    subject: 'Test',
    htmlContent: '<p>Content</p>',
    ccEmails: ['cc@example.com'],
    bccEmails: ['bcc@example.com'],
  }),
});
```

---

## Admin Dashboards

### Route to Correct Dashboard
```typescript
// Navigate to /admin
// Automatically routes based on user role:
// - super-admin → SuperAdminDashboard
// - admin/tenant-admin → TenantAdminDashboard
// - hod → HODDashboard
```

### Import Specific Dashboard
```typescript
import { SuperAdminDashboard } from '@/app/components/dashboards/super-admin-dashboard';
import { TenantAdminDashboard } from '@/app/components/dashboards/tenant-admin-dashboard';
import { HODDashboard } from '@/app/components/dashboards/hod-dashboard';

// Use as needed
```

---

## Admin API Endpoints

### List All Tenants
```typescript
const response = await fetch('/api/admin/tenants', {
  headers: { 'Content-Type': 'application/json' },
});
const tenants = await response.json();
// Response: { id, name, email, status, usersCount, complaintsCount, subscriptionTier, storageUsed, storageLimit }[]
```

### Create Tenant
```typescript
const response = await fetch('/api/admin/tenants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Company Name',
    email: 'admin@company.com',
    subscriptionTier: 'pro',
  }),
});
```

### List Team Members
```typescript
const response = await fetch('/api/admin/team-members', {
  headers: { 'Content-Type': 'application/json' },
});
const members = await response.json();
// Response: { id, name, email, role, department, status, joinedAt }[]
```

### Invite Team Member
```typescript
const response = await fetch('/api/admin/team-members/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@company.com',
    role: 'engineer', // 'admin' | 'hod' | 'engineer' | 'user'
  }),
});
```

### Update Team Member
```typescript
const response = await fetch('/api/admin/team-members/{id}', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'hod',
    department: 'IT',
    isActive: true,
  }),
});
```

### Remove Team Member
```typescript
const response = await fetch('/api/admin/team-members/{id}', {
  method: 'DELETE',
});
```

---

## Dark Mode

### Automatic
Dark mode is automatic based on:
1. System preference (initially)
2. User theme selection (persistent)
3. Theme provider in providers.tsx

### Manual Toggle
```typescript
// Use existing theme provider functionality
// Component automatically includes theme toggle in header
```

### Color Variables
All colors are CSS variables in globals.css:
- `--background` - Page background
- `--foreground` - Text color
- `--primary` - Primary action color
- `--accent` - Accent color
- `--success`, `--warning`, `--destructive` - Semantic colors

---

## Dialog Manager

### Single Dialog
```typescript
import { useDialog } from '@/app/lib/dialog-manager';

const { isOpen, open, close, getState, onClose } = useDialog('my-dialog');

// Open dialog with data
open({ userId: '123', name: 'John' });

// Close dialog with result
close({ success: true });

// Listen for close
onClose((result) => {
  console.log('Dialog closed with:', result);
});
```

### Multiple Dialogs
```typescript
import { useDialogs } from '@/app/lib/dialog-manager';

const { dialogs, closeAll, getOpenDialogs } = useDialogs([
  'email-dialog',
  'confirm-dialog',
  'settings-dialog'
]);

// Access individual dialogs
dialogs['email-dialog'].open(data);

// Close all at once
closeAll();

// Get list of open dialogs
const openList = getOpenDialogs(); // ['email-dialog', 'confirm-dialog']
```

---

## Responsive Breakpoints

### Usage
```typescript
// Tailwind responsive prefixes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* Mobile: 1 col, Tablet: 2 col, Desktop: 4 col */}
</div>

<div className="hidden md:block">
  {/* Hidden on mobile, visible on tablet+ */}
</div>

<table className="min-w-full overflow-x-auto block md:table">
  {/* Block scroll on mobile, normal table on tablet+ */}
</table>
```

### Breakpoints
- **Mobile:** `<640px` (default)
- **Tablet:** `640px-1024px` (md:)
- **Desktop:** `>1024px` (lg:)

---

## Common Tasks

### Add Email Sending to a Feature
1. Import the hook: `import { useEmailConfirmation } from '@/app/hooks/use-email-confirmation';`
2. Call hook: `const { requestConfirmation, ... } = useEmailConfirmation();`
3. Prepare email data
4. Show dialog: `requestConfirmation(emailData);`
5. Dialog handles the rest

### Create Admin-Only Page
1. Create page.tsx
2. Get session: `const session = await getSession();`
3. Check role: `if (session.role !== 'admin') redirect('/');`
4. Import dashboard: `import { TenantAdminDashboard } from '@/app/components/dashboards/tenant-admin-dashboard';`
5. Render: `return <TenantAdminDashboard />;`

### Add New Admin Feature
1. Add API endpoint in `/api/admin/`
2. Add validation with Zod
3. Check session and role
4. Verify tenant/resource ownership
5. Return sanitized response
6. Document in FEATURES_GUIDE.md

### Ensure Dark Mode Support
1. Use CSS variables for colors (not hardcoded)
2. Use Tailwind dark: modifier: `dark:bg-slate-900`
3. Use semantic color variables
4. Test in both light and dark modes
5. Check contrast ratios

---

## Testing

### Run Tests
```bash
# Check email service
curl -X GET http://localhost:3000/api/emails/send-with-confirmation

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# List tenants (as super-admin)
curl -X GET http://localhost:3000/api/admin/tenants
```

### Manual Testing
Use TESTING_CHECKLIST.md for comprehensive testing guide:
1. Email confirmation system (14 tests)
2. Dark mode verification (18 tests)
3. Admin dashboards (25 tests)
4. Responsive design (12 tests)
5. API endpoints (15 tests)

---

## Environment Variables

### Required for Email
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

### Database
```env
MONGODB_URI=mongodb://...
```

### Session
```env
NEXTAUTH_SECRET=your-secret-key
```

---

## Troubleshooting

### Email Not Sending
- Check .env credentials
- Test SMTP: `GET /api/emails/send-with-confirmation`
- Check email validation errors
- Review server logs

### Dark Mode Not Working
- Clear browser cache
- Check CSS variables in globals.css
- Verify ThemeProvider in providers.tsx
- Check for conflicting styles

### Admin Access Denied
- Verify user role in database
- Check tenant assignment
- Ensure session is valid
- Review role-based permissions

### API Returns 403
- Check user authentication
- Verify user role
- Check tenant ownership
- Review permission rules

---

## Quick Links

- **Email Service:** `app/lib/services/email-service.ts`
- **Admin Dashboards:** `app/components/dashboards/`
- **Admin APIs:** `app/api/admin/`
- **Features Guide:** `FEATURES_GUIDE.md`
- **Testing Checklist:** `TESTING_CHECKLIST.md`

---

## Support

For detailed information:
- Feature documentation: See `FEATURES_GUIDE.md`
- Testing help: See `TESTING_CHECKLIST.md`
- Architecture: See `IMPLEMENTATION_SUMMARY.md`
- API details: See endpoint comments in code

---

Last Updated: 2026-03-05

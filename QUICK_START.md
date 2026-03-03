# Nexus Platform - Quick Start Guide

## Welcome! 👋

This guide will get you up and running with the Nexus platform in 15 minutes.

---

## Step 1: Environment Setup (2 minutes)

### 1.1 Install Dependencies
```bash
npm install
# or
pnpm install
# or
yarn install
```

### 1.2 Configure Environment Variables

Create `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexus

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@nexus.com

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 1.3 Start Development Server
```bash
npm run dev
# Application runs on http://localhost:3000
```

---

## Step 2: Understanding the Codebase (5 minutes)

### Project Structure
```
/app
  /api                 # API endpoints
    /auth             # Authentication APIs
    /complaints       # Complaint management
    /remote-sessions  # Remote support
    /search           # Search functionality
    /analytics        # Analytics endpoints
    /bulk-actions     # Bulk operations
    /export           # Export functionality
  
  /dashboard          # Dashboard pages
  /complaints         # Complaint pages
  
  /models             # Database schemas
  /lib                # Utilities
    /validation.ts    # Zod schemas
    /errors.ts        # Error handling
    /password.ts      # Password security
    /sanitize.ts      # Input sanitization
    /audit.ts         # Audit logging
    /csrf.ts          # CSRF protection
    /realtime.ts      # Real-time events
  
  /components         # React components
    /ui               # UI component library

/public              # Static files
globals.css         # Design system
```

### Key Files to Know
- **globals.css** - Design tokens, colors, typography
- **middleware.ts** - Global security headers
- **models/** - Database schemas
- **lib/validation.ts** - API input schemas
- **DEVELOPER_GUIDE.md** - Detailed development guide

---

## Step 3: Core Concepts (5 minutes)

### 1. Authentication
- Login endpoint: `POST /api/auth/login`
- Session stored in secure HTTP-only cookies
- Rate limited to 5 attempts per minute per IP

### 2. Validation
All APIs validate input with Zod schemas:
```typescript
import { complaintCreateSchema } from '@/app/lib/validation';
const validated = complaintCreateSchema.parse(body);
```

### 3. Error Handling
Custom error classes with proper HTTP status codes:
```typescript
import { ValidationError, NotFoundError, UnauthorizedError } from '@/app/lib/errors';
```

### 4. Audit Logging
All important actions are logged:
```typescript
import { logSuccess, logFailure } from '@/app/lib/audit';
await logSuccess(userId, 'CREATE', 'COMPLAINT', complaintId, changes, request);
```

### 5. Security
- Input sanitization prevents XSS
- CSRF tokens protect state-changing requests
- Account lockout after 5 failed logins
- Passwords hashed with PBKDF2

---

## Step 4: Common Tasks (3 minutes)

### Creating a New API Endpoint

**1. Create the route file** (`app/api/resource/route.ts`):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Model from '@/app/models/Model';
import { getSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const items = await Model.find({ tenant: session.tenant });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { message: 'Error fetching items' },
      { status: 500 }
    );
  }
}
```

**2. Add validation schema** to `app/lib/validation.ts`:
```typescript
export const resourceSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
```

**3. Test with curl or Postman**:
```bash
curl -X GET http://localhost:3000/api/resource \
  -H "Cookie: session=..."
```

### Creating a New Page

**1. Create page component** (`app/dashboard/new-page/page.tsx`):
```typescript
'use client';

import DashboardLayout from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Page Title</h1>
        <Card>
          <CardHeader>
            <CardTitle>Section Title</CardTitle>
          </CardHeader>
          <CardContent>Content here</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

**2. Use styling from design system**:
```typescript
// Colors
<div className="bg-primary text-primary-foreground">Primary</div>
<div className="bg-success">Success</div>

// Typography
<h1 className="h1">Large Heading</h1>
<p className="body">Regular text</p>
<p className="caption">Small text</p>

// Spacing
<div className="p-4 m-4 gap-4">Spaced content</div>
```

### Adding Database Models

**1. Create model file** (`app/models/NewModel.ts`):
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface INewModel extends Document {
  name: string;
  email: string;
  tenant?: string;
  createdAt: Date;
}

const schema = new Schema<INewModel>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  tenant: { type: String, index: true },
  createdAt: { type: Date, default: () => new Date() },
});

// Indexes for common queries
schema.index({ tenant: 1, createdAt: -1 });

const NewModel = mongoose.models.NewModel || 
  mongoose.model<INewModel>('NewModel', schema);

export default NewModel;
```

---

## Step 5: Testing the Remote Support Feature

### 1. Engineer Requests Remote Access
```bash
curl -X POST http://localhost:3000/api/remote-sessions \
  -H "Content-Type: application/json" \
  -H "Cookie: session=..." \
  -d '{
    "complaintId": "complaint-123",
    "duration": 30,
    "requestedAt": "2024-01-01T10:00:00Z"
  }'
```

### 2. Customer Approves Request
Visit: `http://localhost:3000/complaints/[id]`
- Click "Request Remote Support" button
- Review engineer details
- Set permission level (view-only, mouse-only, full-control)
- Click approve

### 3. Monitor Session
```bash
curl -X GET http://localhost:3000/api/remote-sessions \
  -H "Cookie: session=..."
```

---

## Step 6: Database Testing

### Connect to MongoDB
```bash
mongosh "mongodb+srv://username:password@cluster.mongodb.net/nexus"
```

### Common Queries
```javascript
// Check users
db.users.find({}).limit(5)

// Check complaints
db.complaints.find({ status: 'open' })

// Check audit logs
db.auditlogs.find({ action: 'LOGIN' }).sort({ timestamp: -1 }).limit(10)

// Check remote sessions
db.remotesessions.find({ status: 'approved' })
```

---

## Step 7: Reading Logs & Debugging

### View Application Logs
```bash
# In development, logs appear in the terminal
npm run dev
```

### Check Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red error messages

### Debug API Issues
1. Check Network tab in DevTools
2. Look for failed requests
3. Check response status and body
4. Review server console logs

### Example Debug Code
```typescript
// Add temporary debug logging
console.log('[v0] Component state:', state);
console.log('[v0] API response:', response);
console.log('[v0] User session:', session);

// Remove after debugging
```

---

## Common Problems & Solutions

### Problem: MongoDB Connection Failed
**Solution**: 
1. Check MONGODB_URI in `.env.local`
2. Verify IP is whitelisted in MongoDB Atlas
3. Check credentials are correct

### Problem: Email Not Sending
**Solution**:
1. Check EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD in `.env.local`
2. Verify email provider settings
3. Check spam folder for test emails

### Problem: API Returns 401 Unauthorized
**Solution**:
1. Make sure session cookie is included in request
2. Check session hasn't expired
3. Verify user has required role

### Problem: Validation Errors
**Solution**:
1. Check request body matches schema
2. Look at error message for missing fields
3. Verify data types (string, number, email, etc.)

### Problem: Page Won't Load
**Solution**:
1. Check browser console for errors
2. Verify API endpoint exists
3. Check database connection
4. Look for TypeScript errors in terminal

---

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run TypeScript type check
npm run type-check

# Format code
npm run format

# Lint code
npm run lint
```

---

## Important Files to Read

1. **FINAL_SUMMARY.md** - Complete project overview
2. **DEVELOPER_GUIDE.md** - Detailed development patterns
3. **SECURITY_IMPLEMENTATION.md** - Security features and best practices
4. **API_DOCUMENTATION.md** - All API endpoints
5. **INTEGRATION_CHECKLIST.md** - Testing and deployment checklist

---

## Team Contacts

- **Technical Lead**: [Your Name]
- **Product Manager**: [Your Name]
- **DevOps Lead**: [Your Name]
- **QA Lead**: [Your Name]

---

## Getting Help

1. **For code questions**: Check DEVELOPER_GUIDE.md
2. **For API questions**: Check API_DOCUMENTATION.md
3. **For security questions**: Check SECURITY_IMPLEMENTATION.md
4. **For deployment**: Check INTEGRATION_CHECKLIST.md
5. **Still stuck?**: Check git history or ask the team

---

## Next Steps

1. ✓ Set up environment
2. ✓ Start development server
3. ✓ Read DEVELOPER_GUIDE.md
4. ✓ Make your first API endpoint
5. ✓ Test with the provided examples
6. ✓ Review security practices
7. ✓ Prepare for code review

---

**Welcome to the team! Happy coding! 🚀**

Last Updated: March 2026

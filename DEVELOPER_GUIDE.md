# Nexus Platform - Developer Guide

## Quick Start

### Project Structure
```
/app
  /api                 # API endpoints
    /complaints        # Complaint management
    /remote-sessions   # Remote support feature
    /notifications     # Notification system
  /dashboard           # Dashboard pages
  /complaints          # Complaint pages
  /models              # Database schemas
  /lib                 # Utilities and helpers
  /components          # React components
    /ui                # UI component library
```

### Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables (.env.local)
MONGODB_URI=your_mongodb_connection
EMAIL_HOST=your_email_host
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@company.com

# Run development server
npm run dev
```

---

## Creating New Pages

### 1. Simple Page
```tsx
// app/dashboard/new-page/page.tsx
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
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>Content here</CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
```

### 2. With Data Fetching
```tsx
'use client';

import { useEffect, useState } from 'react';

export default function PageWithData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/endpoint');
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Skeleton />;
  if (!data) return <div>No data</div>;

  return <div>{/* render data */}</div>;
}
```

---

## Creating New API Endpoints

### Basic Pattern
```typescript
// app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Model from '@/app/models/Model';
import { successResponse, errorResponse } from '@/app/lib/api-helpers';
import { getSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const items = await Model.find();
    return successResponse(items);
  } catch (error: any) {
    return errorResponse(error, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const item = new Model(data);
    await item.save();
    
    return successResponse(item, 201);
  } catch (error: any) {
    return errorResponse(error, 400);
  }
}
```

### With Validation
```typescript
import { validateBody } from '@/app/lib/api-helpers';
import { schemaName } from '@/app/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const validatedData = await validateBody(request, schemaName);
    // Use validatedData...
  } catch (error) {
    return errorResponse(error, 400);
  }
}
```

---

## Creating New UI Components

### Simple Component
```tsx
// components/my-component.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  description?: string;
  onAction?: () => void;
}

export default function MyComponent({ title, description, onAction }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {description && <p>{description}</p>}
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  );
}
```

### With State Management
```tsx
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Do something
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        value={state}
        onChange={(e) => setState(e.target.value)}
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Loading...' : 'Submit'}
      </button>
    </div>
  );
}
```

---

## Using Design Tokens

### Colors
```tsx
// Primary color
<div className="bg-primary text-primary-foreground">Primary</div>

// Semantic colors
<div className="text-success">Success</div>
<div className="text-warning">Warning</div>
<div className="text-destructive">Error</div>

// Backgrounds
<div className="bg-card">Card background</div>
<div className="bg-muted">Muted background</div>
```

### Typography
```tsx
<h1 className="h1">Heading 1 (4xl)</h1>
<h2 className="h2">Heading 2 (3xl)</h2>
<h3 className="h3">Heading 3 (2xl)</h3>

<p className="body-lg">Large body text</p>
<p className="body">Regular body text</p>
<p className="body-sm">Small body text</p>
<p className="caption">Caption text</p>
```

### Spacing
```tsx
// Use Tailwind spacing scale
<div className="p-4">Padding</div>
<div className="m-4">Margin</div>
<div className="gap-4">Gap in flex/grid</div>

// Space between children
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Shadows
```tsx
<div className="shadow-sm">Subtle shadow</div>
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow</div>
```

---

## Database Operations

### Finding Documents
```typescript
// Find all
const items = await Model.find();

// Find with filter
const items = await Model.find({ status: 'active' });

// Find one
const item = await Model.findOne({ id: 'abc123' });

// Find by ID
const item = await Model.findById(id);

// With population
const item = await Model.findById(id).populate('relation');

// Lean (faster, but no methods)
const items = await Model.find().lean();
```

### Creating Documents
```typescript
// Method 1
const item = new Model(data);
await item.save();

// Method 2
const item = await Model.create(data);
```

### Updating Documents
```typescript
// Update and return
const item = await Model.findByIdAndUpdate(
  id,
  { field: 'value' },
  { new: true }
);

// Update many
await Model.updateMany(
  { status: 'old' },
  { status: 'new' }
);
```

### Deleting Documents
```typescript
await Model.findByIdAndDelete(id);
await Model.deleteOne({ id: 'abc123' });
await Model.deleteMany({ status: 'draft' });
```

---

## Form Handling

### Form Component
```tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      // Success handling
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={5}
        />
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

---

## Error Handling

### Common Patterns
```typescript
try {
  // Operation
} catch (error: any) {
  if (error instanceof ValidationError) {
    return errorResponse(error, 400);
  }
  if (error instanceof NotFoundError) {
    return errorResponse(error, 404);
  }
  if (error instanceof UnauthorizedError) {
    return errorResponse(error, 401);
  }
  return errorResponse(error, 500);
}
```

### Custom Error Classes
```typescript
import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError, 
  ForbiddenError 
} from '@/app/lib/errors';

throw new ValidationError('Field is required');
throw new NotFoundError('Resource not found');
throw new UnauthorizedError('Must be logged in');
throw new ForbiddenError('Insufficient permissions');
```

---

## Debugging

### Console Logging
```typescript
// Use [v0] prefix for v0 debugging
console.log('[v0] Component state:', state);
console.log('[v0] API response:', response);

// Remove after debugging
```

### Common Issues

**Page not rendering**: Check if route exists and component is exported default

**API 404**: Verify route file naming matches URL structure

**Database connection**: Check MongoDB URI in .env.local

**Data not updating**: Ensure component state updates or page refresh triggers

---

## Testing

### Unit Test Example
```typescript
// __tests__/validation.test.ts
import { complaintCreateSchema } from '@/app/lib/validation';

test('validates complaint data', () => {
  const validData = {
    title: 'Issue',
    description: 'Description',
    reporterEmail: 'test@example.com',
  };
  
  expect(() => complaintCreateSchema.parse(validData)).not.toThrow();
});
```

---

## Performance Tips

1. **Use `lean()` for read-only queries**
   ```typescript
   const items = await Model.find().lean();
   ```

2. **Add database indexes**
   ```typescript
   schema.index({ status: 1, createdAt: -1 });
   ```

3. **Implement pagination**
   ```typescript
   const skip = (page - 1) * limit;
   const items = await Model.find().skip(skip).limit(limit);
   ```

4. **Use `select()` to limit fields**
   ```typescript
   const items = await Model.find().select('name email');
   ```

5. **Cache frequently accessed data**
   ```typescript
   const cache = new Map();
   ```

---

## Security Best Practices

1. Always validate input
2. Check authentication and authorization
3. Use parameterized queries (MongoDB native prevents injection)
4. Hash passwords with bcrypt
5. Use HTTPS in production
6. Set secure cookie flags
7. Implement rate limiting
8. Validate file uploads
9. Sanitize HTML output
10. Keep dependencies updated

---

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Zod Validation](https://zod.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui Components](https://ui.shadcn.com)

---

Last Updated: 2024
Version: 1.0

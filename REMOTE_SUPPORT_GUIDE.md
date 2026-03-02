# Remote Support Feature - Quick Start Guide

## Overview
The Remote Support feature allows engineers to request real-time remote access to a customer's device to diagnose and fix support issues. Customers can approve/deny requests with full control over permissions and session duration.

---

## Architecture

### Database Models
- **RemoteSession** (`/app/models/RemoteSession.ts`)
  - Tracks all remote support sessions
  - Stores chat messages, activity logs, and recording data
  - Manages session lifecycle and permissions

### API Endpoints

#### For Engineers (Creating Requests)
```
POST /api/remote-sessions
├── Body: { complaintId, reason, estimatedDuration }
├── Response: Created session with id
└── Usage: Request remote access to help customer

GET /api/remote-sessions
├── Query: status, complaintId, userId
├── Response: List of sessions (paginated)
└── Usage: View all remote sessions

DELETE /api/remote-sessions/[id]
├── Response: Session ended
└── Usage: Terminate active session
```

#### For Customers (Approving Requests)
```
PATCH /api/remote-sessions/[id]/approve
├── Body: { timeLimit: 15 } (minutes)
├── Response: Session approved and started
└── Usage: Accept engineer's remote request

PATCH /api/remote-sessions/[id]/deny
├── Body: { reason: "string" }
├── Response: Session rejected
└── Usage: Decline remote access request

PATCH /api/remote-sessions/[id]/control
├── Body: { controlLevel, allowRemoteInput, ... }
├── Response: Updated session
└── Usage: Change permission levels during session
```

#### Real-time Communication
```
GET/POST /api/remote-sessions/[id]/chat
├── GET: Retrieve all messages
├── POST: Send new message
└── Usage: In-session text communication

WS /api/remote-sessions/ws
├── Query: sessionId, userType (engineer|complainer)
└── Usage: WebSocket signaling for screen share/video
```

---

## Component Usage

### 1. Request Remote Support (Engineer View)
```tsx
import { RemoteSessionRequestModal } from '@/app/components/remote-session-request-modal';

<RemoteSessionRequestModal
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  complaintId="complaint-id"
  complaintTitle="Complaint Title"
  onSuccess={(sessionId) => {
    // Handle successful request
  }}
/>
```

### 2. Approve Remote Support (Customer View)
```tsx
import { RemoteSessionApprovalDialog } from '@/app/components/remote-session-approval-dialog';

<RemoteSessionApprovalDialog
  isOpen={isOpen}
  sessionId="session-id"
  engineerName="Engineer Name"
  complaintTitle="Complaint Title"
  reason="Why they need access"
  estimatedDuration={15}
  onApprove={(timeLimit) => {
    // Session approved and started
  }}
  onDeny={() => {
    // Session denied
  }}
/>
```

### 3. Complaint Detail Integration
```tsx
import { ComplaintRemoteSupportButton } from '@/app/components/complaint-remote-support-button';

<ComplaintRemoteSupportButton
  complaintId={complaint._id}
  complaintTitle={complaint.title}
  userRole="engineer"
  isComplainer={false}
/>
```

### 4. View All Sessions
```tsx
// Navigate to /remote-sessions
// Displays all active and historical sessions
// Filters by status (Active, Completed, Rejected)
```

---

## Session Workflow

### Engineer Perspective
```
1. Click "Request Remote Support" on complaint
   ↓
2. Fill in reason and estimated duration
   ↓
3. Send request to customer
   ↓
4. Wait for customer approval (auto-expires in 30 min)
   ↓
5. Once approved, connect and help customer
   ↓
6. End session when done
   ↓
7. Session recorded and available for review
```

### Customer Perspective
```
1. Receive notification: Engineer requesting access
   ↓
2. Review request details and engineer identity
   ↓
3. Set time limit for session
   ↓
4. Approve or deny request
   ↓
5. If approved, engineer connects (you can modify permissions)
   ↓
6. Chat with engineer, see them on screen
   ↓
7. Can end session anytime
   ↓
8. Session recorded for your records
```

---

## Session States

| Status | Meaning | Duration |
|--------|---------|----------|
| `pending` | Waiting for customer approval | 30 minutes (auto-reject) |
| `approved` | Customer approved, ready to start | Until engineer starts |
| `active` | Engineer connected and assisting | Set by customer (5-120 min) |
| `completed` | Session ended successfully | N/A |
| `rejected` | Customer denied the request | N/A |
| `cancelled` | Engineer or system cancelled | N/A |

---

## Control Levels

Engineers can have different permission levels based on customer approval:

| Level | Engineer Can | Notes |
|-------|-------------|-------|
| `view-only` | See customer's screen | No input control |
| `mouse-only` | Move mouse, click | Cannot type or use advanced functions |
| `full-control` | Full keyboard and mouse | Complete control like local user |

**Customer can change control level during active session**

---

## API Integration Example

### Create Session (Engineer)
```typescript
const response = await fetch('/api/remote-sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    complaintId: 'complaint-123',
    reason: 'Need to diagnose network issue',
    estimatedDuration: 20,
  }),
});

const { session } = await response.json();
console.log('Session created:', session._id);
```

### Approve Session (Customer)
```typescript
const response = await fetch(`/api/remote-sessions/${sessionId}/approve`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    timeLimit: 15, // 15 minute session
  }),
});

const { session } = await response.json();
console.log('Session started:', session.status); // 'active'
```

### Send Chat Message
```typescript
const response = await fetch(`/api/remote-sessions/${sessionId}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Can you see my screen?',
  }),
});

const { newMessage } = await response.json();
console.log('Message sent');
```

### Get Session Messages
```typescript
const response = await fetch(`/api/remote-sessions/${sessionId}/chat`);
const { messages } = await response.json();

messages.forEach(msg => {
  console.log(`${msg.senderName}: ${msg.message}`);
});
```

---

## Notifications

### For Customer
- **Notification**: Engineer {name} is requesting remote access
- **Timeout**: Auto-dismisses if not approved in 5 minutes
- **Action**: Approve with time limit or Deny

### For Engineer
- **Session Status**: See in Remote Sessions page
- **States**: Pending → Approved → Active → Completed

---

## Security Features

1. **Session Expiration**
   - Pending requests auto-expire after 30 minutes
   - Active sessions timeout after inactivity (15 min)

2. **Permission Control**
   - Customer fully controls what engineer can do
   - Can revoke access at any time
   - Can change permission level mid-session

3. **Activity Logging**
   - All actions recorded with timestamps
   - Session recording for compliance
   - Chat history preserved
   - Who did what and when

4. **Authentication**
   - Session-based user verification
   - Role-based access control
   - Only engineers can request
   - Only customers can approve their sessions

5. **Encryption**
   - Ready for end-to-end encryption
   - Secure WebSocket connections
   - Sensitive data protection

---

## Deployment Checklist

- [ ] MongoDB connection configured
- [ ] Session cookies secure (httpOnly, sameSite)
- [ ] CORS headers properly set
- [ ] Rate limiting configured
- [ ] WebSocket server deployed
- [ ] Screen sharing library selected (WebRTC library)
- [ ] Recording storage configured
- [ ] Email notifications setup
- [ ] Testing with real customers
- [ ] Monitoring and alerts setup

---

## Next Steps

1. **Screen Sharing Implementation**
   - Integrate WebRTC or similar
   - Handle browser permission requests
   - Implement H.264/VP9 codec support

2. **Video Call Integration**
   - Add WebRTC video communication
   - Fallback to audio-only option
   - Microphone permission handling

3. **Recording Implementation**
   - Use MediaRecorder API or ffmpeg
   - Store securely in cloud storage
   - Provide playback UI

4. **Notifications**
   - Real-time in-app notifications
   - Email notifications
   - Browser push notifications

5. **Admin Dashboard**
   - Session analytics
   - Quality metrics
   - Support agent productivity tracking

---

## Troubleshooting

### Session not starting
- Check customer approved the request
- Verify both users are online
- Check WebSocket connection
- Review browser console for errors

### Session disconnects
- Check internet connection
- Review browser network tab
- Check for browser extensions blocking WebRTC
- Review server logs

### Chat not sending
- Verify session is active
- Check message isn't empty
- Confirm both users connected
- Check API response for errors

### Recording not saving
- Verify storage configured
- Check disk space
- Review recording settings
- Check file permissions

---

## Support

For issues or questions:
1. Check the REDESIGN_PROGRESS.md file
2. Review API endpoint documentation above
3. Check browser console for errors
4. Review server logs

---

Last Updated: 2026-03-03

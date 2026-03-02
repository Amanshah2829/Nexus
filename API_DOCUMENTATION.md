# Nexus API Documentation

## Base URL
```
http://localhost:3000/api (development)
https://nexus.example.com/api (production)
```

## Authentication
All protected endpoints require a valid session cookie (`session`). Session is set automatically on successful login.

## Response Format

### Success Response
```json
{
  "data": {
    "field": "value"
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {} // optional
  }
}
```

---

## Remote Sessions API

### 1. Create Remote Session Request

**Endpoint:** `POST /api/remote-sessions`

**Authentication:** Required (Engineer role)

**Request Body:**
```json
{
  "complaintId": "string",        // MongoDB ID of complaint
  "reason": "string",             // Why engineer needs access
  "estimatedDuration": "number"   // Minutes (5-120, optional)
}
```

**Response (201):**
```json
{
  "message": "Remote session request created",
  "session": {
    "_id": "session-id",
    "id": "uuid",
    "status": "pending",
    "complaint": {
      "_id": "complaint-id",
      "title": "Complaint Title",
      "ticketNumber": "TICKET-001"
    },
    "engineer": {
      "_id": "user-id",
      "name": "Engineer Name",
      "email": "engineer@example.com"
    },
    "complainer": {
      "_id": "user-id",
      "name": "Customer Name",
      "email": "customer@example.com"
    },
    "reason": "Network connectivity issue",
    "estimatedDuration": 20,
    "controlLevel": "view-only",
    "requestedAt": "2026-03-03T10:30:00Z",
    "expiresAt": "2026-03-03T11:00:00Z",
    "chatMessages": [],
    "actionsLog": [
      {
        "action": "session_requested",
        "timestamp": "2026-03-03T10:30:00Z",
        "details": {
          "requestedBy": "user-id"
        }
      }
    ]
  }
}
```

**Error Responses:**
- `400` - Validation error: Missing complaintId, invalid duration
- `401` - Unauthorized: Not authenticated
- `403` - Forbidden: User is not an engineer
- `404` - Complaint not found
- `409` - Conflict: Active session already exists for complaint

---

### 2. List Remote Sessions

**Endpoint:** `GET /api/remote-sessions`

**Authentication:** Required

**Query Parameters:**
```
?status=pending              // Filter by status
&status=approved            // Can use multiple
&complaintId=id            // Filter by complaint
&userId=id                 // Filter by user
```

**Response (200):**
```json
{
  "sessions": [
    {
      "_id": "session-id",
      "id": "uuid",
      "status": "active",
      "complaint": { ... },
      "engineer": { ... },
      "complainer": { ... },
      ...
    }
  ]
}
```

---

### 3. Get Session Details

**Endpoint:** `GET /api/remote-sessions/:id`

**Authentication:** Required

**Response (200):**
```json
{
  "session": {
    "_id": "session-id",
    "id": "uuid",
    "status": "active",
    "complaint": { ... },
    "engineer": { ... },
    "complainer": { ... },
    "reason": "Network issue diagnosis",
    "estimatedDuration": 20,
    "actualDuration": null,
    "controlLevel": "view-only",
    "canShareScreen": true,
    "canShareAudio": true,
    "allowRemoteInput": false,
    "allowScreenRecording": true,
    "recordingUrl": null,
    "recordingSize": null,
    "transcriptUrl": null,
    "chatMessages": [
      {
        "sender": "user-id",
        "senderName": "Engineer Name",
        "message": "Can you see my screen?",
        "timestamp": "2026-03-03T10:35:00Z",
        "messageType": "text"
      }
    ],
    "actionsLog": [
      {
        "action": "session_requested",
        "timestamp": "2026-03-03T10:30:00Z",
        "details": { ... }
      },
      {
        "action": "session_approved",
        "timestamp": "2026-03-03T10:32:00Z",
        "details": { ... }
      }
    ],
    "requestedAt": "2026-03-03T10:30:00Z",
    "approvedAt": "2026-03-03T10:32:00Z",
    "startedAt": "2026-03-03T10:32:00Z",
    "endedAt": null,
    "expiresAt": "2026-03-03T10:52:00Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden: Not a participant in this session
- `404` - Session not found

---

### 4. End/Cancel Session

**Endpoint:** `DELETE /api/remote-sessions/:id`

**Authentication:** Required (Engineer or Complainer)

**Response (200):**
```json
{
  "message": "Session completed",
  "session": {
    "_id": "session-id",
    "status": "completed",
    "endedAt": "2026-03-03T10:50:00Z",
    "actualDuration": 18,
    ...
  }
}
```

---

### 5. Approve Remote Session

**Endpoint:** `PATCH /api/remote-sessions/:id/approve`

**Authentication:** Required (Complainer only)

**Request Body:**
```json
{
  "timeLimit": 15  // Minutes (5-120, optional)
}
```

**Response (200):**
```json
{
  "message": "Session approved and started",
  "session": {
    "_id": "session-id",
    "status": "active",
    "approvedAt": "2026-03-03T10:32:00Z",
    "startedAt": "2026-03-03T10:32:00Z",
    "expiresAt": "2026-03-03T10:47:00Z",
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden: Only complainer can approve
- `404` - Session not found
- `409` - Can only approve pending sessions

---

### 6. Deny Remote Session

**Endpoint:** `PATCH /api/remote-sessions/:id/deny`

**Authentication:** Required (Complainer only)

**Request Body:**
```json
{
  "reason": "Don't feel comfortable"  // Optional
}
```

**Response (200):**
```json
{
  "message": "Session rejected",
  "session": {
    "_id": "session-id",
    "status": "rejected",
    "rejectedAt": "2026-03-03T10:32:00Z",
    ...
  }
}
```

---

### 7. Update Control Permissions

**Endpoint:** `PATCH /api/remote-sessions/:id/control`

**Authentication:** Required (Complainer only)

**Request Body:**
```json
{
  "controlLevel": "mouse-only",      // Optional: view-only | mouse-only | full-control
  "allowRemoteInput": true,           // Optional
  "allowScreenRecording": true,       // Optional
  "canShareScreen": true,             // Optional
  "canShareAudio": true               // Optional
}
```

**Response (200):**
```json
{
  "message": "Control permissions updated",
  "session": {
    "_id": "session-id",
    "controlLevel": "mouse-only",
    "allowRemoteInput": true,
    ...
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden: Only complainer can modify
- `404` - Session not found
- `409` - Can only modify active sessions

---

### 8. Get Chat Messages

**Endpoint:** `GET /api/remote-sessions/:id/chat`

**Authentication:** Required

**Response (200):**
```json
{
  "messages": [
    {
      "sender": "user-id",
      "senderName": "Engineer Name",
      "message": "Can you see my screen?",
      "timestamp": "2026-03-03T10:35:00Z",
      "messageType": "text"
    },
    {
      "sender": "system",
      "senderName": "System",
      "message": "Remote session approved",
      "timestamp": "2026-03-03T10:32:00Z",
      "messageType": "system"
    }
  ]
}
```

---

### 9. Send Chat Message

**Endpoint:** `POST /api/remote-sessions/:id/chat`

**Authentication:** Required

**Request Body:**
```json
{
  "message": "Try restarting your router"
}
```

**Response (200):**
```json
{
  "message": "Message sent",
  "newMessage": {
    "sender": "user-id",
    "senderName": "Engineer Name",
    "message": "Try restarting your router",
    "timestamp": "2026-03-03T10:35:00Z",
    "messageType": "text"
  }
}
```

**Error Responses:**
- `400` - Message cannot be empty
- `401` - Unauthorized
- `403` - Forbidden: Not a participant
- `404` - Session not found
- `409` - Can only send messages in active sessions

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Not authenticated |
| `AUTHORIZATION_ERROR` | 403 | Don't have permission |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., already exists) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

---

## Request Examples

### Create Session (cURL)
```bash
curl -X POST http://localhost:3000/api/remote-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "complaintId": "507f1f77bcf86cd799439011",
    "reason": "Need to diagnose network issues",
    "estimatedDuration": 20
  }'
```

### Create Session (JavaScript)
```javascript
const response = await fetch('/api/remote-sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    complaintId: '507f1f77bcf86cd799439011',
    reason: 'Need to diagnose network issues',
    estimatedDuration: 20,
  }),
});

const { session } = await response.json();
console.log('Session ID:', session._id);
```

### Approve Session
```javascript
const response = await fetch(
  `/api/remote-sessions/${sessionId}/approve`,
  {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeLimit: 15,
    }),
  }
);

const { session } = await response.json();
console.log('Session status:', session.status); // 'active'
```

### Send Chat Message
```javascript
const response = await fetch(
  `/api/remote-sessions/${sessionId}/chat`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Can you see my screen now?',
    }),
  }
);

const { newMessage } = await response.json();
console.log('Message sent at:', newMessage.timestamp);
```

---

## Rate Limiting

API endpoints are rate limited per user:
- **Default**: 100 requests per minute
- **Remote sessions**: 10 requests per minute
- **Chat messages**: 30 messages per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1646300400
```

---

## Webhooks (Future)

Webhooks will be available for:
- `session.requested` - New session request
- `session.approved` - Session approved
- `session.started` - Session started
- `session.ended` - Session ended
- `message.sent` - New chat message

---

## Testing

### Test User Accounts
```
Engineer:
Email: engineer@example.com
Password: Password123

Complainer:
Email: customer@example.com
Password: Password123
```

### Test Workflow
1. Login as engineer
2. Create session request
3. Logout and login as customer
4. Approve session
5. Login as engineer
6. View active session
7. Send chat message
8. End session

---

## Troubleshooting

### "Unauthorized" Error
- Check session cookie is set
- Try logging in again
- Check browser dev tools → Application → Cookies

### "Forbidden" Error
- Engineer can only request, not approve
- Complainer can only approve, not request
- User must be participant in session

### "Conflict" Error
- Only one active session per complaint
- Check for existing pending/approved sessions
- End previous session first

### "Rate Limit" Error
- Too many requests in short time
- Wait before retrying
- Check rate limit headers for reset time

---

## API Changelog

### v1.0.0 (Current)
- Remote session management
- Chat messaging
- Permission control
- Activity logging
- WebSocket support

---

## Support

For API issues or questions:
1. Check error message and code
2. Review request format
3. Check authentication status
4. Review server logs
5. Contact development team

---

Last Updated: 2026-03-03

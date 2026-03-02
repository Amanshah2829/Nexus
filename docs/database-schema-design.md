# 2. Database Schema Design
(Multi-Visit, Parts, Downtime & Approval Linkage)

This schema is future-proof, normalized, and audit-safe.

## 2.1 Core Entities Overview
```
Complaint
 ├─ Visits (1 → many)
 │   ├─ Diagnostics
 │   ├─ Actions
 │   ├─ PartsUsed
 │   ├─ DowntimeRequests
 │   └─ Confirmation
 └─ History (append-only)
```

## 2.2 Complaint Schema (Simplified)
```javascript
Complaint {
  _id
  tenantId
  title
  category
  status
  createdBy
  createdAt
  currentSlaState
  history[]   // immutable timeline
}
```

## 2.3 Visit Schema (Core of Multi-Visit Logic)
```javascript
Visit {
  _id
  complaintId
  visitNumber
  engineerId
  engineerName
  startedAt
  completedAt
  outcome          // resolved | follow-up | observation
  visitData        // snapshot JSON
  createdAt
}
```
- ✔ Each visit is independent and immutable
- ✔ Multiple visits per complaint allowed
- ✔ No visit overwrites another

## 2.4 Diagnostics Subdocument
```javascript
Diagnostics {
  deviceCategory
  issueType
  checklist[] {
    item
    status
  }
  otherIssueText
}
```

## 2.5 Actions Performed
```javascript
ActionPerformed {
  description
  performedAt
}
```

## 2.6 Parts / Asset Usage
```javascript
PartUsage {
  assetId
  serialNumber
  action          // replaced | installed | removed
  reason
}
```

## 2.7 Downtime Request & Approval
```javascript
DowntimeRequest {
  required: boolean
  reason
  duration
  requestedAt
  approvedBy
  approvedAt
}
```

## 2.8 User Confirmation
```javascript
Confirmation {
  userName
  signatureImage
  rating
  feedback
  confirmedAt
}
```

## 2.9 Why This Schema Works

- ✔ Supports unlimited visits
- ✔ Maintains legal traceability
- ✔ Enables audit reconstruction
- ✔ Prevents data mutation
- ✔ Clean separation of responsibility

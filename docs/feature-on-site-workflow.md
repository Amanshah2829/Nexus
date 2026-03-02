# Feature Deep Dive
On-Site Visit Workflow & Audit-Ready Reporting
## 1. Purpose & Business Outcome
Turning Field Work into a Defensible Record of Service

The On-Site Visit Workflow is a mobile-first, guided execution framework for field engineers. Its purpose is not merely to document work—but to convert every physical service visit into a standardized, tamper-evident, and legally defensible service record.

This feature is designed for organizations where accountability, SLA adherence, and dispute prevention are critical.

### Core Business Objectives

#### Operational Consistency
Enforce a uniform diagnostic and resolution process across all engineers, locations, and issue types.

#### Audit & Legal Readiness
Generate immutable, evidence-backed records that can withstand:

- Internal audits
- Client escalations
- SLA disputes
- Compliance reviews

#### Dispute Elimination
Capture explicit end-user acknowledgment (signature + confirmation) to eliminate ambiguity around service completion and quality.

---

## 2. On-Site Visit Workflow
A Controlled, Evidence-Driven Process

The workflow is implemented as a step-locked, conditional wizard rendered by `app/components/on-visit-content.tsx` and initiated via:

`/on-visit?id=<complaintId>`


Each step exists to progressively build an auditable trail, not merely collect information.

---
## 3. Step-by-Step Engineer Journey (With Compliance Rationale)
### Step 1: Arrival Confirmation

**Action**

Engineer confirms arrival at the service location.

**System Enforcement**

Auto-captures timestamp (and optional geo-metadata, if enabled).

**Compliance Value**

Establishes a verifiable service start time

Forms the foundation for:

- SLA calculations
- Engineer performance metrics
- Client time-dispute resolution

---
### Step 2: Device Category Selection

**Action**

Engineer selects the device category (e.g., Network Device, End-User Device).

**Compliance Value**

- Eliminates ambiguous problem classification
- Enables structured analytics across tenants and locations
- Prevents free-text misuse at the root of the workflow

---
### Step 3: Diagnosed Issue Selection

**Action**

Engineer selects a predefined issue mapped to the selected device category.

**Compliance Value**

- Enforces standardized issue taxonomy
- Enables reliable trend analysis (failure patterns, recurring faults)
- Reduces reporting noise caused by inconsistent terminology

---
### Step 4: “Other Issue” Description (Conditional)

**Trigger**

Appears only if “Other” is selected in Step 3.

**Action**

Engineer must provide a detailed free-text explanation.

**Compliance Value**

- Prevents silent data loss for edge cases
- Ensures all non-standard issues are still captured, reviewable, and auditable
- Mandatory input blocks step progression until completed

---
### Step 5: Diagnostic Checklist (Conditional)

**Trigger**

Appears for predefined issue types.

**Action**

Engineer must explicitly confirm each diagnostic step.

**Compliance Value**

- Proves that a minimum diagnostic baseline was followed
- Prevents superficial resolutions
- Protects the organization against negligence claims

---
### Step 6: Action Taken (Resolution Work)

**Action**

Engineer records the exact work performed.

**Compliance Value**

- Separates diagnosis from remediation
- Creates a defensible record of what actions were actually taken
- Enables internal quality audits and training insights

---
### Step 7: Parts & Inventory Usage (Conditional)

**Trigger**

Appears if the engineer indicates parts were used or replaced.

**Action**

Engineer logs:

- Asset / part identifier
- Quantity
- Replacement reason

**Compliance Value**

- Maintains a verifiable inventory chain-of-custody
- Links physical assets directly to service events
- Enables cost attribution and asset failure tracking

---
### Step 8: Visit Outcome Classification

**Action**

Engineer selects final visit result:

- Resolved
- Requires Follow-Up
- Observation / Monitoring

**Compliance Value**

- Clearly defines SLA endpoints
- Drives conditional system behavior in the final confirmation step
- Prevents incorrect closure states

---
### Step 9: User Confirmation & Acknowledgment

This step is strictly conditional and context-aware.

**Conditional Verification Checklist**

- Shown only when the issue is marked as “Resolved”
- Hidden for follow-up or observation outcomes

**Digital Signature Capture**

- User signs directly on the engineer’s device
- Stored as a signed image artifact

**Satisfaction Rating (Optional)**

- Simple star-based input

**Compliance Value**

- Signature acts as legally significant proof of service acknowledgment
- Eliminates post-closure disputes
- Satisfaction rating provides auditable service quality feedback

---
### Step 10: Submission & Data Lock-In

**Action**

Engineer submits the visit.

**System Behavior**

Entire visit dataset is compiled and committed atomically.

**Compliance Value**

- Finalizes the service record
- Prevents retroactive edits
- Marks the visit as a completed historical event

---
## 4. Data Integrity & Technical Guarantees
### Immutable Visit Records

The complete `visitData` payload is stored as a single JSON snapshot within the complaint’s `history[]` array.

Records are:

- Append-only
- Never overwritten
- Time-ordered

This creates a tamper-evident audit trail.

### Transactional Submission

Final submission uses a single atomic request:

`PATCH /api/complaints/[id]`


Ensures:

- No partial writes
- No inconsistent states
- Reliable recovery in case of failure

---
## 5. Audit-Ready Service Reporting

Generated via `app/components/report-content.tsx`, reports render immutable visit data into professional, stakeholder-ready documents.

### 6. Report Variants (Audience-Aware)
#### Short Report

**Purpose**

One-page executive summary

**Audience**

- Clients
- Department heads
- Non-technical reviewers

**Answers**

- What was the issue?
- What was done?
- Is it resolved?

#### Long Report

**Purpose**

Full technical and compliance documentation

**Audience**

- Auditors
- Legal teams
- Internal QA and operations

---
### 7. Long Report Structure

**Document Header**

- Branding
- Unique Report ID
- Tenant identity

**Complaint & Client Context**

- Reporter details
- Issue summary

**Complete Service Timeline**

- Status transitions
- Visit initiation
- Actions taken

**On-Site Findings**

- Diagnostic checklist
- Engineer remarks
- Parts used

**Proof of Service**

- User digital signature
- Satisfaction rating
- Timestamp of acknowledgment

**Footer & Legal Disclaimer**

- Signature disclaimer
- Copy designation:
  - Client / User Copy
  - Internal Record

---
### 8. Key Implementation Files

- **Workflow Container:** `app/components/on-visit-content.tsx`
- **Step Components:** `app/on-visit/components/*`
- **Reporting Engine:** `app/components/report-content.tsx`
- **Submission API:** `app/api/complaints/[id]/route.ts` (PATCH)
- **Persistence Schema:** `app/models/Complaint.ts` (history[])

---
### Why This Feature Matters (Blunt Truth)

This is not a “nice-to-have” workflow.
This is what separates:

❌ Ticketing tools
from
✅ Enterprise service platforms

With this design, every site visit becomes an asset, not a liability.

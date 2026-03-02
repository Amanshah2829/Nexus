# 1. Internal Audit SOP
Vynsec Nexus – On-Site Visits, Complaints & Service Records
## 1.1 Purpose

This SOP defines how internal audits are conducted to verify that:

- On-site service activities are executed as recorded
- Service reports are complete, accurate, and immutable
- Engineers, admins, and systems comply with defined workflows
- SLA, inventory, and approval controls are functioning correctly

## 1.2 Scope

This SOP applies to:

- All complaints and service tickets
- All on-site visits (single or multiple)
- All engineer-generated service reports
- All asset usage and downtime approvals
- All tenant environments

## 1.3 Audit Frequency
| Audit Type | Frequency | Conducted By |
| :--- | :--- | :--- |
| Routine Audit | Quarterly | Internal Audit Team |
| SLA Audit | Monthly | Operations + Audit |
| Triggered Audit | As needed | Compliance Officer |
| Post-Incident Audit | Within 5 days | Audit + Legal |

## 1.4 Roles & Responsibilities
**Internal Auditor**

- Select audit samples
- Validate record completeness
- Flag non-compliance

**Compliance Officer**

- Interpret findings
- Decide remediation actions
- Escalate to legal if required

**System Admin**

- Provide read-only access
- Generate audit exports
- Ensure no data modification

## 1.5 Audit Preparation Checklist

Before starting the audit:

- [ ] Confirm audit scope & period
- [ ] Identify tenants included
- [ ] Lock audit dataset (read-only)
- [ ] Generate report export list
- [ ] Assign audit reference ID

## 1.6 Audit Execution Procedure
### Step 1: Sample Selection

Select samples based on:

- High-priority complaints
- SLA breaches
- Multi-visit cases
- Asset replacements
- Downtime approvals

**Minimum sample size:**

- 10% of closed complaints OR
- 25 records (whichever is higher)

### Step 2: Complaint-Level Review

Verify:

- Complaint lifecycle follows allowed state transitions
- No skipped states
- Timestamps are sequential
- Status changes are justified

Flag if:

- Manual overrides without reason
- Backdated actions
- Missing transitions

### Step 3: Visit-Level Review

For each visit:

- Arrival timestamp present
- Diagnostics completed
- Actions logged clearly
- Outcome matches visit result
- Visit record is immutable

### Step 4: Engineer Compliance Review

Verify:

- Engineer identity present
- Role authorization valid
- No visit completed without arrival confirmation
- SOP adherence

### Step 5: Asset & Inventory Review

Verify:

- Asset usage logged
- Serial numbers recorded
- Replacement reason stated
- Inventory state updated correctly

### Step 6: Downtime & Approval Review

Verify:

- Downtime request exists
- Client approval recorded
- Approval timestamp precedes execution
- Duration matches actual downtime

### Step 7: User Confirmation Review

Verify:

- Signature present for resolved cases
- Signature timestamp matches visit completion
- Feedback optional but valid

## 1.7 Non-Compliance Classification
| Severity | Description | Action |
| :--- | :--- | :--- |
| Minor | Formatting or missing optional fields | Corrective training |
| Major | Missing signature, skipped steps | Incident report |
| Critical | Fabricated visit, unauthorized approval | Immediate escalation |

## 1.8 Audit Findings & Reporting

Audit report must include:

- Audit reference ID
- Summary of findings
- Evidence references (Report IDs)
- Severity classification
- Recommended remediation

## 1.9 Remediation & Follow-Up

- Corrective action plan required within 7 days
- Re-audit within 30 days
- Repeat violations escalate to management

## 1.10 Audit Closure

Audit closed only when:

- Findings resolved or accepted
- Documentation archived
- Audit sign-off recorded

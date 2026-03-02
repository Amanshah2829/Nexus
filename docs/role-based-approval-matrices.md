# 2. Role-Based Approval Matrices
Controlled Authority & Decision Boundaries
## 2.1 Approval Principles

- No single role can request and approve the same action
- High-risk actions require multi-role approval
- Approval authority is tenant-scoped
- All approvals are timestamped and immutable

## 2.2 Role Definitions (Approval Context)
| Role | Authority Level |
| :--- | :--- |
| Engineer | Execution only |
| Admin | Operational approvals |
| Tenant Admin | Financial & downtime approvals |
| Super Admin | Global overrides |
| Auditor | Read-only |

## 2.3 Approval Matrix – Downtime
| Action | Engineer | Admin | Tenant Admin | Super Admin |
| :--- | :--- | :--- | :--- | :--- |
| Request Downtime | ✔ | ✖ | ✖ | ✖ |
| Approve < 30 min | ✖ | ✔ | ✔ | ✖ |
| Approve > 30 min | ✖ | ✖ | ✔ | ✔ |
| Emergency Override | ✖ | ✖ | ✖ | ✔ |

## 2.4 Approval Matrix – Asset Replacement
| Action | Engineer | Admin | Tenant Admin |
| :--- | :--- | :--- | :--- |
| Request Replacement | ✔ | ✖ | ✖ |
| Approve Low-Value Asset | ✖ | ✔ | ✖ |
| Approve High-Value Asset | ✖ | ✖ | ✔ |
| Inventory Write-Off | ✖ | ✖ | ✔ |

## 2.5 Approval Matrix – Complaint Closure
| Action | Engineer | Admin | Tenant Admin |
| :--- | :--- | :--- | :--- |
| Mark Resolved | ✔ | ✖ | ✖ |
| Close Without Signature | ✖ | ✔ | ✔ |
| Force Close | ✖ | ✖ | ✔ |

## 2.6 Approval Matrix – SLA Exceptions
| Action | Engineer | Admin | Tenant Admin |
| :--- | :--- | :--- | :--- |
| Request SLA Exception | ✔ | ✖ | ✖ |
| Approve SLA Exception | ✖ | ✔ | ✔ |
| SLA Override | ✖ | ✖ | ✔ |

## 2.7 Approval Enforcement Rules (System-Level)

Approval actions must:

- Be role-validated
- Include justification
- Be logged in audit trail
- No retroactive approvals
- No deletion or editing of approvals

## 2.8 Audit Mapping

Each approval event logs:

- Action type
- Requested by
- Approved by
- Role
- Timestamp
- Justification

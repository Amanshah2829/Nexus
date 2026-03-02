
# Vynsec Nexus: Application Workflow and Technical Overview

## 1. High-Level Concept

**Vynsec Nexus** is a multi-tenant, SaaS-based IT complaint and asset management platform designed for organizations like universities, corporate campuses, or large residential complexes. It streamlines the entire support lifecycle, from ticket creation (manual or via email) to on-site visits, resolution, and reporting. The platform also includes modules for inventory management, sales CRM, and granular user role management.

## 2. Core Modules & Functionality

- **Multi-Tenancy**: The system is architected to support multiple, isolated organizations (tenants). Each tenant has its own users, complaints, assets, and settings.
- **Complaint Management**: The core of the application. It handles ticket creation, assignment, status tracking, and resolution.
- **Email-to-Ticket Pipeline**: An integrated IMAP client fetches emails from a designated support inbox. It allows admins to convert emails into formal tickets, with AI assisting in extracting key information like building, room number, and contact details.
- **On-Site Visit Workflow**: A guided, step-by-step wizard for field engineers to ensure consistent data collection, diagnostics, and action logging during on-site visits.
- **User & Role Management**: A sophisticated system defining access levels for different user types:
    - **Super Admin**: Global oversight, tenant management, and sales.
    - **Admin**: Manages a single tenant (users, settings, complaints).
    - **Engineer**: The field agent who resolves tickets.
    - **Sales**: Manages leads and the sales pipeline.
    - **Viewer**: Read-only access to dashboards and reports.
- **Inventory Management**: Tracks physical assets (e.g., routers, extenders), their status (available, allotted), and their history. Supports bulk import and allotment.
- **Sales CRM**: A dedicated dashboard for the sales team to manage leads from creation to `closed-won` or `closed-lost`.

## 3. Key Workflows

### a. Complaint Lifecycle

1.  **Creation**:
    - **Manual**: An Admin creates a ticket through the "New Complaint" form.
    - **Email-to-Ticket**: An Admin reviews an email in the "Inbox" and clicks "Create Ticket". An AI flow (`extract-complaint-info-flow`) attempts to pre-fill user details. If info is missing, the admin can send a templated "Request for Information" email.
2.  **Scheduling**: The complaint appears in the "Schedule" view. An Admin schedules a visit, assigning an engineer and a time slot. Notifications are sent to the reporter and the engineer. The ticket status becomes `scheduled`.
3.  **Engineer's Task**: The ticket appears in the assigned engineer's "My Tasks" dashboard.
4.  **On-Site Visit**:
    - The engineer clicks "Start Visit," which navigates them to the `/on-visit` workflow.
    - After the visit is fully documented and submitted through the multi-step wizard (diagnostics, actions, customer signature), the ticket status is updated to `visited`.
5.  **Resolution**: The engineer logs findings and actions. If the issue is resolved, they close the ticket. The status becomes `closed`, and a resolution email is sent to the reporter.
6.  **Follow-up**: If a part is needed or the issue persists, the status can be moved to `follow-up` or `observation`, and communication with the user continues via the "Communication" tab.

### b. User Onboarding & Authentication

1.  **Public Signup**: A user signs up on the `/signup` page. This is controlled by a `signupEnabled` global setting.
2.  **OTP Verification**: The user is redirected to `/verify-email` and must enter an OTP sent to their email. The `/api/auth/verify-otp` endpoint validates the OTP.
3.  **Onboarding**: Upon successful verification, the user receives a temporary token and is redirected to `/onboarding`, where they provide details about their organization to create a new tenant.
4.  **Login**: The user logs in via the `/login` page. The `/api/auth/login` route validates credentials and sets an HTTP-only session cookie.
5.  **Middleware**: The `middleware.ts` file intercepts all requests. It protects routes from unauthenticated access and manages role-based redirects.

### c. Super Admin Workflow

1.  **Tenant Management**:
    - The Super Admin has a global view of all tenants.
    - They can create new tenants and their primary admin users.
    - They can click into any tenant to access a detailed management view (`/tenants/[id]`), where they have exclusive rights to edit subscription details (plan, cost, end date).
2.  **Sales CRM**:
    - The Super Admin can access the "Sales" dashboard to manage leads.
    - They can add new leads, assign them to sales-role users, and track their progress through the pipeline.

## 4. File Structure & Logic

- **`app/api/`**: Contains all backend API routes, organized by resource (e.g., `complaints`, `users`, `tenants`). This is where all database interactions and business logic reside.
- **`app/models/`**: Defines the Mongoose schemas for all database collections (`User`, `Complaint`, `Tenant`, `Asset`, `Lead`, etc.). This is the single source of truth for the data structure.
- **`app/(pages)/`**: Each folder represents a page in the application (e.g., `app/dashboard/page.tsx`). Each page typically contains a main content component.
- **`components/`**: Contains the primary React components that make up the UI for each page (e.g., `dashboard-content.tsx`, `inbox-content.tsx`). These components handle client-side state, data fetching (SWR), and user interactions.
- **`components/ui/`**: Reusable, low-level UI components from `shadcn/ui` (e.g., `Button`, `Card`, `Dialog`).
- **`ai/flows/`**: Contains Genkit flows for AI-powered features, such as `extract-complaint-info-flow.ts`.
- **`lib/`**: Utility functions, database connection logic (`db.ts`), session management (`session.ts`), and email template rendering (`templates.ts`).
- **`on-visit/components/`**: A dedicated set of components that make up the multi-step on-site visit wizard.
- **`middleware.ts`**: The single entry point for request authentication and authorization, protecting routes and managing redirects.

## 5. API Routes

### Authentication
- `POST /api/auth/signup`: Registers a new user.
- `POST /api/auth/login`: Authenticates a user and sets a session cookie.
- `POST /api/auth/logout`: Clears the session cookie.
- `POST /api/auth/verify-otp`: Verifies an OTP for email confirmation.
- `POST /api/auth/resend-verification`: Sends a new OTP to a user.
- `POST /api/auth/forgot-password`: Sends a temporary password to a user.
- `POST /api/users/me/change-password`: Allows a logged-in user to change their password.

### Users
- `GET /api/users`: Get all users within a tenant.
- `POST /api/users`: Create a new user.
- `GET /api/users/me`: Get the currently logged-in user's profile.
- `PATCH /api/users/[id]`: Update a user's details.
- `DELETE /api/users/[id]`: Delete a user.
- `POST /api/users/[id]/reset-password`: Admin action to send a password reset to a user.

### Tenants
- `GET /api/tenants`: (Super Admin) Get all tenants.
- `POST /api/tenants`: (Super Admin) Create a new tenant.
- `GET /api/tenants/me`: Get the current user's tenant details.
- `PATCH /api/tenants/me`: Update the current user's tenant details.
- `POST /api/tenants/onboard`: Creates a new tenant from the public onboarding flow.
- `GET, PATCH, DELETE /api/tenants/[id]`: (Super Admin) Manage a specific tenant.

### Complaints
- `GET, POST /api/complaints`: Get a list of complaints or create a new one.
- `GET, PATCH /api/complaints/[id]`: Get or update a specific complaint.
- `POST /api/complaints/[id]/resolve`: Marks a complaint as resolved and sends a notification.

### Inventory (Assets & Extenders)
- `GET, POST /api/inventory/assets`: Get all assets or create a new one.
- `PATCH /api/inventory/assets/[id]`: Update an asset.
- `POST /api/inventory/assets/import`: Bulk import assets from a CSV.
- `POST /api/inventory/assets/bulk-allot`: Bulk update asset allotments.
- `POST /api/inventory/assets/bulk-delete`: Delete multiple assets.
- `POST /api/inventory/assets/[id]/verify`: Log a physical verification of an asset.
- *Similar routes exist for `/extenders`.*

### Emails
- `GET /api/emails`: Fetches a list of emails from the configured IMAP server.
- `POST /api/emails/send`: Sends an email via the configured SMTP server.
- `GET /api/emails/search`: Searches for emails by subject.

### Settings
- `GET, POST /api/settings`: Get or set tenant-specific or global settings.
- `GET, POST /api/settings/templates`: Manage email templates.
- `GET, POST /api/settings/sla`: Manage Service Level Agreement policies.

### Leads & Sales
- `GET, POST /api/leads`: Get all leads or create a new one.
- `PATCH, DELETE /api/leads/[id]`: Update or delete a specific lead.

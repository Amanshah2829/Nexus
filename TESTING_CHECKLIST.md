# Comprehensive Testing Checklist

## Email Confirmation System

### Dialog Display & Functionality
- [ ] Dialog opens when `requestConfirmation()` is called
- [ ] Email data displays correctly in all fields
- [ ] Subject line shows full text without truncation
- [ ] HTML content renders properly in preview
- [ ] Recipient, CC, and BCC emails display correctly
- [ ] Copy-to-clipboard button works for email addresses
- [ ] Warning message displays at bottom of dialog
- [ ] Scroll area works for long content
- [ ] Dialog closes when "Cancel" is clicked
- [ ] Dialog closes when "Send" is clicked after confirmation

### Email Sending
- [ ] Email sends successfully with valid data
- [ ] Validation errors show for invalid email formats
- [ ] Success toast appears after sending
- [ ] Error toast appears on send failure
- [ ] Loading state shows "Sending..." button text
- [ ] Button is disabled during sending
- [ ] MessageId is returned on success
- [ ] Error message is user-friendly

### Input Validation
- [ ] Missing recipient email shows error
- [ ] Invalid email format shows error
- [ ] Missing subject shows error
- [ ] Missing content shows error
- [ ] Invalid CC emails show error
- [ ] Invalid BCC emails show error
- [ ] Empty arrays are handled correctly

### SMTP Configuration
- [ ] Connection test endpoint works
- [ ] Email credentials from .env are used
- [ ] Connection failures show clear errors
- [ ] Fallback to localhost SMTP works if configured

---

## Dark Mode Verification

### Light Mode
- [ ] All text is readable on white background
- [ ] Buttons have proper contrast
- [ ] Cards have visible borders
- [ ] Icons render correctly
- [ ] Charts display with correct colors
- [ ] Tables are easy to read

### Dark Mode
- [ ] All text is readable on dark background (#0f172a)
- [ ] Buttons have proper contrast
- [ ] Card backgrounds (#1e293b) are distinct from page background
- [ ] Icons render correctly with light colors
- [ ] Charts display with correct colors
- [ ] Tables are easy to read

### Theme Switching
- [ ] Theme preference persists on page reload
- [ ] Switching theme updates all components instantly
- [ ] No flash of unstyled content (FOUC)
- [ ] System preference is respected initially
- [ ] User preference overrides system preference

### Components with Dark Mode
- [ ] Dialog/Modal backgrounds change
- [ ] Input fields have proper dark styling
- [ ] Dropdowns use correct dark colors
- [ ] Tables use proper dark styling
- [ ] Cards/Panels have correct dark styling
- [ ] Badges render correctly in dark mode
- [ ] Badges with custom colors work in dark mode
- [ ] Charts have readable axes in dark mode
- [ ] Tooltips work in dark mode

---

## Admin Dashboards

### Super Admin Dashboard
- [ ] Only super-admin role can access
- [ ] Tenant list loads correctly
- [ ] Tenant search works
- [ ] Tenant filtering works
- [ ] "New Tenant" button is visible and functional
- [ ] Stats cards show correct data
- [ ] Tenant table displays all columns
- [ ] More menu (⋮) works for each tenant
- [ ] View details option works
- [ ] Edit option works
- [ ] Delete option shows confirmation
- [ ] Delete actually removes tenant
- [ ] System Settings tab loads
- [ ] Audit Logs tab loads

### Tenant Admin Dashboard
- [ ] Only admin/tenant-admin role can access
- [ ] Team members list loads
- [ ] Team member search works
- [ ] Team member filtering works
- [ ] "Invite Member" button opens dialog
- [ ] Invite dialog has email and role inputs
- [ ] Role dropdown shows all roles
- [ ] Invite sends successfully
- [ ] Team member is added to list after invite
- [ ] Stats cards show correct counts
- [ ] Team members table displays all columns
- [ ] Role badges show correct colors
- [ ] Status badge shows active/inactive
- [ ] More menu works for each member
- [ ] Edit role option works
- [ ] Remove option shows confirmation
- [ ] Remove actually deletes member
- [ ] Roles tab loads and shows role info
- [ ] Settings tab loads

### HOD Dashboard
- [ ] Only HOD role can access
- [ ] Department name displays correctly
- [ ] Summary stats show correct data
- [ ] Trend line chart renders
- [ ] Status pie chart renders
- [ ] Team performance table loads
- [ ] Engineer names display correctly
- [ ] Performance percentages calculate correctly
- [ ] Progress bars display correctly
- [ ] View Details button works

---

## Responsive Design

### Mobile (320px - 640px)
- [ ] All text is readable without zooming
- [ ] Buttons are large enough to tap
- [ ] Tables convert to card view or horizontal scroll
- [ ] Dialogs fit on screen without overflow
- [ ] Navigation collapses to mobile menu
- [ ] Forms are single column
- [ ] Stats cards stack vertically
- [ ] Charts scale appropriately

### Tablet (641px - 1024px)
- [ ] Layout adjusts to tablet width
- [ ] Two-column grid for stats
- [ ] Table displays normally
- [ ] Dialogs have proper padding
- [ ] Touch targets are adequate

### Desktop (1025px+)
- [ ] Four-column grid for stats
- [ ] Tables display with full details
- [ ] Dialogs are centered and sized properly
- [ ] Sidebar is visible
- [ ] No horizontal scrolling needed

---

## API Endpoints

### Email API
- [ ] GET `/api/emails/send-with-confirmation` - Tests SMTP connection
- [ ] POST `/api/emails/send-with-confirmation` - Sends email with validation
- [ ] Validates all required fields
- [ ] Returns 401 for unauthenticated
- [ ] Returns 400 for validation errors
- [ ] Returns 403 for unauthorized sender
- [ ] Returns 500 for SMTP errors

### Admin Tenants API
- [ ] GET `/api/admin/tenants` - Lists all tenants (super-admin)
- [ ] POST `/api/admin/tenants` - Creates new tenant (super-admin)
- [ ] Returns 403 for non-super-admin
- [ ] Returns 400 for missing fields
- [ ] Returns 409 for duplicate email
- [ ] Returns proper error messages

### Admin Team Members API
- [ ] GET `/api/admin/team-members` - Lists team members (admin/tenant-admin)
- [ ] POST `/api/admin/team-members/invite` - Invites new member
- [ ] GET `/api/admin/team-members/[id]` - Gets member details
- [ ] PATCH `/api/admin/team-members/[id]` - Updates member
- [ ] DELETE `/api/admin/team-members/[id]` - Removes member (admin only)
- [ ] All endpoints return 403 for unauthorized access
- [ ] All endpoints return 404 for not found
- [ ] Update returns updated data
- [ ] Delete returns success message

---

## Security

### IDOR Prevention
- [ ] Super admin cannot access tenant data of other systems
- [ ] Tenant admin cannot access other tenant's members
- [ ] Users cannot view other tenant's data
- [ ] API endpoints validate tenant ownership
- [ ] Deleted resources cannot be accessed

### Input Validation
- [ ] Server validates email format
- [ ] Server validates required fields
- [ ] Server validates role values
- [ ] XSS attempts are escaped
- [ ] HTML content in emails is sanitized

### Authentication
- [ ] Unauthenticated requests return 401
- [ ] Invalid tokens are rejected
- [ ] Session expires properly
- [ ] Protected routes redirect to login

---

## Error Handling

### User Feedback
- [ ] Error messages are clear and helpful
- [ ] Success messages confirm actions
- [ ] Loading states prevent multiple submissions
- [ ] Network errors show retry option
- [ ] Validation errors list specific issues

### Logging
- [ ] Successful operations are logged
- [ ] Errors are logged with context
- [ ] Sensitive data is not logged
- [ ] Log format is consistent

---

## Performance

### Load Times
- [ ] Admin dashboard loads in < 2 seconds
- [ ] Email dialog opens instantly
- [ ] Theme switch is instantaneous
- [ ] API responses are under 500ms

### Rendering
- [ ] No unnecessary re-renders
- [ ] Tables handle large datasets smoothly
- [ ] Charts render without lag
- [ ] Dialogs open/close smoothly

### Network
- [ ] Only necessary data is fetched
- [ ] API responses are optimized
- [ ] Images are optimized
- [ ] No duplicate requests

---

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Accessibility

- [ ] All buttons are keyboard accessible
- [ ] All form inputs have labels
- [ ] Color is not the only indicator
- [ ] Contrast ratios meet WCAG AA
- [ ] Screen readers work correctly
- [ ] Focus indicators are visible
- [ ] Dialogs trap focus properly
- [ ] Skip links are present (if applicable)

---

## Integration Tests

### Email Confirmation Workflow
1. [ ] Open dashboard
2. [ ] Navigate to feature that sends email
3. [ ] Trigger email sending
4. [ ] Email confirmation dialog appears
5. [ ] Review email details
6. [ ] Click "Send Email"
7. [ ] Email sends successfully
8. [ ] Success message appears
9. [ ] Dialog closes
10. [ ] Feature continues normally

### Admin Workflow
1. [ ] Login as super-admin
2. [ ] Navigate to admin dashboard
3. [ ] View all tenants
4. [ ] Search for tenant
5. [ ] Click on tenant to view details
6. [ ] Return to tenant list
7. [ ] Create new tenant
8. [ ] Verify tenant appears in list
9. [ ] Delete tenant
10. [ ] Verify tenant is removed

### Team Management Workflow
1. [ ] Login as tenant-admin
2. [ ] Navigate to admin dashboard
3. [ ] View team members
4. [ ] Search for member
5. [ ] Invite new member
6. [ ] Verify member appears in list
7. [ ] Edit member role
8. [ ] Verify role updates
9. [ ] Remove member
10. [ ] Verify member is removed

---

## Sign-Off

- **Tested By:** _______________
- **Date:** _______________
- **All Tests Passed:** ☐ Yes ☐ No
- **Issues Found:** _______________


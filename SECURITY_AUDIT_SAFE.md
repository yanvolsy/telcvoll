# TELC Voll — Security Audit & Safe Hardening Report

Base version audited:
`telcvoll_fixed_ai_chat_subscription_rtl.zip`

Resulting safe-hardening build:
`telcvoll_security_safe_fixes.zip`

Audit date: 2026-10-04

## Operating rule

Only changes with high confidence of being isolated from the working authentication, Google OAuth, payment flow, and UI were applied. Changes that could plausibly break production behavior were intentionally left untouched and are listed below.

Reference framework: OWASP Top 10:2025.

## Changes safely applied

### 1. Paid exercise content removed from `exercises-list` for free students

Before: the endpoint returned `body` and `audio_url` for every published exercise to any authenticated student.

After: free students still receive exercise metadata needed for navigation, but paid exercises return:
- `body: null`
- `audio_url: null`

Free exercises remain unchanged. Paid students with an active subscription retain the full response.

### 2. Paid exercise content removed from `/api/me` for free students

Before: `/api/me` returned `body`, `translation`, `audio_url`, and `settings_json` for every published exercise.

After: for paid exercises viewed by a free student, those content fields are nulled. Metadata such as id, title, level, section, teil, task type and access mode remains available for the dashboard/selectors.

This was deliberately implemented at the server response layer rather than relying on frontend hiding.

### 3. Parent-exercise authorization added

Before: `exercise-get` could inherit `body`, `instructions`, and `settings_json` from `parent_exercise_id` after the child exercise had passed access control.

After: the server checks the parent first. A free student cannot use a free/revision child as a side-channel to a paid parent. If the parent is unpublished/deleted, the child is not served through that inheritance path.

If the parent access check fails unexpectedly, the request fails closed rather than exposing content.

## Verification performed

- All JavaScript files under `netlify/functions` and `public/assets`: syntax check passed.
- No syntax errors found.
- Common dangerous code scan for `eval`, `new Function`, `child_process`, `exec`, `spawn`, and VM execution patterns: no matches in the scanned JavaScript.
- Authentication files were not modified by the hardening patch.
- Google authentication file was not modified.
- Payment checkout/verification files were not modified.
- AI TELC chat file was not modified.
- No UI files were modified by the hardening patch.
- ZIP integrity test passed.

## Findings intentionally NOT changed

### A. Student JWT lifetime / server-side invalidation

Current system uses a long-lived JWT and does not implement server-side session-version invalidation. Strengthening this would require coordinated changes to login, session validation, logout, password changes, and possibly Google login. It was not changed because doing so could break the currently working authentication flow.

Risk: Medium/High depending on threat model.

### B. Database TLS certificate validation

`db.js` currently uses `rejectUnauthorized: false` for non-local database connections. Changing this safely requires confirming the exact production PostgreSQL/Supabase CA configuration. It was not changed because an incorrect TLS configuration can take the whole site offline.

Risk: Medium/High.

### C. Cleanup endpoint authentication

`cleanup-payment-orders.js` is intentionally left unchanged because it may be invoked by a scheduled Netlify function. Adding an HTTP secret without confirming the deployed scheduler configuration could disable cleanup. It should be hardened after confirming the production schedule mechanism.

Risk: Medium.

### D. CSP

A Content-Security-Policy was not added. The site contains external authentication/CDN resources and inline scripts. A restrictive CSP can easily break Google login, CDN-loaded libraries, or existing inline code. It should be introduced only after collecting the actual production resource graph and preferably using a report-only rollout first.

Risk: Medium.

### E. Supabase CDN pinning / dependency lockfile

Dependency supply-chain hardening was not changed because the archive does not contain a reliable package-lock workflow for the deployed environment. This should be handled as a separate dependency-management task.

Risk: Medium.

### F. Email-change verification

Profile email-change behavior was not altered because it is part of account recovery/authentication semantics. It should be redesigned and tested separately so existing users are not locked out.

Risk: Medium.

### G. Email verification enforcement at login

The current login behavior was not changed. Enforcing `email_verified` would be a business/authentication behavior change and could lock existing accounts whose records predate the verification system.

Risk: Medium.

### H. Admin rate-limit model

The current admin rate limit combines IP and email. Improving it with an additional global-IP bucket is desirable, but changing the rate-limit semantics was not necessary for the safe content-protection pass.

Risk: Low/Medium.

## Security areas checked

### Broken Access Control

Primary focus. Server-side exercise access uses subscription state, and the two confirmed content-leak paths were hardened. Student-specific endpoints reviewed for ownership checks.

Status: Improved; further live testing recommended.

### Authentication

Working authentication was intentionally preserved. No changes were made to email login or Google login in this hardening pass.

Status: Not destabilized; deeper session hardening deferred.

### Authorization / Admin

Admin mutation endpoints generally use `requireAdmin` and same-origin checks. Admin login/logout are separate authentication lifecycle endpoints.

Status: No change required for this safe pass.

### Injection

Parameterized PostgreSQL queries were found throughout the reviewed paths. Common server-side code execution patterns were not found in the scanned JavaScript.

Status: No confirmed SQL/RCE issue from static review.

### CSRF / Origin

Sensitive mutation/AI endpoints generally use `requireSameOrigin`. Payment verification also checks same-origin and binds the order to the authenticated student before activation.

Status: Existing controls preserved.

### Payment authorization

`payment-verify` checks authenticated ownership before confirming an order and uses a DB row lock/idempotency check before activating the subscription.

Status: Preserved; no changes made.

### AI authorization

TELC AI chat requires an authenticated student with an active subscription and has rate limiting/request controls. No changes made in this pass.

Status: Preserved.

### Information disclosure

The confirmed high-impact disclosure was paid exercise content returned by list/me endpoints. This was fixed server-side.

Status: Improved.

## Remaining limitation

This is a static/source audit plus safe hardening. It is not a live penetration test. The following require a deployed staging/production environment and test accounts:

1. Free student attempts to fetch every paid exercise ID.
2. Student A attempts Student B endpoints/IDs.
3. Student attempts admin endpoints.
4. Free student attempts paid model answers/submission/mock flows.
5. Tampered JWT/cookie behavior.
6. Google OAuth redirect/window behavior.
7. Payment replay and order ownership.
8. Rate-limit behavior under repeated requests.
9. File upload/path traversal tests if upload features are deployed.
10. Actual production headers and CORS/Origin behavior.

## Final classification

Safe fixes applied: 3 focused server-side access-control changes.

Authentication/Google/payment architecture: intentionally untouched.

The resulting build is safer against the confirmed exercise-content disclosure without introducing the broad authentication changes that previously caused login problems.

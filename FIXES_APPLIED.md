# TELC Voll — Security & Backend Fixes

This build preserves the existing visual design and content structure while applying backend/security corrections.

## Main changes

- Removed the Access Code authentication/payment flow from active application logic.
- Payment confirmation now activates the authenticated student's subscription directly.
- Subscription checks no longer depend on `access_codes`.
- Student/admin JWTs are no longer stored in browser `localStorage`; authentication uses HttpOnly cookies.
- Payment checkout is tied to the authenticated account and verified email.
- Payment verification validates the authenticated student/order relationship.
- AI Writing now requires an active AI-enabled subscription and has server-side rate limiting.
- Plan pricing must exist in the database; hardcoded price fallbacks were removed.
- Admin plan management is separated into `admin-plans`.
- Legacy code-management pages redirect to plan management.
- Admin revenue is based on confirmed orders, not legacy access-code state.
- Admin student subscription activation creates a normal confirmed order without generating a code.
- Campaigns/notifications target subscriptions rather than access codes.
- Added Netlify `/api/*` routing and baseline security headers.
- Added explicit Node dependencies and Node 20 engine configuration.
- Authentication rate-limit failures now fail closed for login/register/password recovery flows.
- Passwords created or reset from now on require at least 8 characters.
- Client IP resolution prefers Netlify's connection IP header.

## Compatibility decision

Legacy `access_codes` database data is not automatically deleted. Existing historical rows can remain for rollback/audit purposes, but the active application no longer uses them for authentication, subscriptions, payments, or admin operations.

## QA performed

- JavaScript syntax check: 0 errors.
- Static HTML asset-reference check: 0 missing references.
- API endpoint reference check: 0 missing endpoints.
- Netlify TOML parse check: passed.
- Auth token `localStorage` references: 0.
- Active Access Code API generation/lookup references: 0.

# TELC Voll — Security Audit / Hardened Build

Date: 2026-10-03
Base: `telcvoll_fixed_ai_chat_subscription_rtl.zip`

## Scope

Static/source-level security audit of the Netlify Functions, authentication/session layer, authorization gates, payment flows, student/admin APIs, content delivery, frontend injection surfaces, security headers, legacy code system, and dependency declarations.

## High-risk issues fixed in this build

1. **Paid-content disclosure through `/api/me`**
   - Free students could receive published exercise bodies/settings/audio metadata.
   - Dashboard now receives only content appropriate to the student's access state.

2. **Mock-exam authorization bypass**
   - `mock-submit` did not enforce exercise `access_mode` before reading/scoring items.
   - It now uses the same server-side exercise authorization gate as normal exercise access.

3. **Paid parent-exercise inheritance leak**
   - A free child exercise could inherit body/settings from a paid parent.
   - Parent content is now inherited only when the parent is itself accessible.

4. **Student notification metadata leak**
   - Admin notification `target_type` / `target_value` could expose targeting information such as another student's identifier/email.
   - These fields are now filtered out of student-facing responses.

5. **Database failure fail-open behavior**
   - The student guard previously fell back to trusting a valid JWT when the database failed.
   - It now fails closed. A database failure cannot grant an authenticated state.

6. **Admin authorization strengthened**
   - Admin requests are now checked against the database, not only the JWT payload.
   - Admin session tokens use a server-side session version.
   - Admin token lifetime reduced to 2 hours.

7. **Student session revocation**
   - Added `students.session_version`.
   - Password reset increments the version, invalidating previously issued sessions.

8. **Cookie hardening**
   - Production authentication cookies use `__Host-` names, `Secure`, `HttpOnly`, `SameSite=Lax`, and `Path=/`.
   - Legacy cookie names are accepted only in local development.

9. **JWT hardening**
   - Tokens are restricted to HS256 and validated with a fixed issuer and audience.

10. **CSRF / origin hardening**
    - Unsafe browser requests must use an explicitly trusted origin.
    - Cross-site Fetch Metadata requests are rejected.
    - Arbitrary `*.netlify.app` origins and arbitrary forwarded hosts are no longer trusted.

11. **Database TLS hardening**
    - Remote PostgreSQL connections now require certificate validation (`rejectUnauthorized: true`).

12. **Public cleanup mutator hardened**
    - Payment cleanup is now a scheduled function.
    - Direct HTTP invocation requires a configured `CLEANUP_SECRET` of at least 32 characters.

13. **Legacy Access Code attack surface removed**
    - Removed `admin-codes.js`, `admin/codes.html`, and `admin/code-generator.html`.
    - Payment verification does not create or return access codes.

14. **Open redirect hardening**
    - Login/register `redirect` parameters now accept only same-origin local paths.

15. **AI request hardening**
    - Chat history is capped to 10 messages and 2,000 characters per message before being sent to an AI provider.
    - Speaking AI endpoint now enforces origin and request-size checks.

16. **Error disclosure reduction**
    - Several endpoints no longer return raw server/database/provider exception messages to clients.

17. **Security headers**
    - Added CSP, COOP, CORP, stronger HSTS, and existing anti-sniff/frame/referrer controls.

18. **Dependency pinning**
    - Dependencies are pinned to exact versions rather than ranges.
    - Current pinned versions in this build: bcryptjs 3.0.3, cookie 1.1.1, jsonwebtoken 9.0.2, pg 8.23.0.

## Checks performed

- Node syntax check: 59 JavaScript files — 0 failures.
- Inline HTML JavaScript syntax check: 35 blocks — 0 failures.
- Dangerous execution scan: no `eval`, `new Function`, `child_process`, `exec`, `spawn`, or `vm` usage found.
- Dynamic SQL scan: no user-controlled SQL interpolation found. The remaining flagged query is a parameterized `UPDATE ... WHERE rkey=$1` statement.
- Legacy code-system files removed from the deployed source tree.
- Authentication and admin authorization paths inspected.
- Exercise, exam, AI, payment, notification, profile, and admin mutation paths inspected.

## Important limitations

This is a **source/static security audit plus hardening pass**, not a guarantee of absolute security.

A complete production penetration test still requires testing the deployed application and infrastructure, including:

- authenticated/unauthenticated API fuzzing;
- IDOR/BOLA testing across multiple real student accounts;
- admin privilege escalation testing;
- live CSRF/CORS/browser testing;
- DAST with OWASP ZAP/Burp;
- PostgreSQL permissions/RLS review;
- Netlify environment-variable and deploy-permission review;
- live OneClick payment replay/signature/webhook testing;
- dependency audit against the final generated lockfile.

`npm audit` could not be completed in this isolated build environment because the npm registry was not reachable and no existing lockfile was present. The dependency declarations were nevertheless pinned to exact versions.

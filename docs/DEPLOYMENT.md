# Deployment Checklist

## Build and deploy

- Node.js 22
- Install with npm install
- Run npm run typecheck
- Run npm run lint
- Run npm run build
- Deploy the Next.js application to a Node.js-compatible host.
- Add agrobridgeconsult.com and www.agrobridgeconsult.com and choose one canonical host.
- Configure HTTPS and redirect the non-canonical host.

## Environment

Configure DATABASE_URL, SESSION_SECRET, RESEND_API_KEY, EMAIL_FROM, ADMIN_NOTIFICATION_EMAIL and CRON_SECRET in the deployment environment. Add optional AI and WhatsApp variables only when those providers are configured.

## Database

Run npm run db:migrate and npm run db:seed against the production database. Then create the initial administrator with the one-time npm run admin:create command using secure environment variables. Remove the temporary admin bootstrap variables after use.

## DNS and email

- Point the domain using the records supplied by the selected hosting provider.
- Verify the sending domain with Resend.
- Configure SPF, DKIM and DMARC exactly as provided by the email provider.
- Test email delivery and reply handling.

## Smoke tests

- / homepage, navigation and mobile menu.
- /services and all service detail pages.
- /contact consultation form, database record and email notification.
- /register, /login, /workspace and logout.
- /farm-planner creates a client brief.
- /crop-health stores a case and photo; staff can view it.
- /admin dashboard and staff-only APIs.
- /academy course enrolment and lesson progress.
- /insights and /projects public content.
- /api/health reports application and database status.
- Follow-up cron runs with a valid CRON_SECRET.

Do not announce production readiness until these tests pass against the deployed environment.

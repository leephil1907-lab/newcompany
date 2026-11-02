# Deployment Checklist

## Build and deploy

- Use Node.js 22.
- Install with npm install.
- Run npm run typecheck.
- Run npm run lint.
- Run npm run build.
- Deploy the Next.js application to a Node.js-compatible host.
- Add agrobridgeconsult.com and www.agrobridgeconsult.com and choose one canonical host.
- Configure HTTPS and redirect the non-canonical host.

## Environment

Configure DATABASE_URL, SESSION_SECRET, RESEND_API_KEY, EMAIL_FROM, ADMIN_NOTIFICATION_EMAIL and CRON_SECRET in the deployment environment.

Optional integrations:
- AI_API_KEY, AI_BASE_URL and AI_MODEL for model-backed chat and vision triage.
- NEXT_PUBLIC_WHATSAPP_NUMBER for the official business WhatsApp CTA.
- NEXT_PUBLIC_HERO_VIDEO_URL for the cinematic hero video.
- NEXT_PUBLIC_SITE_URL for canonical links in emails and metadata.

## Database and administrator

1. Run npm run db:migrate against the production database.
2. Run npm run db:seed.
3. Set ADMIN_EMAIL, ADMIN_PASSWORD and optionally ADMIN_NAME for the one-time bootstrap.
4. Run npm run admin:create.
5. Remove the temporary ADMIN_PASSWORD value from the deployment environment after use.
6. Sign in at /login and confirm the staff dashboard opens.

## DNS and email

- Point the domain using records supplied by the hosting provider.
- Verify the sending domain with Resend.
- Configure SPF, DKIM and DMARC exactly as provided by the email provider.
- Test reply handling and transactional email delivery.

## Smoke tests

- / homepage, navigation, hero fallback and mobile menu.
- /services and all service detail pages.
- /contact stores an enquiry and sends notifications.
- /book-consultation stores a request; staff confirmation sends a confirmation email.
- /register, /login, /forgot-password, /reset-password, /workspace and logout.
- /farm-planner stores a farm planning brief.
- /crop-health stores a crop case and image; staff can view the image and add expert notes.
- /admin dashboard, staff-only APIs and administrator-only user role management.
- /admin/projects, /admin/articles and /admin/courses publishing controls.
- Academy course enrolment, lesson access and progress.
- /insights, /projects, /faq and /pricing.
- Newsletter confirmation and unsubscribe links.
- /api/health reports database connectivity and configured integrations.
- Follow-up cron runs with a valid CRON_SECRET.

Do not announce production readiness until these tests pass against the deployed environment.

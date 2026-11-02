# Deployment Checklist

## Build and deploy

- Use Node.js 22 (pinned in `.nvmrc` and the `engines` field of `package.json`, which Vercel also reads).
- Install with `npm ci` so the exact versions in `package-lock.json` are used.
- Run npm run typecheck.
- Run npm run lint.
- Run npm run build.
- GitHub Actions runs these checks and the end-to-end suite on every push and pull request; keep `main` green before deploying.
- Deploy the Next.js application to a Node.js-compatible host.
- Add agrobridgeconsult.com and www.agrobridgeconsult.com and choose one canonical host.
- Configure HTTPS and redirect the non-canonical host.

## Vercel plan and scheduled jobs

- Vercel's Hobby plan is for non-commercial personal use only; a business site such as this one needs a Pro (or Enterprise) plan.
- `vercel.json` schedules two jobs, both daily so they also deploy on Hobby: enquiry follow-ups at 09:00 UTC (10:00 in Lagos) and programme reminders at 08:00 UTC. Hobby may run a job at any time within its scheduled hour.
- On Pro you can run follow-ups more often (for example hourly, `0 * * * *`). The job emails every enquiry older than 24 hours that has not yet been followed up, so a daily schedule never skips anyone.
- Vercel calls each job with `Authorization: Bearer $CRON_SECRET`, so `CRON_SECRET` must be set in the Vercel project environment.
- Vercel Functions accept request bodies up to 4.5 MB; crop photos are therefore resized in the browser and capped at 4 MB by the API.

## Environment

Configure DATABASE_URL, SESSION_SECRET, RESEND_API_KEY, EMAIL_FROM, ADMIN_NOTIFICATION_EMAIL and CRON_SECRET in the deployment environment.

Optional integrations:
- AI_API_KEY, AI_BASE_URL and AI_MODEL for model-backed chat and vision triage.
- NEXT_PUBLIC_WHATSAPP_NUMBER for the official business WhatsApp CTA.
- NEXT_PUBLIC_HERO_VIDEO_URL for the cinematic hero video.
- NEXT_PUBLIC_SITE_URL for canonical links in emails and metadata.

## Database and administrator

For a fresh Neon database, create a project named AgroBridge Consult, create/select the `agrobridge_consult` database, and copy the pooled connection string from Neon Connect into `DATABASE_URL`. Keep the URL in environment secrets, never in source control. Generate `SESSION_SECRET` with a secure random generator such as `openssl rand -base64 48`.

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
- /admin/programmes creates programmes and manages attendee registration and attendance.
- /programmes and programme registration; daily reminder cron sends pre-event emails.
- Academy course enrolment, lesson access and progress.
- /insights, /projects, /faq and /pricing.
- Newsletter confirmation and unsubscribe links.
- /api/health reports database connectivity and configured integrations.
- Follow-up cron runs with a valid CRON_SECRET.

Do not announce production readiness until these tests pass against the deployed environment.

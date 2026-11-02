# AgroBridge Consult — Operations Runbook

## Platform modules

- Public consultancy website with 12 service pages, projects, insights, FAQ and engagement information.
- Consultation enquiries stored in PostgreSQL with client and staff email notifications.
- Client registration, sign-in, sign-out and one-time password reset links.
- Client workspace for enquiries, appointments, farm briefs, crop-health cases and Academy progress.
- Appointment requests with staff confirmation and confirmation email.
- Farm planning intake and structured client briefs.
- Crop-health reports with JPG, PNG or WebP image storage in PostgreSQL (4 MB maximum; large photos are resized in the browser before upload, and the file type is verified from its contents).
- Optional vision-model preliminary triage when an OpenAI-compatible provider is configured.
- Human crop-health review queue with expert notes and client email notification.
- Staff dashboard, role management, enquiry pipeline, appointment management and content publishing.
- Academy courses, lesson publishing, enrolment and progress tracking.
- Farmer training programmes, public registration, capacity checks, attendance records and scheduled pre-programme reminders.
- Farm Assistant with a guided fallback and optional model-backed replies.
- Newsletter double opt-in, signed confirmation and unsubscribe links.
- Daily enquiry follow-up job (09:00 UTC) for enquiries older than 24 hours that have not yet been followed up.
- Daily training programme reminder job for registered participants within two days of a published programme.

## Required environment variables

- DATABASE_URL: PostgreSQL connection string. A pooled Neon connection is recommended.
- SESSION_SECRET: random secret of at least 32 characters.
- RESEND_API_KEY: Resend API key.
- EMAIL_FROM: sender on a verified sending domain.
- ADMIN_NOTIFICATION_EMAIL: team notification recipient.
- CRON_SECRET: bearer secret for the follow-up job.

Optional:
- AI_API_KEY, AI_BASE_URL, AI_MODEL: OpenAI-compatible chat and vision provider.
- NEXT_PUBLIC_WHATSAPP_NUMBER: official WhatsApp number in international digits, without plus sign.
- NEXT_PUBLIC_HERO_VIDEO_URL: optimised hero video URL.
- NEXT_PUBLIC_SITE_URL: canonical site origin.

## Database setup

1. Set DATABASE_URL.
2. Run npm run db:migrate.
3. Run npm run db:seed.
4. Set ADMIN_EMAIL, ADMIN_PASSWORD (14+ characters), and optionally ADMIN_NAME.
5. Run npm run admin:create.
6. Sign in at /login; staff accounts are redirected to /admin.

The admin bootstrap script promotes the supplied email to the admin role. Run it only with a trusted email and secure password.

## Email setup

1. Verify agrobridgeconsult.com in Resend.
2. Publish the exact SPF/DKIM records Resend provides.
3. Configure DMARC and monitor reports.
4. Set EMAIL_FROM to an address on the verified domain.
5. Set ADMIN_NOTIFICATION_EMAIL to the team inbox.
6. Test enquiry acknowledgement, appointment requests, farm-plan receipt, crop-case notification, password reset and newsletter confirmation.
7. Enable the deployment cron and configure CRON_SECRET.

Database submissions remain saved if email delivery is unavailable. The application does not report successful delivery when the provider is missing or rejects a request.

## AI assistant and crop triage

The guided assistant works without an external AI credential. For model-backed chat and optional image triage, configure AI_API_KEY, AI_BASE_URL and AI_MODEL. The configured model must support image input for crop-photo triage.

Crop triage is deliberately preliminary. It must not produce pesticide prescriptions, chemical mixtures or definitive diagnoses. Human review remains the basis for professional recommendations.

## Staff roles

- client: can access only records associated with their account.
- consultant: can access staff review and operations pages.
- admin: full staff access, including role management.

The application reads the current role from PostgreSQL on each authenticated request, so role demotion takes effect immediately. Password reset increments the account session version and invalidates existing sessions. The initial administrator is created with the one-time admin bootstrap command.

## Operational limitations before scale

- Current rate limiting is process-local. Replace it with a shared Redis/Upstash limiter before running multiple server instances or expecting high public traffic.
- Crop photos are stored in PostgreSQL bytea. Move them to private object storage with signed URLs if image volume grows.
- Newsletter confirmation and unsubscribe are implemented; newsletter campaign composition and sending are not included.
- Staff activity audit trails, export tooling and automated backup verification should be added before onboarding a large staff team.
- Farm-planning and crop-health workflows are intake and review processes, not automated agronomic diagnosis or bankable feasibility reports.

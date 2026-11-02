# AgroBridge Consult — Operations Runbook

## Platform capabilities

- Public consultancy website, 12 service detail pages, projects and insights.
- Consultation requests stored in PostgreSQL with email acknowledgement.
- Client accounts, signed sessions and client workspace.
- Farm planning intake and structured client briefs.
- Crop-health cases with JPG, PNG or WebP image storage in PostgreSQL (5 MB maximum).
- Staff review queues for enquiries, farm plans and crop-health cases.
- Farmer Academy with course enrolment and lesson progress.
- Admin content publishing for projects, articles and courses.
- Farm Assistant: guided fallback is available without an AI provider; a configured OpenAI-compatible provider enables model-backed replies.
- Newsletter capture with consent recorded.
- Hourly 24-hour follow-up job (requires deployment cron and email credentials).

## Required environment variables

- DATABASE_URL: PostgreSQL connection string. A pooled Neon connection is recommended for application traffic.
- SESSION_SECRET: random secret of at least 32 characters.
- RESEND_API_KEY: Resend API key for email delivery.
- EMAIL_FROM: sender address on a verified sending domain.
- ADMIN_NOTIFICATION_EMAIL: recipient for new enquiries and crop cases.
- CRON_SECRET: bearer secret for the follow-up job.

Optional:
- AI_API_KEY, AI_BASE_URL, AI_MODEL: OpenAI-compatible provider.
- NEXT_PUBLIC_WHATSAPP_NUMBER: official business number in international digits without plus sign.

## Database setup

1. Set DATABASE_URL.
2. Run npm run db:migrate.
3. Run npm run db:seed.
4. Create the first staff account with ADMIN_EMAIL, ADMIN_PASSWORD (14+ characters), and optionally ADMIN_NAME, then run npm run admin:create.
5. Sign in at /login; staff accounts are redirected to /admin.

The admin bootstrap script promotes the supplied email to the admin role. Run it only with a trusted email and secure password.

## Email setup

1. Verify agrobridgeconsult.com in Resend.
2. Publish the exact SPF/DKIM records Resend provides.
3. Configure DMARC for the domain and monitor reports.
4. Set EMAIL_FROM to an address on the verified domain.
5. Set ADMIN_NOTIFICATION_EMAIL to the team inbox.
6. Test enquiry acknowledgement, admin notification, farm-plan receipt, and crop-case notification.
7. Confirm the deployment platform has enabled the scheduled cron and CRON_SECRET.

The application does not report a successful email send if the provider is not configured. Database submissions remain saved even when email delivery is unavailable.

## AI assistant setup

The guided assistant works without an external AI credential. For model-backed responses, configure AI_API_KEY, AI_BASE_URL and AI_MODEL. The assistant is instructed to avoid definitive image diagnoses and pesticide prescriptions. Crop-health cases are routed to a human review queue.

## Staff roles

- client: can access only their own workspace records.
- consultant: can access staff management pages and review records.
- admin: full staff access.

Use the database carefully when changing roles. Never expose service credentials in browser code.

## Operational limitations to address before scale

- Current rate limiting is process-local. Replace it with a shared Redis/Upstash limiter before running multiple server instances or expecting high-volume public traffic.
- Crop photos are stored in PostgreSQL bytea. Move them to private object storage with signed URLs if image volume grows.
- Newsletter capture records consent but does not yet run a full double-opt-in campaign and suppression workflow. Do not use it for bulk marketing until that lifecycle is completed.
- Admin user management, audit trails, backups and data export should be added before onboarding a large staff team.
- Farm-planning and crop-health content is an intake and review workflow, not an automated agronomic diagnosis or bankable feasibility report.

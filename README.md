# AgroBridge Consult

**Connecting Farmers to Smarter Growth.**

A mobile-first agricultural consultancy website and client operations platform for farmers, agribusinesses, investors, cooperatives, NGOs and institutions.

## Brand system

- Domain: agrobridgeconsult.com
- Deep green: #1B5E20
- Forest background: #153B1D
- Fresh leaf: #4CAF50
- Earth brown: #6D4C41
- Off-white: #F7F8F5

## Technology

- Next.js 15 App Router and React 19
- TypeScript and Tailwind CSS v4
- Framer Motion and Lucide icons
- PostgreSQL using a Neon-compatible DATABASE_URL
- Signed JWT sessions with jose and bcryptjs
- Zod server-side validation
- Resend transactional email API

## Public website

- Home, About, Services and 12 service detail pages
- Projects and published project profiles
- Insights and published article pages
- Farmer Academy and course pages
- FAQ and consultancy engagement/pricing information
- Contact and consultation request form
- Appointment request booking flow
- Farm planning intake
- Crop-health photo submission and optional preliminary AI triage
- Privacy and Terms
- Responsive navigation, original SVG brand logo, field-work carousel, configurable cinematic video hero, loading skeletons and route transitions
- Global Farm Assistant with guided fallback and optional model provider

## Client workspace

- Account registration, sign-in, sign-out and password reset
- Consultation request history
- Appointment request history and status
- Farm planning briefs
- Crop-health cases and professional review notes
- Course enrolment and lesson progress

## Staff operations

- Admin overview and consultation pipeline
- Appointment request confirmation and client notification
- Farm planning review queue
- Crop-health case review, optional AI triage summary and expert notes
- Client account and role management
- Project, article and course publishing controls
- Course lesson creation and learning progress

## Environment setup

Install dependencies and create a local environment file:

    npm install
    cp .env.example .env.local

Set DATABASE_URL and SESSION_SECRET, then apply the schema and seed the Academy:

    npm run db:migrate
    npm run db:seed

Create the first administrator with ADMIN_EMAIL, ADMIN_PASSWORD (at least 14 characters) and optional ADMIN_NAME:

    npm run admin:create

Start local development:

    npm run dev

Quality checks:

    npm run typecheck
    npm run lint
    npm run build

## Required production configuration

- DATABASE_URL: PostgreSQL connection string. Use a pooled Neon connection for the application.
- SESSION_SECRET: random secret of at least 32 characters.
- RESEND_API_KEY: transactional email API key.
- EMAIL_FROM: sender on a verified domain.
- ADMIN_NOTIFICATION_EMAIL: staff notification inbox.
- CRON_SECRET: secret for scheduled enquiry follow-ups.

## Optional integrations

- AI_API_KEY, AI_BASE_URL and AI_MODEL: OpenAI-compatible chat and vision provider for the Farm Assistant and preliminary crop-health triage.
- NEXT_PUBLIC_WHATSAPP_NUMBER: official business WhatsApp number in international digits without plus sign.
- NEXT_PUBLIC_HERO_VIDEO_URL: optimised muted looping hero video. An image fallback is used when unset.
- NEXT_PUBLIC_SITE_URL: canonical production origin.

## Database commands

- npm run db:migrate — apply db/schema.sql.
- npm run db:seed — add the starter Academy courses and lessons.
- npm run admin:create — create or promote the initial administrator.

## Important product boundaries

- A preferred appointment time is a request, not a confirmed booking, until staff confirm it.
- Farm briefs are intake records, not completed feasibility studies or bankable investment reports.
- Crop-health AI summaries are preliminary triage, not confirmed diagnoses or pesticide prescriptions.
- Project case studies and testimonials must be based on real completed work and permission.
- Fees are agreed after the scope and deliverables are reviewed; no unverified price promises are published.
- Current rate limiting is process-local and must be replaced with a shared limiter before scaling horizontally.
- Crop photos are stored in PostgreSQL for the initial release; private object storage is recommended as volume grows.
- The newsletter uses double opt-in confirmation and signed unsubscribe links. Campaign broadcasting is not included in the current release.

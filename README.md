# Nudge Builder

AI-powered e-commerce store builder. Create, customize, and publish online stores in minutes.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** Supabase
- **AI:** OpenRouter (multi-model)
- **Payments:** Razorpay
- **Uploads:** Cloudinary
- **Emails:** Resend
- **Queue:** Upstash Redis

## Setup

```bash
pnpm install
cp .env.example .env.local
# Fill in environment variables
pnpm dev
```

## Environment Variables

See `.env.example` for all required vars. Key ones:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` — Admin access (server-side only)
- `OPENROUTER_API_KEY` — AI chat
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Payments
- `STOREFRONT_URL` — Storefront deployment URL (for revalidation)

## Deploy on Render

1. Connect repo, set build command: `pnpm install && pnpm build`
2. Set start command: `pnpm start`
3. Add all environment variables from `.env.example`

## Structure

```
apps/builder/       # Dashboard, landing page, API routes
packages/db/        # Supabase client, types, schema
packages/ai/        # AI generation pipeline
packages/ui/        # Shared UI primitives
```

# Evidence Hub™ — Socialisation Demo (EvHub-S)

Demo environment for Evidence Hub's evidence socialisation capabilities.

## Local development

1. Copy `.env.local.example` to `.env.local`
2. Set `DEMO_PASSWORD` to any string
3. Set `SESSION_SECRET` to a 48+ char random hex (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
4. Set `ANTHROPIC_API_KEY` to a valid key from console.anthropic.com (chat panel returns 500 without it; the rest of the app still works)
5. `npm run dev`

## Tech

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v3 with design tokens lifted from EvHub-D
- Password gate via Next.js middleware + HMAC-signed session cookie
- Per-module chat panel powered by Claude Sonnet 4.6, streaming via SSE, with prompt caching on the system prompt + corpus

## Deploy

Deployed on Vercel. Production env vars `DEMO_PASSWORD`, `SESSION_SECRET`, and `ANTHROPIC_API_KEY` are set in the Vercel project settings (do not commit values; do not reuse local values).

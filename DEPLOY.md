# Glaukos Evidence Hub — Deploy & verify (Vercel)

DEMO_MODE app, no database. All state is static or in-session.

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

| Variable | Value | Notes |
|---|---|---|
| `DEMO_MODE` | `true` | Enables demo behaviour. |
| `DEMO_PASSWORD` | *(your shared demo password)* | The password gate checks this. **Note:** the variable is `DEMO_PASSWORD` (not `ACCESS_PASSWORD`). If unset, a non-secret fallback is used — set a real value for the shared demo. |
| `SESSION_SECRET` | *(a long random string)* | Signs the session cookie. Set a real value in production; a fallback exists but is not secure. |
| `ANTHROPIC_API_KEY` | `sk-ant-…` | Server-side only. Powers AskAI chat + dossier live generation. If absent, those features degrade gracefully (no crash); everything else works. |

Never commit any of these — `.env*` is git-ignored.

## 2. Security: the gate protects pages AND API routes

`middleware.ts` runs on `'/((?!_next/static|_next/image|favicon.ico).*)'` and only allows `/access` + `/api/access` through unauthenticated. Everything else — including `/api/chat` and `/api/dossier/write` — requires a valid signed session cookie, so **no chat/generation endpoint is reachable unauthenticated**. The `ANTHROPIC_API_KEY` is read only in server route handlers and is never sent to the client.

## 3. Build

`npm run build` should be clean (`next build --webpack`). Vercel uses the default Next.js build.

## 4. Live-URL verification checklist

1. Open the deployment URL → you should be redirected to `/access` (the gate).
2. Enter the demo password → redirected back; the landing shows **3 groups / 7 tiles**, with **DocuHub greyed** ("Coming Soon").
3. **Library** — table loads (22 articles); the Sci-Narr / Value-Msg columns show link pills; the Global/UK/Germany dossier columns show section pills.
4. **AskAI streaming** — open AskAI in the Library, attach a row, ask a question → response **streams** (confirms `ANTHROPIC_API_KEY` works in prod). Repeat in Dossier (active dossier/section grounding) and Epidemiology (active funnel grounding).
5. **Deep-links** — a Payer Value Story source chip, a dossier compiled-view `[#N]`, and a per-dossier Library column pill all navigate correctly (Library opens+scrolls+highlights; column pill opens the dossier section).
6. **Direct API probe (optional)** — `curl -i <url>/api/chat` in a fresh session should redirect to `/access` (302), not reach the handler.

## 5. Notes

- In-session state (dossier edits, added dossiers, sign-off toggles, pushed Library articles) resets on refresh — by design (no DB).
- Parked enhancements: Library epi/burden expansion; RBAC behind sign-off toggles; more country dossiers; dossier Word/PDF export.

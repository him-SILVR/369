# 369

Research. Build. Learn. Together.

This is the Phase 0 spine from ROADMAP.md: a working chat UI, backed by
an API route, backed by a model router. Nothing else in the codebase
should call an AI provider directly — everything goes through
`src/lib/model-router.ts` so switching providers, or changing which
model handles which task, stays a one-file change.

## Current model: Groq (Llama 3.3 70B)

Running on Groq's free tier for now, not Claude. Anthropic API credits
ran out, and Google Gemini's free tier returned a `limit: 0` quota error
on this account (a known Google-side issue, not fixable by waiting).
Groq's free tier has no billing gate, just a straightforward rate limit
(30 requests/minute), so that's what's wired in.

To switch to a different provider later, `src/lib/model-router.ts` is
the only file that needs to change — the API route and UI don't care
which provider is behind `routeModel()`.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `GROQ_API_KEY` in `.env.local` (get one free, no card, from
console.groq.com → API Keys), then:

```bash
npm run dev
```

Open http://localhost:3000 — you should be able to send a message and
get a real reply through the router.

## What's here (Phase 0)

- `src/app/page.tsx` — chat UI shell
- `src/app/api/chat/route.ts` — API route the UI calls
- `src/lib/model-router.ts` — the one place that talks to the LLM (currently Groq/Llama)

## What's next

Per ROADMAP.md:

- **Phase 1** — wire in Tavily for real web search + citations in the
  `research` task type
- **Phase 2** — build engine: WebContainer live preview, one-click
  deploy
- **Phase 3** — bridge research and build into one flow
- **Phase 4** — teaching layer (the `explain` task type already has a
  system prompt stubbed in the router, ready to use)
- **Phase 5** — Planet: multiplayer, video (LiveKit), screen share,
  shared task board
- Auth/DB: add Supabase once you're ready to persist users and
  conversations — env vars are already stubbed in `.env.example`
- Swap back to Claude (`claude-sonnet-5`) once there's API credit again
  — just replace the body of `routeModel()` in `model-router.ts`

## Notes

- Compile/test locally before pushing, same as SILVR.

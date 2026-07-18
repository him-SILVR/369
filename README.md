# 369

Research. Build. Learn. Together.

This is the Phase 0 spine from ROADMAP.md: a working chat UI, backed by
an API route, backed by a model router. Nothing else in the codebase
should call an AI SDK directly — everything goes through
`src/lib/model-router.ts` so adding models, or changing which model
handles which task, stays a one-file change.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `ANTHROPIC_API_KEY` in `.env.local` (get one from
console.anthropic.com), then:

```bash
npm run dev
```

Open http://localhost:3000 — you should be able to send a message and
get a real reply from Claude through the router.

## What's here (Phase 0)

- `src/app/page.tsx` — chat UI shell
- `src/app/api/chat/route.ts` — API route the UI calls
- `src/lib/model-router.ts` — the one place that talks to the LLM

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

## Notes

- Model string in `model-router.ts` (`claude-sonnet-4-6`) — update it
  to whichever Claude model you're targeting before you deploy.
- Compile/test locally before pushing, same as SILVR.

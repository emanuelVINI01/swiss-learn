# SwissLearn

A gamified web app for learning **Swiss German (Schwiizerdütsch)** vocabulary and phrases, translated into English, Portuguese, and German. Built with Next.js 16 (App Router), React 19, Prisma 7, and PostgreSQL.

Sign in, take auto-generated quizzes tuned to your skill level, earn XP, keep a daily streak, and climb a global leaderboard — all fully localized in three interface languages.

## Features

- **Adaptive quizzes** — three question types (word matching, fill-in-the-blank phrases, whole-phrase meaning), sampled from a seeded word/phrase bank and weighted by the player's XP so harder content unlocks progressively.
- **Audio pronunciation** — Swiss German words and phrases have offline-generated audio clips (via Microsoft Edge TTS), played back in text, audio-only, or text+audio prompt modes.
- **Progress tracking** — XP, a GitHub-style daily streak heatmap (371-day window), and three separately tracked skills (listening, vocabulary, reading).
- **Global ranking** — a leaderboard by completed quizzes, filterable by day/week/month.
- **Public profiles** — a shareable, unauthenticated profile page per user (`/[lang]/profile/[userId]`) showing XP, streak, and skill stats.
- **i18n routing** — every route is locale-prefixed (`/en`, `/pt`, `/de`); locale is auto-detected from `Accept-Language` on first visit.
- **GitHub OAuth** — authentication via NextAuth v5 with database-backed sessions (Prisma adapter). Protected routes are gated both at the edge (`proxy.ts`) and per-page.
- **Light/dark theme**, mobile-first responsive layout with a bottom tab bar on small screens.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| UI | React 19, Tailwind CSS 4, Framer Motion, lucide-react |
| Auth | NextAuth v5 (beta) + `@auth/prisma-adapter`, GitHub provider |
| Database | PostgreSQL, accessed via Prisma 7 (`@prisma/adapter-pg`) |
| Validation | Zod, at every API route boundary |
| Data fetching (client) | TanStack Query |
| Audio generation | `msedge-tts`, run offline via a standalone script |
| Language | TypeScript throughout |

## Architecture

The app follows a lightweight Clean Architecture split, expressed with Next.js's own primitives instead of hand-rolled ports/adapters:

```
app/**/page.tsx, app/api/**/route.ts   → delivery layer (thin: auth check, parse/validate, delegate, shape response)
lib/server/*.ts                        → use cases (business rules, framework-free, unit-testable in principle)
lib/server/repositories/*.ts           → data access (one interface + one Prisma implementation per aggregate)
lib/prisma.ts                          → the single PrismaClient instance
```

A few concrete rules this enforces:
- Pages and route handlers never import `@/lib/prisma` directly — they call functions in `lib/server/*.ts`, which call a repository, which is the only place a `PrismaClient` query is written.
- Every `lib/server/*.ts` function returns a narrow, named DTO (`QuizForPlay`, `RankingEntry`, `ProgressSummary`, ...), never a raw Prisma model.
- API routes validate every incoming payload with Zod before it reaches the use-case layer (`lib/server/http.ts#parseBody`).
- Domain failures (not found, conflicting state, invalid input) are typed exceptions (`lib/server/errors.ts`) mapped to the right HTTP status by a single `toErrorResponse()` helper — never a blanket `400` with a leaked error message.
- Quiz balance (XP payouts, difficulty unlock curve, question-type odds) lives in exactly one file, `lib/server/quiz-rules.ts`, so tuning the game never means hunting through business logic.

See [`architecture/`](./architecture) (git-ignored, local-only) for the full compliance notes this structure was audited against.

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database
- A [GitHub OAuth App](https://github.com/settings/developers) (for sign-in)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env.local` (or `.env`) with:

```bash
DATABASE_URL=            # PostgreSQL connection string
AUTH_SECRET=             # random secret, e.g. `npx auth secret`
AUTH_GITHUB_ID=          # GitHub OAuth App client ID
AUTH_GITHUB_SECRET=      # GitHub OAuth App client secret
```

Set the OAuth App's callback URL to `http://localhost:3000/api/auth/callback/github` for local development.

### 3. Set up the database

```bash
npm run prisma:push    # sync prisma/schema.prisma to the database
npm run prisma:seed    # load the Swiss German word/phrase bank
```

### 4. (Optional) generate pronunciation audio

Requires network access to Microsoft Edge's TTS endpoint; writes `.mp3` files under `public/audio/` and backfills `WordBase.audioUrl` / `PhraseBase.audioUrl`.

```bash
npm run generate:audio
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to your browser's preferred locale (`en`/`pt`/`de`) automatically.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Generate the Prisma client, then build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:push` | Push `schema.prisma` to the database (no migration history) |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed the word/phrase bank |
| `npm run generate:audio` | Generate pronunciation clips for seeded content |

## Project structure

```
src/
  app/                    routes (App Router) — [lang]/(app)/*, [lang]/(auth)/*, api/*
  auth.ts                 NextAuth configuration
  proxy.ts                edge-level locale detection + route protection
  components/             UI, grouped by feature (dashboard, questions, ranking, profile, ui)
  hooks/                  client-side state (e.g. use-quiz-session.ts owns the whole quiz lifecycle)
  lib/
    server/                use-case layer + repositories (see Architecture above)
    prisma.ts, audio.ts    the two justified module-level singletons (DB pool, AudioContext)
prisma/
  schema.prisma           data model
  language/swiss/          the seeded word/phrase content, by category
  seed.ts
scripts/
  generate-audio.ts        offline TTS generation entry point
```

## Data model

Six models: `User`/`Account`/`Session`/`VerificationToken` (NextAuth), plus `WordBase`/`PhraseBase` (the seeded, per-target-language content bank) and `Quiz`/`QuizQuestion` (a player's generated quiz and its snapshotted questions — answers are graded against a snapshot taken at generation time, so a later change to the seed data never rewrites a completed quiz's history). `UserProgress` tracks XP and streak per player, per source language.

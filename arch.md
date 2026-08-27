# Architecture compliance — SwissLearn

This document is proof-of-application for `../architecture/agents.md` against this
codebase: what each rule means concretely here, where it's satisfied, and where a
rule was pragmatically adapted (and why) instead of applied literally. It was
produced alongside a real refactor pass (see [Changes made in this pass](#changes-made-in-this-pass)),
not written speculatively — every claim below points at a file you can open.

Stack: Next.js 16 App Router, React 19, Prisma 7 + PostgreSQL, NextAuth v5. A
"framework-native" app like this can't run a textbook hexagonal architecture
(Server Components *are* the delivery mechanism) — so "apply the principles"
here means: keep the same three logical layers Clean Architecture asks for
(delivery → use cases → data), just expressed with this framework's own tools
(route handlers / Server Components, `lib/server/*.ts`, Prisma) instead of
hand-rolled ports and adapters.

## Core directives

1. **Always save artifacts** — `artifacts/` holds dated write-ups of prior
   structural passes (`artifacts/2026-08-26-bottom-nav-restructure.md`,
   `artifacts/2026-08-26-history-ranking.md`). This document is the artifact
   for the current pass.
2. **`.gitignore` compliance** — `/artifacts/` is ignored (`.gitignore:44`).
   Verified, not assumed.
3. **Save your tracks** — the `artifacts/*.md` files log what changed and why,
   for anyone doing archaeology later. This file does the same at the
   whole-codebase level.

## 1. Clean Architecture & Layer Strictness

**Rule:** domain/business logic never knows about UI, framework, or DB
directly; dependencies point inward; DTOs at boundaries.

**Applied as three layers:**

- **Delivery** — `app/**/page.tsx` (Server Components) and `app/api/**/route.ts`
  (Route Handlers). These are intentionally thin: check auth, parse/validate
  input, call one function from `lib/server/*`, shape the response. Example:
  `app/api/quiz/[id]/answer/route.ts` is 30 lines — auth check, zod parse,
  one call to `answerQuestion(...)`, error mapping. It contains zero quiz
  rules (no scoring, no "already answered" logic — that's all in the use-case
  layer).
- **Use cases** — `lib/server/quiz.ts` and `lib/server/ranking.ts`. This is
  where the actual rules live: quiz pool sizing (`ACTIVE_POOL_SIZE`,
  `QUESTIONS_PER_QUIZ`), XP scoring (`XP_PER_CORRECT_ANSWER`), ranking period
  math (`periodStart` in `lib/server/ranking.ts`). Nothing here imports
  `next/navigation`, touches a `Request`, or renders anything — these
  functions are plain `async` functions taking primitive/DTO arguments and
  returning plain data, callable from a route handler, a Server Component, or
  a test with no framework in the loop.
- **Data** — `lib/prisma.ts` is the only place a `PrismaClient` is
  constructed; every other file imports the shared `prisma` export.
  `prisma/schema.prisma` is the single source of truth for the data shape.

**DTOs at boundaries:** every function in `lib/server/*` returns a narrow,
named shape, not a raw Prisma row — e.g. `QuizForPlay` and `QuizHistoryEntry`
in `lib/server/quiz.ts`, `RankingEntry` in `lib/server/ranking.ts`. Prisma's
model types never leak into a route handler's JSON response or into a client
component's props. `answerSchema` in `app/api/quiz/[id]/answer/route.ts` is
the inbound DTO, validated with zod before anything touches the use-case
layer.

**Named, pragmatic exception:** `lib/server/*.ts` calls `prisma.*` directly
instead of going through a repository interface. For an app this size, an
interface with exactly one implementation is the "theatrical abstraction"
guideline #5 explicitly says to avoid — it would add a layer with no real
substitutability benefit (there is one database, one ORM, one deployment
target). The dependency still points one direction only (use case → Prisma,
never the reverse, never from a component), which is the property that
actually matters. If a second data source or a test double is ever needed,
`lib/server/*` is exactly where a repository seam would go — the isolation is
already there, just not behind a formal `interface`.

## 2. Single Responsibility Principle

**Rule:** one reason to change per unit; composition over conditionals; split
anything that needs "and" to describe.

This was the one real violation found in this pass: `components/questions/questions-client.tsx`
was 470 lines, one component switching on a `view` string across four
unrelated screens (picker / loading / results / playing) with an `if/else`
color-picking block buried inside the render. It needed "and" to describe
("renders the quiz picker **and** the loading spinner **and** the results
screen **and** the play screen **and** owns all their state").

**Fixed by composition, not just line-splitting** — it's now:

| File | Lines | Responsibility |
|---|---|---|
| `components/questions/questions-client.tsx` | 156 | orchestrator: owns state + handlers, picks which screen to mount |
| `components/questions/quiz-picker.tsx` | 90 | render the quiz list |
| `components/questions/quiz-loading.tsx` | 16 | render the loading state |
| `components/questions/quiz-results.tsx` | 108 | render the results screen |
| `components/questions/quiz-playing.tsx` | 173 | render one question + its answer grid |
| `components/questions/types.ts` | 33 | shared shapes, one definition instead of duplicated across the above |

`questions-client.tsx` now reads as a switch between four named components,
not a 300-line JSX tree with an 80-line conditional in the middle of it. Each
new file takes under 30 seconds to understand because it does exactly one
thing — `quiz-loading.tsx` is a spinner and a label, full stop.

**Same pattern applied earlier in the session** (dashboard/nav restructure):
`components/ui/app-shell.tsx` (chrome only), `components/ui/bottom-nav.tsx`
(mobile tab bar only), `components/dashboard/history-section.tsx` (one list),
`components/ranking/ranking-section.tsx` (one leaderboard). None of these own
more than one reason to change.

## 3. State & Patterns

**Rule:** avoid Singleton-as-global-access-point; prefer DI; keep services
stateless.

- **`lib/prisma.ts`** keeps a module-scoped `PrismaClient` reused via
  `globalThis` in development. This *is* the Singleton pattern, called out
  by name — but it's the framework-mandated one: Next.js hot-reloads modules
  in dev, and without this exact pattern every reload opens a fresh pool of
  DB connections until the limit is exhausted. This is Prisma's own
  documented fix for a Next.js-specific problem, not a convenience shortcut
  for avoiding parameter-passing. Every consumer still receives it via a
  named import (`import { prisma } from "@/lib/prisma"`) rather than reaching
  into ambient global state — the module system *is* the injection
  mechanism in a framework where constructor DI has no place to attach.
- **`lib/audio.ts`** keeps one module-scoped `AudioContext` for the same
  reason browsers do: they cap concurrent `AudioContext` instances and
  creating one per sound effect would eventually throw. Justified for the
  same reason as above — a real external constraint, not a design shortcut.
- **Services are stateless.** Every function in `lib/server/quiz.ts` and
  `lib/server/ranking.ts` takes an `ownerId`/args and returns a result — no
  module-level mutable state related to *business* data (the two exceptions
  above are infrastructure connections, not domain state). The in-memory
  `poolCache` in `quiz.ts` (`POOL_CACHE_TTL_MS`) is a documented, time-boxed
  performance cache for a read-heavy word pool, not state that changes the
  correctness of a call — clearing it early just means one extra DB read.

## 4. Component & Module Design

**Rule:** thin entry points; pure utils; centrally configured, injected
clients.

- **Thin entry points:** every `page.tsx` under `app/[lang]/(app)/*` follows
  the same shape — resolve `lang`, force per-request rendering with
  `connection()`, check `auth()`, fetch via `lib/server/*`, hand the result
  to one client component. Compare `app/[lang]/(app)/dashboard/page.tsx`,
  `.../questions/page.tsx`, `.../ranking/page.tsx` — three routes, one
  template, no route owns bespoke logic beyond wiring.
- **Pure utils:** the shuffling helpers in `lib/server/quiz.ts`
  (`shuffle<T>`, `sampleIds`) take input, return output, touch nothing
  external. `lib/server/ranking.ts`'s `periodStart(period)` is the same —
  feed it a period, get a `Date`, no side effects. `lib/audio.ts` is the
  one intentional exception: its whole job is a side effect (playing a
  sound), so "purity" doesn't apply to it — forcing it to return an
  unplayed buffer instead of playing it would be the "theatrical
  abstraction" guideline #5 warns against.
- **Centralized, injected config:** `lib/prisma.ts` is the one place a
  `PrismaClient` is constructed; `auth.ts` is the one place `NextAuth(...)`
  is configured. Every route handler and Server Component receives them by
  import, never re-instantiates them.

## 5. Security & Robustness

**Rule:** validate all incoming payloads at the boundary; protect against
SSRF/SQLi/XSS; remove dead code; preserve behavior.

- **Validation at the boundary:** `app/api/quiz/[id]/answer/route.ts` parses
  the body with a zod schema (`answerSchema`) before it reaches the use-case
  layer, and returns `400` on a bad shape. `app/api/quiz/route.ts` and
  `app/api/ranking/route.ts` validate their query params through typed
  guards (`isTargetLang`, `isRankingPeriod`) rather than trusting the string.
  Nothing reaches Prisma un-typed.
- **SQLi:** every DB access goes through Prisma's query builder — no raw SQL
  string concatenation anywhere in the codebase (`grep -r "\$queryRaw\|\$executeRaw"`
  returns nothing).
- **XSS:** the only `dangerouslySetInnerHTML` in the codebase is
  `components/ui/theme-provider.tsx`'s inline no-flash-of-wrong-theme script,
  which renders a static string with no user input interpolated into it —
  not attacker-reachable.
- **Auth is checked twice, deliberately, not redundantly:** `proxy.ts` gates
  `/dashboard`, `/questions`, and `/ranking` at the edge before any page
  renders (this is what actually produces the `307` a logged-out visitor
  gets); each page *also* re-checks `auth()` before touching data, because a
  page must never trust that the only path to it is the proxy. **This
  exact gap was live during this session** — `/ranking` was added to the
  three protected page-level checks but the developer (me, two turns ago)
  forgot the parallel entry in `proxy.ts`'s `isAppRoute` list, so an
  unauthenticated request slipped past the edge gate into a page whose own
  `auth()` check should have caught it, but got shadowed by an unrelated
  Next.js dev-mode static-shell caching bug. Fixed by adding `/ranking` to
  `proxy.ts:42-46`. The page-level `auth()` checks stayed in place — they're
  not dead code, they're the reason this was "page briefly cacheable with no
  session" instead of "page fully bypassable," and the incident is exactly
  why both layers earn their keep.
- **Dead code removed this pass:**
  - `components/dashboard/dashboard-client.tsx` — unused `useTheme()` /
    `theme` (leftover from before the theme toggle moved into the shared
    navbar).
  - `components/landing/landing-page.tsx` — unused `Brain`, `BarChart3`,
    `Globe2` icon imports; a ternary used for its side effect
    (`opt.correct ? playSuccess() : playError()`) tidied to `if/else` since
    a ternary's value was being discarded, which is what a linter flags as
    a likely mistake even when (as here) it wasn't one.
  - A throwaway diagnostic route (`app/[lang]/(app)/rankingtest/`) created
    while isolating the caching bug above was deleted once the real cause
    was found — never left in the tree.
- **Preserve behavior:** the questions-flow split (§2) is a pure
  refactor — every class name, animation, copy string, and handler was
  moved verbatim into its new file. Verified with `tsc --noEmit`, a full
  `eslint` pass, and live requests against the running dev server before
  and after (same status codes, same redirect targets, no new console
  errors).

## Changes made in this pass

- `components/questions/questions-client.tsx` split into
  `quiz-picker.tsx`, `quiz-loading.tsx`, `quiz-results.tsx`,
  `quiz-playing.tsx`, `types.ts` (§2).
- `proxy.ts` — added `/ranking` to the protected-route matcher (§5).
- Dead code removed: unused `theme` in `dashboard-client.tsx`, unused icon
  imports in `landing-page.tsx`, ternary-for-side-effect tidied (§5).
- This file.

## Verification

- `npx tsc --noEmit` — clean, no errors.
- `npx eslint .` — no new warnings/errors introduced; remaining ones
  (`dict: any` on i18n props, a handful of `<img>` LCP warnings, one
  pre-existing `react-hooks/set-state-in-effect` in `theme-provider.tsx`)
  predate this pass and aren't covered by any rule in `agents.md` — they're
  noted here for transparency, not swept under the rug.
- Live-tested against the running dev server: `/en/ranking`, `/en/dashboard`,
  `/en/questions` all correctly `307` to signin when unauthenticated;
  `/api/ranking` returns `401` unauthenticated; the refactored questions flow
  renders through the same dev server with no new console/server errors.

# SportInScope

**The Game. In Focus.**

SportInScope is a production-ready sports media platform covering Football and NBA, built with Next.js App Router, TypeScript, Tailwind CSS, and a PostgreSQL/Prisma data layer. It's architected to extend to more sports (NFL, MLB, F1, Tennis, NHL) without restructuring the schema or the sports-data-provider abstraction.

It ships with a full public site, a JWT-authenticated admin CMS at `/admin`, a mock-first sports-data-provider layer that works with zero setup and can be pointed at live APIs later, search, trending, a newsletter signup, ad/monetization slots, comprehensive SEO (metadata, JSON-LD, sitemap/robots), legal pages, and accessible, responsive UI throughout.

## Table of contents

- [Tech stack](#tech-stack)
- [Quick start (no database required)](#quick-start-no-database-required)
- [Running with a real database](#running-with-a-real-database)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Mock-first data layer](#mock-first-data-layer)
- [Admin CMS](#admin-cms)
- [Connecting live sports data](#connecting-live-sports-data)
- [Testing](#testing)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Extending to new sports](#extending-to-new-sports)

## Tech stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript, Server Components)
- **Styling**: Tailwind CSS 3 + `@tailwindcss/typography`, design tokens in `tailwind.config.ts`
- **Database**: PostgreSQL via Prisma ORM (Supabase-compatible — pooled `DATABASE_URL` + direct `DIRECT_URL`)
- **Auth**: Custom JWT session cookies (`jose`) + `bcryptjs` password hashing, edge `middleware.ts` route protection
- **Validation**: `zod` schemas shared between client forms (`react-hook-form` + `@hookform/resolvers`) and API routes
- **Testing**: `vitest`
- **Icons**: `lucide-react`

The app runs on **port 3001** in both `dev` and `start` (see `package.json`).

## Quick start (no database required)

The content layer transparently falls back to bundled mock data whenever `DATABASE_URL` isn't configured, so the entire site — homepage, sport hubs, article/team/player/league pages, scores, standings, transfers, search, trending, and even the admin CMS (using a single env-defined admin account) — works immediately with zero external setup.

```bash
npm install
cp .env.example .env
# Optionally edit .env — the defaults work out of the box for mock mode.
npm run dev
```

Visit `http://localhost:3001`. Sign in to the admin CMS at `http://localhost:3001/admin/login` using the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from your `.env` (defaults are in `.env.example`).

> In mock mode, admin article/transfer edits are held in memory for the life of the server process (see [Mock-first data layer](#mock-first-data-layer)) — they reset on restart. Connect a database to persist changes.

## Running with a real database

1. Provision a PostgreSQL database (Supabase, Neon, RDS, or local Postgres all work — the schema uses no provider-specific features).
2. Fill in `DATABASE_URL` (pooled connection) and `DIRECT_URL` (direct connection; on providers without pooling, use the same value for both) in `.env`.
3. Generate the Prisma client and apply the schema:

   ```bash
   npm run db:generate
   npm run db:migrate      # creates and applies a migration (dev)
   # or: npm run db:push   # push schema without creating a migration file
   ```

4. Seed demo content (same articles/teams/players/standings/transfers as mock mode, plus an admin login):

   ```bash
   npm run db:seed
   ```

5. `npm run dev` — the app now reads/writes through Prisma instead of the in-memory mock data.

`npm run db:studio` opens Prisma Studio if you want to browse/edit rows directly.

### About the seed script

`prisma/seed.ts` re-uses the same mock data (`src/lib/mock-data/*`) that powers zero-setup mode, so DB-backed content matches what you see without a database. It's idempotent — safe to re-run — and additionally:

- Creates one `ADMIN` user from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` (skipped with a warning if those aren't set).
- Seeds a small, proportional sample of `ArticleView` rows per article (capped) so the admin dashboard and trending have realistic, non-zero, differentiated data without inserting the full illustrative view counts used in mock mode.
- **Does not seed `Match` rows.** Fixtures/results are meant to come from a live `SportsDataProvider` synced on a schedule (see [Connecting live sports data](#connecting-live-sports-data)); the bundled mock provider already generates a realistic, always-fresh set of matches for local dev, so static seeded matches would just go stale. Wire up a real provider (or your own sync job writing to the `Match` table) for live fixtures in a DB-backed deployment.

## Environment variables

See `.env.example` for the full list with inline documentation. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` / `DIRECT_URL` | No | Postgres connection. Omit (or leave as the placeholder) to run entirely on mock data. |
| `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_SITE_NAME` | Yes | Canonical URL and site name, used throughout SEO metadata and JSON-LD. |
| `AUTH_SECRET` | Yes | Signs admin session JWTs. Generate with `openssl rand -base64 32`. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | Yes for admin access | Used both as the seed script's admin account and as the fallback login when no database is configured. |
| `FOOTBALL_API_KEY` / `FOOTBALL_API_BASE_URL` | No | Enables the live football data provider; empty falls back to the mock provider. |
| `NBA_API_KEY` / `NBA_API_BASE_URL` | No | Enables the live NBA data provider; empty falls back to the mock provider. |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics 4 measurement ID. Empty disables analytics. |
| `ADSENSE_CLIENT_ID` / `NEXT_PUBLIC_ADS_ENABLED` | No | Ad slots render as reserved empty space (no CLS) until enabled. |
| `NEWSLETTER_API_KEY` / `NEWSLETTER_PROVIDER` / `NEWSLETTER_LIST_ID` | No | Subscribers are always stored in the database/mock layer; these additionally forward signups to an ESP. |
| `AI_API_KEY` | No | Reserved for the optional AI content-assistant integration (`src/lib/ai/content-assistant.ts`); not required to run the app. |

**Never commit your real `.env` file.**

## Project structure

```
src/
  app/                     Next.js App Router routes
    (public site)          /, /football, /nba, /scores, /standings, /transfers,
                            /analysis, /trending, /search, /about, /contact,
                            /privacy, /terms, /cookies
    article/[slug]/        Article detail
    team/[slug]/            Team profile (squad, fixtures/results, news)
    player/[slug]/          Player profile
    league/[slug]/          League hub (standings, fixtures, clubs, news)
    admin/
      login/                Unauthenticated login page
      (dashboard)/          Auth-gated route group: dashboard, articles, transfers
    api/                    Route handlers backing client components + admin CMS
    sitemap.ts, robots.ts   Dynamic SEO metadata routes
    loading.tsx, error.tsx, not-found.tsx
  components/               UI, layout, navigation, articles, sports, admin, ads
  lib/
    content/                Article/team/player/league/transfer data access
                             (Prisma-or-mock, chosen by isDatabaseConfigured())
    api/providers/           SportsDataProvider abstraction (mock + live)
    auth.ts                  Session creation/verification, password hashing
    db.ts, prisma.ts         Prisma client + DB-configured check
    mock-data/               Bundled demo content (teams, players, leagues,
                             standings, transfers, articles, taxonomy)
    seo/                     Metadata + JSON-LD builders
    utils/                   slugify, date formatting, reading time, etc.
    validations/             zod schemas shared by forms and API routes
  config/site.ts             Central site name/URL/social/brand config
  types/                     Domain types mirroring the Prisma schema
  middleware.ts               Edge auth guard for /admin/*
prisma/
  schema.prisma               Full data model
  seed.ts                      Idempotent demo-data seed script
```

## Mock-first data layer

Every content-access function in `src/lib/content/*` checks `isDatabaseConfigured()` (from `src/lib/db.ts`) and transparently serves either Prisma-backed data or the bundled mock data in `src/lib/mock-data/*` — UI code never branches on this itself. This means:

- The app is fully functional, demoable, and screenshot-ready with zero setup.
- Switching to a real database is just filling in `DATABASE_URL`/`DIRECT_URL` and seeding — no code changes.
- Mock data uses the same shapes (`src/types`) as the Prisma-mapped domain objects, so admin forms, article pages, etc. work identically either way.

In mock mode, admin writes (creating/editing articles, logging transfers) mutate an in-memory array for the lifetime of the server process — there's no persistence across restarts without a database.

## Admin CMS

- `/admin/login` — email/password login (unprotected; the only exempted admin path).
- `/admin` — dashboard: article/view/transfer stats, most-viewed articles.
- `/admin/articles` — filterable, paginated article list with edit/delete/view actions.
- `/admin/articles/new` and `/admin/articles/[id]/edit` — full article editor (title, slug, excerpt, content, featured image, SEO fields, status, sport/category/author/team/league/player/tag assignment).
- `/admin/transfers` — transfer ticker management.

Protection is defense-in-depth: an edge `middleware.ts` verifies the session JWT for everything under `/admin/*` except `/admin/login`, and the `(dashboard)` route group's layout additionally calls `requireAdmin()` server-side (to fetch the current user for display) and redirects to `/admin/login` on failure.

## Connecting live sports data

`src/lib/api/providers` defines a `SportsDataProvider` interface (`getMatchesForLeague`, `getStandings`, etc.) with a mock implementation used whenever the corresponding API key env var is empty. To go live:

1. Pick a provider for each sport (e.g. football-data.org, balldontlie.io, or any provider of your choice) and set `FOOTBALL_API_KEY`/`NBA_API_KEY` (+ base URLs) in `.env`.
2. Implement the live provider(s) alongside the existing mock provider, conforming to the same `SportsDataProvider` interface.
3. Everything downstream (score tickers, standings tables, team/league pages) already calls through the abstraction and needs no further changes.

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Unit tests currently cover the pure-function layer most valuable to test in isolation: `src/lib/utils` (slugify, reading time, relative time formatting, email validation, the view-dedupe hash, clamping), `src/lib/validations` (every zod input schema used by forms and API routes), and `src/lib/seo` (metadata + JSON-LD builders). Add integration/route tests as the project grows.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Start the production server on port 3001 |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` / `format:check` | Prettier |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create + apply a dev migration |
| `npm run db:push` | Push the schema without a migration file |
| `npm run db:seed` | Seed demo content (idempotent) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` / `test:watch` | Run unit tests |

## Deployment

The app is a standard Next.js app and deploys cleanly to Vercel or any Node hosting:

1. Set all required environment variables (see [Environment variables](#environment-variables)) in your host's dashboard.
2. Point `DATABASE_URL`/`DIRECT_URL` at a production Postgres instance (Supabase, Neon, RDS, etc.).
3. Run migrations against production with `npx prisma migrate deploy` (the `db:migrate` script wraps `prisma migrate dev`, which is dev-only and prompts interactively — use `migrate deploy` in CI/production instead), then seed once (`npm run db:seed`) if you want the bundled demo content live.
4. Build (`npm run build`) and start (`npm run start`), or let your host run these for you.

`next.config.ts` already sets security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) and allow-lists remote image hosts — add any additional image CDN hostnames there.

## Extending to new sports

`Sport` is a single enum (`prisma/schema.prisma` and `src/types`) referenced by `Team`, `Player`, `League`, `Match`, `Article`, and `Transfer`. `ACTIVE_SPORTS` / `UPCOMING_SPORTS` in `src/types/index.ts` control what's live in navigation versus shown as "coming soon." To add NFL, MLB, F1, Tennis, or NHL:

1. The enum values already exist (`NFL`, `MLB`, `F1`, `TENNIS`, `NHL`) — no schema migration needed to start.
2. Add a `SportsDataProvider` implementation (mock and/or live) for the sport.
3. Move the sport from `UPCOMING_SPORTS` to `ACTIVE_SPORTS` once content and a data provider exist, and add a sport hub route mirroring `src/app/football` or `src/app/nba`.

/**
 * Prisma seed script — populates a fresh database with the same demo content
 * used by the mock providers (src/lib/mock-data/*), so DB-backed mode and
 * mock mode show identical content out of the box.
 *
 * Run with: npm run db:seed  (wraps `tsx prisma/seed.ts`)
 * Safe to re-run: every model is seeded with upserts keyed on the same
 * explicit ids used by the mock data, so re-running this script updates
 * existing rows instead of duplicating them.
 *
 * NOTE on Match rows: this script deliberately does NOT seed the `Match`
 * model. Fixtures/results are meant to come from a live SportsDataProvider
 * (see src/lib/api/providers) synced on a schedule; the bundled mock
 * provider already generates a realistic, always-fresh set of matches
 * (live/upcoming/finished, with relative kickoff times) for local dev and
 * demos without a database. Seeding static match rows here would go stale
 * the moment they're inserted (kickoff times frozen at seed time), so it's
 * left out by design — wire up a real provider + sync job for match data in
 * a DB-backed deployment.
 *
 * NOTE on Article views: the mock data's `views` numbers (thousands per
 * article) are illustrative "as if this had been live for a while" counts.
 * Faithfully recreating them would mean inserting tens of thousands of
 * ArticleView rows. Instead this script inserts a small, proportional
 * sample of ArticleView rows per article (capped) so the admin dashboard,
 * "Most Viewed" lists, and trending all have realistic, differentiated,
 * non-zero data to demo against — real traffic will dwarf this over time.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { mockAuthors, mockCategories, mockTags } from "../src/lib/mock-data/taxonomy";
import { mockLeagues } from "../src/lib/mock-data/leagues";
import { mockTeams } from "../src/lib/mock-data/teams";
import { mockPlayers } from "../src/lib/mock-data/players";
import { mockStandingsByLeagueSlug } from "../src/lib/mock-data/standings";
import { mockTransfers } from "../src/lib/mock-data/transfers";
import { mockArticles } from "../src/lib/mock-data/articles";

const prisma = new PrismaClient();

const MAX_SAMPLE_VIEWS_PER_ARTICLE = 200;

function randomPastDate(withinDays: number): Date {
  const ms = Math.random() * withinDays * 86_400_000;
  return new Date(Date.now() - ms);
}

function randomSessionHash(): string {
  return Math.random().toString(36).slice(2, 10);
}

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Site Admin";

  if (!email || !password) {
    console.warn(
      "  ! SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set — skipping admin user creation. " +
        "Set them in .env and re-run `npm run db:seed` to create a login-capable admin account.",
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: "ADMIN", isActive: true },
    create: { email, passwordHash, name, role: "ADMIN", isActive: true },
  });
  console.log(`  ✓ Admin user ready: ${user.email}`);
}

async function seedAuthors() {
  for (const a of mockAuthors) {
    await prisma.author.upsert({
      where: { id: a.id },
      update: {
        name: a.name,
        slug: a.slug,
        bio: a.bio ?? null,
        avatarUrl: a.avatarUrl ?? null,
        twitter: a.twitter ?? null,
        title: a.title ?? null,
      },
      create: {
        id: a.id,
        name: a.name,
        slug: a.slug,
        bio: a.bio ?? null,
        avatarUrl: a.avatarUrl ?? null,
        twitter: a.twitter ?? null,
        title: a.title ?? null,
      },
    });
  }
  console.log(`  ✓ ${mockAuthors.length} authors`);
}

async function seedCategories() {
  for (const c of mockCategories) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { name: c.name, slug: c.slug, sport: c.sport ?? null },
      create: { id: c.id, name: c.name, slug: c.slug, sport: c.sport ?? null },
    });
  }
  console.log(`  ✓ ${mockCategories.length} categories`);
}

async function seedTags() {
  for (const t of mockTags) {
    await prisma.tag.upsert({
      where: { id: t.id },
      update: { name: t.name, slug: t.slug },
      create: { id: t.id, name: t.name, slug: t.slug },
    });
  }
  console.log(`  ✓ ${mockTags.length} tags`);
}

async function seedLeagues() {
  for (const l of mockLeagues) {
    await prisma.league.upsert({
      where: { id: l.id },
      update: { name: l.name, slug: l.slug, sport: l.sport, country: l.country ?? null, logoUrl: l.logoUrl ?? null, tier: l.tier ?? 1 },
      create: { id: l.id, name: l.name, slug: l.slug, sport: l.sport, country: l.country ?? null, logoUrl: l.logoUrl ?? null, tier: l.tier ?? 1 },
    });
  }
  console.log(`  ✓ ${mockLeagues.length} leagues`);
}

async function seedTeams() {
  for (const t of mockTeams) {
    await prisma.team.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        slug: t.slug,
        shortName: t.shortName ?? null,
        sport: t.sport,
        leagueId: t.leagueId ?? null,
        logoUrl: t.logoUrl ?? null,
        city: t.city ?? null,
        foundedYear: t.foundedYear ?? null,
        colorPrimary: t.colorPrimary ?? null,
        colorSecondary: t.colorSecondary ?? null,
      },
      create: {
        id: t.id,
        name: t.name,
        slug: t.slug,
        shortName: t.shortName ?? null,
        sport: t.sport,
        leagueId: t.leagueId ?? null,
        logoUrl: t.logoUrl ?? null,
        city: t.city ?? null,
        foundedYear: t.foundedYear ?? null,
        colorPrimary: t.colorPrimary ?? null,
        colorSecondary: t.colorSecondary ?? null,
      },
    });
  }
  console.log(`  ✓ ${mockTeams.length} teams`);
}

async function seedPlayers() {
  for (const p of mockPlayers) {
    await prisma.player.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        slug: p.slug,
        sport: p.sport,
        teamId: p.teamId ?? null,
        position: p.position ?? null,
        nationality: p.nationality ?? null,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
        photoUrl: p.photoUrl ?? null,
        jerseyNumber: p.jerseyNumber ?? null,
      },
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sport: p.sport,
        teamId: p.teamId ?? null,
        position: p.position ?? null,
        nationality: p.nationality ?? null,
        dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
        photoUrl: p.photoUrl ?? null,
        jerseyNumber: p.jerseyNumber ?? null,
      },
    });
  }
  console.log(`  ✓ ${mockPlayers.length} players`);
}

async function seedStandings() {
  const allStandings = Object.values(mockStandingsByLeagueSlug).flat();
  for (const s of allStandings) {
    await prisma.standing.upsert({
      where: { leagueId_teamId_season: { leagueId: s.leagueId, teamId: s.teamId, season: s.season } },
      update: {
        position: s.position,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        points: s.points,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
      },
      create: {
        id: s.id,
        leagueId: s.leagueId,
        teamId: s.teamId,
        season: s.season,
        position: s.position,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        points: s.points,
        goalsFor: s.goalsFor,
        goalsAgainst: s.goalsAgainst,
      },
    });
  }
  console.log(`  ✓ ${allStandings.length} standings rows`);
}

async function seedTransfers() {
  for (const t of mockTransfers) {
    await prisma.transfer.upsert({
      where: { id: t.id },
      update: {
        playerName: t.playerName,
        playerId: t.playerId ?? null,
        fromTeamId: t.fromTeam?.id ?? null,
        toTeamId: t.toTeam?.id ?? null,
        status: t.status,
        feeAmount: t.feeAmount ?? null,
        source: t.source,
        sourceUrl: t.sourceUrl ?? null,
        sport: t.sport,
        reportedAt: new Date(t.reportedAt),
        confirmedAt: t.confirmedAt ? new Date(t.confirmedAt) : null,
      },
      create: {
        id: t.id,
        playerName: t.playerName,
        playerId: t.playerId ?? null,
        fromTeamId: t.fromTeam?.id ?? null,
        toTeamId: t.toTeam?.id ?? null,
        status: t.status,
        feeAmount: t.feeAmount ?? null,
        source: t.source,
        sourceUrl: t.sourceUrl ?? null,
        sport: t.sport,
        reportedAt: new Date(t.reportedAt),
        confirmedAt: t.confirmedAt ? new Date(t.confirmedAt) : null,
      },
    });
  }
  console.log(`  ✓ ${mockTransfers.length} transfers`);
}

async function seedArticles() {
  for (const a of mockArticles) {
    await prisma.article.upsert({
      where: { id: a.id },
      update: {
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        featuredImage: a.featuredImage ?? null,
        status: a.status,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
        readingTimeMins: a.readingTimeMins,
        seoTitle: a.seoTitle ?? null,
        metaDescription: a.metaDescription ?? null,
        canonicalUrl: a.canonicalUrl ?? null,
        authorId: a.author.id,
        categoryId: a.category.id,
        sport: a.sport,
        teamId: a.team?.id ?? null,
        leagueId: a.league?.id ?? null,
        playerId: a.player?.id ?? null,
      },
      create: {
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        content: a.content,
        featuredImage: a.featuredImage ?? null,
        status: a.status,
        publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
        createdAt: new Date(a.createdAt),
        updatedAt: new Date(a.updatedAt),
        readingTimeMins: a.readingTimeMins,
        seoTitle: a.seoTitle ?? null,
        metaDescription: a.metaDescription ?? null,
        canonicalUrl: a.canonicalUrl ?? null,
        authorId: a.author.id,
        categoryId: a.category.id,
        sport: a.sport,
        teamId: a.team?.id ?? null,
        leagueId: a.league?.id ?? null,
        playerId: a.player?.id ?? null,
      },
    });

    // Re-sync tag join rows: delete + recreate is simplest for a re-runnable seed.
    await prisma.articleTag.deleteMany({ where: { articleId: a.id } });
    if (a.tags.length > 0) {
      await prisma.articleTag.createMany({
        data: a.tags.map((t) => ({ articleId: a.id, tagId: t.id })),
        skipDuplicates: true,
      });
    }

    // Sample ArticleView rows so dashboards/trending have realistic data.
    await prisma.articleView.deleteMany({ where: { articleId: a.id } });
    const sampleCount = Math.min(MAX_SAMPLE_VIEWS_PER_ARTICLE, Math.round((a.views ?? 0) / 50));
    if (sampleCount > 0) {
      await prisma.articleView.createMany({
        data: Array.from({ length: sampleCount }, () => ({
          articleId: a.id,
          viewedAt: randomPastDate(14),
          sessionHash: randomSessionHash(),
        })),
      });
    }
  }
  console.log(`  ✓ ${mockArticles.length} articles (with tags + sample view events)`);
}

async function main() {
  console.log("Seeding database…\n");

  console.log("Admin user:");
  await seedAdminUser();

  console.log("\nTaxonomy:");
  await seedAuthors();
  await seedCategories();
  await seedTags();

  console.log("\nSports entities:");
  await seedLeagues();
  await seedTeams();
  await seedPlayers();
  await seedStandings();
  await seedTransfers();

  console.log("\nContent:");
  await seedArticles();

  console.log("\nDone.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

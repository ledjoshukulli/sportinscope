import type { Article } from "@/types";
import { mockAuthors, mockCategories, mockTags } from "./taxonomy";
import { mockTeams } from "./teams";
import { mockLeagues } from "./leagues";
import { mockPlayers } from "./players";
import { estimateReadingTime } from "@/lib/utils";

function author(slug: string) {
  const a = mockAuthors.find((x) => x.slug === slug);
  if (!a) throw new Error(`author not found: ${slug}`);
  return a;
}
function category(slug: string) {
  const c = mockCategories.find((x) => x.slug === slug);
  if (!c) throw new Error(`category not found: ${slug}`);
  return c;
}
function tags(...slugs: string[]) {
  return mockTags.filter((t) => slugs.includes(t.slug));
}
function team(slug: string) {
  return mockTeams.find((x) => x.slug === slug) ?? null;
}
function league(slug: string) {
  return mockLeagues.find((x) => x.slug === slug) ?? null;
}
function player(slug: string) {
  return mockPlayers.find((x) => x.slug === slug) ?? null;
}
function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}
function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3_600_000).toISOString();
}

const IMG = {
  soccerField: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1600&auto=format&fit=crop",
  soccerAction: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1600&auto=format&fit=crop",
  soccerStadium: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop",
  soccerBall: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1600&auto=format&fit=crop",
  basketballHoop: "https://images.unsplash.com/photo-1519861531473-9200262188bf?q=80&w=1600&auto=format&fit=crop",
  basketballAction: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1600&auto=format&fit=crop",
  basketballCourt: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1600&auto=format&fit=crop",
  basketballGame: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1600&auto=format&fit=crop",
};

interface Seed {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  authorSlug: string;
  categorySlug: string;
  sport: Article["sport"];
  teamSlug?: string;
  leagueSlug?: string;
  playerSlug?: string;
  tagSlugs: string[];
  status?: Article["status"];
  publishedHoursAgo?: number;
  views: number;
}

const seeds: Seed[] = [
  {
    id: "article-arsenal-major-move",
    title: "Arsenal Make Major Move Ahead of Summer Window",
    slug: "arsenal-make-major-move-ahead-of-summer-window",
    excerpt:
      "Arsenal are laying the groundwork for a busy summer, with the club's recruitment team already assessing targets across multiple positions.",
    content: `Arsenal's recruitment staff have accelerated their summer planning, according to people close to the club's football operations, with the Gunners keen to strengthen their squad depth after another season competing on multiple fronts.

The north London club is understood to be prioritizing reinforcements in wide areas and midfield, positions the coaching staff have flagged as needing greater depth for a season that will again include Champions League football alongside a demanding domestic calendar.

Sources familiar with the club's thinking say Arsenal's data and scouting departments have compiled a shortlist that spans several European leagues, with an emphasis on younger profiles who fit the team's pressing structure. No formal approaches have been made yet, and the club is not expected to rush into deals before assessing squad needs at the end of the season.

Financially, Arsenal are believed to have more room to operate than in previous windows, having offset spending with sales in recent transfer cycles. That flexibility, insiders suggest, could allow the club to move early if a priority target becomes available.

As always with transfer speculation this far out from the window opening, nothing is imminent, and the situation could shift considerably depending on how the rest of the season unfolds. SportInScope will continue to track developments as they emerge.`,
    featuredImage: IMG.soccerAction,
    authorSlug: "james-whitfield",
    categorySlug: "football-news",
    sport: "FOOTBALL",
    teamSlug: "arsenal",
    leagueSlug: "premier-league",
    tagSlugs: ["arsenal", "premier-league", "transfer-news"],
    publishedHoursAgo: 3,
    views: 18400,
  },
  {
    id: "article-arsenal-derby-preview",
    title: "Arsenal vs Chelsea: Tactical Preview and Key Battles",
    slug: "arsenal-vs-chelsea-tactical-preview",
    excerpt:
      "A breakdown of the tactical matchups that could decide the London derby, from midfield control to Chelsea's threat in transition.",
    content: `London derbies rarely need extra context, but this weekend's meeting between Arsenal and Chelsea carries additional weight given both clubs' positions in the table entering the fixture.

Arsenal's approach under their current setup has leaned heavily on controlling midfield tempo, using their double-pivot to dictate when the game speeds up and when it slows down. Chelsea, by contrast, have looked most dangerous in transition this season, favoring quick vertical passes to their front line rather than sustained possession spells.

That contrast in style should shape how the match is officiated and managed. If Arsenal can deny Chelsea the space to break quickly, they are well equipped to control the game for long stretches. If Chelsea can force turnovers in the middle third, their front line has shown the pace to punish even well-organized backlines.

Set pieces could also be decisive. Both sides have scored a significant share of their goals this season from corners and free kicks, making the battle at both ends of the pitch during dead-ball situations one to watch closely.

Expect a tightly contested encounter decided by moments rather than sustained dominance from either side.`,
    featuredImage: IMG.soccerStadium,
    authorSlug: "james-whitfield",
    categorySlug: "analysis",
    sport: "FOOTBALL",
    teamSlug: "arsenal",
    leagueSlug: "premier-league",
    tagSlugs: ["arsenal", "chelsea", "premier-league", "tactics"],
    publishedHoursAgo: 26,
    views: 9200,
  },
  {
    id: "article-mancity-title-race",
    title: "Manchester City's Title Defense Faces Its Toughest Stretch",
    slug: "manchester-city-title-defense-toughest-stretch",
    excerpt:
      "A congested fixture list and a string of away trips will test City's squad depth over the coming weeks.",
    content: `Manchester City enter one of the most demanding stretches of their season, with a run of fixtures that will test the depth built up over recent transfer windows.

The champions have leaned on squad rotation to manage the physical toll of competing across three competitions, and the coming weeks will be a genuine examination of that strategy. Away trips against sides fighting for European qualification often prove trickier than fixtures against direct title rivals, given the differing incentives at stake.

City's underlying numbers remain strong across most metrics tracked by analysts, but small dips in defensive solidity on the road have been noted by observers this season. How the coaching staff manage rotation without disrupting the team's rhythm will likely determine whether City can maintain their position at the top of the table through the run.`,
    featuredImage: IMG.soccerField,
    authorSlug: "james-whitfield",
    categorySlug: "analysis",
    sport: "FOOTBALL",
    teamSlug: "manchester-city",
    leagueSlug: "premier-league",
    tagSlugs: ["premier-league", "tactics"],
    publishedHoursAgo: 40,
    views: 6100,
  },
  {
    id: "article-real-madrid-barcelona-preview",
    title: "El Clásico Preview: Real Madrid Host Barcelona in Season-Defining Clash",
    slug: "el-clasico-preview-real-madrid-barcelona",
    excerpt:
      "Real Madrid and Barcelona meet at the Santiago Bernabéu with the top of La Liga on the line.",
    content: `El Clásico returns with both Real Madrid and Barcelona sitting near the top of La Liga, giving this weekend's fixture at the Santiago Bernabéu direct title implications rather than simply bragging rights.

Real Madrid's home form has been a foundation of their campaign, built around quick transitions and the individual brilliance of their attacking players. Barcelona, meanwhile, have leaned on a possession-heavy approach that asks opponents to defend for long spells without the ball.

The tactical duel between these two approaches has produced some of the most memorable Clásicos in recent seasons, and this weekend's fixture looks set to continue that trend. Injury updates in the buildup to the match could prove decisive, with both clubs managing fitness concerns for key contributors.

Whichever side leaves the Bernabéu with three points will take a significant psychological advantage into the second half of the season.`,
    featuredImage: IMG.soccerAction,
    authorSlug: "maria-santos",
    categorySlug: "football-news",
    sport: "FOOTBALL",
    teamSlug: "real-madrid",
    leagueSlug: "la-liga",
    tagSlugs: ["real-madrid", "la-liga"],
    publishedHoursAgo: 10,
    views: 21500,
  },
  {
    id: "article-champions-league-fixtures",
    title: "Champions League: This Week's Fixtures and What's at Stake",
    slug: "champions-league-fixtures-this-week",
    excerpt:
      "A full rundown of this matchday's Champions League ties, with qualification scenarios for the leading contenders.",
    content: `Champions League matchday action returns this week, with several group standings still tightly contested heading into the final rounds of the league phase.

Bayern Munich's clash with Paris Saint-Germain headlines the round, pitting two sides with strong recent European pedigree against one another in what amounts to a preview of a potential knockout-stage meeting later in the competition.

Elsewhere, several English and Spanish clubs have the opportunity to secure qualification for the next round with a positive result this week, while others face a must-win scenario to keep their campaigns alive.

SportInScope will provide live coverage and instant reaction as results come in across the week.`,
    featuredImage: IMG.soccerStadium,
    authorSlug: "maria-santos",
    categorySlug: "champions-league-news",
    sport: "FOOTBALL",
    leagueSlug: "champions-league",
    tagSlugs: ["champions-league"],
    publishedHoursAgo: 5,
    views: 8700,
  },
  {
    id: "article-bayern-transfer-strategy",
    title: "Inside Bayern Munich's Recruitment Strategy This Season",
    slug: "bayern-munich-recruitment-strategy",
    excerpt:
      "How Bayern's front office has approached the market differently since their last major rebuild.",
    content: `Bayern Munich's recruitment approach has shifted noticeably over the past two transfer cycles, with the club favoring proven Bundesliga performers over high-profile international signings in several key deals.

That strategy reflects lessons learned from previous windows, where big-name arrivals did not always translate smoothly into the club's system. By targeting players with a track record in German football, Bayern's sporting director has reduced the adjustment period new signings typically need.

The approach has coincided with continued domestic dominance, though the club's ambitions in the Champions League remain the ultimate measure of success for a squad of this caliber.`,
    featuredImage: IMG.soccerField,
    authorSlug: "maria-santos",
    categorySlug: "transfers",
    sport: "FOOTBALL",
    teamSlug: "bayern-munich",
    leagueSlug: "bundesliga",
    tagSlugs: ["transfer-news"],
    publishedHoursAgo: 60,
    views: 4300,
  },
  {
    id: "article-osimhen-chelsea-negotiations",
    title: "Osimhen–Chelsea Talks Progress as Clubs Discuss Structure of Deal",
    slug: "osimhen-chelsea-talks-progress",
    excerpt:
      "Negotiations between Napoli and Chelsea are said to be advancing, though a final agreement on payment structure remains unresolved.",
    content: `Talks between Napoli and Chelsea over a potential move for Victor Osimhen have progressed in recent days, according to multiple reports, though the two clubs are still working through the structure of any eventual deal.

The discussion is understood to center on how the transfer fee would be paid — whether as a lump sum or spread across installments — a detail that has slowed negotiations in similar deals elsewhere in European football this year.

Chelsea's recruitment team has been tracking Osimhen for an extended period, viewing him as a fit for their evolving attacking setup. Napoli, for their part, are reportedly open to a sale provided their valuation is met.

It's important to stress that, as with all reported transfer negotiations, terms can change quickly and a deal is not guaranteed to be completed. SportInScope will continue to monitor the situation and update as it develops.`,
    featuredImage: IMG.soccerAction,
    authorSlug: "james-whitfield",
    categorySlug: "transfers",
    sport: "FOOTBALL",
    teamSlug: "chelsea",
    leagueSlug: "premier-league",
    tagSlugs: ["chelsea", "transfer-news"],
    publishedHoursAgo: 14,
    views: 12800,
  },
  {
    id: "article-lakers-warriors-recap",
    title: "Lakers Hold Off Warriors Rally in Tight Fourth Quarter",
    slug: "lakers-hold-off-warriors-rally",
    excerpt:
      "Los Angeles survived a late surge from Golden State to protect their lead down the stretch at Crypto.com Arena.",
    content: `The Lakers withstood a late push from the Warriors to escape with a narrow win at Crypto.com Arena, a game that swung several times in the final period before Los Angeles pulled away in the closing minutes.

Golden State's perimeter shooting kept them within striking distance for most of the second half, and a run early in the fourth quarter briefly gave the Warriors their first lead since the opening period. The Lakers responded with a string of possessions in the paint, using their size advantage to slow the game down and limit Golden State's transition opportunities.

Bench production proved to be a difference-maker, with role players stepping up in minutes when starters were managing foul trouble. The result keeps the Lakers within range of the top of the conference standings heading into a stretch of divisional matchups.`,
    featuredImage: IMG.basketballAction,
    authorSlug: "marcus-lee",
    categorySlug: "nba-news",
    sport: "NBA",
    teamSlug: "lakers",
    leagueSlug: "nba",
    playerSlug: "lebron-james",
    tagSlugs: ["lakers"],
    publishedHoursAgo: 2,
    views: 15600,
  },
  {
    id: "article-nba-trade-deadline-primer",
    title: "NBA Trade Deadline Primer: Buyers, Sellers, and Teams on the Fence",
    slug: "nba-trade-deadline-primer",
    excerpt:
      "With the trade deadline approaching, here's how front offices around the league appear to be positioning themselves.",
    content: `As the NBA trade deadline approaches, front offices across the league are beginning to signal their intentions, with some teams clearly buying and others weighing a partial reset.

Contenders near the top of both conference standings are expected to explore depth additions, particularly on the wing, where several teams have identified a need for two-way size. Meanwhile, clubs further back in the standings face a more complicated calculus: sell impending free agents for future value, or hold and hope for a second-half turnaround.

Several teams sit in the middle — competitive enough to stay in the play-in conversation, but without a clear enough path to a deep playoff run to justify standing pat without changes. Expect those front offices to be among the most active in the days leading up to the deadline.

SportInScope's NBA desk will track every deal as it's reported.`,
    featuredImage: IMG.basketballCourt,
    authorSlug: "aisha-brown",
    categorySlug: "trade-rumors",
    sport: "NBA",
    leagueSlug: "nba",
    tagSlugs: ["nba-trades"],
    publishedHoursAgo: 8,
    views: 19800,
  },
  {
    id: "article-celtics-injury-report",
    title: "Celtics Injury Report: Latest Updates Ahead of Knicks Matchup",
    slug: "celtics-injury-report-knicks-matchup",
    excerpt:
      "A look at the Celtics' current injury situation and how it could affect the rotation against New York.",
    content: `Boston's injury report ahead of their matchup with New York includes a handful of players listed as questionable, continuing a pattern of load management the team has used throughout the season to manage minutes across a long schedule.

The team's medical staff have generally taken a conservative approach with soft-tissue concerns, preferring to hold players out of practice rather than risk aggravating minor issues during the regular season. That caution has occasionally limited continuity in the starting lineup but is viewed internally as a worthwhile trade-off given the team's postseason ambitions.

Fans should expect official status updates closer to tip-off, as is standard practice, with the questionable tag often not resolved until shortly before the game begins.`,
    featuredImage: IMG.basketballHoop,
    authorSlug: "aisha-brown",
    categorySlug: "nba-news",
    sport: "NBA",
    teamSlug: "celtics",
    leagueSlug: "nba",
    tagSlugs: ["celtics", "injury-report"],
    publishedHoursAgo: 18,
    views: 7300,
  },
  {
    id: "article-giannis-mvp-case",
    title: "Building the MVP Case for Giannis Antetokounmpo This Season",
    slug: "giannis-antetokounmpo-mvp-case",
    excerpt:
      "A statistical and contextual look at why Giannis belongs firmly in this season's MVP conversation.",
    content: `Every season, the MVP conversation tends to center on a handful of players putting up historic numbers for contending teams, and Giannis Antetokounmpo's case this year deserves serious consideration alongside the league's other top candidates.

Beyond the raw scoring and rebounding numbers, what stands out is his efficiency — maintaining elite per-possession production while also anchoring the Bucks' defense. Advanced metrics that account for both ends of the floor consistently rank him among the very best performers in the league this season.

The counterargument typically centers on team success relative to other candidates' teams, a factor voters have weighted heavily in past MVP races. Where Milwaukee finishes in the standings over the season's second half will likely determine how strong his case ultimately looks come voting time.`,
    featuredImage: IMG.basketballGame,
    authorSlug: "marcus-lee",
    categorySlug: "analysis",
    sport: "NBA",
    teamSlug: "bucks",
    leagueSlug: "nba",
    playerSlug: "giannis-antetokounmpo",
    tagSlugs: ["nba-trades"],
    publishedHoursAgo: 33,
    views: 11200,
  },
  {
    id: "article-nuggets-suns-recap",
    title: "Jokić Triple-Double Powers Nuggets Past Suns",
    slug: "jokic-triple-double-nuggets-suns",
    excerpt:
      "Denver's star center delivered another all-around performance as the Nuggets pulled away in the second half.",
    content: `Denver's frontcourt dominance was on full display as the Nuggets pulled away from Phoenix in the second half, extending their lead steadily after a tightly contested opening two quarters.

The Nuggets' ball movement in the half-court set continued to create quality looks for shooters on the perimeter, a staple of their offensive identity this season. Phoenix's defense struggled to find an answer for Denver's inside-out approach, particularly once foul trouble limited their frontcourt rotation options.

The win keeps Denver near the top of the conference standings as they head into a stretch of games against fellow playoff contenders.`,
    featuredImage: IMG.basketballAction,
    authorSlug: "marcus-lee",
    categorySlug: "nba-news",
    sport: "NBA",
    teamSlug: "nuggets",
    leagueSlug: "nba",
    playerSlug: "nikola-jokic",
    tagSlugs: [],
    publishedHoursAgo: 22,
    views: 6900,
  },
  {
    id: "article-liverpool-city-analysis",
    title: "How Liverpool Plan to Disrupt Manchester City's Build-Up Play",
    slug: "liverpool-disrupt-manchester-city-buildup",
    excerpt:
      "A tactical look at Liverpool's pressing triggers and how they might apply them against City's possession game.",
    content: `Liverpool's coaching staff have historically approached matches against Manchester City with a clear plan: disrupt the build-up before it starts, rather than sit back and defend a settled shape.

That means pressing triggers activated high up the pitch, often targeting the moment City's goalkeeper or center-backs receive the ball under pressure. When executed well, this approach has forced turnovers in dangerous areas and limited City's ability to dictate tempo — the foundation of their approach under their current setup.

The risk, of course, is exposure in behind if the press is beaten, given City's attacking players' pace in transition. Expect Liverpool to calibrate the intensity of their press based on the scoreline and game state as the match progresses.`,
    featuredImage: IMG.soccerField,
    authorSlug: "james-whitfield",
    categorySlug: "analysis",
    sport: "FOOTBALL",
    teamSlug: "liverpool",
    leagueSlug: "premier-league",
    tagSlugs: ["premier-league", "tactics"],
    publishedHoursAgo: 46,
    views: 5400,
  },
  {
    id: "article-psg-mbappe-transition",
    title: "PSG's Attacking Identity Continues to Evolve This Season",
    slug: "psg-attacking-identity-evolves",
    excerpt:
      "Paris Saint-Germain have leaned into a more collective attacking approach, and the early results are encouraging.",
    content: `Paris Saint-Germain's attacking approach this season has looked notably more collective, built around fluid rotations between the front line rather than isolating individual creators in wide areas.

The shift has coincided with strong underlying attacking metrics, including improved expected-goals output from open play compared to recent seasons. Coaches around the league have taken note of how PSG generate overloads in the final third, frequently using midfield runners to support the front line rather than relying solely on their forwards to create chances alone.

Whether that identity holds up against the division's most well-organized defenses — and in the Champions League against Europe's elite — remains the biggest question of their season.`,
    featuredImage: IMG.soccerAction,
    authorSlug: "maria-santos",
    categorySlug: "analysis",
    sport: "FOOTBALL",
    teamSlug: "psg",
    leagueSlug: "ligue-1",
    tagSlugs: ["tactics"],
    publishedHoursAgo: 52,
    views: 4100,
  },
  {
    id: "article-warriors-roster-construction",
    title: "Warriors Face Familiar Questions About Roster Construction",
    slug: "warriors-roster-construction-questions",
    excerpt:
      "Golden State's front office continues to balance win-now moves with an eye toward the roster's long-term shape.",
    content: `Golden State's front office is once again navigating a familiar tension: balancing the current roster's competitive window with decisions that will shape the team's outlook over the next several seasons.

Depth at forward remains a point of discussion among analysts covering the team, with the Warriors' perimeter-heavy approach sometimes leaving them light on size against bigger frontcourts. How the front office addresses that balance — through the trade market, free agency, or simply developing younger players already on the roster — will be a storyline worth following through the rest of the season.`,
    featuredImage: IMG.basketballCourt,
    authorSlug: "aisha-brown",
    categorySlug: "analysis",
    sport: "NBA",
    teamSlug: "warriors",
    leagueSlug: "nba",
    playerSlug: "stephen-curry",
    tagSlugs: [],
    publishedHoursAgo: 70,
    views: 3800,
  },
  {
    id: "article-draft-nba-trade-rumors-today",
    title: "NBA Trade Rumors Today: Latest Buzz Around the League",
    slug: "nba-trade-rumors-today",
    excerpt:
      "Draft article gathering the latest reported trade chatter — pending final review before publication.",
    content: `This is a working draft collecting reported chatter from around the league ahead of the trade deadline. Needs fact-checking against additional sources before publishing, and a second pass on team-by-team framing.

Bullet points below to be turned into prose:
- Team A reportedly fielding calls on veteran wing
- Team B eyeing draft-pick consolidation
- Team C described as "aggressive" trade partner`,
    featuredImage: IMG.basketballHoop,
    authorSlug: "aisha-brown",
    categorySlug: "trade-rumors",
    sport: "NBA",
    leagueSlug: "nba",
    tagSlugs: ["nba-trades"],
    status: "DRAFT",
    publishedHoursAgo: 0,
    views: 0,
  },
  {
    id: "article-draft-transfer-deadline-day-guide",
    title: "Transfer Deadline Day: How SportInScope Will Cover It",
    slug: "transfer-deadline-day-coverage-guide",
    excerpt: "Internal draft outlining live-coverage plan for deadline day — not yet ready for publication.",
    content: `Draft planning notes for deadline-day live coverage: staffing rotation, which leagues to prioritize, and social posting cadence. To be finalized with the editorial team before deadline day.`,
    featuredImage: IMG.soccerBall,
    authorSlug: "sportinscope-staff",
    categorySlug: "transfers",
    sport: "FOOTBALL",
    tagSlugs: ["transfer-news"],
    status: "DRAFT",
    publishedHoursAgo: 0,
    views: 0,
  },
];

export const mockArticles: Article[] = seeds.map((s) => {
  const status = s.status ?? "PUBLISHED";
  const publishedAt = status === "PUBLISHED" ? hoursAgo(s.publishedHoursAgo ?? 1) : null;
  return {
    id: s.id,
    title: s.title,
    slug: s.slug,
    excerpt: s.excerpt,
    content: s.content,
    featuredImage: s.featuredImage,
    status,
    publishedAt,
    updatedAt: publishedAt ?? daysAgo(0),
    createdAt: publishedAt ?? daysAgo(0),
    readingTimeMins: estimateReadingTime(s.content),
    seoTitle: null,
    metaDescription: s.excerpt,
    canonicalUrl: null,
    author: author(s.authorSlug),
    category: category(s.categorySlug),
    sport: s.sport,
    team: s.teamSlug ? team(s.teamSlug) : null,
    league: s.leagueSlug ? league(s.leagueSlug) : null,
    player: s.playerSlug ? player(s.playerSlug) : null,
    tags: tags(...s.tagSlugs),
    views: s.views,
  };
});

export function getMockArticleBySlug(slug: string): Article | undefined {
  return mockArticles.find((a) => a.slug === slug);
}

import type { Match } from "@/types";
import { mockTeams } from "./teams";
import { mockLeagues } from "./leagues";

function team(slug: string) {
  const t = mockTeams.find((x) => x.slug === slug);
  if (!t) throw new Error(`Mock team not found: ${slug}`);
  return t;
}

function league(slug: string) {
  const l = mockLeagues.find((x) => x.slug === slug);
  if (!l) throw new Error(`Mock league not found: ${slug}`);
  return l;
}

function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

function daysFromNow(days: number, hour = 15): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

/**
 * Generated fresh on every call so "live"/"today"/"upcoming" always line up
 * with the current time, regardless of when the app is run. In production
 * this function is replaced by a real SportsDataProvider (see
 * src/lib/api/providers) — nothing else in the app needs to change.
 */
export function generateMockMatches(): Match[] {
  const pl = league("premier-league");
  const laliga = league("la-liga");
  const bundesliga = league("bundesliga");
  const ucl = league("champions-league");
  const nba = league("nba");

  const matches: Match[] = [
    // --- LIVE ---
    {
      id: "match-live-1",
      sport: "FOOTBALL",
      leagueId: pl.id,
      league: pl,
      homeTeamId: team("arsenal").id,
      homeTeam: team("arsenal"),
      awayTeamId: team("chelsea").id,
      awayTeam: team("chelsea"),
      homeScore: 2,
      awayScore: 1,
      status: "LIVE",
      startTime: minutesFromNow(-72),
      venue: "Emirates Stadium",
      clock: "72'",
    },
    {
      id: "match-live-2",
      sport: "NBA",
      leagueId: nba.id,
      league: nba,
      homeTeamId: team("lakers").id,
      homeTeam: team("lakers"),
      awayTeamId: team("warriors").id,
      awayTeam: team("warriors"),
      homeScore: 108,
      awayScore: 104,
      status: "LIVE",
      startTime: minutesFromNow(-150),
      venue: "Crypto.com Arena",
      clock: "Q4 03:21",
    },

    // --- TODAY / UPCOMING ---
    {
      id: "match-upcoming-1",
      sport: "FOOTBALL",
      leagueId: pl.id,
      league: pl,
      homeTeamId: team("liverpool").id,
      homeTeam: team("liverpool"),
      awayTeamId: team("manchester-city").id,
      awayTeam: team("manchester-city"),
      status: "SCHEDULED",
      startTime: hoursFromNow(5),
      venue: "Anfield",
    },
    {
      id: "match-upcoming-2",
      sport: "NBA",
      leagueId: nba.id,
      league: nba,
      homeTeamId: team("celtics").id,
      homeTeam: team("celtics"),
      awayTeamId: team("knicks").id,
      awayTeam: team("knicks"),
      status: "SCHEDULED",
      startTime: hoursFromNow(8),
      venue: "TD Garden",
    },
    {
      id: "match-upcoming-3",
      sport: "FOOTBALL",
      leagueId: laliga.id,
      league: laliga,
      homeTeamId: team("real-madrid").id,
      homeTeam: team("real-madrid"),
      awayTeamId: team("barcelona").id,
      awayTeam: team("barcelona"),
      status: "SCHEDULED",
      startTime: daysFromNow(1, 20),
      venue: "Santiago Bernabéu",
    },
    {
      id: "match-upcoming-4",
      sport: "FOOTBALL",
      leagueId: ucl.id,
      league: ucl,
      homeTeamId: team("bayern-munich").id,
      homeTeam: team("bayern-munich"),
      awayTeamId: team("psg").id,
      awayTeam: team("psg"),
      status: "SCHEDULED",
      startTime: daysFromNow(2, 21),
      venue: "Allianz Arena",
    },
    {
      id: "match-upcoming-5",
      sport: "NBA",
      leagueId: nba.id,
      league: nba,
      homeTeamId: team("bucks").id,
      homeTeam: team("bucks"),
      awayTeamId: team("nuggets").id,
      awayTeam: team("nuggets"),
      status: "SCHEDULED",
      startTime: daysFromNow(1, 19),
      venue: "Fiserv Forum",
    },
    {
      id: "match-upcoming-6",
      sport: "FOOTBALL",
      leagueId: bundesliga.id,
      league: bundesliga,
      homeTeamId: team("borussia-dortmund").id,
      homeTeam: team("borussia-dortmund"),
      awayTeamId: team("bayern-munich").id,
      awayTeam: team("bayern-munich"),
      status: "SCHEDULED",
      startTime: daysFromNow(3, 18),
      venue: "Signal Iduna Park",
    },

    // --- FINISHED / RECENT RESULTS ---
    {
      id: "match-finished-1",
      sport: "FOOTBALL",
      leagueId: pl.id,
      league: pl,
      homeTeamId: team("manchester-united").id ?? team("arsenal").id,
      homeTeam: team("manchester-united"),
      awayTeamId: team("tottenham-hotspur").id,
      awayTeam: team("tottenham-hotspur"),
      homeScore: 1,
      awayScore: 3,
      status: "FINISHED",
      startTime: hoursFromNow(-30),
      venue: "Old Trafford",
    },
    {
      id: "match-finished-2",
      sport: "NBA",
      leagueId: nba.id,
      league: nba,
      homeTeamId: team("nuggets").id,
      homeTeam: team("nuggets"),
      awayTeamId: team("suns").id,
      awayTeam: team("suns"),
      homeScore: 121,
      awayScore: 117,
      status: "FINISHED",
      startTime: hoursFromNow(-20),
      venue: "Ball Arena",
    },
    {
      id: "match-finished-3",
      sport: "FOOTBALL",
      leagueId: laliga.id,
      league: laliga,
      homeTeamId: team("atletico-madrid").id,
      homeTeam: team("atletico-madrid"),
      awayTeamId: team("sevilla").id,
      awayTeam: team("sevilla"),
      homeScore: 2,
      awayScore: 0,
      status: "FINISHED",
      startTime: hoursFromNow(-48),
      venue: "Cívitas Metropolitano",
    },
    {
      id: "match-finished-4",
      sport: "NBA",
      leagueId: nba.id,
      league: nba,
      homeTeamId: team("76ers").id,
      homeTeam: team("76ers"),
      awayTeamId: team("mavericks").id,
      awayTeam: team("mavericks"),
      homeScore: 99,
      awayScore: 105,
      status: "FINISHED",
      startTime: hoursFromNow(-44),
      venue: "Wells Fargo Center",
    },
  ];

  return matches;
}

import { generateArticleFromPrompt, type GeneratedArticleContent } from "./openai-client";

const SYSTEM_PROMPT =
  "You are a sports news writer for SportInScope, a football and NBA media outlet. " +
  "Write factual, neutral news copy using ONLY the data given — never invent stats, quotes, " +
  "injuries, or lineup details that aren't in the input. Respond with ONLY a JSON object: " +
  '{"title": string, "excerpt": string, "content": string, "seoTitle": string, "metaDescription": string, "tags": string[]}. ' +
  '"excerpt" is one sentence (max 200 characters). "content" is 6-9 plain-text paragraphs ' +
  "(no markdown headers) with real analysis, context, and implications — not just a brief " +
  'summary. "seoTitle" is a search-engine-friendly headline (max 70 characters). ' +
  '"metaDescription" is a search-result summary (max 155 characters). "tags" is 3-6 short, ' +
  "lowercase keyword tags (team names, league/competition, topic) with no hashtags.";

export interface MatchOfTheRoundInput {
  leagueName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  homePosition: number | null;
  awayPosition: number | null;
}

/** One focused recap of the single standout match from a league's latest finished round, picked as the top-of-table clash. */
export function generateMatchOfTheRound(input: MatchOfTheRoundInput): Promise<GeneratedArticleContent> {
  const homeRank = input.homePosition ? ` (${input.homePosition}${ordinalSuffix(input.homePosition)} in the table)` : "";
  const awayRank = input.awayPosition ? ` (${input.awayPosition}${ordinalSuffix(input.awayPosition)} in the table)` : "";
  const userPrompt = `Write a short recap article about the standout match of the round in this league.
League: ${input.leagueName}
Result: ${input.homeTeamName}${homeRank} ${input.homeScore} - ${input.awayScore} ${input.awayTeamName}${awayRank}
Focus only on this single match — do not mention other fixtures. Use only the score and table positions given; do not invent goalscorers, lineups, or match events not in this data.`;
  return generateArticleFromPrompt(SYSTEM_PROMPT, userPrompt);
}

function ordinalSuffix(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export interface TransferArticleInput {
  playerName: string;
  fromTeamName: string | null;
  toTeamName: string | null;
  status: string;
  feeAmount: string | null;
  source: string;
}

export function generateTransferArticle(transfer: TransferArticleInput): Promise<GeneratedArticleContent> {
  const userPrompt = `Write a short transfer news update.
Player: ${transfer.playerName}
From club: ${transfer.fromTeamName ?? "Unattached"}
To club: ${transfer.toTeamName ?? "Unconfirmed"}
Deal status: ${transfer.status}
Reported fee: ${transfer.feeAmount ?? "undisclosed"}
Source: ${transfer.source}`;
  return generateArticleFromPrompt(SYSTEM_PROMPT, userPrompt);
}

export interface StandingsRecapInput {
  leagueName: string;
  rows: { position: number; teamName: string; points: number; played: number; won: number; drawn: number; lost: number }[];
}

export function generateStandingsRecap(input: StandingsRecapInput): Promise<GeneratedArticleContent> {
  const table = input.rows
    .slice(0, 10)
    .map((r) => `${r.position}. ${r.teamName} — ${r.points} pts (P${r.played} W${r.won} D${r.drawn} L${r.lost})`)
    .join("\n");
  const userPrompt = `Write a short league standings update article.
League: ${input.leagueName}
Current table (top entries):
${table}`;
  return generateArticleFromPrompt(SYSTEM_PROMPT, userPrompt);
}

export interface ViralNewsInput {
  headline: string;
  description: string | null;
  sourceName: string;
  sourceUrl: string;
}

/** Original commentary piece inspired by a real trending headline — never a copy/paraphrase-for-paraphrase's-sake reproduction of the source. */
export function generateViralNewsArticle(input: ViralNewsInput): Promise<GeneratedArticleContent> {
  const userPrompt = `Write an ORIGINAL short news article inspired by this real, currently trending sports headline.
Headline: ${input.headline}
Source summary: ${input.description ?? "(no summary available)"}
Source: ${input.sourceName} (${input.sourceUrl})
Rules: Do not copy sentences verbatim from the source summary — rewrite entirely in your own words and add context/analysis. Attribute the underlying report to "${input.sourceName}" by name in the article body. If the summary lacks detail, keep the article short and general rather than inventing specifics.`;
  return generateArticleFromPrompt(SYSTEM_PROMPT, userPrompt);
}

import { generateArticleFromPrompt, type GeneratedArticleContent } from "./openai-client";

const SYSTEM_PROMPT =
  "You are a sports news writer for SportInScope, a football and NBA media outlet. " +
  "Write factual, neutral, concise news copy using ONLY the data given — never invent " +
  "stats, quotes, injuries, or lineup details that aren't in the input. Respond with ONLY " +
  'a JSON object: {"title": string, "excerpt": string, "content": string}. "excerpt" is one ' +
  'sentence (max 200 characters). "content" is 3-5 short plain-text paragraphs (no markdown headers).';

export interface LeagueRoundupInput {
  leagueName: string;
  results: { homeTeamName: string; awayTeamName: string; homeScore: number; awayScore: number }[];
}

/** One roundup article covering every finished match in a league from a single sync run, instead of one article per match. */
export function generateLeagueRoundup(input: LeagueRoundupInput): Promise<GeneratedArticleContent> {
  const results = input.results
    .map((r) => `${r.homeTeamName} ${r.homeScore} - ${r.awayScore} ${r.awayTeamName}`)
    .join("\n");
  const userPrompt = `Write a short results roundup article covering these recent matches in one league.
League: ${input.leagueName}
Results:
${results}
Summarize the overall picture (notable results, high-scoring games, upsets) using only the scores given — do not invent standings, form, or player details not in this data.`;
  return generateArticleFromPrompt(SYSTEM_PROMPT, userPrompt);
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

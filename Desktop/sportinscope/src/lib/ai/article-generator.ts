import { generateArticleFromPrompt, type GeneratedArticleContent } from "./openai-client";

const SYSTEM_PROMPT =
  "You are a sports news writer for SportInScope, a football and NBA media outlet. " +
  "Write factual, neutral, concise news copy using ONLY the data given — never invent " +
  "stats, quotes, injuries, or lineup details that aren't in the input. Respond with ONLY " +
  'a JSON object: {"title": string, "excerpt": string, "content": string}. "excerpt" is one ' +
  'sentence (max 200 characters). "content" is 3-5 short plain-text paragraphs (no markdown headers).';

export interface MatchReportInput {
  leagueName: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  venue: string | null;
  kickoffIso: string;
}

export function generateMatchReport(match: MatchReportInput): Promise<GeneratedArticleContent> {
  const userPrompt = `Write a short match report.
League: ${match.leagueName}
Final score: ${match.homeTeamName} ${match.homeScore} - ${match.awayScore} ${match.awayTeamName}
Venue: ${match.venue ?? "Unknown"}
Kickoff (UTC): ${match.kickoffIso}
Do not speculate about lineups, injuries, or individual performances beyond the result and context given.`;
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

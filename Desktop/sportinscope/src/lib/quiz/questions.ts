export type QuizCategory = "Football" | "Champions League" | "NBA" | "Players";

export interface QuizQuestion {
  id: string;
  category: QuizCategory;
  question: string;
  options: readonly string[];
  answer: string;
  explanation: string;
  sourceUrl: string;
}

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: "ucl-most-titles",
    category: "Champions League",
    question: "Which club has won the European Cup and Champions League the most times?",
    options: ["AC Milan", "Real Madrid", "Liverpool", "Bayern Munich"],
    answer: "Real Madrid",
    explanation: "Real Madrid are the competition's record winners.",
    sourceUrl: "https://www.uefa.com/uefachampionsleague/history/winners/",
  },
  {
    id: "ucl-first-final",
    category: "Champions League",
    question: "Which club won the first European Cup final in 1956?",
    options: ["Real Madrid", "Stade de Reims", "Benfica", "Inter Milan"],
    answer: "Real Madrid",
    explanation: "Real Madrid beat Stade de Reims 4-3 in the inaugural final.",
    sourceUrl: "https://www.uefa.com/uefachampionsleague/history/seasons/1955/",
  },
  {
    id: "world-cup-most-wins",
    category: "Football",
    question: "Which men's national team has won the FIFA World Cup the most times?",
    options: ["Germany", "Italy", "Brazil", "Argentina"],
    answer: "Brazil",
    explanation: "Brazil have won the men's World Cup five times.",
    sourceUrl: "https://www.fifa.com/en/tournaments/mens/worldcup",
  },
  {
    id: "football-law-players",
    category: "Football",
    question: "How many players does each team start with in a standard football match?",
    options: ["9", "10", "11", "12"],
    answer: "11",
    explanation: "A team starts with eleven players, including its goalkeeper.",
    sourceUrl: "https://www.theifab.com/laws/latest/the-players/",
  },
  {
    id: "premier-league-founded",
    category: "Football",
    question: "In which year did the Premier League begin?",
    options: ["1988", "1992", "1996", "2000"],
    answer: "1992",
    explanation: "The first Premier League season began in 1992-93.",
    sourceUrl: "https://www.premierleague.com/history",
  },
  {
    id: "nba-championship-record",
    category: "NBA",
    question: "Which franchise has won the most NBA championships?",
    options: ["Chicago Bulls", "Boston Celtics", "Los Angeles Lakers", "Golden State Warriors"],
    answer: "Boston Celtics",
    explanation: "Boston are tied with the Lakers at the top historically and most recently held the record outright after their 2024 title.",
    sourceUrl: "https://www.nba.com/news/nba-championships-by-team",
  },
  {
    id: "nba-shot-clock",
    category: "NBA",
    question: "How many seconds are on the NBA shot clock?",
    options: ["20", "24", "30", "35"],
    answer: "24",
    explanation: "NBA teams must attempt a shot that hits the rim within 24 seconds.",
    sourceUrl: "https://official.nba.com/rule-no-7-24-second-clock/",
  },
  {
    id: "nba-three-point-line",
    category: "NBA",
    question: "How many points is a successful shot from behind the NBA three-point line worth?",
    options: ["1", "2", "3", "4"],
    answer: "3",
    explanation: "A made field goal from beyond the three-point line is worth three points.",
    sourceUrl: "https://official.nba.com/rule-no-5-scoring-and-timing/",
  },
  {
    id: "nba-game-length",
    category: "NBA",
    question: "How long is an NBA game, excluding overtime?",
    options: ["40 minutes", "48 minutes", "60 minutes", "90 minutes"],
    answer: "48 minutes",
    explanation: "NBA games have four 12-minute quarters.",
    sourceUrl: "https://official.nba.com/rule-no-5-scoring-and-timing/",
  },
  {
    id: "nba-mvp-award",
    category: "NBA",
    question: "What does NBA MVP stand for?",
    options: ["Most Valuable Player", "Maximum Victory Performance", "Most Versatile Professional", "Major Victory Player"],
    answer: "Most Valuable Player",
    explanation: "MVP is the league's Most Valuable Player award.",
    sourceUrl: "https://www.nba.com/awards",
  },
  {
    id: "ucl-trophy-name",
    category: "Champions League",
    question: "What is the European Cup trophy commonly nicknamed?",
    options: ["The Globe", "The Big Ears", "The Crown", "The Silver Ball"],
    answer: "The Big Ears",
    explanation: "The trophy's large handles give it the famous nickname.",
    sourceUrl: "https://www.uefa.com/uefachampionsleague/news/0253-0d8223a7b2a3-4a4d4c4b9b0e-1000--the-champions-league-trophy/",
  },
  {
    id: "football-pitch-halves",
    category: "Football",
    question: "How many halves make up regulation time in football?",
    options: ["2", "3", "4", "6"],
    answer: "2",
    explanation: "A standard match consists of two 45-minute halves before added time.",
    sourceUrl: "https://www.theifab.com/laws/latest/the-duration-of-the-match/",
  },
  {
    id: "nba-free-throw",
    category: "NBA",
    question: "How many points is a made NBA free throw worth?",
    options: ["1", "2", "3", "It depends"],
    answer: "1",
    explanation: "Every successful free throw counts for one point.",
    sourceUrl: "https://official.nba.com/rule-no-5-scoring-and-timing/",
  },
  {
    id: "football-yellow-card",
    category: "Football",
    question: "What does a yellow card represent in football?",
    options: ["A warning", "A goal", "A substitution", "A match win"],
    answer: "A warning",
    explanation: "A yellow card is a formal caution issued by the referee.",
    sourceUrl: "https://www.theifab.com/laws/latest/fouls-and-misconduct/",
  },
  {
    id: "nba-court-teams",
    category: "NBA",
    question: "How many players from one team are on the court during live NBA play?",
    options: ["4", "5", "6", "7"],
    answer: "5",
    explanation: "Each team has five players on the court during live play.",
    sourceUrl: "https://official.nba.com/rule-no-3-players-substitutes-and-coaches/",
  },
  {
    id: "ucl-final-name",
    category: "Champions League",
    question: "What was the competition called before it became the UEFA Champions League in 1992?",
    options: ["European Cup", "UEFA Super League", "Continental Cup", "Cup Winners League"],
    answer: "European Cup",
    explanation: "The competition began as the European Champion Clubs' Cup, commonly called the European Cup.",
    sourceUrl: "https://www.uefa.com/uefachampionsleague/history/",
  },
  {
    id: "football-red-card",
    category: "Football",
    question: "What happens when a football player receives a red card?",
    options: ["The player is sent off", "The team gets a goal", "The player takes a free kick", "The match ends immediately"],
    answer: "The player is sent off",
    explanation: "A red card dismisses the player from the match.",
    sourceUrl: "https://www.theifab.com/laws/latest/fouls-and-misconduct/",
  },
  {
    id: "nba-quarters",
    category: "NBA",
    question: "How many quarters are played in a regulation NBA game?",
    options: ["2", "3", "4", "5"],
    answer: "4",
    explanation: "Regulation NBA games are divided into four quarters.",
    sourceUrl: "https://official.nba.com/rule-no-5-scoring-and-timing/",
  },
  {
    id: "ucl-match-format",
    category: "Champions League",
    question: "Which organization runs the UEFA Champions League?",
    options: ["FIFA", "UEFA", "The FA", "The NBA"],
    answer: "UEFA",
    explanation: "UEFA is European football's governing body and organizes the competition.",
    sourceUrl: "https://www.uefa.com/insideuefa/about-uefa/",
  },
  {
    id: "football-penalty-distance",
    category: "Football",
    question: "How far is the penalty mark from the goal line in football?",
    options: ["9 metres", "10 metres", "11 metres", "12 metres"],
    answer: "11 metres",
    explanation: "The penalty mark is 11 metres from the goal line.",
    sourceUrl: "https://www.theifab.com/laws/latest/the-penalty-kick/",
  },
];

export const DAILY_QUIZ_SIZE = 10;

import { additionalQuizQuestions } from "@/lib/quiz/fact-bank";

export const allQuizQuestions: readonly QuizQuestion[] = [...quizQuestions, ...additionalQuizQuestions];

export function getDailyQuiz(date = new Date(), questionBank: readonly QuizQuestion[] = allQuizQuestions): QuizQuestion[] {
  const dayKey = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000);
  const shuffled = [...questionBank].sort((left, right) => {
    const leftValue = hash(`${dayKey}:${left.id}`);
    const rightValue = hash(`${dayKey}:${right.id}`);
    return leftValue - rightValue;
  });
  return shuffled.slice(0, DAILY_QUIZ_SIZE);
}

function hash(value: string): number {
  let result = 2166136261;
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619);
  return result >>> 0;
}

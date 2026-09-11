import { describe, expect, it } from "vitest";
import { DAILY_QUIZ_SIZE, allQuizQuestions, getDailyQuiz } from "@/lib/quiz/questions";

describe("quiz question bank", () => {
  it("has valid answer options and unique ids", () => {
    expect(allQuizQuestions.length).toBeGreaterThanOrEqual(200);
    expect(new Set(allQuizQuestions.map((question) => question.id)).size).toBe(allQuizQuestions.length);
    for (const question of allQuizQuestions) {
      expect(question.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(question.options).size).toBe(question.options.length);
      expect(question.options).toContain(question.answer);
      expect(question.sourceUrl).toMatch(/^https:\/\//);
    }
  });

  it("returns a stable daily selection", () => {
    const date = new Date("2026-09-11T12:00:00Z");
    expect(getDailyQuiz(date)).toEqual(getDailyQuiz(date));
    expect(getDailyQuiz(date)).toHaveLength(DAILY_QUIZ_SIZE);
    expect(getDailyQuiz(date).map((question) => question.id)).not.toEqual(
      getDailyQuiz(new Date("2026-09-12T12:00:00Z")).map((question) => question.id),
    );
  });
});

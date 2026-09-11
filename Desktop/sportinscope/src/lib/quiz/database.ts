import { prisma } from "@/lib/db";
import { allQuizQuestions, type QuizQuestion } from "@/lib/quiz/questions";

export async function getQuizQuestionBank(): Promise<QuizQuestion[]> {
  try {
    const rows = await prisma.quizQuestion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    if (rows.length === 0) return [...allQuizQuestions];
    return rows.map((row) => ({
      id: row.id,
      category: row.category as QuizQuestion["category"],
      question: row.question,
      options: Array.isArray(row.options) ? row.options.filter((option): option is string => typeof option === "string") : [],
      answer: row.answer,
      explanation: row.explanation,
      sourceUrl: row.sourceUrl,
    }));
  } catch {
    return [...allQuizQuestions];
  }
}
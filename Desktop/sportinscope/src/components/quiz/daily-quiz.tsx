"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, RotateCcw, Share2, X } from "lucide-react";
import { DAILY_QUIZ_SIZE, getDailyQuiz, type QuizQuestion } from "@/lib/quiz/questions";

const STORAGE_PREFIX = "sis:daily-quiz:";

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

interface SavedQuiz {
  answers: Record<string, string>;
  score: number;
  completed: boolean;
}

export function DailyQuiz({ questions: questionBank }: { questions: readonly QuizQuestion[] }) {
  const dateKey = getDateKey();
  const questions = useMemo(() => getDailyQuiz(new Date(), questionBank), [questionBank]);
  const [saved, setSaved] = useState<SavedQuiz>({ answers: {}, score: 0, completed: false });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${dateKey}`);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedQuiz;
        setSaved(parsed);
        setCurrentIndex(parsed.completed ? questions.length - 1 : Object.keys(parsed.answers).length);
      }
    } catch {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${dateKey}`);
    }
  }, [dateKey, questions]);

  const question = questions[currentIndex] ?? questions[0]!;
  const selectedAnswer = saved.answers[question.id];
  const answeredCount = Object.keys(saved.answers).length;

  function chooseAnswer(answer: string) {
    if (selectedAnswer) return;
    const next = {
      ...saved,
      answers: { ...saved.answers, [question.id]: answer },
    };
    setSaved(next);
    window.localStorage.setItem(`${STORAGE_PREFIX}${dateKey}`, JSON.stringify(next));
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) setCurrentIndex((index) => index + 1);
    else finishQuiz();
  }

  function finishQuiz() {
    const score = questions.reduce((total, item) => total + (saved.answers[item.id] === item.answer ? 1 : 0), 0);
    const next = { ...saved, score, completed: true };
    setSaved(next);
    window.localStorage.setItem(`${STORAGE_PREFIX}${dateKey}`, JSON.stringify(next));
  }

  function resetQuiz() {
    const next = { answers: {}, score: 0, completed: false };
    setSaved(next);
    setCurrentIndex(0);
    window.localStorage.removeItem(`${STORAGE_PREFIX}${dateKey}`);
  }

  async function shareScore() {
    const text = `I scored ${saved.score}/${questions.length} on today's SportInScope quiz.`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "SportInScope Daily Quiz", text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 1800);
    } catch {
      setShareState("idle");
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Daily challenge</p>
          <p className="mt-1 text-sm text-muted-foreground">10 questions. No sign-in. New quiz every day.</p>
        </div>
        <div className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-bold">
          {saved.completed ? `${saved.score}/${questions.length}` : `${Math.min(answeredCount + 1, questions.length)}/${questions.length}`}
        </div>
      </div>

      {saved.completed ? (
        <QuizResult score={saved.score} questions={questions} onReset={resetQuiz} onShare={shareScore} shareState={shareState} />
      ) : (
        <div className="rounded-md border border-border bg-surface p-5 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <span>{question.category}</span>
            <span>Question {currentIndex + 1}</span>
          </div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{question.question}</h2>
          <div className="mt-7 grid gap-3">
            {question.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === question.answer;
              const showResult = Boolean(selectedAnswer);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => chooseAnswer(option)}
                  disabled={Boolean(selectedAnswer)}
                  className={`flex min-h-14 items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-semibold transition-colors ${
                    showResult && isCorrect
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : showResult && isSelected
                        ? "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300"
                        : "border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <span>{option}</span>
                  {showResult && isCorrect ? <Check className="h-5 w-5 shrink-0" aria-hidden /> : null}
                  {showResult && isSelected && !isCorrect ? <X className="h-5 w-5 shrink-0" aria-hidden /> : null}
                </button>
              );
            })}
          </div>
          {selectedAnswer ? (
            <div className="mt-6 border-t border-border pt-5">
              <p className="text-sm text-muted-foreground">{question.explanation}</p>
              <a href={question.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Check the source <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <button type="button" onClick={nextQuestion} className="mt-5 flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
                {currentIndex === questions.length - 1 ? "See my score" : "Next question"}
              </button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}

function QuizResult({
  score,
  questions,
  onReset,
  onShare,
  shareState,
}: {
  score: number;
  questions: readonly QuizQuestion[];
  onReset: () => void;
  onShare: () => void;
  shareState: "idle" | "copied";
}) {
  const percentage = Math.round((score / questions.length) * 100);
  const message = percentage >= 80 ? "Sharp work." : percentage >= 50 ? "Solid start." : "The rematch is tomorrow.";
  return (
    <div className="rounded-md border border-border bg-surface p-6 text-center shadow-sm sm:p-10">
      <p className="kicker">Final score</p>
      <p className="mt-3 font-display text-6xl font-extrabold text-primary">{score}/{questions.length}</p>
      <h2 className="mt-3 font-display text-2xl font-extrabold">{message}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Your score is saved on this device. Come back tomorrow for a new challenge.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onShare} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">
          {shareState === "copied" ? <Copy className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
          {shareState === "copied" ? "Result copied" : "Share result"}
        </button>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-3 text-sm font-bold">
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </button>
      </div>
    </div>
  );
}

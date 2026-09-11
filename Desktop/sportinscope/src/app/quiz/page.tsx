import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { DailyQuiz } from "@/components/quiz/daily-quiz";
import { buildMetadata } from "@/lib/seo";
import { getQuizQuestionBank } from "@/lib/quiz/database";

export const metadata: Metadata = buildMetadata({
  title: "Daily Sports Quiz",
  description: "Test your football and NBA knowledge with a new SportInScope quiz every day.",
  path: "/quiz",
});

export default async function QuizPage() {
  const questions = await getQuizQuestionBank();

  return (
    <div className="container-page flex flex-col gap-7 py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Daily Quiz" }]} />
      <header className="max-w-3xl">
        <p className="kicker">SportInScope interactive</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">How much do you know?</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Take today&apos;s quick-fire football and NBA quiz. No account needed, just a fresh set of questions and a score to share.
        </p>
      </header>
      <DailyQuiz questions={questions} />
    </div>
  );
}

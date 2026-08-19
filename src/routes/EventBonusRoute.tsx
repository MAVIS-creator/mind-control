import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { PlayIcon, SparklesIcon } from "../components/AppIcons";
import { EventEditionShell } from "../components/EventEditionShell";
import { fetchEventEdition, type EventEdition } from "../lib/eventEditions";
import { loadEventRuns, type EventRun, upsertEventRun } from "../lib/eventRuntime";
import { formatNumber } from "../lib/utils";

export const EventBonusRoute = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventSlug = "cyberpath" } = useParams();
  const [edition, setEdition] = useState<EventEdition | null | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    void fetchEventEdition(eventSlug).then(setEdition);
  }, [eventSlug]);

  const latestRun =
    (location.state as { run?: EventRun } | undefined)?.run ??
    (edition ? loadEventRuns(edition.id)[0] : undefined);
  const challenges = edition?.config.challenges ?? [];

  const result = useMemo(() => {
    const correct = challenges.filter(
      (challenge) =>
        answers[challenge.id]?.trim().toUpperCase() === challenge.expectedAnswer.toUpperCase(),
    );
    return {
      correctCount: correct.length,
      score: correct.reduce((sum, challenge) => sum + challenge.points, 0),
    };
  }, [answers, challenges]);

  if (edition === undefined) return <EventEditionShell edition={edition}><main className="p-8 text-center font-bold text-[#1c05b3] dark:text-sky-400">Loading event...</main></EventEditionShell>;
  if (!edition) return <Navigate to="/" replace />;
  if (!latestRun) return <Navigate to={`/${edition.slug}`} replace />;
  if (!latestRun.qualifiedForBonus) return <Navigate to={`/${edition.slug}/results`} state={{ run: latestRun }} replace />;

  const finishBonus = async () => {
    const nextRun = {
      ...latestRun,
      currentStage: "Completed" as const,
      bonusScore: result.score,
      totalScore: latestRun.memoryScore + result.score,
      completedAt: new Date().toISOString(),
    };
    await upsertEventRun(nextRun);
    navigate(`/${edition.slug}/results`, { state: { run: nextRun } });
  };

  return (
    <EventEditionShell edition={edition}>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-7 text-center">
          <SparklesIcon className="mx-auto h-12 w-12 text-[#1c05b3] dark:text-sky-400" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-[#1c05b3] dark:text-sky-400">Bonus Round Unlocked</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-[#0f172a] dark:text-white sm:text-6xl">Safe CTF Challenges</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#586074] dark:text-slate-400">
            Solve safe bonus puzzles. Correct answers add to your event score.
          </p>
        </section>

        <section className="grid gap-4">
          {challenges.map((challenge, index) => {
            const isCorrect =
              submitted && answers[challenge.id]?.trim().toUpperCase() === challenge.expectedAnswer.toUpperCase();
            return (
              <article key={challenge.id} className="glass-panel rounded-[1.8rem] p-5 sm:p-6 dark:bg-slate-900/90 dark:border-slate-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#1c05b3] dark:text-sky-400">
                      Challenge {index + 1} • {challenge.points} pts
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-[-0.04em] text-[#0f172a] dark:text-white">{challenge.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-[#586074] dark:text-slate-400">{challenge.prompt}</p>
                  </div>
                  {submitted ? (
                    <span className={`rounded-full px-4 py-2 text-sm font-bold ${isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                      {isCorrect ? "Correct" : "Try next time"}
                    </span>
                  ) : null}
                </div>
                <pre className="mt-4 overflow-x-auto rounded-[1.2rem] bg-[#0f172a] dark:bg-slate-950 p-4 text-sm leading-7 text-white">{challenge.body}</pre>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395] dark:text-slate-400">{challenge.hint}</p>
                <input
                  value={answers[challenge.id] ?? ""}
                  onChange={(event) => setAnswers((current) => ({ ...current, [challenge.id]: event.target.value }))}
                  className="mt-3 w-full rounded-[1.1rem] border border-[#cbd5e1] dark:border-slate-700 bg-white/85 dark:bg-slate-900 px-4 py-3 outline-none focus:border-[#1c05b3] dark:text-white"
                  placeholder="Enter answer"
                  disabled={submitted}
                />
              </article>
            );
          })}
        </section>

        <div className="mt-6 glass-panel rounded-[1.8rem] p-5 text-center dark:bg-slate-900/90 dark:border-slate-800">
          <p className="text-sm text-[#586074] dark:text-slate-400">Current bonus score</p>
          <p className="mt-1 text-4xl font-black text-[#1c05b3] dark:text-sky-400">{formatNumber(result.score)}</p>
          {!submitted ? (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="mt-5 rounded-full bg-gradient-to-b from-[#2406e2] to-[#1c05b3] px-8 py-4 font-bold text-white shadow-md"
            >
              Check Answers
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void finishBonus()}
              className="mt-5 inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#2406e2] to-[#1c05b3] px-8 py-4 font-bold text-white shadow-md"
            >
              <PlayIcon className="h-5 w-5" />
              Finish Event
            </button>
          )}
        </div>
      </main>
    </EventEditionShell>
  );
};

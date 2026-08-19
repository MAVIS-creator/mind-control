import { Link, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GridIcon, PlayIcon, TrophyIcon } from "../components/AppIcons";
import { EventEditionShell } from "../components/EventEditionShell";
import { fetchEventEdition, type EventEdition } from "../lib/eventEditions";
import { loadEventRuns, type EventRun } from "../lib/eventRuntime";
import { formatDuration, formatNumber } from "../lib/utils";

export const EventResultsRoute = () => {
  const { eventSlug = "cyberpath" } = useParams();
  const location = useLocation();
  const [edition, setEdition] = useState<EventEdition | null | undefined>(undefined);

  useEffect(() => {
    void fetchEventEdition(eventSlug).then(setEdition);
  }, [eventSlug]);

  const run = (location.state as { run?: EventRun } | undefined)?.run ?? (edition ? loadEventRuns(edition.id)[0] : undefined);

  if (edition === undefined) return <EventEditionShell edition={edition}><main className="p-8 text-center font-bold text-[#2563eb] dark:text-sky-400">Loading event...</main></EventEditionShell>;
  if (!edition) return <Navigate to="/" replace />;
  if (!run) return <Navigate to={`/${edition.slug}`} replace />;

  return (
    <EventEditionShell edition={edition}>
      <main className="mx-auto flex min-h-[calc(100svh-92px)] max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-3xl text-center">
          <div className="glass-panel rounded-[2.4rem] p-6 shadow-[0_24px_60px_rgba(37,99,235,0.12)] sm:p-9 dark:bg-slate-900/90 dark:border-slate-800">
            <TrophyIcon className="mx-auto h-14 w-14 text-[#2563eb] dark:text-sky-400" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.26em] text-[#2563eb] dark:text-sky-400">Event Complete</p>
            <h1 className="mt-2 text-5xl font-black tracking-[-0.06em] text-[#0f172a] dark:text-white sm:text-7xl">
              {formatNumber(run.totalScore)}
            </h1>
            <p className="mt-2 text-lg font-semibold text-[#586074] dark:text-slate-400">
              {run.nickname} • {run.participantCode}
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <ResultTile label="Memory Score" value={formatNumber(run.memoryScore)} />
              <ResultTile label="Bonus Score" value={formatNumber(run.bonusScore)} />
              <ResultTile label="Total Time" value={formatDuration(run.totalTimeSeconds)} />
            </div>

            <div className="mt-6 grid gap-3">
              {run.roundResults.length ? (
                run.roundResults.map((round) => (
                  <div key={round.roundId} className="flex items-center justify-between rounded-[1.2rem] bg-white/70 dark:bg-slate-800/50 px-4 py-3 text-left">
                    <div>
                      <p className="font-bold text-[#0f172a] dark:text-white">{round.title}</p>
                      <p className="text-sm text-[#586074] dark:text-slate-400">
                        {round.matches}/{round.totalPairs ?? 8} matched • {round.mistakes} mistakes • {formatDuration(round.duration)}
                      </p>
                    </div>
                    <p className="font-black text-[#2563eb] dark:text-sky-400">{formatNumber(round.score)}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.2rem] bg-white/70 dark:bg-slate-800/50 px-4 py-3 text-sm text-[#586074] dark:text-slate-400">
                  Detailed round data is stored on this device for fresh runs.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to={`/${edition.slug}/play`} className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-8 py-4 font-bold text-white shadow-md">
              <PlayIcon className="h-5 w-5" />
              Play Again
            </Link>
            <Link to={`/${edition.slug}/live`} className="inline-flex items-center justify-center gap-3 rounded-full border border-[#cbd5e1] dark:border-slate-800 bg-white/80 dark:bg-slate-900 px-8 py-4 font-bold text-[#2563eb] dark:text-sky-400 shadow-sm">
              <GridIcon className="h-5 w-5" />
              View Live Board
            </Link>
          </div>
        </section>
      </main>
    </EventEditionShell>
  );
};

const ResultTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.3rem] bg-white/75 dark:bg-slate-950/50 px-4 py-5">
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7d8395] dark:text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-black text-[#2563eb] dark:text-sky-400">{value}</p>
  </div>
);

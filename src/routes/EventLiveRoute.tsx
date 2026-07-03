import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { RefreshIcon, TrophyIcon } from "../components/AppIcons";
import { EventEditionShell } from "../components/EventEditionShell";
import { fetchEventEdition, type EventEdition } from "../lib/eventEditions";
import {
  clearEventRuns,
  compareEventRuns,
  fetchEventLeaderboard,
  type EventRun,
} from "../lib/eventRuntime";
import { formatDuration, formatNumber } from "../lib/utils";

export const EventLiveRoute = () => {
  const { eventSlug = "cyberpath" } = useParams();
  const [edition, setEdition] = useState<EventEdition | null | undefined>(undefined);
  const [runs, setRuns] = useState<EventRun[]>([]);

  useEffect(() => {
    void fetchEventEdition(eventSlug).then(setEdition);
  }, [eventSlug]);

  const refresh = async () => {
    if (!edition) return;
    const nextRuns = await fetchEventLeaderboard(edition.id);
    setRuns(nextRuns.sort(compareEventRuns));
  };

  useEffect(() => {
    if (!edition) return undefined;
    void refresh();
    const interval = window.setInterval(() => void refresh(), 8000);
    return () => window.clearInterval(interval);
  }, [edition]);

  const resetLocal = () => {
    if (!edition) return;
    clearEventRuns(edition.id);
    void refresh();
  };

  if (edition === undefined) return <EventEditionShell edition={edition}><main className="p-8 text-center font-bold text-[#3525cd]">Loading event...</main></EventEditionShell>;
  if (!edition) return <Navigate to="/" replace />;

  return (
    <EventEditionShell edition={edition}>
      <main className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3525cd]">Projector Leaderboard</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-[#111c2d] sm:text-6xl">{edition.title}</h1>
            <p className="mt-3 max-w-2xl text-base leading-8 text-[#586074]">Nicknames only. Scores refresh automatically for this event display.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void refresh()} className="rounded-full border border-[#d9d8eb] bg-white/80 px-5 py-3 font-bold text-[#3525cd]">
              <RefreshIcon className="inline h-4 w-4" /> Refresh
            </button>
            <button type="button" onClick={resetLocal} className="rounded-full border border-red-100 bg-red-50 px-5 py-3 font-bold text-red-600">
              Reset Local
            </button>
          </div>
        </section>

        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="hidden grid-cols-[70px_1fr_140px_140px_140px_140px] bg-white/75 px-5 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#7d8395] md:grid">
            <span>Rank</span>
            <span>Nickname</span>
            <span>Stage</span>
            <span>Memory</span>
            <span>Bonus</span>
            <span>Time</span>
          </div>
          <div className="divide-y divide-white/80">
            {runs.length ? (
              runs.map((run, index) => (
                <div key={run.id} className="grid gap-3 px-5 py-5 md:grid-cols-[70px_1fr_140px_140px_140px_140px] md:items-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-black text-[#3525cd] shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#111c2d]">{run.nickname}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7d8395]">{run.participantCode}</p>
                  </div>
                  <p className="font-bold text-[#586074]">{run.currentStage}</p>
                  <p className="font-black text-[#3525cd]">{formatNumber(run.memoryScore)}</p>
                  <p className="font-black text-[#6b00b7]">{formatNumber(run.bonusScore)}</p>
                  <div>
                    <p className="font-black text-[#111c2d]">{formatDuration(run.totalTimeSeconds)}</p>
                    <p className="text-sm font-bold text-[#0060ac]">{formatNumber(run.totalScore)} total</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-14 text-center">
                <TrophyIcon className="mx-auto h-12 w-12 text-[#3525cd]" />
                <p className="mt-4 text-lg font-bold text-[#111c2d]">No event runs yet.</p>
                <Link to={`/${edition.slug}`} className="mt-4 inline-flex rounded-full bg-[#3525cd] px-6 py-3 font-bold text-white">
                  Start first participant
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </EventEditionShell>
  );
};

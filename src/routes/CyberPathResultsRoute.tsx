import { Link, Navigate, useLocation } from "react-router-dom";
import { GridIcon, PlayIcon, TrophyIcon } from "../components/AppIcons";
import { CyberPathShell } from "../components/CyberPathShell";
import { loadCyberPathRuns, type CyberPathRun } from "../lib/cyberpath";
import { formatDuration, formatNumber } from "../lib/utils";

export const CyberPathResultsRoute = () => {
  const location = useLocation();
  const run = (location.state as { run?: CyberPathRun } | undefined)?.run ?? loadCyberPathRuns()[0];

  if (!run) return <Navigate to="/cyberpath" replace />;

  return (
    <CyberPathShell>
      <main className="mx-auto flex min-h-[calc(100svh-92px)] max-w-5xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-3xl text-center">
          <div className="glass-panel rounded-[2.4rem] p-6 shadow-[0_24px_60px_rgba(53,37,205,0.12)] sm:p-9">
            <TrophyIcon className="mx-auto h-14 w-14 text-[#3525cd]" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.26em] text-[#3525cd]">CyberPath Complete</p>
            <h1 className="mt-2 text-5xl font-black tracking-[-0.06em] text-[#111c2d] sm:text-7xl">
              {formatNumber(run.totalScore)}
            </h1>
            <p className="mt-2 text-lg font-semibold text-[#586074]">
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
                  <div key={round.roundId} className="flex items-center justify-between rounded-[1.2rem] bg-white/70 px-4 py-3 text-left">
                    <div>
                      <p className="font-bold text-[#111c2d]">{round.title}</p>
                      <p className="text-sm text-[#586074]">
                        {round.matches}/8 matched • {round.mistakes} mistakes • {formatDuration(round.duration)}
                      </p>
                    </div>
                    <p className="font-black text-[#3525cd]">{formatNumber(round.score)}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.2rem] bg-white/70 px-4 py-3 text-sm text-[#586074]">
                  Detailed round data is stored on this device for fresh runs.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/cyberpath/play" className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-8 py-4 font-bold text-white">
              <PlayIcon className="h-5 w-5" />
              Play Again
            </Link>
            <Link to="/cyberpath/live" className="inline-flex items-center justify-center gap-3 rounded-full border border-[#d9d8eb] bg-white/80 px-8 py-4 font-bold text-[#3525cd]">
              <GridIcon className="h-5 w-5" />
              View Live Board
            </Link>
          </div>
        </section>
      </main>
    </CyberPathShell>
  );
};

const ResultTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.3rem] bg-white/75 px-4 py-5">
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7d8395]">{label}</p>
    <p className="mt-2 text-2xl font-black text-[#3525cd]">{value}</p>
  </div>
);

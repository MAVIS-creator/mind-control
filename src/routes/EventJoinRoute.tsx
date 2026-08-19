import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { BrandMotionMark, GridIcon, PlayIcon, TrophyIcon } from "../components/AppIcons";
import { EventEditionShell } from "../components/EventEditionShell";
import { fetchEventEdition, type EventEdition } from "../lib/eventEditions";
import { saveEventParticipant } from "../lib/eventRuntime";

export const EventJoinRoute = () => {
  const navigate = useNavigate();
  const { eventSlug = "cyberpath" } = useParams();
  const [edition, setEdition] = useState<EventEdition | null | undefined>(undefined);
  const [nickname, setNickname] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void fetchEventEdition(eventSlug).then(setEdition);
  }, [eventSlug]);

  const enterEvent = () => {
    if (!edition) return;
    if (nickname.trim().length < 2) {
      setError("Enter a nickname with at least 2 characters.");
      return;
    }
    saveEventParticipant({ edition, nickname, matricNumber });
    navigate(`/${edition.slug}/play`);
  };

  if (edition === undefined) {
    return (
      <EventEditionShell edition={edition}>
        <main className="flex min-h-[70svh] items-center justify-center px-4 text-center">
          <div className="glass-panel rounded-[2rem] p-8 dark:bg-slate-900/90 dark:border-slate-800">
            <BrandMotionMark className="mx-auto w-[12rem]" />
            <p className="mt-4 font-bold text-[#2563eb] dark:text-sky-400">Loading event...</p>
          </div>
        </main>
      </EventEditionShell>
    );
  }

  if (!edition || edition.status === "draft") return <Navigate to="/" replace />;
  if (edition.status === "closed") return <Navigate to={`/${edition.slug}/live`} replace />;

  return (
    <EventEditionShell edition={edition}>
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <BrandMotionMark className="mx-auto w-[15rem] sm:w-[22rem] lg:mx-0" />
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.28em] text-[#2563eb] dark:text-sky-400">
              {edition.config.heroLabel}
            </p>
            <h1 className="mt-3 font-display text-5xl font-black tracking-[-0.07em] text-[#0f172a] dark:text-white sm:text-7xl">
              {edition.title.replace("MindGrid: Neural Clash - ", "")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-[#475569] dark:text-slate-400 lg:mx-0">
              {edition.config.tagline} {edition.config.description}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoPill icon={<GridIcon className="h-5 w-5" />} title={`${edition.config.rounds.length} rounds`} text="Fixed event memory boards" />
              <InfoPill icon={<TrophyIcon className="h-5 w-5" />} title={`${edition.config.maxMemoryScore + edition.config.maxBonusScore} max`} text="Memory plus bonus score" />
              <InfoPill icon={<PlayIcon className="h-5 w-5" />} title="Guest play" text="Nickname only for seminar speed" />
            </div>
          </div>

          <div className="glass-panel rounded-[2.2rem] p-5 shadow-[0_18px_42px_rgba(37,99,235,0.08)] sm:p-7 dark:bg-slate-900/90 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#2563eb] dark:text-sky-400">{edition.config.eventLabel}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#0f172a] dark:text-white">Enter Event</h2>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#7d8395] dark:text-slate-400">Nickname</span>
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="mt-2 w-full rounded-[1.2rem] border border-[#cbd5e1] dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-4 py-4 text-lg outline-none focus:border-[#2563eb] dark:text-white"
                  placeholder="CyberBK"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#7d8395] dark:text-slate-400">Matric number optional</span>
                <input
                  value={matricNumber}
                  onChange={(event) => setMatricNumber(event.target.value)}
                  className="mt-2 w-full rounded-[1.2rem] border border-[#cbd5e1] dark:border-slate-700 bg-white/80 dark:bg-slate-900 px-4 py-4 text-lg outline-none focus:border-[#2563eb] dark:text-white"
                  placeholder="Optional"
                />
              </label>
              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
              <button
                type="button"
                onClick={enterEvent}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] px-8 py-4 text-lg font-bold text-white shadow-[0_18px_34px_rgba(37,99,235,0.22)]"
              >
                <PlayIcon className="h-5 w-5" />
                Enter Event
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#2563eb] dark:text-sky-400">Career paths from the seminar</p>
            <h2 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-[#0f172a] dark:text-white">This event is bigger than one match.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {edition.config.categories.map((category) => (
              <article key={category.title} className="glass-panel rounded-[1.6rem] p-5 dark:bg-slate-900/90 dark:border-slate-800">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white">{category.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#586074] dark:text-slate-400">{category.paths.slice(0, 5).join(", ")}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </EventEditionShell>
  );
};

const InfoPill = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="rounded-[1.4rem] border border-white/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/90 p-4 shadow-[0_12px_26px_rgba(37,99,235,0.06)]">
    <div className="text-[#2563eb] dark:text-sky-400">{icon}</div>
    <p className="mt-3 font-bold text-[#0f172a] dark:text-white">{title}</p>
    <p className="mt-1 text-sm text-[#5a6174] dark:text-slate-400">{text}</p>
  </div>
);

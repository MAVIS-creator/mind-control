import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandMotionMark, GridIcon, PlayIcon, TrophyIcon } from "../components/AppIcons";
import { CyberPathShell } from "../components/CyberPathShell";
import { CYBERPATH_EVENT_LABEL } from "../data/cyberpathRounds";
import { cyberpathCategories } from "../data/cyberpathPaths";
import { saveCyberPathParticipant } from "../lib/cyberpath";

export const CyberPathJoinRoute = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [error, setError] = useState("");

  const enterEvent = () => {
    if (nickname.trim().length < 2) {
      setError("Enter a nickname with at least 2 characters.");
      return;
    }
    saveCyberPathParticipant({ nickname, matricNumber });
    navigate("/cyberpath/play");
  };

  return (
    <CyberPathShell>
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <BrandMotionMark className="mx-auto w-[15rem] sm:w-[22rem] lg:mx-0" />
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.28em] text-[#3525cd]">
              MindGrid: Neural Clash
            </p>
            <h1 className="mt-3 font-display text-5xl font-black tracking-[-0.07em] text-[#111c2d] sm:text-7xl">
              CyberPath Edition
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-9 text-[#4f5568] lg:mx-0">
              Learn. Match. Defend. Explore cybersecurity career paths through three fast memory rounds and safe bonus challenges.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <InfoPill icon={<GridIcon className="h-5 w-5" />} title="3 rounds" text="Careers, terms, scenarios" />
              <InfoPill icon={<TrophyIcon className="h-5 w-5" />} title="3,600 max" text="Memory plus bonus score" />
              <InfoPill icon={<PlayIcon className="h-5 w-5" />} title="Guest play" text="Nickname only for seminar speed" />
            </div>
          </div>

          <div className="glass-panel rounded-[2.2rem] p-5 shadow-[0_18px_42px_rgba(53,37,205,0.08)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#3525cd]">{CYBERPATH_EVENT_LABEL}</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-[#111c2d]">Enter CyberPath</h2>
            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#7d8395]">Nickname</span>
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="mt-2 w-full rounded-[1.2rem] border border-[#dce5f6] bg-white/80 px-4 py-4 text-lg outline-none focus:border-[#4f46e5]"
                  placeholder="CyberBK"
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#7d8395]">Matric number optional</span>
                <input
                  value={matricNumber}
                  onChange={(event) => setMatricNumber(event.target.value)}
                  className="mt-2 w-full rounded-[1.2rem] border border-[#dce5f6] bg-white/80 px-4 py-4 text-lg outline-none focus:border-[#4f46e5]"
                  placeholder="Optional"
                />
              </label>
              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p> : null}
              <button
                type="button"
                onClick={enterEvent}
                className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-8 py-4 text-lg font-bold text-white shadow-[0_18px_34px_rgba(53,37,205,0.22)]"
              >
                <PlayIcon className="h-5 w-5" />
                Enter CyberPath
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#3525cd]">Career paths from the seminar</p>
            <h2 className="mt-2 text-4xl font-bold tracking-[-0.05em] text-[#111c2d]">Cybersecurity is bigger than one role.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cyberpathCategories.map((category) => (
              <article key={category.title} className="glass-panel rounded-[1.6rem] p-5">
                <h3 className="text-lg font-bold text-[#111c2d]">{category.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#586074]">{category.paths.slice(0, 5).join(", ")}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </CyberPathShell>
  );
};

const InfoPill = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="rounded-[1.4rem] border border-white/80 bg-white/70 p-4 shadow-[0_12px_26px_rgba(53,37,205,0.06)]">
    <div className="text-[#3525cd]">{icon}</div>
    <p className="mt-3 font-bold text-[#111c2d]">{title}</p>
    <p className="mt-1 text-sm text-[#5a6174]">{text}</p>
  </div>
);

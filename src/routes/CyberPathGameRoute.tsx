import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { GridIcon, PlayIcon, TrophyIcon } from "../components/AppIcons";
import { CyberPathShell } from "../components/CyberPathShell";
import { cyberpathRounds, type CyberPathPair } from "../data/cyberpathRounds";
import {
  calculateCyberPathRoundScore,
  createCyberPathRun,
  loadCyberPathParticipant,
  type CyberPathRoundResult,
  upsertCyberPathRun,
} from "../lib/cyberpath";
import { formatDuration, formatNumber } from "../lib/utils";

type CyberCard = {
  id: string;
  pairId: string;
  text: string;
  kind: "prompt" | "answer";
  revealed: boolean;
  matched: boolean;
};

const shuffle = <T,>(items: T[]) => {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
};

const createRoundCards = (pairs: CyberPathPair[]): CyberCard[] =>
  shuffle(
    pairs.flatMap((pair) => [
      { id: `${pair.id}-prompt`, pairId: pair.id, text: pair.prompt, kind: "prompt" as const, revealed: false, matched: false },
      { id: `${pair.id}-answer`, pairId: pair.id, text: pair.answer, kind: "answer" as const, revealed: false, matched: false },
    ]),
  );

export const CyberPathGameRoute = () => {
  const participant = loadCyberPathParticipant();
  const navigate = useNavigate();
  const [roundIndex, setRoundIndex] = useState(0);
  const [roundResults, setRoundResults] = useState<CyberPathRoundResult[]>([]);
  const [cards, setCards] = useState(() => createRoundCards(cyberpathRounds[0].pairs));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<"playing" | "complete">("playing");
  const [lastResult, setLastResult] = useState<CyberPathRoundResult | null>(null);

  const round = cyberpathRounds[roundIndex];
  const selectedCards = useMemo(
    () => selectedIds.map((id) => cards.find((card) => card.id === id)).filter(Boolean) as CyberCard[],
    [cards, selectedIds],
  );

  useEffect(() => {
    if (status !== "playing") return undefined;
    const interval = window.setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (selectedCards.length !== 2) return undefined;
    const timeout = window.setTimeout(() => {
      const [first, second] = selectedCards;
      const matched = first.pairId === second.pairId && first.kind !== second.kind;

      if (matched) {
        const nextMatches = matches + 1;
        setCards((current) =>
          current.map((card) =>
            card.pairId === first.pairId ? { ...card, matched: true, revealed: true } : card,
          ),
        );
        setMatches(nextMatches);
        if (nextMatches === 8) {
          const score = calculateCyberPathRoundScore({ matches: nextMatches, mistakes, duration: elapsed });
          const result = {
            roundId: round.id,
            title: round.title,
            score,
            matches: nextMatches,
            mistakes,
            duration: elapsed,
          };
          setLastResult(result);
          setRoundResults((current) => [...current, result]);
          setStatus("complete");
        }
      } else {
        setMistakes((current) => current + 1);
        setCards((current) =>
          current.map((card) =>
            selectedIds.includes(card.id) ? { ...card, revealed: false } : card,
          ),
        );
      }
      setSelectedIds([]);
    }, 720);

    return () => window.clearTimeout(timeout);
  }, [elapsed, matches, mistakes, round.id, round.title, selectedCards, selectedIds]);

  if (!participant) return <Navigate to="/cyberpath" replace />;

  const revealCard = (cardId: string) => {
    if (status !== "playing" || selectedIds.length >= 2) return;
    const card = cards.find((entry) => entry.id === cardId);
    if (!card || card.revealed || card.matched) return;
    setCards((current) => current.map((entry) => (entry.id === cardId ? { ...entry, revealed: true } : entry)));
    setSelectedIds((current) => [...current, cardId]);
  };

  const continueFlow = async () => {
    if (roundIndex < cyberpathRounds.length - 1) {
      const nextIndex = roundIndex + 1;
      setRoundIndex(nextIndex);
      setCards(createRoundCards(cyberpathRounds[nextIndex].pairs));
      setSelectedIds([]);
      setMatches(0);
      setMistakes(0);
      setElapsed(0);
      setStatus("playing");
      setLastResult(null);
      return;
    }

    const finalResults = lastResult && roundResults.at(-1)?.roundId !== lastResult.roundId ? [...roundResults, lastResult] : roundResults;
    const run = createCyberPathRun(participant, finalResults);
    await upsertCyberPathRun(run);
    navigate(run.qualifiedForBonus ? "/cyberpath/bonus" : "/cyberpath/results", { state: { run } });
  };

  return (
    <CyberPathShell>
      <main className="mx-auto max-w-[1320px] px-3 py-5 sm:px-6 lg:px-8">
        <section className="mb-5 grid gap-3 rounded-[1.8rem] border border-white/80 bg-white/70 p-4 shadow-[0_16px_36px_rgba(53,37,205,0.08)] md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#3525cd]">Round {round.number} of 3</p>
            <h1 className="mt-1 text-3xl font-black tracking-[-0.05em] text-[#111c2d]">{round.title}</h1>
            <p className="mt-1 text-sm leading-6 text-[#586074]">{round.subtitle}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Hud label="Time" value={formatDuration(elapsed)} />
            <Hud label="Matches" value={`${matches}/8`} />
            <Hud label="Mistakes" value={`${mistakes}`} />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => revealCard(card.id)}
              className={`min-h-[6.5rem] rounded-[1.2rem] border p-3 text-center text-sm font-bold leading-5 transition sm:min-h-[8rem] sm:p-4 ${
                card.revealed || card.matched
                  ? card.kind === "prompt"
                    ? "border-[#b7cdf8] bg-[#eef5ff] text-[#111c2d]"
                    : "border-[#cbb9ff] bg-[#f4efff] text-[#3525cd]"
                  : "border-white/80 bg-white/80 text-[#c3bbff] shadow-[0_12px_26px_rgba(53,37,205,0.06)] hover:scale-[1.01]"
              }`}
            >
              {card.revealed || card.matched ? (
                <span>{card.text}</span>
              ) : (
                <span className="inline-flex flex-col items-center gap-2">
                  <GridIcon className="h-7 w-7" />
                  CyberPath
                </span>
              )}
            </button>
          ))}
        </section>

        {status === "complete" && lastResult ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111c2d]/35 px-4 backdrop-blur-sm">
            <div className="glass-panel max-w-lg rounded-[2rem] p-6 text-center shadow-[0_24px_60px_rgba(17,28,45,0.18)]">
              <TrophyIcon className="mx-auto h-10 w-10 text-[#3525cd]" />
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.24em] text-[#3525cd]">Round Complete</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#111c2d]">8/8 Matched</h2>
              <p className="mt-2 text-5xl font-black text-[#3525cd]">{formatNumber(lastResult.score)}</p>
              <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#586074]">{round.summary}</p>
              <button
                type="button"
                onClick={() => void continueFlow()}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-6 py-4 font-bold text-white"
              >
                <PlayIcon className="h-5 w-5" />
                {roundIndex < cyberpathRounds.length - 1 ? "Next Round" : "Continue"}
              </button>
            </div>
          </div>
        ) : null}
      </main>
    </CyberPathShell>
  );
};

const Hud = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1rem] bg-white/85 px-4 py-3 shadow-sm">
    <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#7d8395]">{label}</p>
    <p className="mt-1 text-xl font-black text-[#3525cd]">{value}</p>
  </div>
);

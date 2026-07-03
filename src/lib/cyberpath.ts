import { CYBERPATH_EVENT_ID, CYBERPATH_EVENT_LABEL } from "../data/cyberpathRounds";
import { hasSupabase, supabase } from "./supabase";
import { normalizeUsername, uid } from "./utils";

const PARTICIPANT_KEY = "mindgrid.cyberpath.participant";
const RUNS_KEY = "mindgrid.cyberpath.runs";

export type CyberPathStage = "Round 1" | "Round 2" | "Round 3" | "Bonus Round" | "Completed";

export type CyberPathParticipant = {
  eventId: string;
  eventLabel: string;
  nickname: string;
  matricNumber: string;
  participantCode: string;
  startedAt: string;
};

export type CyberPathRoundResult = {
  roundId: string;
  title: string;
  score: number;
  matches: number;
  mistakes: number;
  duration: number;
};

export type CyberPathRun = {
  id: string;
  eventId: string;
  nickname: string;
  participantCode: string;
  currentStage: CyberPathStage;
  roundResults: CyberPathRoundResult[];
  roundOneScore: number;
  roundTwoScore: number;
  roundThreeScore: number;
  memoryScore: number;
  bonusScore: number;
  totalScore: number;
  totalTimeSeconds: number;
  qualifiedForBonus: boolean;
  completedAt: string;
  reviewStatus: "pending" | "approved" | "removed";
};

const safeStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const createParticipantCode = () => `CP-${Math.floor(100 + Math.random() * 900)}`;

export const saveCyberPathParticipant = (payload: {
  nickname: string;
  matricNumber?: string;
}) => {
  const participant: CyberPathParticipant = {
    eventId: CYBERPATH_EVENT_ID,
    eventLabel: CYBERPATH_EVENT_LABEL,
    nickname: normalizeUsername(payload.nickname) || "cyberpath_player",
    matricNumber: payload.matricNumber?.trim() ?? "",
    participantCode: createParticipantCode(),
    startedAt: new Date().toISOString(),
  };

  safeStorage()?.setItem(PARTICIPANT_KEY, JSON.stringify(participant));
  return participant;
};

export const loadCyberPathParticipant = (): CyberPathParticipant | null => {
  const raw = safeStorage()?.getItem(PARTICIPANT_KEY);
  return raw ? (JSON.parse(raw) as CyberPathParticipant) : null;
};

export const loadCyberPathRuns = (): CyberPathRun[] => {
  const raw = safeStorage()?.getItem(RUNS_KEY);
  return raw ? (JSON.parse(raw) as CyberPathRun[]) : [];
};

const saveCyberPathRuns = (runs: CyberPathRun[]) => {
  safeStorage()?.setItem(RUNS_KEY, JSON.stringify(runs));
};

export const calculateCyberPathRoundScore = ({
  matches,
  mistakes,
  duration,
}: {
  matches: number;
  mistakes: number;
  duration: number;
}) => {
  const base = matches * 100;
  const completion = matches === 8 ? 250 : 0;
  const timeBonus = matches === 8 ? Math.max(0, 50 - Math.floor(duration / 6)) : 0;
  const mistakePenalty = mistakes * 15;
  return Math.max(0, base + completion + timeBonus - mistakePenalty);
};

export const createCyberPathRun = (
  participant: CyberPathParticipant,
  roundResults: CyberPathRoundResult[],
  bonusScore = 0,
): CyberPathRun => {
  const [one, two, three] = roundResults;
  const memoryScore = roundResults.reduce((sum, round) => sum + round.score, 0);
  const totalTimeSeconds = roundResults.reduce((sum, round) => sum + round.duration, 0);
  const qualifiedForBonus =
    roundResults.length === 3 &&
    roundResults.every((round) => round.matches === 8) &&
    memoryScore >= 2400;

  return {
    id: uid(),
    eventId: participant.eventId,
    nickname: participant.nickname,
    participantCode: participant.participantCode,
    currentStage: bonusScore > 0 || !qualifiedForBonus ? "Completed" : "Bonus Round",
    roundResults,
    roundOneScore: one?.score ?? 0,
    roundTwoScore: two?.score ?? 0,
    roundThreeScore: three?.score ?? 0,
    memoryScore,
    bonusScore,
    totalScore: memoryScore + bonusScore,
    totalTimeSeconds,
    qualifiedForBonus,
    completedAt: new Date().toISOString(),
    reviewStatus: "pending",
  };
};

export const upsertCyberPathRun = async (run: CyberPathRun) => {
  const existing = loadCyberPathRuns().filter((entry) => entry.id !== run.id);
  saveCyberPathRuns([run, ...existing].sort(compareCyberPathRuns));

  if (!hasSupabase || !supabase) return run;

  const { error } = await supabase
    .from("cyberpath_runs")
    .upsert({
      id: run.id,
      event_id: run.eventId,
      nickname: run.nickname,
      participant_code: run.participantCode,
      current_stage: run.currentStage,
      round_one_score: run.roundOneScore,
      round_two_score: run.roundTwoScore,
      round_three_score: run.roundThreeScore,
      memory_score: run.memoryScore,
      bonus_score: run.bonusScore,
      total_score: run.totalScore,
      total_time_seconds: run.totalTimeSeconds,
      qualified_for_bonus: run.qualifiedForBonus,
      completed_at: run.completedAt,
      review_status: run.reviewStatus,
    });

  if (error) return run;

  return run;
};

export const fetchCyberPathLeaderboard = async () => {
  if (!hasSupabase || !supabase) {
    return loadCyberPathRuns().sort(compareCyberPathRuns);
  }

  const { data, error } = await supabase
    .from("cyberpath_public_leaderboard")
    .select("*")
    .order("total_score", { ascending: false })
    .order("total_time_seconds", { ascending: true })
    .limit(100);

  if (error) return loadCyberPathRuns().sort(compareCyberPathRuns);

  return (data ?? []).map((row) => ({
    id: row.id,
    eventId: row.event_id,
    nickname: row.nickname,
    participantCode: row.participant_code,
    currentStage: row.current_stage,
    roundResults: [],
    roundOneScore: row.round_one_score,
    roundTwoScore: row.round_two_score,
    roundThreeScore: row.round_three_score,
    memoryScore: row.memory_score,
    bonusScore: row.bonus_score,
    totalScore: row.total_score,
    totalTimeSeconds: row.total_time_seconds,
    qualifiedForBonus: row.qualified_for_bonus,
    completedAt: row.completed_at,
    reviewStatus: row.review_status,
  })) satisfies CyberPathRun[];
};

export const compareCyberPathRuns = (a: CyberPathRun, b: CyberPathRun) => {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  if (a.totalTimeSeconds !== b.totalTimeSeconds) return a.totalTimeSeconds - b.totalTimeSeconds;
  if (b.memoryScore !== a.memoryScore) return b.memoryScore - a.memoryScore;
  return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
};

export const clearCyberPathEvent = () => {
  safeStorage()?.removeItem(RUNS_KEY);
};

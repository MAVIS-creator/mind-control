import type { EventEdition } from "./eventEditions";
import { hasSupabase, supabase } from "./supabase";
import { normalizeUsername, uid } from "./utils";

const participantKey = (slug: string) => `mindgrid.event.${slug}.participant`;
const runsKey = (eventId: string) => `mindgrid.event.${eventId}.runs`;

export type EventRunStage = "Round 1" | "Round 2" | "Round 3" | "Bonus Round" | "Completed";

export type EventParticipant = {
  eventId: string;
  eventLabel: string;
  eventSlug: string;
  nickname: string;
  matricNumber: string;
  participantCode: string;
  startedAt: string;
};

export type EventRoundResult = {
  roundId: string;
  title: string;
  score: number;
  matches: number;
  totalPairs: number;
  mistakes: number;
  duration: number;
};

export type EventRun = {
  id: string;
  eventId: string;
  nickname: string;
  participantCode: string;
  currentStage: EventRunStage;
  roundResults: EventRoundResult[];
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

export const saveEventParticipant = (payload: {
  edition: EventEdition;
  nickname: string;
  matricNumber?: string;
}) => {
  const participant: EventParticipant = {
    eventId: payload.edition.id,
    eventLabel: payload.edition.config.eventLabel,
    eventSlug: payload.edition.slug,
    nickname: normalizeUsername(payload.nickname) || "cyberpath_player",
    matricNumber: payload.matricNumber?.trim() ?? "",
    participantCode: createParticipantCode(),
    startedAt: new Date().toISOString(),
  };

  safeStorage()?.setItem(participantKey(payload.edition.slug), JSON.stringify(participant));
  return participant;
};

export const loadEventParticipant = (slug = "cyberpath"): EventParticipant | null => {
  const raw = safeStorage()?.getItem(participantKey(slug));
  return raw ? (JSON.parse(raw) as EventParticipant) : null;
};

export const loadEventRuns = (eventId = "cyberpath-seminar-2026"): EventRun[] => {
  const raw = safeStorage()?.getItem(runsKey(eventId));
  return raw ? (JSON.parse(raw) as EventRun[]) : [];
};

const saveEventRuns = (eventId: string, runs: EventRun[]) => {
  safeStorage()?.setItem(runsKey(eventId), JSON.stringify(runs));
};

export const calculateEventRoundScore = ({
  matches,
  mistakes,
  duration,
  totalPairs = 8,
}: {
  matches: number;
  mistakes: number;
  duration: number;
  totalPairs?: number;
}) => {
  const base = matches * 100;
  const completion = matches === totalPairs ? 250 : 0;
  const timeBonus = matches === totalPairs ? Math.max(0, 50 - Math.floor(duration / 6)) : 0;
  const mistakePenalty = mistakes * 15;
  return Math.max(0, base + completion + timeBonus - mistakePenalty);
};

export const createEventRun = (
  participant: EventParticipant,
  roundResults: EventRoundResult[],
  bonusScore = 0,
  qualificationScore = 2400,
): EventRun => {
  const [one, two, three] = roundResults;
  const memoryScore = roundResults.reduce((sum, round) => sum + round.score, 0);
  const totalTimeSeconds = roundResults.reduce((sum, round) => sum + round.duration, 0);
  const qualifiedForBonus =
    roundResults.length === 3 &&
    roundResults.every((round) => round.matches === round.totalPairs) &&
    memoryScore >= qualificationScore;

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

export const upsertEventRun = async (run: EventRun) => {
  const existing = loadEventRuns(run.eventId).filter((entry) => entry.id !== run.id);
  saveEventRuns(run.eventId, [run, ...existing].sort(compareEventRuns));

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

export const fetchEventLeaderboard = async (eventId = "cyberpath-seminar-2026") => {
  if (!hasSupabase || !supabase) {
    return loadEventRuns(eventId).sort(compareEventRuns);
  }

  const { data, error } = await supabase
    .from("cyberpath_public_leaderboard")
    .select("*")
    .eq("event_id", eventId)
    .order("total_score", { ascending: false })
    .order("total_time_seconds", { ascending: true })
    .limit(100);

  if (error) return loadEventRuns(eventId).sort(compareEventRuns);

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
  })) satisfies EventRun[];
};

export const compareEventRuns = (a: EventRun, b: EventRun) => {
  if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
  if (a.totalTimeSeconds !== b.totalTimeSeconds) return a.totalTimeSeconds - b.totalTimeSeconds;
  if (b.memoryScore !== a.memoryScore) return b.memoryScore - a.memoryScore;
  return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
};

export const clearEventRuns = (eventId = "cyberpath-seminar-2026") => {
  safeStorage()?.removeItem(runsKey(eventId));
};

export const saveCyberPathParticipant = saveEventParticipant;
export const loadCyberPathParticipant = loadEventParticipant;
export const loadCyberPathRuns = loadEventRuns;
export const calculateCyberPathRoundScore = calculateEventRoundScore;
export const createCyberPathRun = createEventRun;
export const upsertCyberPathRun = upsertEventRun;
export const fetchCyberPathLeaderboard = fetchEventLeaderboard;
export const compareCyberPathRuns = compareEventRuns;
export const clearCyberPathEvent = clearEventRuns;
export type CyberPathParticipant = EventParticipant;
export type CyberPathRoundResult = EventRoundResult;
export type CyberPathRun = EventRun;

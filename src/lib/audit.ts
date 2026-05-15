import type { RunAudit } from "../types";

export const createEmptyAudit = (): RunAudit => ({
  suspicionScore: 0,
  suspicionReasons: [],
  automationFlag: false,
  fastInputFlag: false,
  hiddenTabFlag: false,
  rapidSequenceCount: 0,
  reviewedStatus: "pending",
  reviewedNote: "",
});

export const normalizeAudit = (audit?: Partial<RunAudit> | null): RunAudit => ({
  ...createEmptyAudit(),
  ...audit,
  suspicionReasons: audit?.suspicionReasons ?? [],
  reviewedStatus: audit?.reviewedStatus ?? "pending",
  reviewedNote: audit?.reviewedNote ?? "",
});

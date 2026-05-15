import { useEffect, useMemo, useRef } from "react";
import { createEmptyAudit } from "../lib/audit";
import type { RunAudit } from "../types";
import type { GameEvent, GameStatus } from "./types";

const computeStdDev = (values: number[]) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

export const useFairPlayMonitor = (events: GameEvent[], status: GameStatus) => {
  const auditRef = useRef<RunAudit>(createEmptyAudit());
  const flipTimesRef = useRef<number[]>([]);
  const recentHumanInputAtRef = useRef<number>(0);
  const handledEventsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const recordInput = () => {
      recentHumanInputAtRef.current = Date.now();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        auditRef.current.hiddenTabFlag = true;
      }
    };

    window.addEventListener("pointerdown", recordInput, true);
    window.addEventListener("keydown", recordInput, true);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pointerdown", recordInput, true);
      window.removeEventListener("keydown", recordInput, true);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const automationSignals = [
      typeof navigator !== "undefined" && navigator.webdriver,
      "__playwright__binding__" in window,
      "__pw_manual__" in window,
      /HeadlessChrome|Playwright/i.test(navigator.userAgent),
    ];

    if (automationSignals.some(Boolean)) {
      auditRef.current.automationFlag = true;
    }
  }, []);

  useEffect(() => {
    for (const event of events) {
      if (handledEventsRef.current.has(event.timestamp)) continue;
      handledEventsRef.current.add(event.timestamp);

      if (event.type === "card_flipped") {
        const now = event.timestamp;
        flipTimesRef.current.push(now);
        if (
          recentHumanInputAtRef.current > 0 &&
          now - recentHumanInputAtRef.current > 2500
        ) {
          auditRef.current.suspicionReasons.push("card reveal without recent direct input");
          auditRef.current.suspicionScore += 1;
        }
      }
    }
  }, [events]);

  return useMemo(() => {
    if (status === "idle") {
      return createEmptyAudit();
    }

    const next = { ...auditRef.current };
    const flipTimes = flipTimesRef.current;

    if (flipTimes.length >= 6) {
      const intervals = flipTimes.slice(1).map((time, index) => time - flipTimes[index]);
      const rapidCount = intervals.filter((interval) => interval < 90).length;
      const average = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
      const stdDev = computeStdDev(intervals);

      next.rapidSequenceCount = rapidCount;

      if (rapidCount >= 6 || average < 120) {
        next.fastInputFlag = true;
      }

      if (stdDev < 10 && average < 140 && intervals.length >= 7) {
        next.suspicionReasons = [
          ...next.suspicionReasons,
          "highly regular rapid reveal cadence",
        ];
        next.suspicionScore += 2;
      }
    }

    if (next.automationFlag) {
      next.suspicionReasons = [...next.suspicionReasons, "browser automation marker detected"];
      next.suspicionScore += 4;
    }

    if (next.fastInputFlag) {
      next.suspicionReasons = [...next.suspicionReasons, "tile reveals were unusually fast"];
      next.suspicionScore += 1;
    }

    if (next.hiddenTabFlag) {
      next.suspicionReasons = [...next.suspicionReasons, "tab switched during active run"];
      next.suspicionScore += 1;
    }

    next.suspicionReasons = [...new Set(next.suspicionReasons)];
    next.reviewedStatus = next.suspicionScore >= 4 ? "flagged" : next.suspicionScore >= 2 ? "pending" : "approved";
    return next;
  }, [events, status]);
};

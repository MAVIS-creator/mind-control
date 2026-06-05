import { beforeEach, describe, expect, it } from "vitest";
import { authApi } from "./auth";
import { clearAppStorage } from "./storage";
import { createEmptyAudit } from "./audit";

describe("local auth fallback", () => {
  beforeEach(() => {
    clearAppStorage();
  });

  it("registers and logs in a user by email or username", async () => {
    const registered = await authApi.register({
      username: "pilot_one",
      email: "pilot@example.com",
      password: "secure123",
      avatarId: "ace-scout",
    });

    expect(registered.session?.profile.username).toBe("pilot_one");
    expect(registered.session?.profile.email).toBe("pilot@example.com");
    expect(registered.session?.profile.isAdmin).toBe(false);

    await authApi.logout();

    const loggedIn = await authApi.login({
      identifier: "pilot_one",
      password: "secure123",
    });

    expect(loggedIn.profile.avatarId).toBe("ace-scout");
  });

  it("keeps one best row per category while total points continue to accumulate", async () => {
    const registered = await authApi.register({
      username: "score_keeper",
      email: "score@example.com",
      password: "secure123",
      avatarId: "ace-scout",
    });
    const session = registered.session!;

    await authApi.submitRun(session, {
      mode: "classic",
      matchType: "numbers",
      gridSize: "4x4",
      score: 1000,
      accuracy: 80,
      maxCombo: 2,
      duration: 60,
      audit: createEmptyAudit(),
    });

    const second = await authApi.submitRun(session, {
      mode: "classic",
      matchType: "numbers",
      gridSize: "4x4",
      score: 900,
      accuracy: 70,
      maxCombo: 1,
      duration: 65,
      audit: createEmptyAudit(),
    });

    expect(second.leaderboard).toHaveLength(1);
    expect(second.leaderboard[0].score).toBe(1000);
    expect(second.leaderboard[0].totalPoints).toBe(1900);

    const third = await authApi.submitRun(second.session, {
      mode: "classic",
      matchType: "icons",
      gridSize: "4x4",
      score: 1200,
      accuracy: 82,
      maxCombo: 3,
      duration: 58,
      audit: createEmptyAudit(),
    });

    expect(third.leaderboard).toHaveLength(2);
    expect(third.leaderboard[0].totalPoints).toBe(3100);
    expect(third.leaderboard[1].totalPoints).toBe(3100);
  });
});

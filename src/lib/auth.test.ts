import { beforeEach, describe, expect, it } from "vitest";
import { authApi } from "./auth";
import { clearAppStorage } from "./storage";

describe("local auth fallback", () => {
  beforeEach(() => {
    clearAppStorage();
  });

  it("registers and logs in a user by username", async () => {
    const registered = await authApi.register({
      username: "pilot_one",
      password: "secure123",
      avatarId: "ace-scout",
    });

    expect(registered.profile.username).toBe("pilot_one");
    expect(registered.profile.isAdmin).toBe(false);

    await authApi.logout();

    const loggedIn = await authApi.login({
      username: "pilot_one",
      password: "secure123",
    });

    expect(loggedIn.profile.avatarId).toBe("ace-scout");
  });
});

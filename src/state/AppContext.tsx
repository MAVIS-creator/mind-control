import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  AuthSession,
  GameSetupSettings,
  LeaderboardEntry,
  LoginPayload,
  RegisterResult,
  RegisterPayload,
} from "../types";
import { authApi } from "../lib/auth";
import { loadSettings, saveSettings } from "../lib/storage";
import { DEFAULT_GAME_SETTINGS } from "../game/config";

type AppContextValue = {
  booting: boolean;
  session: AuthSession | null;
  leaderboard: LeaderboardEntry[];
  accountLeaderboard: LeaderboardEntry[];
  authMode: "login" | "register";
  settings: GameSetupSettings;
  setAuthMode: (mode: "login" | "register") => void;
  updateSettings: (patch: Partial<GameSetupSettings>) => void;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  login: (payload: LoginPayload) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  updateRun: (entry: LeaderboardEntry) => Promise<void>;
  deleteRun: (runId: string) => Promise<void>;
  submitRun: (
    entry: Omit<LeaderboardEntry, "id" | "playedAt" | "userId" | "username" | "email" | "avatarId" | "rating" | "totalPoints">,
  ) => Promise<LeaderboardEntry>;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [accountLeaderboard, setAccountLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [settings, setSettings] = useState<GameSetupSettings>(() =>
    loadSettings(DEFAULT_GAME_SETTINGS),
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [nextSession, nextLeaderboard] = await Promise.all([
          authApi.bootstrap().catch(() => null),
          authApi.fetchLeaderboard().catch(() => ({ leaderboard: [], accountLeaderboard: [] })),
        ]);
        startTransition(() => {
          setSession(nextSession);
          setLeaderboard(nextLeaderboard.leaderboard);
          setAccountLeaderboard(nextLeaderboard.accountLeaderboard);
          setBooting(false);
        });
      } catch {
        startTransition(() => {
          setSession(null);
          setLeaderboard([]);
          setAccountLeaderboard([]);
          setBooting(false);
        });
      }
    };

    void load();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      booting,
      session,
      leaderboard,
      accountLeaderboard,
      authMode,
      settings,
      setAuthMode,
      updateSettings: (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        saveSettings(next);
      },
      register: async (payload) => {
        const result = await authApi.register(payload);
        setSession(result.session);
        return result;
      },
      login: async (payload) => {
        const nextSession = await authApi.login(payload);
        setSession(nextSession);
      },
      requestPasswordReset: async (email) => {
        await authApi.requestPasswordReset(email);
      },
      updatePassword: async (password) => {
        await authApi.updatePassword(password);
      },
      updateEmail: async (email) => {
        if (!session) throw new Error("You need to be logged in.");
        const nextSession = await authApi.updateEmail(session, email);
        setSession(nextSession);
      },
      logout: async () => {
        await authApi.logout();
        setSession(null);
      },
      refreshLeaderboard: async () => {
        const next = await authApi.fetchLeaderboard();
        setLeaderboard(next.leaderboard);
        setAccountLeaderboard(next.accountLeaderboard);
      },
      updateRun: async (entry) => {
        if (!session) throw new Error("Admin access is required.");
        await authApi.updateRun(session, entry);
        const next = await authApi.fetchLeaderboard();
        setLeaderboard(next.leaderboard);
        setAccountLeaderboard(next.accountLeaderboard);
      },
      deleteRun: async (runId) => {
        if (!session) throw new Error("Admin access is required.");
        await authApi.deleteRun(session, runId);
        const next = await authApi.fetchLeaderboard();
        setLeaderboard(next.leaderboard);
        setAccountLeaderboard(next.accountLeaderboard);
      },
      submitRun: async (entry) => {
        if (!session) throw new Error("You need to be logged in before saving a run.");
        const result = await authApi.submitRun(session, entry);
        setSession(result.session);
        setLeaderboard(result.leaderboard);
        setAccountLeaderboard(result.accountLeaderboard);
        return result.entry;
      },
    }),
    [accountLeaderboard, authMode, booting, leaderboard, session, settings],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider.");
  }
  return context;
};

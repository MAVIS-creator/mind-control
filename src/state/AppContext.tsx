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
  RegisterPayload,
} from "../types";
import { authApi } from "../lib/auth";
import { loadSettings, saveSettings } from "../lib/storage";
import { DEFAULT_GAME_SETTINGS } from "../game/config";

type AppContextValue = {
  booting: boolean;
  session: AuthSession | null;
  leaderboard: LeaderboardEntry[];
  authMode: "login" | "register";
  settings: GameSetupSettings;
  setAuthMode: (mode: "login" | "register") => void;
  updateSettings: (patch: Partial<GameSetupSettings>) => void;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshLeaderboard: () => Promise<void>;
  submitRun: (
    entry: Omit<LeaderboardEntry, "id" | "playedAt" | "userId" | "username" | "avatarId">,
  ) => Promise<LeaderboardEntry>;
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [settings, setSettings] = useState<GameSetupSettings>(() =>
    loadSettings(DEFAULT_GAME_SETTINGS),
  );

  useEffect(() => {
    const load = async () => {
      try {
        const [nextSession, nextLeaderboard] = await Promise.all([
          authApi.bootstrap().catch(() => null),
          authApi.fetchLeaderboard().catch(() => []),
        ]);
        startTransition(() => {
          setSession(nextSession);
          setLeaderboard(nextLeaderboard);
          setBooting(false);
        });
      } catch {
        startTransition(() => {
          setSession(null);
          setLeaderboard([]);
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
      authMode,
      settings,
      setAuthMode,
      updateSettings: (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        saveSettings(next);
      },
      register: async (payload) => {
        const nextSession = await authApi.register(payload);
        setSession(nextSession);
      },
      login: async (payload) => {
        const nextSession = await authApi.login(payload);
        setSession(nextSession);
      },
      logout: async () => {
        await authApi.logout();
        setSession(null);
      },
      refreshLeaderboard: async () => {
        const next = await authApi.fetchLeaderboard();
        setLeaderboard(next);
      },
      submitRun: async (entry) => {
        if (!session) throw new Error("You need to be logged in before saving a run.");
        const result = await authApi.submitRun(session, entry);
        setSession(result.session);
        setLeaderboard(result.leaderboard);
        return result.entry;
      },
    }),
    [authMode, booting, leaderboard, session, settings],
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

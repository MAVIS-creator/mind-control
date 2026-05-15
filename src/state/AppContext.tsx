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
  LeaderboardEntry,
  LoginPayload,
  RegisterPayload,
} from "../types";
import { authApi } from "../lib/auth";

type AppContextValue = {
  booting: boolean;
  session: AuthSession | null;
  leaderboard: LeaderboardEntry[];
  authMode: "login" | "register";
  setAuthMode: (mode: "login" | "register") => void;
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

  useEffect(() => {
    const load = async () => {
      const [nextSession, nextLeaderboard] = await Promise.all([
        authApi.bootstrap(),
        authApi.fetchLeaderboard().catch(() => []),
      ]);
      startTransition(() => {
        setSession(nextSession);
        setLeaderboard(nextLeaderboard);
        setBooting(false);
      });
    };

    void load();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      booting,
      session,
      leaderboard,
      authMode,
      setAuthMode,
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
        if (!session) throw new Error("A neural pilot session is required.");
        const result = await authApi.submitRun(session, entry);
        setSession(result.session);
        setLeaderboard(result.leaderboard);
        return result.entry;
      },
    }),
    [authMode, booting, leaderboard, session],
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

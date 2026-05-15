import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AvatarPicker } from "./AvatarPicker";
import { useAppContext } from "../state/AppContext";
import { avatarOptions } from "../data/avatars";
import { hasSupabase } from "../lib/supabase";

export const AuthPanel = () => {
  const { authMode, setAuthMode, login, register } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarId, setAvatarId] = useState(avatarOptions[0].id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const copy = useMemo(
    () =>
      authMode === "login"
        ? {
            title: "Resume neural sync",
            action: "Login",
            hint: "Re-enter the grid and stabilize your fragment chain.",
          }
        : {
            title: "Forge your pilot identity",
            action: "Register",
            hint: "Claim a codename, secure your access key, and select an avatar shell.",
          },
    [authMode],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === "login") {
        await login({ username, password });
      } else {
        await register({ username, password, avatarId });
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Connection failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel relative overflow-hidden rounded-[2rem] p-5 shadow-violet sm:p-7"
    >
      <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan/60 to-transparent" />
      <div className="mb-6 flex items-center gap-2 rounded-full border border-cyan/15 bg-cyan/5 p-1 text-sm">
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            authMode === "login" ? "bg-cyan/15 text-cyan" : "text-white/70"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("register")}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            authMode === "register" ? "bg-violet/15 text-violet" : "text-white/70"
          }`}
        >
          Register
        </button>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-2xl uppercase tracking-[0.2em] text-white">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-white/70">{copy.hint}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-cyan/80">
            Username
          </span>
          <input
            required
            minLength={3}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="neural_pilot"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan/70 focus:bg-white/10"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-cyan/80">
            Password
          </span>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-cyan/70 focus:bg-white/10"
          />
        </label>

        {authMode === "register" ? (
          <div>
            <div className="mb-2 block text-xs uppercase tracking-[0.28em] text-cyan/80">
              Avatar shell
            </div>
            <AvatarPicker value={avatarId} onChange={setAvatarId} />
          </div>
        ) : null}

        {error ? (
          <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-cyan to-indigo px-5 py-3 font-display text-sm uppercase tracking-[0.3em] text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Syncing..." : copy.action}
        </button>
      </form>

      <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-xs text-white/60">
        {hasSupabase
          ? "Supabase bridge detected. Auth, profile state, and leaderboard runs will persist remotely."
          : "Supabase keys not set yet. The game runs in local pilot mode with the same flows so you can build and test immediately."}
      </div>
    </motion.section>
  );
};

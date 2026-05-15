import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AvatarPicker } from "./AvatarPicker";
import { useAppContext } from "../state/AppContext";
import { avatarOptions } from "../data/avatars";

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
            title: "Welcome back",
            action: "Login",
            hint: "Jump back in and keep your streak going.",
          }
        : {
            title: "Create your player account",
            action: "Register",
            hint: "Pick a username, set your password, and choose a demo avatar.",
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
      className="glass-panel relative overflow-hidden rounded-[2rem] p-5 sm:p-7"
    >
      <div className="mb-6 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 text-sm">
        <button
          type="button"
          onClick={() => setAuthMode("login")}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            authMode === "login" ? "bg-white text-slate-900" : "text-white/70"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("register")}
          className={`flex-1 rounded-full px-4 py-2 transition ${
            authMode === "register" ? "bg-white text-slate-900" : "text-white/70"
          }`}
        >
          Register
        </button>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-2xl uppercase tracking-[0.14em] text-white">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-white/70">{copy.hint}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/75">
            Username
          </span>
          <input
            required
            minLength={3}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="player_one"
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-sky-300 focus:bg-white/15"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/75">
            Password
          </span>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-sky-300 focus:bg-white/15"
          />
        </label>

        {authMode === "register" ? (
          <div>
            <div className="mb-2 block text-xs uppercase tracking-[0.22em] text-white/75">
              Avatar
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
          className="w-full rounded-2xl bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 px-5 py-3 font-display text-sm uppercase tracking-[0.22em] text-slate-900 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading..." : copy.action}
        </button>
      </form>
    </motion.section>
  );
};

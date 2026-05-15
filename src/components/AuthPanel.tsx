import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AvatarPicker } from "./AvatarPicker";
import { useAppContext } from "../state/AppContext";
import { avatarOptions } from "../data/avatars";

type AuthPanelProps = {
  forcedMode?: "login" | "register";
};

export const AuthPanel = ({ forcedMode }: AuthPanelProps) => {
  const { authMode, setAuthMode, login, register } = useAppContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarId, setAvatarId] = useState(avatarOptions[0].id);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forcedMode) {
      setAuthMode(forcedMode);
    }
  }, [forcedMode, setAuthMode]);

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
      className="glass-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 p-1 text-sm">
        <Link
          to="/login"
          className={`flex-1 rounded-full px-4 py-2 text-center font-medium transition ${
            authMode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Login
        </Link>
        <Link
          to="/register"
          className={`flex-1 rounded-full px-4 py-2 text-center font-medium transition ${
            authMode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
          }`}
        >
          Register
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-3xl tracking-[-0.03em] text-slate-900">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{copy.hint}</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
            Username
          </span>
          <input
            required
            minLength={3}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="player_one"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
            Password
          </span>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />
        </label>

        {authMode === "register" ? (
          <div>
            <div className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500">
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
          className="w-full rounded-2xl bg-gradient-to-b from-indigo-600 to-indigo-500 px-5 py-3 font-display text-sm uppercase tracking-[0.22em] text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading..." : copy.action}
        </button>
      </form>
    </motion.section>
  );
};

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
            action: "Enter Grid",
            hint: "Sign in to continue your single-player run, save scores, and climb the Hall of Fame.",
          }
        : {
            title: "Join the Grid",
            action: "Create Account",
            hint: "Choose an avatar, lock in your username, and start building your memory rank.",
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

  if (authMode === "login") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto w-full max-w-[32rem] rounded-[2.8rem] border border-white/60 bg-white/82 p-7 shadow-[0_26px_60px_rgba(53,37,205,0.08)] backdrop-blur-xl sm:p-9"
      >
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#667085]">Sign in</p>
          <h2 className="mt-3 font-display text-[2.6rem] font-extrabold tracking-[-0.06em] text-[#111c2d]">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-md text-[1rem] leading-7 text-[#5a6174]">{copy.hint}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555]">
              Username
            </span>
            <input
              required
              minLength={3}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="player_one"
              className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.1rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
            />
          </label>

          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#464555]">Password</span>
            </div>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.1rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="h-20 w-full rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-[1.45rem] font-bold text-white shadow-[0_16px_28px_rgba(53,37,205,0.24)] transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Loading..." : copy.action}
          </button>

          <div className="rounded-[1.6rem] border border-[#e8eaf5] bg-[#f8f9ff] px-5 py-4 text-sm text-[#5a6174]">
            Use the same username and password you created during registration. Saved runs and leaderboard progress stay tied to this account.
          </div>
        </form>

        <p className="mt-8 text-center text-[1.05rem] text-[#464555]">
          New to the grid?{" "}
          <Link to="/register" className="font-semibold text-[#3525cd]">
            Create Account
          </Link>
        </p>
      </motion.section>
    );
  }

  return (
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto w-full max-w-[34rem]"
      >
      <section className="rounded-[2.8rem] border border-white/60 bg-white/82 p-7 shadow-[0_26px_60px_rgba(53,37,205,0.08)] backdrop-blur-xl sm:p-9">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#667085]">Create account</p>
          <h3 className="mt-3 text-[2.8rem] font-extrabold tracking-[-0.06em] text-[#111c2d]">{copy.title}</h3>
          <p className="mt-3 max-w-lg text-[1rem] leading-7 text-[#5a6174]">{copy.hint}</p>
        </header>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="mb-4 text-base font-semibold uppercase tracking-[0.14em] text-[#3525cd]">Choose your avatar</div>
            <AvatarPicker value={avatarId} onChange={setAvatarId} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555]">
                Username
              </span>
              <input
                required
                minLength={3}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your grid name"
                className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.05rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555]">
                Password
              </span>
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.05rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-[1.05rem] text-[#464555]">
            <input type="checkbox" className="h-5 w-5 rounded border-[#c7c4d8] text-[#3525cd]" />
            <span>
              I agree to the <span className="font-semibold text-[#3525cd]">Terms of Service</span>
            </span>
          </label>

          {error ? (
            <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="h-20 w-full rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-[1.45rem] font-bold text-white shadow-[0_16px_28px_rgba(53,37,205,0.24)] transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Loading..." : copy.action}
          </button>
        </form>
      </section>

      <p className="mt-8 text-center text-[1.05rem] text-[#464555]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#3525cd]">
          Sign In
        </Link>
      </p>
    </motion.section>
  );
};

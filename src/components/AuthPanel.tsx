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
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarId, setAvatarId] = useState(avatarOptions[0].id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
            hint: "Sign in with the email attached to your account to continue your single-player run, save scores, and climb the Hall of Fame.",
          }
        : {
            title: "Join the Grid",
            action: "Create Account",
            hint: "Choose an avatar, lock in your username, add your email, and start building your memory rank.",
          },
    [authMode],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (authMode === "login") {
        await login({ identifier, password });
      } else {
        const result = await register({ username, email, password, avatarId });
        if (!result.session) {
          setSuccess(`Verification email sent to ${result.verificationEmail ?? email}. Confirm it before signing in.`);
          setAuthMode("login");
          setIdentifier(result.verificationEmail ?? email);
          setPassword("");
          return;
        }
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
        className="mx-auto w-full max-w-[32rem] rounded-[2.8rem] border border-white/60 bg-white/82 p-7 shadow-[0_26px_60px_rgba(53,37,205,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 sm:p-9"
      >
        <div className="mb-9">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#667085] dark:text-slate-400">Sign in</p>
          <h2 className="mt-3 font-display text-[2.6rem] font-extrabold tracking-[-0.06em] text-[#111c2d] dark:text-white">
            {copy.title}
          </h2>
          <p className="mt-3 max-w-md text-[1rem] leading-7 text-[#5a6174] dark:text-slate-300">{copy.hint}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555] dark:text-slate-300">
              Email or Username
            </span>
            <input
              required
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="you@example.com or player_one"
              className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.1rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff] dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#464555] dark:text-slate-300">Password</span>
              <Link to="/forgot-password" className="text-sm font-semibold text-[#3525cd] dark:text-indigo-400">
                Forgot?
              </Link>
            </div>
            <input
              required
              type="password"
              minLength={6}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.1rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff] dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
            />
          </label>

          {error ? (
            <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="h-20 w-full rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-[1.45rem] font-bold text-white shadow-[0_16px_28px_rgba(53,37,205,0.24)] transition hover:scale-[1.01] disabled:opacity-60"
          >
            {loading ? "Loading..." : copy.action}
          </button>

          <div className="rounded-[1.6rem] border border-[#e8eaf5] bg-[#f8f9ff] px-5 py-4 text-sm text-[#5a6174] dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
            You can sign in with either your email or your username. Password reset links always go to the email attached to the account.
          </div>
        </form>

        <p className="mt-8 text-center text-[1.05rem] text-[#464555] dark:text-slate-400">
          New to the grid?{" "}
          <Link to="/register" className="font-semibold text-[#3525cd] dark:text-indigo-400">
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
      <section className="rounded-[2.8rem] border border-white/60 bg-white/82 p-7 shadow-[0_26px_60px_rgba(53,37,205,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100 sm:p-9">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#667085] dark:text-slate-400">Create account</p>
          <h3 className="mt-3 text-[2.8rem] font-extrabold tracking-[-0.06em] text-[#111c2d] dark:text-white">{copy.title}</h3>
          <p className="mt-3 max-w-lg text-[1rem] leading-7 text-[#5a6174] dark:text-slate-300">{copy.hint}</p>
        </header>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="mb-4 text-base font-semibold uppercase tracking-[0.14em] text-[#3525cd] dark:text-indigo-400">Choose your avatar</div>
            <AvatarPicker value={avatarId} onChange={setAvatarId} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555] dark:text-slate-300">
                Username
              </span>
              <input
                required
                minLength={3}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your grid name"
                className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.05rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff] dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555] dark:text-slate-300">
                Email
              </span>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.05rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff] dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
              />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-1">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555] dark:text-slate-300">
                Password
              </span>
              <input
                required
                type="password"
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.05rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff] dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-500"
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-[1.05rem] text-[#464555] dark:text-slate-300">
            <input type="checkbox" className="h-5 w-5 rounded border-[#c7c4d8] text-[#3525cd]" />
            <span>
              I agree to the <span className="font-semibold text-[#3525cd] dark:text-indigo-400">Terms of Service</span>
            </span>
          </label>

          {error ? (
            <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              {success}
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

      <p className="mt-8 text-center text-[1.05rem] text-[#464555] dark:text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#3525cd] dark:text-indigo-400">
          Sign In
        </Link>
      </p>
    </motion.section>
  );
};

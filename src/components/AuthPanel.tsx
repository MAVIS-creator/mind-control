import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AvatarPicker } from "./AvatarPicker";
import { BrandMarkIcon } from "./AppIcons";
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
            title: "Welcome Back, Genius",
            action: "Enter Grid",
            hint: null,
          }
        : {
            title: "Join the Grid",
            action: "Create Account",
            hint: "Start your journey toward mental mastery today.",
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
        className="mx-auto w-full max-w-md rounded-[2.8rem] border border-white/50 bg-white/75 p-8 shadow-[0_20px_40px_rgba(53,37,205,0.08)] backdrop-blur-xl"
      >
        <div className="mb-10 text-center">
          <BrandMarkIcon className="mx-auto mb-6 h-20 w-20 shadow-[0_14px_28px_rgba(53,37,205,0.18)]" />
          <h2 className="font-display text-[2.3rem] font-bold tracking-[-0.05em] text-[#3525cd]">MindGrid</h2>
          <p className="mt-3 text-[1.1rem] text-[#464555]">{copy.title}</p>
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
              className="h-16 w-full rounded-full border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.15rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
            />
          </label>

          <label className="block">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#464555]">Password</span>
              <span className="text-sm font-semibold text-[#3525cd]">Forgot?</span>
            </div>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-16 w-full rounded-full border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.15rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
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
        </form>

        <div className="my-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#d8dbea]" />
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#a0a4b8]">Or connect with</span>
          <div className="h-px flex-1 bg-[#d8dbea]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="rounded-full border border-[#d9d8eb] bg-white px-5 py-5 text-lg font-semibold text-[#111c2d]">
            Google
          </button>
          <button type="button" className="rounded-full border border-[#d9d8eb] bg-white px-5 py-5 text-lg font-semibold text-[#111c2d]">
            File
          </button>
        </div>

        <p className="mt-10 text-center text-[1.05rem] text-[#464555]">
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
      className="mx-auto w-full max-w-xl"
    >
      <div className="mb-8 text-center">
        <h2 className="font-display text-[3rem] font-extrabold tracking-[-0.05em] text-[#3525cd]">MindGrid</h2>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#464555]">Connect To Clarity</p>
      </div>

      <section className="rounded-[2.8rem] border border-white/50 bg-white/80 p-8 shadow-[0_20px_40px_rgba(53,37,205,0.08)] backdrop-blur-xl">
        <header>
          <h3 className="text-[3rem] font-extrabold tracking-[-0.06em] text-[#111c2d]">{copy.title}</h3>
          <p className="mt-3 max-w-md text-[1.2rem] leading-9 text-[#464555]">{copy.hint}</p>
        </header>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="mb-4 text-base font-semibold uppercase tracking-[0.14em] text-[#3525cd]">Choose your avatar</div>
            <AvatarPicker value={avatarId} onChange={setAvatarId} />
          </div>

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
              className="h-16 w-full rounded-[1.2rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.15rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
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
              className="h-16 w-full rounded-[1.2rem] border border-[#e8eaf5] bg-[#eef2ff] px-6 text-[1.15rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
            />
          </label>

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

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { BrandMotionMark, MailIcon } from "../components/AppIcons";
import { SiteFooter } from "../components/SiteFooter";
import { isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

export const CompleteEmailRoute = () => {
  const { session, updateEmail } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.profile.email && !isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/play" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updateEmail(email);
      setSent(true);
      window.setTimeout(() => navigate("/play", { replace: true }), 1200);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e0f2fe_0%,_#f8faff_45%,_#dbeafe_100%)] dark:bg-none dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-10">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-20 h-[22rem] w-[22rem] rounded-full bg-[#38bdf8]/18 dark:bg-[#38bdf8]/10 blur-[90px]" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-[#2563eb]/16 dark:bg-[#2563eb]/10 blur-[110px]" />
      </div>

      <div className="mx-auto flex max-w-5xl items-center justify-center">
        <section className="glass-panel w-full max-w-[34rem] rounded-[2.5rem] px-6 py-8 shadow-[0_26px_60px_rgba(37,99,235,0.08)] sm:px-8 dark:bg-slate-900/90 dark:border dark:border-slate-800">
          <BrandMotionMark className="mx-auto mb-6 w-[11rem] sm:w-[14rem]" />
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#64748b] dark:text-slate-400">Complete Account Setup</p>
          <h1 className="mt-3 text-center font-display text-[2.3rem] font-extrabold tracking-[-0.06em] text-[#0f172a] dark:text-white">
            Add your real email
          </h1>
          <p className="mt-3 text-center text-[1rem] leading-7 text-[#475569] dark:text-slate-300">
            This older account needs a real email address before continuing, so password resets and verification emails can reach you.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#475569] dark:text-slate-300">
                Email
              </span>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#64748b] dark:text-slate-500" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-16 w-full rounded-[1.35rem] border border-[#e2e8f0] bg-[#f0f9ff] pl-14 pr-6 text-[1.05rem] text-[#0f172a] outline-none transition focus:border-[#60a5fa] focus:ring-4 focus:ring-[#bae6fd] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500"
                />
              </div>
            </label>

            {sent ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Email updated. If verification is required, check your inbox before your next sign-in.
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-16 w-full rounded-full bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] text-[1.15rem] font-bold text-white shadow-[0_16px_28px_rgba(37,99,235,0.24)] transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Email"}
            </button>
          </form>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
};

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { BrandMotionMark, MailIcon } from "../components/AppIcons";
import { SiteFooter } from "../components/SiteFooter";
import { useAppContext } from "../state/AppContext";

export const ForgotPasswordRoute = () => {
  const { session, requestPasswordReset } = useAppContext();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (session) {
    return <Navigate to="/play" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_45%,_#d4e3ff_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-20 h-[22rem] w-[22rem] rounded-full bg-[#9a7cff]/16 blur-[90px]" />
        <div className="absolute right-0 top-0 h-[28rem] w-[28rem] rounded-full bg-[#64a8fe]/18 blur-[110px]" />
      </div>

      <div className="mx-auto flex max-w-5xl items-center justify-center">
        <section className="glass-panel w-full max-w-[32rem] rounded-[2.5rem] px-6 py-8 shadow-[0_26px_60px_rgba(53,37,205,0.08)] sm:px-8">
          <BrandMotionMark className="mx-auto mb-6 h-20 w-20 sm:h-24 sm:w-24" />
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#667085]">Password Reset</p>
          <h1 className="mt-3 text-center font-display text-[2.4rem] font-extrabold tracking-[-0.06em] text-[#111c2d]">
            Reset your password
          </h1>
          <p className="mt-3 text-center text-[1rem] leading-7 text-[#5a6174]">
            Enter the email attached to your account and we&apos;ll send a reset link to your inbox.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555]">
                Email
              </span>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f7590]" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] pl-14 pr-6 text-[1.05rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
                />
              </div>
            </label>

            {sent ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Reset email sent. Check your inbox and spam folder for the MindGrid reset link.
              </p>
            ) : null}

            {error ? (
              <p className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-16 w-full rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] text-[1.15rem] font-bold text-white shadow-[0_16px_28px_rgba(53,37,205,0.24)] transition hover:scale-[1.01] disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-8 text-center text-[1rem] text-[#464555]">
            <Link to="/login" className="font-semibold text-[#3525cd]">
              Back to sign in
            </Link>
          </p>
        </section>
      </div>
      <SiteFooter />
    </div>
  );
};

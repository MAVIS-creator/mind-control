import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMotionMark, LockIcon } from "../components/AppIcons";
import { SiteFooter } from "../components/SiteFooter";
import { useAppContext } from "../state/AppContext";

export const ResetPasswordRoute = () => {
  const { updatePassword } = useAppContext();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSaved(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update password.");
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
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-[#667085]">Create New Password</p>
          <h1 className="mt-3 text-center font-display text-[2.4rem] font-extrabold tracking-[-0.06em] text-[#111c2d]">
            Secure your account
          </h1>
          <p className="mt-3 text-center text-[1rem] leading-7 text-[#5a6174]">
            Choose a new password for your MindGrid account.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {[
              {
                label: "New password",
                value: password,
                setValue: setPassword,
                autoComplete: "new-password",
              },
              {
                label: "Confirm password",
                value: confirmPassword,
                setValue: setConfirmPassword,
                autoComplete: "new-password",
              },
            ].map((field) => (
              <label key={field.label} className="block">
                <span className="mb-2 block text-sm font-semibold uppercase tracking-[0.16em] text-[#464555]">
                  {field.label}
                </span>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6f7590]" />
                  <input
                    required
                    type="password"
                    minLength={6}
                    autoComplete={field.autoComplete}
                    value={field.value}
                    onChange={(event) => field.setValue(event.target.value)}
                    placeholder="••••••••"
                    className="h-16 w-full rounded-[1.35rem] border border-[#e8eaf5] bg-[#eef2ff] pl-14 pr-6 text-[1.05rem] text-[#111c2d] outline-none transition focus:border-[#c3c0ff] focus:ring-4 focus:ring-[#e2dfff]"
                  />
                </div>
              </label>
            ))}

            {saved ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Password updated. Redirecting you back to sign in.
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
              {loading ? "Updating..." : "Update Password"}
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

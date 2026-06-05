import { useState } from "react";
import { Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { avatarOptions } from "../data/avatars";
import { getLevelProgress, isLegacyAccountEmail } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

export const ProfileRoute = () => {
  const { session, updateEmail } = useAppContext();
  const [email, setEmail] = useState(session?.profile.email ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!session.profile.email || isLegacyAccountEmail(session.profile.email)) {
    return <Navigate to="/complete-email" replace />;
  }

  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];
  const level = getLevelProgress(session.profile.xp);
  const legacyEmail = isLegacyAccountEmail(session.profile.email);

  const handleEmailUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await updateEmail(email);
      setMessage("Email updated. Check your inbox if verification is required.");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update email.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell session={session} active={null}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <section className="glass-panel rounded-[2rem] p-8 shadow-[0_14px_34px_rgba(53,37,205,0.08)] sm:p-10 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:items-center">
            <div className="relative">
              <img
                src={avatar.image}
                alt={avatar.name}
                className="w-full max-w-[240px] rounded-full border-4 border-white bg-slate-100 shadow-lg ring-4 ring-[#e2dfff]"
              />
            </div>
            <div>
              <h1 className="font-display text-5xl tracking-[-0.05em] text-slate-900">
                {session.profile.username}
              </h1>
              <p className="mt-2 text-[1.9rem] text-[#464555]">{session.profile.rank}</p>

              <div className="mt-6 space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#3525cd]">
                    XP Level
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Lvl {level.level} • {session.profile.xp} XP
                  </span>
                </div>
                <div className="h-4 rounded-full bg-[#d8e3fb] p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3525cd] to-[#64a8fe]"
                    style={{ width: `${Math.max(8, level.progress)}%` }}
                  />
                </div>
                <p className="text-base text-[#464555]">Progress to Level {level.level + 1} ({level.nextLevelXp} XP).</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["XP", `${session.profile.xp}`],
            ["Email", session.profile.email],
            ["Joined", new Date(session.profile.createdAt).toLocaleDateString("en-GB")],
          ].map(([title, value]) => (
            <div key={title} className="glass-panel rounded-[1.6rem] p-6 shadow-[0_10px_26px_rgba(53,37,205,0.05)]">
              <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">{title}</div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        <section className="glass-panel mt-6 rounded-[1.8rem] p-6 shadow-[0_10px_26px_rgba(53,37,205,0.05)]">
          <h2 className="text-lg font-semibold text-slate-900">Account Email</h2>
          <p className="mt-2 text-sm leading-7 text-[#5a6174]">
            {legacyEmail
              ? "This account is still using a legacy sign-in email. Replace it with your real email so you can receive password reset and account verification messages."
              : "Change the email attached to your account anytime here."}
          </p>

          <form className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end" onSubmit={handleEmailUpdate}>
            <label className="block flex-1">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#7d8395]">Email</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-14 w-full rounded-[1.2rem] border border-[#dfe4f2] bg-[#f8f9ff] px-4 text-sm text-[#1f2740] outline-none transition focus:border-[#c5c2ff] focus:ring-4 focus:ring-[#ebe9ff]"
              />
            </label>
            <button
              type="submit"
              disabled={saving}
              className="h-14 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-6 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(53,37,205,0.2)] disabled:opacity-60"
            >
              {saving ? "Saving..." : "Update Email"}
            </button>
          </form>

          {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
        </section>
      </div>
    </AppShell>
  );
};

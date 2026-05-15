import { Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { avatarOptions } from "../data/avatars";
import { useAppContext } from "../state/AppContext";

export const ProfileRoute = () => {
  const { session } = useAppContext();
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];

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
                    {session.profile.xp} XP
                  </span>
                </div>
                <div className="h-4 rounded-full bg-[#d8e3fb] p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3525cd] to-[#64a8fe]"
                    style={{ width: `${Math.min(100, Math.max(12, (session.profile.xp % 1000) / 10))}%` }}
                  />
                </div>
                <p className="text-base text-[#464555]">Progress toward your next rank tier.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["XP", `${session.profile.xp}`],
            ["Avatar", avatar.name],
            ["Joined", new Date(session.profile.createdAt).toLocaleDateString("en-GB")],
          ].map(([title, value]) => (
            <div key={title} className="glass-panel rounded-[1.6rem] p-6 shadow-[0_10px_26px_rgba(53,37,205,0.05)]">
              <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-500">{title}</div>
              <div className="mt-3 text-lg font-semibold text-slate-900">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

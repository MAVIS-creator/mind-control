import { Link, Navigate } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import { useAppContext } from "../state/AppContext";

export const ProfileRoute = () => {
  const { session } = useAppContext();
  if (!session) {
    return <Navigate to="/" replace />;
  }

  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          to="/play"
          className="inline-flex rounded-2xl border border-white/10 px-4 py-3 text-xs uppercase tracking-[0.32em] text-white/60"
        >
          Return to hub
        </Link>

        <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-[220px_1fr] sm:items-center">
            <img
              src={avatar.image}
              alt={avatar.name}
              className="w-full max-w-[220px] rounded-[2rem] border border-cyan/20 bg-slate-950"
            />
            <div>
              <p className="font-display text-xs uppercase tracking-[0.38em] text-cyan/75">
                Pilot dossier
              </p>
              <h1 className="mt-3 font-display text-4xl uppercase tracking-[0.12em] text-white">
                {session.profile.username}
              </h1>
              <p className="mt-2 text-lg text-white/70">{session.profile.rank}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["XP", `${session.profile.xp}`],
                  ["Avatar", avatar.name],
                  ["Created", new Date(session.profile.createdAt).toLocaleDateString("en-GB")],
                ].map(([title, value]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[0.65rem] uppercase tracking-[0.28em] text-white/45">{title}</div>
                    <div className="mt-2 text-sm text-white">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

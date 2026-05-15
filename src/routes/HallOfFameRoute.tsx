import { Navigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { avatarOptions } from "../data/avatars";
import { formatNumber } from "../lib/utils";
import { useAppContext } from "../state/AppContext";

const medalClasses = [
  "border-[#ffd166] bg-[#fff7db]",
  "border-[#c7d2fe] bg-[#eef2ff]",
  "border-[#f4c7a1] bg-[#fff2e8]",
] as const;

export const HallOfFameRoute = () => {
  const { session, leaderboard } = useAppContext();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  const podium = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3, 12);

  return (
    <AppShell session={session} active="ranks">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-10">
        <section className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
            Ranking board
          </p>
          <h1 className="mt-3 font-display text-5xl tracking-[-0.05em] text-slate-900">
            Hall of Fame
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Your best classic runs, mapped into a cleaner ranking screen inspired by the
            stitch leaderboard references.
          </p>
        </section>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          {podium.map((entry, index) => {
            const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
            return (
              <article
                key={entry.id}
                className={`glass-panel rounded-[2rem] border-2 p-6 text-center ${medalClasses[index] ?? "border-slate-200 bg-white"}`}
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-900 shadow-sm">
                  {index + 1}
                </div>
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="mx-auto mt-4 h-24 w-24 rounded-full border-4 border-white bg-slate-100 shadow-md"
                />
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{entry.username}</h2>
                <p className="mt-1 text-sm uppercase tracking-[0.18em] text-indigo-600">
                  {formatNumber(entry.score)} pts
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Accuracy {entry.accuracy.toFixed(1)}% • Combo x{entry.maxCombo}
                </p>
              </article>
            );
          })}
        </div>

        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200/70 px-6 py-5">
            <h2 className="text-xl font-semibold text-slate-900">Top Players</h2>
            <p className="mt-1 text-sm text-slate-500">Classic mode ranking by best recorded runs.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.22em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Accuracy</th>
                  <th className="px-6 py-4">Combo</th>
                </tr>
              </thead>
              <tbody>
                {rest.length ? (
                  rest.map((entry, index) => {
                    const avatar = avatarOptions.find((item) => item.id === entry.avatarId) ?? avatarOptions[0];
                    return (
                      <tr key={entry.id} className="border-t border-slate-100 text-sm text-slate-700">
                        <td className="px-6 py-4 font-semibold text-slate-500">{index + 4}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={avatar.image}
                              alt={avatar.name}
                              className="h-11 w-11 rounded-full border border-white bg-slate-100"
                            />
                            <span className="font-medium text-slate-900">{entry.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-indigo-700">{formatNumber(entry.score)}</td>
                        <td className="px-6 py-4">{entry.accuracy.toFixed(1)}%</td>
                        <td className="px-6 py-4">x{entry.maxCombo}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-sm text-slate-500">
                      No ranked runs yet. Play a round to place the first Hall of Fame score.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
};

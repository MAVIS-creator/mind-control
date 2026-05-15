import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import type { AuthSession } from "../types";
import { HomeIcon, TrophyIcon, UserIcon } from "./AppIcons";

type AppShellProps = {
  session: AuthSession;
  active: "play" | "hall" | "profile";
  children: ReactNode;
};

const navItems = [
  { id: "play", label: "Home", to: "/play", icon: HomeIcon },
  { id: "hall", label: "Hall", to: "/hall-of-fame", icon: TrophyIcon },
  { id: "profile", label: "Profile", to: "/profile", icon: UserIcon },
] as const;

export const AppShell = ({ session, active, children }: AppShellProps) => {
  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          <Link to="/play" className="font-display text-2xl tracking-[-0.03em] text-indigo-700">
            MindGrid
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full bg-indigo-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 sm:block">
              {session.profile.xp} XP
            </div>
            <img
              src={avatar.image}
              alt={avatar.name}
              className="h-11 w-11 rounded-full border-2 border-white bg-slate-100 shadow-sm"
            />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/88 px-2 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex min-w-[82px] flex-col items-center rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                  isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

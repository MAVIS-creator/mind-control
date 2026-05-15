import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import type { AuthSession } from "../types";
import { GroupIcon, HomeIcon, SettingsIcon, StarBadgeIcon, TrophyIcon, UserIcon } from "./AppIcons";

type AppShellProps = {
  session: AuthSession;
  active: "home" | "ranks" | "social" | "me";
  children: ReactNode;
};

const navItems = [
  { id: "home", label: "Home", to: "/", icon: HomeIcon },
  { id: "ranks", label: "Ranks", to: "/hall-of-fame", icon: TrophyIcon },
  { id: "social", label: "Social", to: "/play", icon: GroupIcon },
  { id: "me", label: "Me", to: "/profile", icon: UserIcon },
] as const;

export const AppShell = ({ session, active, children }: AppShellProps) => {
  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];

  return (
    <div className="min-h-screen bg-transparent pb-24 md:pb-8">
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3 sm:px-8">
          <Link to="/" className="font-display text-[2.2rem] font-extrabold tracking-[-0.05em] text-indigo-700">
            MindGrid
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[1.05rem] font-medium transition ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 shadow-sm"
                      : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-indigo-700 shadow-sm">
              <StarBadgeIcon className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-[0.05em]">{session.profile.xp} XP</span>
            </div>
            <button
              type="button"
              aria-label="Settings"
              className="rounded-full p-2 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
            >
              <SettingsIcon className="h-6 w-6" />
            </button>
            <img
              src={avatar.image}
              alt={avatar.name}
              className="h-12 w-12 rounded-full border-2 border-white bg-slate-100 shadow-sm"
            />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/50 bg-white/75 px-2 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex min-w-[74px] flex-col items-center rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                  isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-slate-700"
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

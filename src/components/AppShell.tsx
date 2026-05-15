import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import { useAppContext } from "../state/AppContext";
import type { AuthSession } from "../types";
import { BrandMarkIcon, HomeIcon, SettingsIcon, StarBadgeIcon, TrophyIcon, UserIcon } from "./AppIcons";

type AppShellProps = {
  session: AuthSession;
  active: "home" | "ranks" | null;
  children: ReactNode;
};

const navItems = [
  { id: "home", label: "Home", to: "/play", icon: HomeIcon },
  { id: "ranks", label: "Ranks", to: "/hall-of-fame", icon: TrophyIcon },
] as const;

export const AppShell = ({ session, active, children }: AppShellProps) => {
  const { logout } = useAppContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 border-b border-white/40 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 sm:px-8">
          <Link to="/play" className="flex items-center gap-3">
            <BrandMarkIcon className="h-11 w-11 shrink-0" />
            <span className="font-display text-[2.15rem] font-extrabold tracking-[-0.05em] text-slate-900">
              MindGrid
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[1.02rem] font-medium transition ${
                    isActive
                      ? "bg-[#efeefe] text-[#3525cd] shadow-sm"
                      : "text-[#667085] hover:bg-[#f5f4ff] hover:text-[#3525cd]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c7c4d8] bg-white/80 px-4 py-2 text-[#3525cd] shadow-sm">
              <StarBadgeIcon className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-[0.04em]">{session.profile.xp} XP</span>
            </div>
            <button
              type="button"
              aria-label="Settings"
              className="rounded-full p-2 text-[#464555] transition hover:bg-[#f5f4ff] hover:text-[#3525cd]"
            >
              <SettingsIcon className="h-6 w-6" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="rounded-full border-2 border-white bg-slate-100 shadow-sm"
              >
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="h-12 w-12 rounded-full"
                />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] w-44 rounded-2xl border border-white/70 bg-white/95 p-2 shadow-[0_18px_40px_rgba(53,37,205,0.12)] backdrop-blur-xl">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#f5f4ff] hover:text-[#3525cd]"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      void logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-[#f5f4ff] hover:text-[#3525cd]"
                  >
                    <UserIcon className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/80 px-2 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex min-w-[78px] flex-col items-center rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-[#4f46e5] text-white shadow-[0_12px_24px_rgba(79,70,229,0.24)]"
                    : "text-[#464555]"
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

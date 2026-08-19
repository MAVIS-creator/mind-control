import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import { getLevelFromXp } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { AuthSession } from "../types";
import { BrandMarkIcon, HomeIcon, TrophyIcon, UserIcon } from "./AppIcons";
import { AddictionFencingModal } from "./AddictionFencingModal";
import { BetaFounderClaimModal } from "./BetaFounderClaimModal";
import { FriendsDrawer } from "./FriendsDrawer";
import { ThemeToggle } from "./ThemeToggle";
import { SiteFooter } from "./SiteFooter";

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
  const [friendsOpen, setFriendsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const avatar = avatarOptions.find((entry) => entry.id === session.profile.avatarId) ?? avatarOptions[0];
  const level = getLevelFromXp(session.profile.xp);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);


  return (
    <div className="flex min-h-[100dvh] flex-col pb-24 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(245,249,255,0.96),rgba(236,243,255,0.92))] backdrop-blur-xl dark:border-slate-800 dark:bg-none dark:bg-slate-950/90">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 px-3 py-3 sm:gap-4 sm:px-6 md:grid-cols-[minmax(0,auto)_1fr_auto] lg:px-8 xl:px-10">
          <Link to="/play" className="flex min-w-0 items-center gap-2 overflow-hidden sm:gap-3">
            <BrandMarkIcon className="h-9 w-9 shrink-0 object-contain sm:h-11 sm:w-11" />
            <span className="truncate font-display text-[1.55rem] font-extrabold tracking-[-0.06em] text-[#15274a] dark:text-white sm:text-[2.2rem]">
              MindGrid
            </span>
          </Link>

          <nav className="col-span-2 hidden items-center justify-center gap-2 md:col-span-1 md:flex lg:gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.98rem] font-semibold transition lg:px-5 lg:text-[1.02rem] ${
                    isActive
                      ? "bg-[#e0f2fe] text-[#0284c7] shadow-[0_10px_22px_rgba(37,99,235,0.08)] dark:bg-blue-900/90 dark:text-white"
                      : "text-[#64748b] hover:bg-white/70 hover:text-[#0284c7] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex min-w-0 shrink-0 items-center justify-self-end gap-2 sm:gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setFriendsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-all shadow-sm dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Friends & Online</span>
            </button>

            <div className="inline-flex min-w-0 items-center gap-1 rounded-full border border-[#cbd5e1] bg-white px-2 py-1.5 text-[#0284c7] shadow-[0_12px_24px_rgba(37,99,235,0.08)] dark:border-slate-800 dark:bg-slate-900 dark:text-sky-300 sm:gap-2 sm:px-4 sm:py-2">
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-[0.58rem] font-bold sm:h-5 sm:w-5 sm:text-[0.72rem]">
                ★
              </span>
              <span className="truncate text-[0.7rem] font-semibold tracking-[0.02em] sm:text-sm">{session.profile.xp}</span>
              <span className="text-[0.7rem] font-semibold tracking-[0.02em] sm:text-sm">XP</span>
              <span className="rounded-full bg-[#e0f2fe] px-1.5 py-0.5 text-[0.56rem] font-bold uppercase tracking-[0.1em] text-[#2563eb] dark:bg-slate-800 dark:text-sky-400 sm:px-2 sm:text-[0.68rem]">
                L{level}
              </span>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="shrink-0 rounded-full focus:outline-none"
                aria-label="Profile menu"
              >
                <div
                  className={`rounded-full p-[2.5px] transition-all duration-300 ${
                    session.profile.isAdmin
                      ? "bg-gradient-to-r from-sky-400 via-blue-500 to-amber-400 shadow-[0_0_16px_rgba(14,165,233,0.45)] dark:shadow-[0_0_24px_rgba(56,189,248,0.7)]"
                      : session.profile.isBetaTester
                      ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.4)] dark:shadow-[0_0_24px_rgba(245,158,11,0.65)]"
                      : "bg-[#dbeafe] dark:bg-slate-700"
                  }`}
                >
                  <img src={avatar.image} alt={avatar.name} className="h-9 w-9 rounded-full border-2 border-white bg-slate-100 object-cover dark:border-slate-800 dark:bg-slate-900 sm:h-11 sm:w-11" />
                </div>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] w-44 rounded-2xl border border-[#cbd5e1] bg-white/95 p-2 shadow-[0_18px_40px_rgba(37,99,235,0.12)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#475569] transition hover:bg-[#f0f9ff] hover:text-[#0284c7] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-sky-400"
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
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#475569] transition hover:bg-[#f0f9ff] hover:text-[#0284c7] dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
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

      <AddictionFencingModal />
      <BetaFounderClaimModal />
      <FriendsDrawer isOpen={friendsOpen} onClose={() => setFriendsOpen(false)} />

      <main className="flex-1">{children}</main>
      <SiteFooter />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#cbd5e1] bg-[linear-gradient(180deg,rgba(245,249,255,0.98),rgba(236,243,255,0.94))] px-2 py-3 backdrop-blur-xl md:hidden dark:bg-none dark:bg-slate-950 dark:border-slate-800">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex min-w-[78px] flex-col items-center rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                  isActive ? "bg-[#2563eb] text-white shadow-[0_12px_24px_rgba(37,99,235,0.24)]" : "text-[#64748b] dark:text-slate-400"
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

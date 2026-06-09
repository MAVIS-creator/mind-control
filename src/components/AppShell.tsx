import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import { getLevelFromXp } from "../lib/utils";
import { useAppContext } from "../state/AppContext";
import type { AuthSession } from "../types";
import { BrandMarkIcon, HomeIcon, TrophyIcon, UserIcon } from "./AppIcons";
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
      <header className="sticky top-0 z-40 border-b border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(245,249,255,0.96),rgba(236,243,255,0.92))] backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,auto)_1fr_auto] items-center gap-3 px-3 py-3 sm:gap-4 sm:px-6 lg:px-8 xl:px-10">
          <Link to="/play" className="flex min-w-0 shrink items-center gap-2 overflow-hidden sm:gap-3">
            <BrandMarkIcon className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11" />
            <span className="truncate font-display text-[1.9rem] font-extrabold tracking-[-0.06em] text-[#15274a] sm:text-[2.2rem]">
              MindGrid
            </span>
          </Link>

          <nav className="hidden items-center justify-center gap-2 md:flex lg:gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[0.98rem] font-semibold transition lg:px-5 lg:text-[1.02rem] ${
                    isActive
                      ? "bg-white text-[#2f46d7] shadow-[0_12px_24px_rgba(53,37,205,0.12)]"
                      : "text-[#5e6d8f] hover:bg-white/70 hover:text-[#2f46d7]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center justify-self-end gap-2 sm:gap-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c9dcff] bg-white px-2.5 py-1.5 text-[#3525cd] shadow-[0_12px_24px_rgba(53,37,205,0.08)] sm:gap-2 sm:px-4 sm:py-2">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-current text-[0.62rem] font-bold sm:h-5 sm:w-5 sm:text-[0.72rem]">
                ★
              </span>
              <span className="text-xs font-semibold tracking-[0.03em] sm:text-sm">{session.profile.xp}</span>
              <span className="text-xs font-semibold tracking-[0.03em] sm:text-sm">XP</span>
              <span className="rounded-full bg-[#f0f3ff] px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#4f46e5] sm:px-2 sm:text-[0.68rem]">
                L{level}
              </span>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="shrink-0 rounded-full border-2 border-white bg-slate-100 shadow-[0_10px_20px_rgba(53,37,205,0.1)]"
                aria-label="Profile menu"
              >
                <img src={avatar.image} alt={avatar.name} className="h-10 w-10 rounded-full object-cover sm:h-12 sm:w-12" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-[calc(100%+10px)] w-44 rounded-2xl border border-[#ececf6] bg-white/95 p-2 shadow-[0_18px_40px_rgba(53,37,205,0.12)] backdrop-blur-xl">
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#464555] transition hover:bg-[#f5f4ff] hover:text-[#3525cd]"
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
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[#464555] transition hover:bg-[#f5f4ff] hover:text-[#3525cd]"
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

      <main className="flex-1">{children}</main>
      <SiteFooter />

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(245,249,255,0.98),rgba(236,243,255,0.94))] px-2 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex min-w-[78px] flex-col items-center rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                  isActive ? "bg-[#4f46e5] text-white shadow-[0_12px_24px_rgba(79,70,229,0.24)]" : "text-[#5e6d8f]"
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

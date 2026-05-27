import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { avatarOptions } from "../data/avatars";
import { useAppContext } from "../state/AppContext";
import type { AuthSession } from "../types";
import { BrandMarkIcon, HomeIcon, TrophyIcon, UserIcon } from "./AppIcons";

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
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 border-b border-[#ececf6] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <Link to="/play" className="flex items-center gap-3">
            <BrandMarkIcon className="h-10 w-10 shrink-0" />
            <span className="font-display text-[1.5rem] font-extrabold tracking-[-0.05em] text-[#111c2d] sm:text-[2rem]">
              MindGrid
            </span>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[1.02rem] font-medium transition ${
                    isActive
                      ? "bg-[#f3f1ff] text-[#3525cd]"
                      : "text-[#667085] hover:bg-[#f7f6ff] hover:text-[#3525cd]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9d8eb] bg-white px-4 py-2 text-[#3525cd] shadow-sm">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[0.72rem] font-bold">
                ★
              </span>
              <span className="text-sm font-semibold tracking-[0.04em]">{session.profile.xp} XP</span>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="rounded-full border-2 border-white bg-slate-100 shadow-sm"
                aria-label="Profile menu"
              >
                <img src={avatar.image} alt={avatar.name} className="h-12 w-12 rounded-full" />
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
                  {session.profile.isAdmin ? (
                    <Link
                      to="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#464555] transition hover:bg-[#f5f4ff] hover:text-[#3525cd]"
                    >
                      <TrophyIcon className="h-4 w-4" />
                      Admin
                    </Link>
                  ) : null}
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

      <main>{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ececf6] bg-white/80 px-2 py-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`flex min-w-[78px] flex-col items-center rounded-2xl px-4 py-2 text-xs font-semibold transition ${
                  isActive ? "bg-[#4f46e5] text-white shadow-[0_12px_24px_rgba(79,70,229,0.24)]" : "text-[#464555]"
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

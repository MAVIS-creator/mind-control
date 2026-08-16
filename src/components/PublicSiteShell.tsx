import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMarkIcon, MailIcon, TrophyIcon, UserIcon } from "./AppIcons";
import { ThemeToggle } from "./ThemeToggle";
import { SiteFooter } from "./SiteFooter";
import { cn } from "../lib/utils";

type PublicSiteShellProps = {
  active: "home" | "ranks" | "contact";
  children: ReactNode;
};

const navItems = [
  { id: "home", label: "Home", to: "/" },
  { id: "ranks", label: "Ranks", to: "/ranks" },
  { id: "contact", label: "Contact", to: "/contact" },
] as const;

export const PublicSiteShell = ({ active, children }: PublicSiteShellProps) => (
  <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] dark:bg-none dark:bg-slate-950 text-[#121a2c] dark:text-slate-100">
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-16 top-14 h-[24rem] w-[24rem] rounded-full bg-[#8a70ff]/18 dark:bg-[#8a70ff]/10 blur-[95px]" />
      <div className="absolute right-0 top-0 h-[26rem] w-[26rem] rounded-full bg-[#64a8fe]/16 dark:bg-[#64a8fe]/10 blur-[95px]" />
      <div className="absolute bottom-0 left-1/3 h-[22rem] w-[22rem] rounded-full bg-[#6b00b7]/10 dark:bg-[#6b00b7]/5 blur-[110px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.34)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.34)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:88px_88px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
    </div>

    <header className="sticky top-0 z-40 border-b border-[#d9def1]/70 bg-white/76 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <BrandMarkIcon className="h-11 w-11 shrink-0 drop-shadow-[0_10px_18px_rgba(53,37,205,0.16)]" />
          <span className="font-display text-2xl font-extrabold tracking-[-0.06em] text-[#111c2d] dark:text-white sm:text-3xl">
            MindGrid
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center justify-center gap-2 sm:order-none sm:w-auto">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              className={cn(
                "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold text-[#667085] dark:text-slate-300 transition sm:text-base hover:text-indigo-600 dark:hover:text-white",
                active === item.id && "bg-[#f0edff] text-[#3525cd] dark:bg-indigo-900/90 dark:text-white shadow-[0_10px_22px_rgba(53,37,205,0.08)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden rounded-full border border-[#d9def1] bg-white/75 px-4 py-2 text-sm font-semibold text-[#1a2340] shadow-[0_10px_22px_rgba(53,37,205,0.05)] transition hover:border-[#c7cbee] hover:bg-white dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 sm:inline-flex"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(53,37,205,0.2)] transition hover:scale-[1.01] sm:px-5"
          >
            <UserIcon className="h-4 w-4" />
            Join
          </Link>
        </div>
      </div>
    </header>

    {children}

    <div className="fixed bottom-5 left-5 z-30 hidden rounded-full bg-white/82 p-2 shadow-[0_18px_40px_rgba(53,37,205,0.12)] backdrop-blur-xl md:flex md:flex-col md:gap-2 dark:border dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-200">
      <Link
        to="/"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-[#3525cd] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
          active === "home" && "bg-[#4f46e5] text-white dark:bg-indigo-600 dark:text-white",
        )}
        aria-label="Home"
      >
        <BrandMarkIcon className="h-6 w-6" />
      </Link>
      <Link
        to="/ranks"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-[#3525cd] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
          active === "ranks" && "bg-[#4f46e5] text-white dark:bg-indigo-600 dark:text-white",
        )}
        aria-label="Ranks"
      >
        <TrophyIcon className="h-5 w-5" />
      </Link>
      <Link
        to="/contact"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-[#3525cd] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
          active === "contact" && "bg-[#4f46e5] text-white dark:bg-indigo-600 dark:text-white",
        )}
        aria-label="Contact"
      >
        <MailIcon className="h-5 w-5" />
      </Link>
    </div>

    <SiteFooter />
  </div>
);

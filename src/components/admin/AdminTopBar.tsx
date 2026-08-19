import type { JSX } from "react";
import { CopyIcon, GridIcon } from "../AppIcons";

type AdminTopBarProps = {
  title: string;
  helper: string;
  onOpenMobile: () => void;
  copiedLink: string | null;
  onCopyInstallLink: () => void;
};

export const AdminTopBar = ({
  title,
  helper,
  onOpenMobile,
  copiedLink,
  onCopyInstallLink,
}: AdminTopBarProps): JSX.Element => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 sm:px-6 lg:px-8 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/85">
      {/* Mobile Menu Button & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobile}
          className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-700 dark:text-slate-200 lg:hidden"
        >
          <GridIcon className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h1 className="font-display text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
            {title}
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
            {helper}
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onCopyInstallLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-[#eff1ff] px-3.5 py-1.5 text-xs font-bold text-[#1c05b3] shadow-sm transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-sky-300"
        >
          <CopyIcon className="h-3.5 w-3.5" />
          <span>{copiedLink === "pwa_install" ? "PWA Copied!" : "PWA Install Link"}</span>
        </button>

        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Systems Online</span>
        </div>
      </div>
    </header>
  );
};

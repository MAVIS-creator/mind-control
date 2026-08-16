import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMarkIcon, TrophyIcon } from "./AppIcons";
import type { EventEdition } from "../lib/eventEditions";

export const EventEditionShell = ({ children, edition }: { children: ReactNode; edition?: EventEdition | null }) => (
  <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_#e2dfff_0%,_#f9f9ff_42%,_#d4e3ff_100%)] dark:bg-none dark:bg-slate-950 text-[#111c2d] dark:text-slate-200">
    <header className="sticky top-0 z-40 border-b border-[#d9def1]/70 dark:border-slate-800 bg-white/78 dark:bg-slate-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to={edition ? `/${edition.slug}` : "/"} className="flex items-center gap-3">
          <BrandMarkIcon className="h-11 w-11" />
          <div>
            <p className="font-display text-2xl font-extrabold tracking-[-0.06em] text-[#111c2d] dark:text-white sm:text-3xl">MindGrid</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#3525cd] dark:text-indigo-400">
              {edition?.config.eventLabel ?? "MindGrid Event"}
            </p>
          </div>
        </Link>
        <Link
          to={edition ? `/${edition.slug}/live` : "/"}
          className="inline-flex items-center gap-2 rounded-full border border-[#d9def1] dark:border-slate-800 bg-white/80 dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-[#3525cd] dark:text-indigo-400 shadow-sm"
        >
          <TrophyIcon className="h-4 w-4" />
          Live Board
        </Link>
      </div>
    </header>
    {children}
  </div>
);

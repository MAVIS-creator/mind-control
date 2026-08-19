export const SiteFooter = () => (
  <footer className="mt-8 shrink-0 border-t border-[#cbd5e1] bg-[linear-gradient(180deg,rgba(244,248,255,0.98),rgba(233,242,255,0.96))] backdrop-blur-xl dark:border-slate-800 dark:bg-none dark:bg-slate-950">
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-4 px-4 py-5 text-center sm:px-6 md:grid-cols-[auto_1fr_auto] md:text-left lg:px-8 xl:px-10">
      <a
        href="https://klyvex-studios.tech"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-3 transition hover:opacity-90 md:justify-start"
      >
        <img
          src="/klyvex_logo.png"
          alt="Klyvex Studios"
          className="h-10 w-10 rounded-xl object-cover shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105 group-hover:ring-blue-400 dark:ring-slate-700 sm:h-12 sm:w-12"
        />
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-bold text-[#0f172a] transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-sky-400">
              Klyvex Studios
            </p>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-900/40 dark:text-sky-300 border border-blue-200 dark:border-blue-800">
              Creator
            </span>
          </div>
        </div>
      </a>
      <div className="hidden h-px w-full bg-[linear-gradient(90deg,transparent,#cbd5e1,transparent)] dark:bg-[linear-gradient(90deg,transparent,#334155,transparent)] md:block" />
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#64748b] dark:text-slate-400 md:justify-self-end">
        <span>MindGrid: Neural Clash</span>
        <span>•</span>
        <a
          href="https://klyvex-studios.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 hover:underline dark:text-sky-400"
        >
          Developed by Klyvex Studios
        </a>
      </div>
    </div>
  </footer>
);

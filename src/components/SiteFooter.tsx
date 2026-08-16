export const SiteFooter = () => (
  <footer className="mt-8 shrink-0 border-t border-[#cfe0ff] bg-[linear-gradient(180deg,rgba(244,248,255,0.98),rgba(233,242,255,0.96))] backdrop-blur-xl dark:border-slate-800 dark:bg-none dark:bg-slate-950">
    <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-4 px-4 py-5 text-center sm:px-6 md:grid-cols-[auto_1fr_auto] md:text-left lg:px-8 xl:px-10">
      <div className="flex items-center justify-center gap-3 md:justify-start">
        <img src="/klyvex_logo.svg" alt="Klyvex Studios" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
        <div>
          <p className="text-sm font-semibold text-[#15274a] dark:text-white">Klyvex Studios</p>
          <p className="text-xs uppercase tracking-[0.18em] text-[#5e6d8f] dark:text-slate-400">MindGrid Production</p>
        </div>
      </div>
      <div className="hidden h-px w-full bg-[linear-gradient(90deg,transparent,#cfe0ff,transparent)] dark:bg-[linear-gradient(90deg,transparent,#334155,transparent)] md:block" />
      <p className="text-sm font-medium text-[#5a6790] dark:text-slate-300 md:justify-self-end">Built by Klyvex Studios</p>
    </div>
  </footer>
);

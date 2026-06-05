export const SiteFooter = () => (
  <footer className="mt-10 border-t border-white/60 bg-white/40 backdrop-blur-xl">
    <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:text-left">
      <div className="flex items-center gap-3">
        <img src="/klyvex-k.svg" alt="Klyvex Studios" className="h-9 w-9 rounded-2xl" />
        <div>
          <p className="text-sm font-semibold text-[#111c2d]">Klyvex Studios</p>
          <p className="text-xs uppercase tracking-[0.18em] text-[#667085]">MindGrid Production</p>
        </div>
      </div>
      <p className="text-sm text-[#5a6174]">Built by Klyvex Studios</p>
    </div>
  </footer>
);

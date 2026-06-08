export const SiteFooter = () => (
  <footer className="mt-10 border-t border-[#cfe0ff] bg-[rgba(241,245,255,0.92)] backdrop-blur-xl">
    <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8 xl:px-10">
      <div className="flex items-center gap-3">
        <img src="/klyvex_logo.svg" alt="Klyvex Studios" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
        <div>
          <p className="text-sm font-semibold text-[#15274a]">Klyvex Studios</p>
          <p className="text-xs uppercase tracking-[0.18em] text-[#5e6d8f]">MindGrid Production</p>
        </div>
      </div>
      <p className="text-sm text-[#5a6790]">Built by Klyvex Studios</p>
    </div>
  </footer>
);

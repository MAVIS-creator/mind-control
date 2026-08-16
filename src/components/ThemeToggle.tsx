import { useState, useRef, useEffect } from "react";
import { useAppContext } from "../state/AppContext";

export const ThemeToggle = () => {
  const { preferences, updatePreferences } = useAppContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const currentTheme = preferences.colorTheme || "system";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: Array<{ id: "light" | "dark" | "system"; label: string; icon: string }> = [
    { id: "light", label: "Light", icon: "☀️" },
    { id: "dark", label: "Dark", icon: "🌙" },
    { id: "system", label: "System", icon: "💻" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800"
        title="Switch color theme"
      >
        <span>
          {currentTheme === "light" ? "☀️" : currentTheme === "dark" ? "🌙" : "💻"}
        </span>
        <span className="capitalize hidden sm:inline">{currentTheme}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[130px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl backdrop-blur-xl animate-fade-in dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  updatePreferences({ colorTheme: opt.id });
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                  currentTheme === opt.id
                    ? "bg-[#4f46e5] text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

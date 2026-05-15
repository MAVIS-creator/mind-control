import { cn } from "../lib/utils";

type StatPillProps = {
  label: string;
  value: string;
  accent?: "cyan" | "violet";
};

export const StatPill = ({ label, value, accent = "cyan" }: StatPillProps) => (
  <div
    className={cn(
      "hud-chip rounded-2xl px-4 py-3",
      accent === "violet" ? "border-violet/30" : "border-cyan/30",
    )}
  >
    <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">{label}</p>
    <p className="mt-1 font-display text-lg uppercase tracking-[0.18em] text-white">
      {value}
    </p>
  </div>
);

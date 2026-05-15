import { cn } from "../lib/utils";

type StatPillProps = {
  label: string;
  value: string;
  accent?: "cyan" | "violet";
};

export const StatPill = ({ label, value, accent = "cyan" }: StatPillProps) => (
  <div
    className={cn(
      "hud-chip rounded-2xl px-4 py-4",
      accent === "violet" ? "border-white/20" : "border-white/20",
    )}
  >
    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/50">{label}</p>
    <p className="mt-1 font-display text-lg uppercase tracking-[0.1em] text-white">
      {value}
    </p>
  </div>
);

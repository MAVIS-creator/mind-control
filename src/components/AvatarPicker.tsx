import { avatarOptions } from "../data/avatars";
import { cn } from "../lib/utils";

type AvatarPickerProps = {
  value: string;
  onChange: (avatarId: string) => void;
};

export const AvatarPicker = ({ value, onChange }: AvatarPickerProps) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {avatarOptions.map((avatar) => {
      const active = value === avatar.id;
      return (
        <button
          key={avatar.id}
          type="button"
          onClick={() => onChange(avatar.id)}
          className={cn(
            "group rounded-3xl border px-3 py-3 text-left transition duration-200",
            active
              ? "border-white/60 bg-white/16 shadow-lg"
              : "border-white/10 bg-white/5 hover:border-white/35 hover:bg-white/10",
          )}
        >
          <div
            className={cn(
              "rounded-2xl bg-gradient-to-br p-1",
              avatar.accent,
            )}
          >
            <img
              src={avatar.image}
              alt={avatar.name}
              className="aspect-square w-full rounded-[1.15rem] bg-slate-950 object-cover"
            />
          </div>
          <p className="mt-2 text-sm font-medium text-white">{avatar.name}</p>
        </button>
      );
    })}
  </div>
);

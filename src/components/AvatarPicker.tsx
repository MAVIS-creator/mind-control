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
            "group rounded-[1.8rem] border px-3 py-3 text-left transition duration-200",
            active
              ? "border-[#c8c5ff] bg-[#f6f5ff] shadow-[0_16px_28px_rgba(53,37,205,0.10)]"
              : "border-[#e7e9f3] bg-white hover:border-[#d2cffb] hover:bg-[#fbfbff]",
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
          <p className="mt-3 text-sm font-semibold text-[#1d2740]">{avatar.name}</p>
        </button>
      );
    })}
  </div>
);

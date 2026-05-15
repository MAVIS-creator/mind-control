import type { AvatarOption } from "../types";

const avatarSvg = (primary: string, secondary: string, label: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${label}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${secondary}" />
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="34" fill="#060b17" />
      <rect x="8" y="8" width="144" height="144" rx="28" fill="url(#bg)" opacity="0.22" />
      <circle cx="80" cy="64" r="28" fill="#edf6ff" opacity="0.96" />
      <path d="M40 134c8-25 28-37 40-37s32 12 40 37" fill="#edf6ff" opacity="0.96" />
      <path d="M50 46c10-14 26-20 46-16 15 3 26 13 32 28-7-3-14-4-21-4-18 0-32 10-41 23-5-6-11-11-16-14z" fill="${primary}" opacity="0.86" />
      <circle cx="67" cy="66" r="4" fill="#09111f" />
      <circle cx="93" cy="66" r="4" fill="#09111f" />
      <path d="M69 82c5 5 17 5 22 0" stroke="#09111f" stroke-width="5" stroke-linecap="round" fill="none" />
      <rect x="19" y="19" width="122" height="122" rx="24" fill="none" stroke="${primary}" stroke-opacity="0.5" />
    </svg>
  `)}`;

export const avatarOptions: AvatarOption[] = [
  {
    id: "pulse-runner",
    name: "Pulse Runner",
    image: avatarSvg("#67f8ff", "#4c63ff", "Pulse Runner avatar"),
    accent: "from-cyan/70 to-indigo/70",
  },
  {
    id: "echo-scout",
    name: "Echo Scout",
    image: avatarSvg("#ff76d9", "#6558ff", "Echo Scout avatar"),
    accent: "from-fuchsia-400/70 to-indigo-500/70",
  },
  {
    id: "static-ghost",
    name: "Static Ghost",
    image: avatarSvg("#98b7ff", "#6cf7ff", "Static Ghost avatar"),
    accent: "from-sky-300/70 to-cyan-300/70",
  },
  {
    id: "void-hunter",
    name: "Void Hunter",
    image: avatarSvg("#d27dff", "#4e5bff", "Void Hunter avatar"),
    accent: "from-violet-400/70 to-indigo-400/70",
  },
];

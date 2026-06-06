import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
type BrandMotionMarkProps = {
  className?: string;
};

const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const UserIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

export const MailIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <path d="m5.5 8 6.5 5 6.5-5" />
  </svg>
);

export const LockIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <rect x="6" y="11" width="12" height="9" rx="2" />
    <path d="M9 11V8a3 3 0 1 1 6 0v3" />
  </svg>
);

export const TrophyIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M8 4h8v3a4 4 0 0 1-8 0V4Z" />
    <path d="M10 15h4" />
    <path d="M12 11v4" />
    <path d="M7 5H5a2 2 0 0 0 2 4" />
    <path d="M17 5h2a2 2 0 0 1-2 4" />
    <path d="M9 20h6" />
  </svg>
);

export const GridIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <rect x="4" y="4" width="6" height="6" rx="1.2" />
    <rect x="14" y="4" width="6" height="6" rx="1.2" />
    <rect x="4" y="14" width="6" height="6" rx="1.2" />
    <rect x="14" y="14" width="6" height="6" rx="1.2" />
  </svg>
);

export const ClockIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v4l3 2" />
  </svg>
);

export const SparklesIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" />
  </svg>
);

export const PlayIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M8 6.5v11l9-5.5-9-5.5Z" />
  </svg>
);

export const RefreshIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M20 11a8 8 0 1 0-2.4 5.7" />
    <path d="M20 4v7h-7" />
  </svg>
);

export const PauseIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M9 5v14" />
    <path d="M15 5v14" />
  </svg>
);

export const VolumeIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M5 14h3l4 4V6L8 10H5z" />
    <path d="M16 9a4 4 0 0 1 0 6" />
    <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);

export const MusicIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M10 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    <path d="M18 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    <path d="M10 18V7l8-2v11" />
  </svg>
);

export const HapticsIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <rect x="8" y="3.5" width="8" height="17" rx="2" />
    <path d="M10.5 6h3" />
    <path d="M4.5 9.5v5" />
    <path d="M19.5 9.5v5" />
    <path d="M2.5 11.5v1" />
    <path d="M21.5 11.5v1" />
  </svg>
);

export const ExitIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M10 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" />
    <path d="M14 8l4 4-4 4" />
    <path d="M18 12h-8" />
  </svg>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const RulesIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <rect x="5" y="4" width="14" height="16" rx="2" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
    <path d="M9 16h4" />
  </svg>
);

export const HomeIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M4 11.5 12 5l8 6.5" />
    <path d="M6 10.5V20h12v-9.5" />
  </svg>
);

export const GroupIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <path d="M16 18a4 4 0 0 0-8 0" />
    <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M20 18a3 3 0 0 0-4-2.83" />
    <path d="M17.5 11.5a2.5 2.5 0 1 0-1.7-4.34" />
  </svg>
);

export const SettingsIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.4 1Z" />
  </svg>
);

export const StarBadgeIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.2l1.35 2.74 3.02.44-2.18 2.12.52 3-2.71-1.43-2.7 1.43.52-3-2.19-2.12 3.03-.44L12 7.2Z" />
  </svg>
);

export const BrandMarkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 256 256" fill="none" {...props}>
    <rect x="14" y="14" width="228" height="228" rx="56" fill="url(#mindgrid-bg)" />
    <rect x="52" y="52" width="64" height="64" rx="20" stroke="white" strokeWidth="12" />
    <circle cx="84" cy="84" r="9" fill="white" />
    <path d="M84 94V128C84 145.673 98.3269 160 116 160H173" stroke="white" strokeWidth="12" strokeLinecap="round" />
    <rect x="140" y="52" width="64" height="64" rx="20" stroke="white" strokeWidth="12" />
    <rect x="52" y="140" width="64" height="64" rx="20" stroke="white" strokeWidth="12" />
    <rect x="140" y="140" width="64" height="64" rx="20" fill="white" fillOpacity="0.25" />
    <circle cx="172" cy="172" r="9" fill="white" />
    <defs>
      <linearGradient id="mindgrid-bg" x1="32" y1="28" x2="214" y2="226" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4F46E5" />
        <stop offset="1" stopColor="#3525CD" />
      </linearGradient>
    </defs>
  </svg>
);

export const BrandMotionMark = ({ className }: BrandMotionMarkProps) => (
  <div className={`brand-motion-mark ${className ?? ""}`.trim()} aria-hidden="true">
    <img src="/logo-m.svg" alt="" className="h-full w-full object-contain" />
  </div>
);

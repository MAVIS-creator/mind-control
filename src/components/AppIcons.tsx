import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

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

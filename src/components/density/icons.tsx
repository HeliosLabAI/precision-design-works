import type { SVGProps } from "react";

/**
 * Apple-style SF Symbol inspired icons.
 * 1.5px stroke, round caps/joins, square 24 viewport.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 16): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const SidebarIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3.25" y="4.25" width="17.5" height="15.5" rx="3" />
    <line x1="9.5" y1="4.5" x2="9.5" y2="19.5" />
  </svg>
);

export const SearchIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="10.75" cy="10.75" r="6.25" />
    <line x1="15.5" y1="15.5" x2="20" y2="20" />
  </svg>
);

export const PlusIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const ChevronDownIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronRightIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

export const ArrowUpRightIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="8 7 17 7 17 16" />
  </svg>
);

export const MoreIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="5" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const ExpandIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <polyline points="15 4 20 4 20 9" />
    <polyline points="9 20 4 20 4 15" />
    <line x1="20" y1="4" x2="14" y2="10" />
    <line x1="4" y1="20" x2="10" y2="14" />
  </svg>
);

export const PanelRightIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3.25" y="4.25" width="17.5" height="15.5" rx="3" />
    <line x1="15" y1="4.5" x2="15" y2="19.5" />
  </svg>
);

export const MicIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="9" y="3.5" width="6" height="11" rx="3" />
    <path d="M6 11.5a6 6 0 0 0 12 0" />
    <line x1="12" y1="17.5" x2="12" y2="20.5" />
  </svg>
);

export const FolderIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M3.5 7.25A2.25 2.25 0 0 1 5.75 5h3.4a2 2 0 0 1 1.5.66l.95 1.09a2 2 0 0 0 1.5.66h5.15A2.25 2.25 0 0 1 20.5 9.66V17a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 17V7.25Z" />
  </svg>
);

export const HardDriveIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3.25" y="13" width="17.5" height="6.5" rx="1.5" />
    <path d="M5.5 13l1.3-7.1A1.5 1.5 0 0 1 8.27 4.75h7.46a1.5 1.5 0 0 1 1.47 1.15L18.5 13" />
    <circle cx="7" cy="16.25" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const SparkleIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.5l1.6 4.4a3 3 0 0 0 2 2L20 11.5l-4.4 1.6a3 3 0 0 0-2 2L12 19.5l-1.6-4.4a3 3 0 0 0-2-2L4 11.5l4.4-1.6a3 3 0 0 0 2-2L12 3.5z" />
  </svg>
);

export const FlaskIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M9 3.5h6" />
    <path d="M10 3.5v5.5L5 18a2 2 0 0 0 1.78 2.92h10.44A2 2 0 0 0 19 18l-5-9V3.5" />
    <path d="M7.6 14h8.8" />
  </svg>
);

export const StackIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.75 3.75 7.5 12 11.25 20.25 7.5 12 3.75z" />
    <path d="M3.75 12 12 15.75 20.25 12" />
    <path d="M3.75 16.5 12 20.25 20.25 16.5" />
  </svg>
);

export const QuestionIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7" />
    <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

export const ImageIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <rect x="3.25" y="4.25" width="17.5" height="15.5" rx="2.5" />
    <circle cx="9" cy="9.75" r="1.5" />
    <path d="M4 17 9.5 12 15 17l3-3 3 3" />
  </svg>
);

export const BookIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15.5H5.5A1.5 1.5 0 0 1 4 18V5.5z" />
    <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15.5h5.5A1.5 1.5 0 0 0 20 18V5.5z" />
  </svg>
);

export const ListIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1="4" y1="6.5" x2="20" y2="6.5" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17.5" x2="20" y2="17.5" />
  </svg>
);

export const BugSlashIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M8 8a4 4 0 0 1 8 0v2a4 4 0 0 1-8 0V8z" />
    <path d="M5 11h2M17 11h2M5.5 15.5l2-1M16.5 15.5l2 1M12 13v6" />
    <line x1="4" y1="20" x2="20" y2="4" />
  </svg>
);

export const InfinityIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M6 12a3.5 3.5 0 1 1 3.5 3.5c-1.4 0-2.4-.8-3.5-2.2C4.9 11.8 3.9 11 2.5 11M18 12a3.5 3.5 0 1 0-3.5 3.5c1.4 0 2.4-.8 3.5-2.2C19.1 11.8 20.1 11 21.5 11" transform="translate(0 0.5)" />
  </svg>
);

export const DiamondIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <path d="M12 3.5 20.5 12 12 20.5 3.5 12 12 3.5z" />
  </svg>
);

export const ArrowLeftIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="11 6 5 12 11 18" />
  </svg>
);

export const ArrowRightIcon = ({ size, ...p }: IconProps) => (
  <svg {...base(size)} {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="13 6 19 12 13 18" />
  </svg>
);

export const DensityLogo = ({ size = 18, ...p }: IconProps) => (
  <svg {...base(size)} {...p} strokeWidth={1.4}>
    <circle cx="12" cy="12" r="9" />
    <path d="M7 9.5h6.5a4 4 0 0 1 0 8H7v-13" />
  </svg>
);

type IconProps = {
  className?: string;
};

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden="true">
      <path d="M10 3 5 8l5 5" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden="true">
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden="true">
      <path d="M6.5 3.5h-2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" />
      <path d="M9.5 2.5h4v4" />
      <path d="M13 3 7 9" />
    </svg>
  );
}

export function LatchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden="true">
      <rect x="3.5" y="7" width="9" height="6" rx="1" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

export function EndStopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden="true">
      <path d="M5 3v10" />
      <path d="M8 3v10" />
    </svg>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...base} aria-hidden="true">
      <path d="M8 2.5 14 13H2z" />
      <path d="M8 6.5v3" />
      <circle cx="8" cy="11.2" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

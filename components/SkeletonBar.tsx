type SkeletonBarProps = {
  className?: string;
};

// A pulsing placeholder line for plain-text loading states (titles,
// subtitles, labels) -- the non-flap counterpart to FlapRowSkeleton.
export function SkeletonBar({ className = "" }: SkeletonBarProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block animate-pulse rounded bg-panel-line ${className}`}
    />
  );
}

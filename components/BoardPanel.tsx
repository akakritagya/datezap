import type { ReactNode } from "react";

type BoardPanelProps = {
  children: ReactNode;
  className?: string;
};

export function BoardPanel({ children, className = "" }: BoardPanelProps) {
  return (
    <div className={`board-panel ${className}`}>
      <span className="rivet rivet-left" />
      <span className="rivet rivet-right" />
      {children}
    </div>
  );
}

import { forwardRef } from "react";
import type { MouseEventHandler, ReactNode } from "react";

type BoardPanelProps = {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const BoardPanel = forwardRef<HTMLDivElement, BoardPanelProps>(
  function BoardPanel({ children, className = "", onClick }, ref) {
    return (
      <div ref={ref} className={`board-panel ${className}`} onClick={onClick}>
        <span className="rivet rivet-left" />
        <span className="rivet rivet-right" />
        {children}
      </div>
    );
  },
);

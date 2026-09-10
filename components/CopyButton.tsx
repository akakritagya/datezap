"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";
import { SIZE_CLASSES } from "@/components/FlapRow";

type CopyButtonProps = {
  value: string;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const ICON_SIZE_CLASSES: Record<NonNullable<CopyButtonProps["size"]>, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6 sm:h-7 sm:w-7",
};

export function CopyButton({ value, label, size, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access unavailable or denied; nothing to recover from here.
    }
  }

  const iconClass = size ? ICON_SIZE_CLASSES[size] : "h-3.5 w-3.5";
  const boxClass = size
    ? `${SIZE_CLASSES[size]} inline-flex items-center justify-center rounded-lg border border-ivory/15 bg-ivory/10 text-ivory shadow-[inset_0_1px_0_rgba(243,237,224,0.15)] backdrop-blur-sm cursor-pointer transition-colors hover:bg-ivory/20 hover:border-ivory/25`
    : "cursor-pointer rounded p-1 text-muted transition-colors hover:text-ivory";

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      title={copied ? "Copied" : `Copy ${label}`}
      className={`${boxClass} ${className}`}
    >
      {copied ? (
        <CheckIcon className={`${iconClass} text-amber`} />
      ) : (
        <CopyIcon className={iconClass} />
      )}
    </button>
  );
}

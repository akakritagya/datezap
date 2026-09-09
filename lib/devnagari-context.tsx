"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "datezap:devnagari";
const CHANGE_EVENT = "datezap:devnagari-change";

// Fallback for when localStorage itself is unavailable (private mode, blocked
// storage): the toggle still works for the session, it just won't persist.
let memoryFallback = false;

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return memoryFallback;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

type DevnagariContextValue = {
  devnagari: boolean;
  setDevnagari: (value: boolean) => void;
};

const DevnagariContext = createContext<DevnagariContextValue | null>(null);

export function DevnagariProvider({ children }: { children: ReactNode }) {
  const devnagari = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setDevnagari = useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      memoryFallback = value;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return (
    <DevnagariContext.Provider value={{ devnagari, setDevnagari }}>
      {children}
    </DevnagariContext.Provider>
  );
}

export function useDevnagari(): DevnagariContextValue {
  const context = useContext(DevnagariContext);
  if (!context) {
    throw new Error("useDevnagari must be used within a DevnagariProvider");
  }
  return context;
}

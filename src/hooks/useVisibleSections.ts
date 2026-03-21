import { useState, useCallback } from 'react';

const STORAGE_KEY = 'fe-prep-hidden-sections';

// Sections hidden by default
const DEFAULT_HIDDEN: string[] = ['/english-speaking'];

function loadHidden(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set(DEFAULT_HIDDEN);
}

function saveHidden(hidden: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...hidden]));
}

export function useVisibleSections() {
  const [hidden, setHidden] = useState<Set<string>>(loadHidden);

  const isVisible = useCallback((path: string) => !hidden.has(path), [hidden]);

  const toggle = useCallback((path: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      saveHidden(next);
      return next;
    });
  }, []);

  return { isVisible, toggle, hidden };
}

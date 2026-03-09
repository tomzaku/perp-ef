import { useState, useCallback } from 'react';

const STORAGE_KEY = 'fe-interview-progress';

interface Progress {
  completed: Set<string>;
  bookmarked: Set<string>;
}

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completed: new Set(parsed.completed || []),
        bookmarked: new Set(parsed.bookmarked || []),
      };
    }
  } catch {}
  return { completed: new Set(), bookmarked: new Set() };
}

function saveProgress(progress: Progress) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      completed: Array.from(progress.completed),
      bookmarked: Array.from(progress.bookmarked),
    })
  );
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  const toggleCompleted = useCallback((id: string) => {
    setProgress((prev) => {
      const next = {
        completed: new Set(prev.completed),
        bookmarked: new Set(prev.bookmarked),
      };
      if (next.completed.has(id)) {
        next.completed.delete(id);
      } else {
        next.completed.add(id);
      }
      saveProgress(next);
      return next;
    });
  }, []);

  const toggleBookmarked = useCallback((id: string) => {
    setProgress((prev) => {
      const next = {
        completed: new Set(prev.completed),
        bookmarked: new Set(prev.bookmarked),
      };
      if (next.bookmarked.has(id)) {
        next.bookmarked.delete(id);
      } else {
        next.bookmarked.add(id);
      }
      saveProgress(next);
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (id: string) => progress.completed.has(id),
    [progress]
  );

  const isBookmarked = useCallback(
    (id: string) => progress.bookmarked.has(id),
    [progress]
  );

  return {
    completedCount: progress.completed.size,
    bookmarkedCount: progress.bookmarked.size,
    toggleCompleted,
    toggleBookmarked,
    isCompleted,
    isBookmarked,
  };
}

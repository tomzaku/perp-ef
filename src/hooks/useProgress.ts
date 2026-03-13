import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'fe-interview-progress';

interface Progress {
  completed: Set<string>;
  bookmarked: Set<string>;
}

function loadLocal(): Progress {
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

function saveLocal(progress: Progress) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      completed: Array.from(progress.completed),
      bookmarked: Array.from(progress.bookmarked),
    })
  );
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>(loadLocal);
  // Load from Supabase when user logs in
  useEffect(() => {
    if (!user || !supabase) return;

    let cancelled = false;

    async function fetchProgress() {
      const { data, error } = await supabase!
        .from('user_progress')
        .select('question_id, type')
        .eq('user_id', user!.id);

      if (cancelled || error) return;

      const completed = new Set<string>();
      const bookmarked = new Set<string>();
      data.forEach((row) => {
        if (row.type === 'completed') completed.add(row.question_id);
        if (row.type === 'bookmarked') bookmarked.add(row.question_id);
      });

      // Merge: local + remote (union)
      const local = loadLocal();
      const merged: Progress = {
        completed: new Set([...local.completed, ...completed]),
        bookmarked: new Set([...local.bookmarked, ...bookmarked]),
      };

      // Push any local-only items to Supabase
      const toInsert: { user_id: string; question_id: string; type: string }[] = [];
      for (const id of local.completed) {
        if (!completed.has(id)) {
          toInsert.push({ user_id: user!.id, question_id: id, type: 'completed' });
        }
      }
      for (const id of local.bookmarked) {
        if (!bookmarked.has(id)) {
          toInsert.push({ user_id: user!.id, question_id: id, type: 'bookmarked' });
        }
      }
      if (toInsert.length > 0) {
        await supabase!.from('user_progress').upsert(toInsert, { onConflict: 'user_id,question_id,type' });
      }

      setProgress(merged);
      saveLocal(merged);
    }

    fetchProgress();
    return () => { cancelled = true; };
  }, [user]);

  const toggleCompleted = useCallback((id: string) => {
    setProgress((prev) => {
      const next: Progress = {
        completed: new Set(prev.completed),
        bookmarked: new Set(prev.bookmarked),
      };
      const removing = next.completed.has(id);
      if (removing) {
        next.completed.delete(id);
      } else {
        next.completed.add(id);
      }
      saveLocal(next);

      // Sync to Supabase
      if (user && supabase) {
        if (removing) {
          supabase.from('user_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('question_id', id)
            .eq('type', 'completed')
            .then(() => {});
        } else {
          supabase.from('user_progress')
            .upsert({ user_id: user.id, question_id: id, type: 'completed' }, { onConflict: 'user_id,question_id,type' })
            .then(() => {});
        }
      }

      return next;
    });
  }, [user]);

  const toggleBookmarked = useCallback((id: string) => {
    setProgress((prev) => {
      const next: Progress = {
        completed: new Set(prev.completed),
        bookmarked: new Set(prev.bookmarked),
      };
      const removing = next.bookmarked.has(id);
      if (removing) {
        next.bookmarked.delete(id);
      } else {
        next.bookmarked.add(id);
      }
      saveLocal(next);

      // Sync to Supabase
      if (user && supabase) {
        if (removing) {
          supabase.from('user_progress')
            .delete()
            .eq('user_id', user.id)
            .eq('question_id', id)
            .eq('type', 'bookmarked')
            .then(() => {});
        } else {
          supabase.from('user_progress')
            .upsert({ user_id: user.id, question_id: id, type: 'bookmarked' }, { onConflict: 'user_id,question_id,type' })
            .then(() => {});
        }
      }

      return next;
    });
  }, [user]);

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

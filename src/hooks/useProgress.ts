import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'fe-interview-progress';

interface ProgressState {
  completed: Set<string>;
  bookmarked: Set<string>;
  _synced: boolean;
  toggleCompleted: (id: string, userId?: string) => void;
  toggleBookmarked: (id: string, userId?: string) => void;
  isCompleted: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  completedCount: () => number;
  bookmarkedCount: () => number;
  _mergeRemote: (remoteCompleted: string[], remoteBookmarked: string[], userId: string) => void;
}

function loadLocal(): { completed: Set<string>; bookmarked: Set<string> } {
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

function saveLocal(completed: Set<string>, bookmarked: Set<string>) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      completed: Array.from(completed),
      bookmarked: Array.from(bookmarked),
    })
  );
}

export const useProgressStore = create<ProgressState>()((set, get) => {
  const local = loadLocal();

  return {
    completed: local.completed,
    bookmarked: local.bookmarked,
    _synced: false,

    toggleCompleted: (id: string, userId?: string) => {
      const { completed, bookmarked } = get();
      const next = new Set(completed);
      const removing = next.has(id);
      if (removing) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveLocal(next, bookmarked);
      set({ completed: next });

      if (userId && supabase) {
        if (removing) {
          supabase.from('user_progress')
            .delete()
            .eq('user_id', userId)
            .eq('question_id', id)
            .eq('type', 'completed')
            .then(() => {});
        } else {
          supabase.from('user_progress')
            .upsert({ user_id: userId, question_id: id, type: 'completed' }, { onConflict: 'user_id,question_id,type' })
            .then(() => {});
        }
      }
    },

    toggleBookmarked: (id: string, userId?: string) => {
      const { completed, bookmarked } = get();
      const next = new Set(bookmarked);
      const removing = next.has(id);
      if (removing) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveLocal(completed, next);
      set({ bookmarked: next });

      if (userId && supabase) {
        if (removing) {
          supabase.from('user_progress')
            .delete()
            .eq('user_id', userId)
            .eq('question_id', id)
            .eq('type', 'bookmarked')
            .then(() => {});
        } else {
          supabase.from('user_progress')
            .upsert({ user_id: userId, question_id: id, type: 'bookmarked' }, { onConflict: 'user_id,question_id,type' })
            .then(() => {});
        }
      }
    },

    isCompleted: (id: string) => get().completed.has(id),
    isBookmarked: (id: string) => get().bookmarked.has(id),
    completedCount: () => get().completed.size,
    bookmarkedCount: () => get().bookmarked.size,

    _mergeRemote: (remoteCompleted: string[], remoteBookmarked: string[], userId: string) => {
      const local = loadLocal();
      const merged = {
        completed: new Set([...local.completed, ...remoteCompleted]),
        bookmarked: new Set([...local.bookmarked, ...remoteBookmarked]),
      };

      // Push local-only items to Supabase
      const toInsert: { user_id: string; question_id: string; type: string }[] = [];
      for (const id of local.completed) {
        if (!remoteCompleted.includes(id)) {
          toInsert.push({ user_id: userId, question_id: id, type: 'completed' });
        }
      }
      for (const id of local.bookmarked) {
        if (!remoteBookmarked.includes(id)) {
          toInsert.push({ user_id: userId, question_id: id, type: 'bookmarked' });
        }
      }
      if (toInsert.length > 0 && supabase) {
        supabase.from('user_progress').upsert(toInsert, { onConflict: 'user_id,question_id,type' }).then(() => {});
      }

      saveLocal(merged.completed, merged.bookmarked);
      set({ completed: merged.completed, bookmarked: merged.bookmarked, _synced: true });
    },
  };
});

/** Hook that syncs the store with Supabase on login and provides a convenient API. */
export function useProgress() {
  const { user } = useAuth();
  const store = useProgressStore();

  // Sync with Supabase when user logs in
  useEffect(() => {
    if (!user || !supabase || store._synced) return;

    let cancelled = false;

    async function fetchProgress() {
      const { data, error } = await supabase!
        .from('user_progress')
        .select('question_id, type')
        .eq('user_id', user!.id);

      if (cancelled || error) return;

      const completed: string[] = [];
      const bookmarked: string[] = [];
      data.forEach((row) => {
        if (row.type === 'completed') completed.push(row.question_id);
        if (row.type === 'bookmarked') bookmarked.push(row.question_id);
      });

      store._mergeRemote(completed, bookmarked, user!.id);
    }

    fetchProgress();
    return () => { cancelled = true; };
  }, [user, store._synced]);

  return {
    completedCount: store.completedCount(),
    bookmarkedCount: store.bookmarkedCount(),
    toggleCompleted: (id: string) => store.toggleCompleted(id, user?.id),
    toggleBookmarked: (id: string) => store.toggleBookmarked(id, user?.id),
    isCompleted: store.isCompleted,
    isBookmarked: store.isBookmarked,
  };
}

import { useEffect } from 'react';
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { createLocalStorage, syncRemote } from '../lib/persist';
import { useAuth } from './useAuth';

const storage = createLocalStorage<{ completed: string[]; bookmarked: string[] }>('fe-interview-progress');

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

function loadSets() {
  const raw = storage.load({ completed: [], bookmarked: [] });
  return {
    completed: new Set(raw.completed),
    bookmarked: new Set(raw.bookmarked),
  };
}

function saveSets(completed: Set<string>, bookmarked: Set<string>) {
  storage.save({ completed: Array.from(completed), bookmarked: Array.from(bookmarked) });
}

export const useProgressStore = create<ProgressState>()((set, get) => {
  const local = loadSets();

  return {
    completed: local.completed,
    bookmarked: local.bookmarked,
    _synced: false,

    toggleCompleted: (id: string, userId?: string) => {
      const { completed, bookmarked } = get();
      const next = new Set(completed);
      const removing = next.has(id);
      if (removing) next.delete(id); else next.add(id);
      saveSets(next, bookmarked);
      set({ completed: next });

      syncRemote(userId, (db, uid) =>
        removing
          ? db.from('user_progress').delete().eq('user_id', uid).eq('question_id', id).eq('type', 'completed')
          : db.from('user_progress').upsert({ user_id: uid, question_id: id, type: 'completed' }, { onConflict: 'user_id,question_id,type' })
      );
    },

    toggleBookmarked: (id: string, userId?: string) => {
      const { completed, bookmarked } = get();
      const next = new Set(bookmarked);
      const removing = next.has(id);
      if (removing) next.delete(id); else next.add(id);
      saveSets(completed, next);
      set({ bookmarked: next });

      syncRemote(userId, (db, uid) =>
        removing
          ? db.from('user_progress').delete().eq('user_id', uid).eq('question_id', id).eq('type', 'bookmarked')
          : db.from('user_progress').upsert({ user_id: uid, question_id: id, type: 'bookmarked' }, { onConflict: 'user_id,question_id,type' })
      );
    },

    isCompleted: (id: string) => get().completed.has(id),
    isBookmarked: (id: string) => get().bookmarked.has(id),
    completedCount: () => get().completed.size,
    bookmarkedCount: () => get().bookmarked.size,

    _mergeRemote: (remoteCompleted: string[], remoteBookmarked: string[], userId: string) => {
      const local = loadSets();
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
      if (toInsert.length > 0) {
        syncRemote(userId, (db) =>
          db.from('user_progress').upsert(toInsert, { onConflict: 'user_id,question_id,type' })
        );
      }

      saveSets(merged.completed, merged.bookmarked);
      set({ completed: merged.completed, bookmarked: merged.bookmarked, _synced: true });
    },
  };
});

/** Hook that syncs the store with Supabase on login and provides a convenient API. */
export function useProgress() {
  const { user } = useAuth();
  const store = useProgressStore();

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

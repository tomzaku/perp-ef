import { supabase } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Read/write JSON to localStorage under a given key.
 */
export function createLocalStorage<T>(key: string) {
  return {
    load(fallback: T): T {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw) as T;
      } catch {}
      return fallback;
    },
    save(data: T) {
      localStorage.setItem(key, JSON.stringify(data));
    },
  };
}

/**
 * Run a Supabase operation only when user is logged in and client is available.
 * Fire-and-forget — errors are silently ignored.
 */
export function syncRemote(
  userId: string | undefined,
  fn: (db: SupabaseClient, userId: string) => PromiseLike<unknown>,
) {
  if (userId && supabase) {
    fn(supabase, userId).then(() => {});
  }
}

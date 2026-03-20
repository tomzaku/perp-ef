import { useState, useCallback, useEffect } from 'react';
import type { QuestionNotes, NoteVersion } from '../types/question';
import { supabase } from '../lib/supabase';
import { createLocalStorage, syncRemote } from '../lib/persist';
import { useAuth } from './useAuth';

const storage = createLocalStorage<Record<string, QuestionNotes>>('fe-interview-notes');

export function useNotes() {
  const { user } = useAuth();
  const [allNotes, setAllNotes] = useState<Record<string, QuestionNotes>>(() => storage.load({}));

  // Load from Supabase when user logs in
  useEffect(() => {
    if (!user || !supabase) return;

    let cancelled = false;

    async function fetchNotes() {
      const { data, error } = await supabase!
        .from('user_notes')
        .select('id, question_id, content, created_at')
        .eq('user_id', user!.id);

      if (cancelled || error) return;

      // Build remote notes map
      const remote: Record<string, QuestionNotes> = {};
      data.forEach((row) => {
        if (!remote[row.question_id]) {
          remote[row.question_id] = { questionId: row.question_id, versions: [] };
        }
        remote[row.question_id].versions.push({
          id: row.id,
          content: row.content,
          createdAt: row.created_at,
        });
      });

      // Merge local + remote (dedupe by id)
      const local = storage.load({});
      const merged: Record<string, QuestionNotes> = { ...remote };

      for (const [qid, localNotes] of Object.entries(local)) {
        if (!merged[qid]) {
          merged[qid] = { questionId: qid, versions: [] };
        }
        const remoteIds = new Set(merged[qid].versions.map((v) => v.id));
        const toUpload: NoteVersion[] = [];

        for (const v of localNotes.versions) {
          if (!remoteIds.has(v.id)) {
            merged[qid].versions.push(v);
            toUpload.push(v);
          }
        }

        // Push local-only notes to Supabase
        if (toUpload.length > 0) {
          syncRemote(user!.id, (db, uid) =>
            db.from('user_notes').upsert(
              toUpload.map((v) => ({
                id: v.id,
                user_id: uid,
                question_id: qid,
                content: v.content,
                created_at: v.createdAt,
              }))
            )
          );
        }
      }

      // Sort versions by createdAt
      for (const qid of Object.keys(merged)) {
        merged[qid].versions.sort((a, b) => a.createdAt - b.createdAt);
      }

      setAllNotes(merged);
      storage.save(merged);
    }

    fetchNotes();
    return () => { cancelled = true; };
  }, [user]);

  const getNotes = useCallback(
    (questionId: string): NoteVersion[] => {
      return allNotes[questionId]?.versions || [];
    },
    [allNotes]
  );

  const addNote = useCallback((questionId: string, content: string) => {
    const newVersion: NoteVersion = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      content,
      createdAt: Date.now(),
    };

    setAllNotes((prev) => {
      const existing = prev[questionId] || { questionId, versions: [] };
      const updated = {
        ...prev,
        [questionId]: {
          questionId,
          versions: [...existing.versions, newVersion],
        },
      };
      storage.save(updated);
      return updated;
    });

    syncRemote(user?.id, (db, uid) =>
      db.from('user_notes').insert({
        id: newVersion.id,
        user_id: uid,
        question_id: questionId,
        content,
        created_at: newVersion.createdAt,
      })
    );
  }, [user]);

  const updateNote = useCallback((questionId: string, noteId: string, content: string) => {
    setAllNotes((prev) => {
      const existing = prev[questionId];
      if (!existing) return prev;
      const updated = {
        ...prev,
        [questionId]: {
          ...existing,
          versions: existing.versions.map((v) =>
            v.id === noteId ? { ...v, content } : v
          ),
        },
      };
      storage.save(updated);
      return updated;
    });

    syncRemote(user?.id, (db, uid) =>
      db.from('user_notes').update({ content }).eq('user_id', uid).eq('id', noteId)
    );
  }, [user]);

  const deleteNote = useCallback((questionId: string, noteId: string) => {
    setAllNotes((prev) => {
      const existing = prev[questionId];
      if (!existing) return prev;
      const updated = {
        ...prev,
        [questionId]: {
          ...existing,
          versions: existing.versions.filter((v) => v.id !== noteId),
        },
      };
      storage.save(updated);
      return updated;
    });

    syncRemote(user?.id, (db, uid) =>
      db.from('user_notes').delete().eq('user_id', uid).eq('id', noteId)
    );
  }, [user]);

  return { getNotes, addNote, updateNote, deleteNote };
}

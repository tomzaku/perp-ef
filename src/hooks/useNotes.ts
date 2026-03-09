import { useState, useCallback } from 'react';
import type { QuestionNotes, NoteVersion } from '../types/question';

const STORAGE_KEY = 'fe-interview-notes';

function loadAllNotes(): Record<string, QuestionNotes> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveAllNotes(notes: Record<string, QuestionNotes>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function useNotes() {
  const [allNotes, setAllNotes] = useState<Record<string, QuestionNotes>>(loadAllNotes);

  const getNotes = useCallback(
    (questionId: string): NoteVersion[] => {
      return allNotes[questionId]?.versions || [];
    },
    [allNotes]
  );

  const addNote = useCallback((questionId: string, content: string) => {
    setAllNotes((prev) => {
      const existing = prev[questionId] || { questionId, versions: [] };
      const newVersion: NoteVersion = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content,
        createdAt: Date.now(),
      };
      const updated = {
        ...prev,
        [questionId]: {
          questionId,
          versions: [...existing.versions, newVersion],
        },
      };
      saveAllNotes(updated);
      return updated;
    });
  }, []);

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
      saveAllNotes(updated);
      return updated;
    });
  }, []);

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
      saveAllNotes(updated);
      return updated;
    });
  }, []);

  return { getNotes, addNote, updateNote, deleteNote };
}

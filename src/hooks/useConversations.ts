import { useState, useCallback, useEffect } from 'react';
import type { SavedConversation, ConversationMessage } from '../types/question';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const STORAGE_KEY = 'fe-interview-conversations';

function loadLocal(): SavedConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveLocal(conversations: SavedConversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function useConversations(questionId: string) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SavedConversation[]>(() =>
    loadLocal().filter((c) => c.questionId === questionId)
  );
  const [allConversations, setAllConversations] = useState<SavedConversation[]>(loadLocal);

  // Load from Supabase when user logs in
  useEffect(() => {
    if (!user || !supabase) return;

    let cancelled = false;

    async function fetchConversations() {
      const { data, error } = await supabase!
        .from('interview_conversations')
        .select('id, question_id, title, messages, created_at, updated_at')
        .eq('user_id', user!.id);

      if (cancelled || error) return;

      const remote: SavedConversation[] = data.map((row) => ({
        id: row.id,
        questionId: row.question_id,
        title: row.title,
        messages: row.messages as ConversationMessage[],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      // Merge local + remote (dedupe by id, prefer newer updatedAt)
      const local = loadLocal();
      const mergedMap = new Map<string, SavedConversation>();

      for (const c of remote) mergedMap.set(c.id, c);

      const toUpload: SavedConversation[] = [];
      for (const c of local) {
        const existing = mergedMap.get(c.id);
        if (!existing) {
          mergedMap.set(c.id, c);
          toUpload.push(c);
        } else if (c.updatedAt > existing.updatedAt) {
          mergedMap.set(c.id, c);
        }
      }

      // Push local-only conversations to Supabase
      if (toUpload.length > 0) {
        await supabase!.from('interview_conversations').upsert(
          toUpload.map((c) => ({
            id: c.id,
            user_id: user!.id,
            question_id: c.questionId,
            title: c.title,
            messages: c.messages,
            created_at: c.createdAt,
            updated_at: c.updatedAt,
          }))
        );
      }

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => b.updatedAt - a.updatedAt
      );

      setAllConversations(merged);
      setConversations(merged.filter((c) => c.questionId === questionId));
      saveLocal(merged);
    }

    fetchConversations();
    return () => { cancelled = true; };
  }, [user, questionId]);

  const saveConversation = useCallback(
    (messages: ConversationMessage[], title?: string) => {
      const now = Date.now();
      const newConv: SavedConversation = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        questionId,
        title: title || `Session ${new Date(now).toLocaleDateString()} ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        messages,
        createdAt: now,
        updatedAt: now,
      };

      setAllConversations((prev) => {
        const updated = [newConv, ...prev];
        saveLocal(updated);
        return updated;
      });
      setConversations((prev) => [newConv, ...prev]);

      // Sync to Supabase
      if (user && supabase) {
        supabase
          .from('interview_conversations')
          .insert({
            id: newConv.id,
            user_id: user.id,
            question_id: questionId,
            title: newConv.title,
            messages: newConv.messages,
            created_at: newConv.createdAt,
            updated_at: newConv.updatedAt,
          })
          .then(() => {});
      }

      return newConv;
    },
    [questionId, user]
  );

  const updateConversation = useCallback(
    (id: string, messages: ConversationMessage[]) => {
      const now = Date.now();

      const update = (list: SavedConversation[]) =>
        list.map((c) =>
          c.id === id ? { ...c, messages, updatedAt: now } : c
        );

      setAllConversations((prev) => {
        const updated = update(prev);
        saveLocal(updated);
        return updated;
      });
      setConversations((prev) => update(prev));

      if (user && supabase) {
        supabase
          .from('interview_conversations')
          .update({ messages, updated_at: now })
          .eq('user_id', user.id)
          .eq('id', id)
          .then(() => {});
      }
    },
    [user]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      const remove = (list: SavedConversation[]) =>
        list.filter((c) => c.id !== id);

      setAllConversations((prev) => {
        const updated = remove(prev);
        saveLocal(updated);
        return updated;
      });
      setConversations((prev) => remove(prev));

      if (user && supabase) {
        supabase
          .from('interview_conversations')
          .delete()
          .eq('user_id', user.id)
          .eq('id', id)
          .then(() => {});
      }
    },
    [user]
  );

  return {
    conversations,
    saveConversation,
    updateConversation,
    deleteConversation,
  };
}

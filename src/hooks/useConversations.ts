import { useState, useCallback, useEffect } from 'react';
import type { SavedConversation, ConversationMessage } from '../types/question';
import { supabase } from '../lib/supabase';
import { createLocalStorage, syncRemote } from '../lib/persist';
import { useAuth } from './useAuth';

const storage = createLocalStorage<SavedConversation[]>('fe-interview-conversations');

export function useConversations(questionId: string) {
  const { user } = useAuth();
  const [, setAllConversations] = useState<SavedConversation[]>(() => storage.load([]));
  const [conversations, setConversations] = useState<SavedConversation[]>(() =>
    storage.load([]).filter((c) => c.questionId === questionId)
  );

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
      const local = storage.load([]);
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
        syncRemote(user!.id, (db, uid) =>
          db.from('interview_conversations').upsert(
            toUpload.map((c) => ({
              id: c.id,
              user_id: uid,
              question_id: c.questionId,
              title: c.title,
              messages: c.messages,
              created_at: c.createdAt,
              updated_at: c.updatedAt,
            }))
          )
        );
      }

      const merged = Array.from(mergedMap.values()).sort(
        (a, b) => b.updatedAt - a.updatedAt
      );

      setAllConversations(merged);
      setConversations(merged.filter((c) => c.questionId === questionId));
      storage.save(merged);
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
        storage.save(updated);
        return updated;
      });
      setConversations((prev) => [newConv, ...prev]);

      syncRemote(user?.id, (db, uid) =>
        db.from('interview_conversations').insert({
          id: newConv.id,
          user_id: uid,
          question_id: questionId,
          title: newConv.title,
          messages: newConv.messages,
          created_at: newConv.createdAt,
          updated_at: newConv.updatedAt,
        })
      );

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
        storage.save(updated);
        return updated;
      });
      setConversations((prev) => update(prev));

      syncRemote(user?.id, (db, uid) =>
        db.from('interview_conversations').update({ messages, updated_at: now }).eq('user_id', uid).eq('id', id)
      );
    },
    [user]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      const remove = (list: SavedConversation[]) =>
        list.filter((c) => c.id !== id);

      setAllConversations((prev) => {
        const updated = remove(prev);
        storage.save(updated);
        return updated;
      });
      setConversations((prev) => remove(prev));

      syncRemote(user?.id, (db, uid) =>
        db.from('interview_conversations').delete().eq('user_id', uid).eq('id', id)
      );
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

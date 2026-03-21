import { useState, useCallback } from 'react';
import type { ConversationMessage } from '../types/question';
import { createLocalStorage } from '../lib/persist';
import type { TopicId, PracticeMode } from './useEnglishChat';

export interface EnglishConversation {
  id: string;
  topicId: TopicId;
  mode: PracticeMode;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
}

const storage = createLocalStorage<EnglishConversation[]>('english-practice-conversations');

export function useEnglishConversations() {
  const [conversations, setConversations] = useState<EnglishConversation[]>(() => storage.load([]));

  const saveConversation = useCallback(
    (topicId: TopicId, mode: PracticeMode, messages: ConversationMessage[], title?: string) => {
      const now = Date.now();
      const newConv: EnglishConversation = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        topicId,
        mode,
        title: title || `Session ${new Date(now).toLocaleDateString()} ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        messages,
        createdAt: now,
        updatedAt: now,
      };

      setConversations((prev) => {
        const updated = [newConv, ...prev];
        storage.save(updated);
        return updated;
      });

      return newConv;
    },
    []
  );

  const updateConversation = useCallback(
    (id: string, messages: ConversationMessage[]) => {
      const now = Date.now();
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, messages, updatedAt: now } : c
        );
        storage.save(updated);
        return updated;
      });
    },
    []
  );

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      storage.save(updated);
      return updated;
    });
  }, []);

  return {
    conversations,
    saveConversation,
    updateConversation,
    deleteConversation,
  };
}

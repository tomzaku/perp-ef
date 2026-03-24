import { useState, useCallback, useRef } from 'react';
import type { Question } from '../types/question';
import { callAI, getCurrentApiKey, getApiKeyForProvider, setApiKeyForProvider, getProvider, getProviderConfig } from '../lib/aiProviders';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Legacy exports — kept for compatibility with components that import these
export function getApiKey(): string {
  return getCurrentApiKey();
}

export function setApiKey(key: string): void {
  setApiKeyForProvider(getProvider(), key);
}

/** Check if the currently selected provider has an API key set */
export function hasCurrentApiKey(): boolean {
  return !!getApiKeyForProvider(getProvider());
}

function buildSystemPrompt(question: Question): string {
  return `You are a senior software engineer conducting a technical interview at a top tech company (Google/Meta level). You're interviewing a candidate on the following problem:

**${question.title}** (${question.difficulty})
Category: ${question.category} / ${question.subcategory}
Pattern: ${question.pattern}

Problem:
${question.description}

${question.examples?.map((ex, i) => `Example ${i + 1}: Input: ${ex.input} → Output: ${ex.output}`).join('\n') || ''}

Optimal complexity: Time ${question.timeComplexity}, Space ${question.spaceComplexity}

You know the optimal solution uses: ${question.pattern}

Rules:
- Start by briefly presenting the problem (don't just copy-paste — paraphrase naturally like a real interviewer)
- Let the candidate think and respond — don't give away the answer
- Ask clarifying questions if their approach is vague
- Push on edge cases: empty input, single element, duplicates, negative numbers, overflow, etc.
- If they're stuck, give small hints — not the full solution
- If they propose a brute force approach, acknowledge it then ask "Can we do better?"
- Evaluate their communication: are they thinking out loud? explaining trade-offs?
- Be encouraging but rigorous — like a real interviewer
- Keep responses concise (2-4 sentences typically). Don't write essays.
- Use code formatting when discussing code
- After they provide a working solution, ask about time/space complexity
- At the end, give brief feedback on what went well and what to improve`;
}

export function useAIChat(question: Question) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!getCurrentApiKey()) {
      const provider = getProviderConfig();
      setError(`Please set your ${provider.label} API key first.`);
      return;
    }

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const assistantMessage = await callAI({
        system: buildSystemPrompt(question),
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        maxTokens: 1024,
        signal: abortRef.current.signal,
      });

      setMessages([
        ...newMessages,
        { role: 'assistant', content: assistantMessage },
      ]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, question]);

  const startInterview = useCallback(async () => {
    if (!getCurrentApiKey()) {
      const provider = getProviderConfig();
      setError(`Please set your ${provider.label} API key first.`);
      return;
    }

    setMessages([]);
    setIsLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const assistantMessage = await callAI({
        system: buildSystemPrompt(question),
        messages: [
          {
            role: 'user',
            content: 'Start the interview. Present the problem to me as if we just sat down together.',
          },
        ],
        maxTokens: 1024,
        signal: abortRef.current.signal,
      });

      setMessages([{ role: 'assistant', content: assistantMessage }]);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [question]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    setError(null);
  }, []);

  return { messages, isLoading, error, sendMessage, startInterview, abort, reset, setMessages };
}

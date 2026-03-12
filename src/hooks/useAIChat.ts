import { useState, useCallback, useRef } from 'react';
import type { Question } from '../types/question';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'fe-interview-api-key';

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
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
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please set your Anthropic API key first.');
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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: buildSystemPrompt(question),
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.error?.message || `API error: ${response.status}`,
        );
      }

      const data = await response.json();
      const assistantMessage =
        data.content?.[0]?.text || 'No response received.';

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
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please set your Anthropic API key first.');
      return;
    }

    setMessages([]);
    setIsLoading(true);
    setError(null);

    abortRef.current = new AbortController();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: buildSystemPrompt(question),
          messages: [
            {
              role: 'user',
              content:
                'Start the interview. Present the problem to me as if we just sat down together.',
            },
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(
          errData?.error?.message || `API error: ${response.status}`,
        );
      }

      const data = await response.json();
      const assistantMessage =
        data.content?.[0]?.text || 'No response received.';

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

  return { messages, isLoading, error, sendMessage, startInterview, abort, reset };
}

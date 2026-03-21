import { useState, useCallback, useRef } from 'react';
import { getApiKey } from './useAIChat';
import { extractLearnings } from './useLearnings';
import type { Learning } from './useLearnings';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type PracticeMode = 'smooth' | 'feedback';

export const ENGLISH_TOPICS = [
  { id: 'daily-life', label: 'Daily Life', desc: 'Routines, habits, hobbies' },
  { id: 'travel', label: 'Travel', desc: 'Trips, destinations, experiences' },
  { id: 'technology', label: 'Technology', desc: 'Tech trends, gadgets, apps' },
  { id: 'work', label: 'Work & Career', desc: 'Office life, goals, challenges' },
  { id: 'food', label: 'Food & Cooking', desc: 'Recipes, restaurants, cuisine' },
  { id: 'health', label: 'Health & Fitness', desc: 'Exercise, wellness, habits' },
  { id: 'entertainment', label: 'Entertainment', desc: 'Movies, music, books, games' },
  { id: 'culture', label: 'Culture & Society', desc: 'Traditions, news, opinions' },
  { id: 'education', label: 'Education', desc: 'Learning, school, skills' },
  { id: 'environment', label: 'Environment', desc: 'Nature, climate, sustainability' },
  { id: 'random', label: 'Random', desc: 'Surprise me with anything!' },
] as const;

export type TopicId = (typeof ENGLISH_TOPICS)[number]['id'];

const LEARNINGS_BLOCK_INSTRUCTION = `

IMPORTANT — at the very end of EVERY response (after your conversational text), append a structured data block with any corrections or tips. Use this exact format:

~~~learnings
[
  {"category": "grammar", "original": "what the user said", "corrected": "the corrected version", "explanation": "why"},
  {"category": "vocabulary", "original": "word used", "corrected": "better alternative", "explanation": "why it's more natural"},
  {"category": "rephrase", "original": "user's sentence", "corrected": "more native phrasing", "explanation": "why this sounds more natural"},
  {"category": "tip", "original": "", "corrected": "the tip or idiom", "explanation": "when to use it"}
]
~~~

Rules for the block:
- Include ALL applicable categories — omit any that don't apply
- If there are no corrections or tips, output an empty array: ~~~learnings\\n[]\\n~~~
- The block is hidden from the user — they only see the conversational text above it
- Always include the block, even if the array is empty

IMPORTANT — this is SPEAKING practice, not writing practice:
- Do NOT correct capitalization, punctuation, or formatting — the user is speaking, not typing
- Focus on grammar structure, word choice, natural phrasing, and pronunciation-related issues
- Corrections should reflect how native speakers actually talk in casual conversation
- "i went to the store" is perfectly fine in speech — do not flag missing capitalization
- Contractions like "gonna", "wanna", "gotta" are natural in spoken English — don't correct them unless the context is formal`;

function buildSystemPrompt(topicId: TopicId, mode: PracticeMode): string {
  const topicLabel = ENGLISH_TOPICS.find((t) => t.id === topicId)?.label || topicId;

  if (mode === 'smooth') {
    return `You are a friendly English conversation partner helping someone practice their English speaking skills. The topic is: "${topicLabel}".

Rules:
- Ask one question at a time — keep it conversational and natural
- ${topicId === 'random' ? 'Pick a random interesting topic for each question — surprise the user with variety' : `Stay on the topic of "${topicLabel}" but explore different angles`}
- After the user responds, briefly acknowledge their answer (1 sentence), then ask a follow-up or new question
- Do NOT correct grammar or vocabulary in your conversational text — just keep it flowing naturally
- Keep your responses concise — 2-4 sentences max
- Use natural, everyday English — not overly formal
- Occasionally introduce useful vocabulary or idioms related to the topic
- If the user seems stuck, offer hints or rephrase the question more simply
- Be warm, patient, and encouraging — this is practice, not a test
- Do NOT use bullet points or lists — keep it conversational like a real chat
- Remember: this is SPEAKING practice — ignore capitalization and punctuation issues, focus on how things sound
${LEARNINGS_BLOCK_INSTRUCTION}`;
  }

  // feedback mode
  return `You are a friendly English conversation partner helping someone practice their English speaking skills. The topic is: "${topicLabel}".

Rules:
- Ask one question at a time — keep it conversational and natural
- ${topicId === 'random' ? 'Pick a random interesting topic for each question — surprise the user with variety' : `Stay on the topic of "${topicLabel}" but explore different angles`}
- After the user responds, briefly acknowledge their answer (1 sentence)
- Then provide detailed feedback on their English. Use this EXACT format for each issue you find:

  📝 **Grammar:** You said "_original_" → "_corrected_". (explanation of the rule)
  📖 **Vocabulary:** "_word/phrase used_" → "_better alternative_". (why it's more natural)
  🔄 **Rephrase:** A more native way to say "_original sentence_" would be: "_rephrased version_"
  💡 **Tip:** (any useful idiom, collocation, or pattern related to what they said)

  Include ALL applicable categories — skip any that don't apply. Be thorough but encouraging.
- After the feedback, ask a follow-up question or a new question on the topic
- Keep your conversational part concise — 2-3 sentences (feedback is separate)
- Be warm and encouraging — frame corrections as "here's how to sound even more natural" not "you made a mistake"
- Remember: this is SPEAKING practice — ignore capitalization and punctuation issues, focus on how things sound
${LEARNINGS_BLOCK_INSTRUCTION}`;
}

function buildSummaryPrompt(): string {
  return `You are an English language coach. The user will provide a conversation they had during English practice. Analyze ALL of the user's messages and provide a detailed summary.

Format your response like this:

## Grammar Issues

For each grammar mistake:
- **What you said:** "the exact quote"
- **Corrected:** "the corrected version"
- **Rule:** brief explanation of the grammar rule

## Vocabulary & Phrasing

For unnatural or non-native phrasing:
- **What you said:** "the phrase"
- **More natural:** "the native-sounding alternative"
- **Why:** why the alternative sounds more natural

## Native Speaker Tips

3-5 specific tips to sound more natural based on patterns you noticed in their messages. Include useful idioms, collocations, or sentence patterns they could use.

## Recurring Patterns

Summarize the 2-3 most common patterns (e.g. "You tend to miss articles before nouns", "You often use simple present when past tense is needed").

## What You Did Well

Mention 2-3 things the user did well to keep them motivated.

Be thorough — catch every mistake, even small ones. Be encouraging but honest.
${LEARNINGS_BLOCK_INSTRUCTION}`;
}

export function useEnglishChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<TopicId | null>(null);
  const [mode, setMode] = useState<PracticeMode | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const topicRef = useRef<TopicId | null>(null);
  const modeRef = useRef<PracticeMode | null>(null);
  // Callback to pass extracted learnings back to the component
  const onLearningsRef = useRef<((items: Omit<Learning, 'id' | 'createdAt'>[], conversationId?: string) => void) | null>(null);

  const setOnLearnings = useCallback((fn: ((items: Omit<Learning, 'id' | 'createdAt'>[], conversationId?: string) => void) | null) => {
    onLearningsRef.current = fn;
  }, []);

  /** Process raw AI text: strip ~~~learnings block, extract learnings, return display text */
  const processResponse = useCallback((rawText: string): string => {
    const { displayText, learnings } = extractLearnings(rawText);
    if (learnings.length > 0 && onLearningsRef.current) {
      onLearningsRef.current(learnings);
    }
    return displayText;
  }, []);

  const callApi = useCallback(async (msgs: { role: string; content: string }[], topic: TopicId, practiceMode: PracticeMode) => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please set your Anthropic API key first (Settings or Mock Interview).');
      return null;
    }

    abortRef.current = new AbortController();

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
        max_tokens: practiceMode === 'feedback' ? 1024 : 512,
        system: buildSystemPrompt(topic, practiceMode),
        messages: msgs.map((m) => ({ role: m.role, content: m.content })),
      }),
      signal: abortRef.current.signal,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || 'No response received.';
  }, []);

  const startConversation = useCallback(async (topicId: TopicId, practiceMode: PracticeMode) => {
    setMessages([]);
    setIsLoading(true);
    setError(null);
    setCurrentTopic(topicId);
    setMode(practiceMode);
    topicRef.current = topicId;
    modeRef.current = practiceMode;

    try {
      const rawText = await callApi(
        [{ role: 'user', content: 'Start the conversation. Greet me and ask me the first question.' }],
        topicId,
        practiceMode,
      );
      if (rawText) {
        const displayText = processResponse(rawText);
        setMessages([{ role: 'assistant', content: displayText }]);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [callApi, processResponse]);

  const sendMessage = useCallback(async (userMessage: string) => {
    const topic = topicRef.current;
    const practiceMode = modeRef.current;
    if (!topic || !practiceMode) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);

    try {
      const rawText = await callApi(newMessages, topic, practiceMode);
      if (rawText) {
        const displayText = processResponse(rawText);
        setMessages([...newMessages, { role: 'assistant', content: displayText }]);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, callApi, processResponse]);

  const summarizeMistakes = useCallback(async (conversationMessages: ChatMessage[]): Promise<string | null> => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Please set your Anthropic API key first.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    abortRef.current = new AbortController();

    try {
      const conversationText = conversationMessages
        .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n\n');

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
          max_tokens: 2048,
          system: buildSummaryPrompt(),
          messages: [{ role: 'user', content: `Here is my conversation:\n\n${conversationText}` }],
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text || null;
      if (rawText) {
        const displayText = processResponse(rawText);
        return displayText;
      }
      return null;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return null;
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [processResponse]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
    setError(null);
    setCurrentTopic(null);
    setMode(null);
    topicRef.current = null;
    modeRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    error,
    currentTopic,
    mode,
    sendMessage,
    startConversation,
    summarizeMistakes,
    reset,
    setMessages,
    setCurrentTopic,
    setMode,
    setOnLearnings,
  };
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LearningCategory = 'grammar' | 'vocabulary' | 'rephrase' | 'tip';

export interface Learning {
  id: string;
  category: LearningCategory;
  original: string;
  corrected: string;
  explanation: string;
  createdAt: number;
  conversationId?: string;
}

interface LearningsState {
  items: Learning[];
  addItems: (items: Omit<Learning, 'id' | 'createdAt'>[], conversationId?: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  clearByConversation: (conversationId: string) => void;
}

export const useLearnings = create<LearningsState>()(
  persist(
    (set) => ({
      items: [],
      addItems: (newItems, conversationId) =>
        set((s) => ({
          items: [
            ...newItems.map((item) => ({
              ...item,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              createdAt: Date.now(),
              conversationId,
            })),
            ...s.items,
          ],
        })),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
      clearByConversation: (conversationId) =>
        set((s) => ({ items: s.items.filter((i) => i.conversationId !== conversationId) })),
    }),
    {
      name: 'english-learnings',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// ─── JSON block extraction ──────────────────────────────────────────
// The AI appends a ~~~learnings JSON block at the end of its response.
// We parse it out and return structured data + the clean display text.

interface RawLearning {
  category?: string;
  original?: string;
  corrected?: string;
  explanation?: string;
}

const BLOCK_REGEX = /\n*~~~learnings\n([\s\S]*?)\n~~~/;
const VALID_CATEGORIES = new Set<LearningCategory>(['grammar', 'vocabulary', 'rephrase', 'tip']);

/**
 * Extract the ~~~learnings JSON block from AI text.
 * Returns { displayText, learnings } where displayText has the block stripped.
 */
export function extractLearnings(text: string): {
  displayText: string;
  learnings: Omit<Learning, 'id' | 'createdAt'>[];
} {
  const match = BLOCK_REGEX.exec(text);
  if (!match) {
    return { displayText: text, learnings: [] };
  }

  const displayText = text.replace(BLOCK_REGEX, '').trimEnd();
  const learnings: Omit<Learning, 'id' | 'createdAt'>[] = [];

  try {
    const parsed = JSON.parse(match[1]);
    const items: RawLearning[] = Array.isArray(parsed) ? parsed : [];

    for (const item of items) {
      const category = item.category as LearningCategory;
      if (!VALID_CATEGORIES.has(category)) continue;

      learnings.push({
        category,
        original: item.original?.trim() || '',
        corrected: item.corrected?.trim() || '',
        explanation: item.explanation?.trim() || '',
      });
    }
  } catch {
    // JSON parse failed — return text as-is, no learnings
  }

  return { displayText, learnings };
}

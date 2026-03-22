import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const DEFAULT_TAGS = ['failed', 'success', '15 mins', '30 mins', '1 hour', 'must try again'];

interface TagsState {
  tagNames: string[];
  questionTags: Record<string, string[]>;

  createTag: (name: string) => void;
  deleteTag: (name: string) => void;
  renameTag: (oldName: string, newName: string) => void;

  addTag: (questionId: string, tag: string) => void;
  removeTag: (questionId: string, tag: string) => void;
  toggleTag: (questionId: string, tag: string) => void;

  getTags: (questionId: string) => string[];
  getQuestionsByTag: (tag: string) => string[];
}

export const useTags = create<TagsState>()(
  persist(
    (set, get) => ({
      tagNames: DEFAULT_TAGS,
      questionTags: {},

      createTag: (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const { tagNames } = get();
        if (tagNames.includes(trimmed)) return;
        set({ tagNames: [...tagNames, trimmed] });
      },

      deleteTag: (name: string) => {
        const { tagNames, questionTags } = get();
        const next: Record<string, string[]> = {};
        for (const [qid, tags] of Object.entries(questionTags)) {
          const filtered = tags.filter((t) => t !== name);
          if (filtered.length > 0) next[qid] = filtered;
        }
        set({
          tagNames: tagNames.filter((t) => t !== name),
          questionTags: next,
        });
      },

      renameTag: (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed || oldName === trimmed) return;
        const { tagNames, questionTags } = get();
        if (tagNames.includes(trimmed)) return;
        const next: Record<string, string[]> = {};
        for (const [qid, tags] of Object.entries(questionTags)) {
          next[qid] = tags.map((t) => (t === oldName ? trimmed : t));
        }
        set({
          tagNames: tagNames.map((t) => (t === oldName ? trimmed : t)),
          questionTags: next,
        });
      },

      addTag: (questionId: string, tag: string) => {
        const { questionTags } = get();
        const current = questionTags[questionId] || [];
        if (current.includes(tag)) return;
        set({
          questionTags: { ...questionTags, [questionId]: [...current, tag] },
        });
      },

      removeTag: (questionId: string, tag: string) => {
        const { questionTags } = get();
        const current = questionTags[questionId] || [];
        const filtered = current.filter((t) => t !== tag);
        const next = { ...questionTags };
        if (filtered.length > 0) {
          next[questionId] = filtered;
        } else {
          delete next[questionId];
        }
        set({ questionTags: next });
      },

      toggleTag: (questionId: string, tag: string) => {
        const { questionTags } = get();
        const current = questionTags[questionId] || [];
        if (current.includes(tag)) {
          get().removeTag(questionId, tag);
        } else {
          get().addTag(questionId, tag);
        }
      },

      getTags: (questionId: string) => get().questionTags[questionId] || [],

      getQuestionsByTag: (tag: string) => {
        const { questionTags } = get();
        return Object.entries(questionTags)
          .filter(([, tags]) => tags.includes(tag))
          .map(([qid]) => qid);
      },
    }),
    {
      name: 'fe-interview-tags',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

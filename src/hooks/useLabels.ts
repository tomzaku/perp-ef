import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface LabelsState {
  /** All user-defined label names (ordered) */
  labelNames: string[];
  /** Map of questionId → set of label names */
  questionLabels: Record<string, string[]>;

  // Label management
  createLabel: (name: string) => void;
  deleteLabel: (name: string) => void;
  renameLabel: (oldName: string, newName: string) => void;

  // Question-label assignment
  addLabel: (questionId: string, label: string) => void;
  removeLabel: (questionId: string, label: string) => void;
  toggleLabel: (questionId: string, label: string) => void;

  // Queries
  getLabels: (questionId: string) => string[];
  getQuestionsByLabel: (label: string) => string[];
}

export const useLabels = create<LabelsState>()(
  persist(
    (set, get) => ({
      labelNames: [],
      questionLabels: {},

      createLabel: (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const { labelNames } = get();
        if (labelNames.includes(trimmed)) return;
        set({ labelNames: [...labelNames, trimmed] });
      },

      deleteLabel: (name: string) => {
        const { labelNames, questionLabels } = get();
        const next: Record<string, string[]> = {};
        for (const [qid, labels] of Object.entries(questionLabels)) {
          const filtered = labels.filter((l) => l !== name);
          if (filtered.length > 0) next[qid] = filtered;
        }
        set({
          labelNames: labelNames.filter((l) => l !== name),
          questionLabels: next,
        });
      },

      renameLabel: (oldName: string, newName: string) => {
        const trimmed = newName.trim();
        if (!trimmed || oldName === trimmed) return;
        const { labelNames, questionLabels } = get();
        if (labelNames.includes(trimmed)) return;
        const next: Record<string, string[]> = {};
        for (const [qid, labels] of Object.entries(questionLabels)) {
          next[qid] = labels.map((l) => (l === oldName ? trimmed : l));
        }
        set({
          labelNames: labelNames.map((l) => (l === oldName ? trimmed : l)),
          questionLabels: next,
        });
      },

      addLabel: (questionId: string, label: string) => {
        const { questionLabels } = get();
        const current = questionLabels[questionId] || [];
        if (current.includes(label)) return;
        set({
          questionLabels: { ...questionLabels, [questionId]: [...current, label] },
        });
      },

      removeLabel: (questionId: string, label: string) => {
        const { questionLabels } = get();
        const current = questionLabels[questionId] || [];
        const filtered = current.filter((l) => l !== label);
        const next = { ...questionLabels };
        if (filtered.length > 0) {
          next[questionId] = filtered;
        } else {
          delete next[questionId];
        }
        set({ questionLabels: next });
      },

      toggleLabel: (questionId: string, label: string) => {
        const { questionLabels } = get();
        const current = questionLabels[questionId] || [];
        if (current.includes(label)) {
          get().removeLabel(questionId, label);
        } else {
          get().addLabel(questionId, label);
        }
      },

      getLabels: (questionId: string) => get().questionLabels[questionId] || [],

      getQuestionsByLabel: (label: string) => {
        const { questionLabels } = get();
        return Object.entries(questionLabels)
          .filter(([, labels]) => labels.includes(label))
          .map(([qid]) => qid);
      },
    }),
    {
      name: 'fe-interview-labels',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

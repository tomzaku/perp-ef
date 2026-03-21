import { create } from 'zustand';

type FabPanel = 'none' | 'askChatGpt' | 'englishPractice' | 'recorder';

interface FabState {
  expanded: boolean;
  panel: FabPanel;
  /** Context for AskChatGpt — set by the page that renders it */
  chatGptContext: { title: string; description: string } | null;

  toggleExpanded: () => void;
  collapse: () => void;
  openPanel: (panel: FabPanel) => void;
  closePanel: () => void;
  setChatGptContext: (ctx: { title: string; description: string } | null) => void;
}

export const useFabStore = create<FabState>((set) => ({
  expanded: false,
  panel: 'none',
  chatGptContext: null,

  toggleExpanded: () => set((s) => ({ expanded: !s.expanded })),
  collapse: () => set({ expanded: false }),
  openPanel: (panel) => set({ panel, expanded: false }),
  closePanel: () => set({ panel: 'none' }),
  setChatGptContext: (ctx) => set({ chatGptContext: ctx }),
}));

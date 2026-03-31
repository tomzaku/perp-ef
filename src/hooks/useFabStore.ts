import { create } from 'zustand';

type FabPanel = 'none' | 'askChatGpt' | 'englishPractice' | 'recorder' | 'readAloud';

interface FabState {
  expanded: boolean;
  panel: FabPanel;
  timerOpen: boolean;
  /** Context for AskChatGpt — set by the page that renders it */
  chatGptContext: { title: string; description: string } | null;

  expand: () => void;
  toggleExpanded: () => void;
  collapse: () => void;
  openPanel: (panel: FabPanel) => void;
  closePanel: () => void;
  toggleTimer: () => void;
  setChatGptContext: (ctx: { title: string; description: string } | null) => void;
}

export const useFabStore = create<FabState>((set) => ({
  expanded: false,
  panel: 'none',
  timerOpen: false,
  chatGptContext: null,

  expand: () => set({ expanded: true }),
  toggleExpanded: () => set((s) => ({ expanded: !s.expanded })),
  collapse: () => set({ expanded: false }),
  openPanel: (panel) => set({ panel, expanded: false }),
  closePanel: () => set({ panel: 'none' }),
  toggleTimer: () => set((s) => ({ timerOpen: !s.timerOpen, expanded: false })),
  setChatGptContext: (ctx) => set({ chatGptContext: ctx }),
}));

import { useEffect, useRef } from 'react';
import { useFabStore } from '../hooks/useFabStore';

export function FabMenu() {
  const { expanded, panel, chatGptContext, toggleExpanded, collapse, openPanel } = useFabStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    if (!expanded) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        collapse();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [expanded, collapse]);

  // Hide FAB when a panel is open (except timer which is a small overlay)
  if (panel !== 'none' && panel !== 'timer') return null;

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2">
      {/* Expanded options */}
      {expanded && (
        <div className="flex flex-col items-end gap-2 animate-fade-in">
          {/* Timer */}
          <button
            onClick={() => openPanel('timer')}
            className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full shadow-lg border border-accent-yellow/30 bg-bg-card hover:bg-accent-yellow/10 transition-all cursor-pointer group"
          >
            <span className="text-sm font-medium text-text-primary group-hover:text-accent-yellow transition-colors whitespace-nowrap">
              Timer
            </span>
            <span className="w-9 h-9 rounded-full bg-accent-yellow/15 text-accent-yellow flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
          </button>

          {/* Recorder */}
          <button
            onClick={() => openPanel('recorder')}
            className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full shadow-lg border border-accent-red/30 bg-bg-card hover:bg-accent-red/10 transition-all cursor-pointer group"
          >
            <span className="text-sm font-medium text-text-primary group-hover:text-accent-red transition-colors whitespace-nowrap">
              Record
            </span>
            <span className="w-9 h-9 rounded-full bg-accent-red/15 text-accent-red flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
              </svg>
            </span>
          </button>

          {/* English Practice */}
          <button
            onClick={() => openPanel('englishPractice')}
            className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full shadow-lg border border-accent-green/30 bg-bg-card hover:bg-accent-green/10 transition-all cursor-pointer group"
          >
            <span className="text-sm font-medium text-text-primary group-hover:text-accent-green transition-colors whitespace-nowrap">
              Practice English
            </span>
            <span className="w-9 h-9 rounded-full bg-accent-green/15 text-accent-green flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </span>
          </button>

          {/* Ask ChatGPT — only show when context is available */}
          {chatGptContext && (
            <button
              onClick={() => openPanel('askChatGpt')}
              className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 rounded-full shadow-lg border border-accent-cyan/30 bg-bg-card hover:bg-accent-cyan/10 transition-all cursor-pointer group"
            >
              <span className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors whitespace-nowrap">
                Ask ChatGPT
              </span>
              <span className="w-9 h-9 rounded-full bg-accent-cyan/15 text-accent-cyan flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={toggleExpanded}
        className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 cursor-pointer flex items-center justify-center ${
          expanded
            ? 'bg-bg-tertiary text-text-primary border border-border rotate-45'
            : 'bg-accent-green text-bg-primary hover:bg-accent-green/90 hover:scale-105'
        }`}
        title="Quick actions"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

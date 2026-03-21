import { useState, useRef, useEffect } from 'react';
import { useFabStore } from '../hooks/useFabStore';

interface AskChatGptProps {
  title: string;
  description: string;
}

export function AskChatGpt({ title, description }: AskChatGptProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { panel, closePanel, setChatGptContext } = useFabStore();
  const open = panel === 'askChatGpt';

  // Register context so FabMenu knows this page supports "Ask ChatGPT"
  useEffect(() => {
    setChatGptContext({ title, description });
    return () => setChatGptContext(null);
  }, [title, description, setChatGptContext]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    const context = `Regarding "${title}":\n\n${description}\n\nMy question: ${query.trim()}`;
    const url = `https://chatgpt.com/?q=${encodeURIComponent(context)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setQuery('');
  };

  if (!open) return null;

  return (
    <div className="sticky -bottom-4 lg:-bottom-8 -mx-4 lg:-mx-8 mt-8 z-10">
      <div className="px-4 lg:px-8 py-3 bg-bg-primary/90 backdrop-blur-md border-t border-border animate-fade-in" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-end gap-3">
          <span className="text-xs font-display font-bold text-text-secondary uppercase tracking-wider shrink-0 hidden sm:block pb-2">
            Ask ChatGPT
          </span>
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              autoResize();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === 'Escape') closePanel();
            }}
            placeholder="Could you give me more example?"
            className="flex-1 px-3 py-2 rounded-lg text-sm bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/25 transition-colors resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!query.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Ask
          </button>
          <button
            onClick={closePanel}
            className="p-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded-lg hover:bg-bg-tertiary"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2L12 12M12 2L2 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';

interface AskChatGptProps {
  title: string;
  description: string;
}

export function AskChatGpt({ title, description }: AskChatGptProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!query.trim()) return;
    const context = `Regarding "${title}":\n\n${description}\n\nMy question: ${query.trim()}`;
    const url = `https://chatgpt.com/?q=${encodeURIComponent(context)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setQuery('');
  };

  return (
    <div className="sticky -bottom-4 lg:-bottom-8 -mx-4 lg:-mx-8 mt-8 z-10">
      {open ? (
        <div className="px-4 lg:px-8 py-3 bg-bg-primary/90 backdrop-blur-md border-t border-border animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-xs font-display font-bold text-text-secondary uppercase tracking-wider shrink-0 hidden sm:block">
              Ask ChatGPT
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
                if (e.key === 'Escape') setOpen(false);
              }}
              placeholder="Could you give me more example?"
              className="flex-1 px-3 py-2 rounded-lg text-sm bg-bg-card border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/25 transition-colors"
            />
            <button
              onClick={handleSubmit}
              disabled={!query.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-green/10 text-accent-green border border-accent-green/30 hover:bg-accent-green/20 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              Ask
            </button>
            <button
              onClick={() => setOpen(false)}
              className="p-2 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded-lg hover:bg-bg-tertiary"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M2 2L12 12M12 2L2 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end px-4 lg:px-8 pb-4 lg:pb-8">
          <button
            onClick={() => setOpen(true)}
            className="p-3 rounded-full shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer border bg-accent-green/10 text-accent-green border-accent-green/30 hover:bg-accent-green/20 hover:scale-105 animate-fade-in"
            title="Ask ChatGPT"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

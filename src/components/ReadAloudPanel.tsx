import { useState, useCallback, useRef, useEffect } from 'react';
import { useFabStore } from '../hooks/useFabStore';
import { speakWithKokoro, stopKokoroAudio } from '../lib/kokoroTts';
import { HoverSentence } from './HoverSentence';

const STORAGE_KEY = 'fe-prep-read-aloud-history';

interface HistoryItem {
  id: string;
  text: string;
  createdAt: number;
}

function loadHistory(): HistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

export function ReadAloudPanel() {
  const { panel, closePanel } = useFabStore();
  const open = panel === 'readAloud';

  const [text, setText] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [maximized, setMaximized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      stopKokoroAudio();
      setPlayingId(null);
    }
  }, [open]);

  const speak = useCallback((item: HistoryItem) => {
    stopKokoroAudio();
    setPlayingId(item.id);
    speakWithKokoro(item.text, {
      onEnd: () => setPlayingId(null),
    }).catch(() => setPlayingId(null));
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const item: HistoryItem = {
      id: Date.now().toString(),
      text: trimmed,
      createdAt: Date.now(),
    };

    const updated = [item, ...history];
    setHistory(updated);
    saveHistory(updated);
    setText('');

    // Auto-read
    speak(item);
  }, [text, history, speak]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const deleteItem = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveHistory(updated);
      return updated;
    });
    if (playingId === id) {
      stopKokoroAudio();
      setPlayingId(null);
    }
  }, [playingId]);

  const clearHistory = useCallback(() => {
    stopKokoroAudio();
    setPlayingId(null);
    setHistory([]);
    saveHistory([]);
  }, []);

  const stopPlaying = useCallback(() => {
    stopKokoroAudio();
    setPlayingId(null);
  }, []);

  if (!open) return null;

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ${
        maximized
          ? 'inset-4'
          : 'bottom-4 left-4 right-4 sm:left-auto sm:w-[420px] max-h-[85vh]'
      } bg-bg-primary border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-accent-purple/15 text-accent-purple flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          </span>
          <span className="text-sm font-display font-bold text-text-primary">Read Aloud</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMaximized((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
            title={maximized ? 'Minimize' : 'Maximize'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {maximized ? (
                <>
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              ) : (
                <>
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              )}
            </svg>
          </button>
          <button
            onClick={() => { stopKokoroAudio(); closePanel(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 py-3 border-b border-border bg-bg-card/30 shrink-0">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste a sentence to hear it..."
            rows={2}
            className="flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted resize-none focus:outline-none focus:border-accent-purple/50 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="self-end px-4 py-2 rounded-lg bg-accent-purple text-white text-sm font-medium hover:bg-accent-purple/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
          >
            Read
          </button>
        </div>
        <p className="text-xs text-text-muted mt-1.5">Press Enter to read. Shift+Enter for new line.</p>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-text-muted">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 mb-3">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <p className="text-sm font-medium">No sentences yet</p>
            <p className="text-xs mt-1">Type something above to get started</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/50">
              <span className="text-xs text-text-muted font-medium">History ({history.length})</span>
              <button
                onClick={clearHistory}
                className="text-xs text-text-muted hover:text-accent-red transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>
            <div className="divide-y divide-border/50">
              {history.map((item) => {
                const isPlaying = playingId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`group flex items-start gap-2 px-4 py-3 transition-colors ${
                      isPlaying ? 'bg-accent-purple/5' : 'hover:bg-bg-hover/50'
                    }`}
                  >
                    {/* Play/stop button */}
                    <button
                      onClick={() => isPlaying ? stopPlaying() : speak(item)}
                      className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-accent-purple/20 text-accent-purple'
                          : 'bg-bg-tertiary text-text-muted hover:text-accent-purple hover:bg-accent-purple/10'
                      }`}
                      title={isPlaying ? 'Stop' : 'Play'}
                    >
                      {isPlaying ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      )}
                    </button>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary leading-relaxed break-words">
                        <HoverSentence text={item.text} />
                      </p>
                      <span className="text-xs text-text-muted mt-1 block">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' · '}
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-text-muted opacity-0 group-hover:opacity-100 hover:text-accent-red hover:bg-accent-red/10 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

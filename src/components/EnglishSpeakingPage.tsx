import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { speakingQuestions, speakingTopics } from '../data/englishSpeaking';
import { ReadAloud } from './ReadAloud';
import { speakWithKokoro, stopKokoroAudio } from '../lib/kokoroTts';

/** Check if there is still a text selection in the document */
function hasSelection() {
  const sel = window.getSelection();
  return sel && sel.toString().trim().length >= 2;
}

/** Floating popup that appears on text selection to read it aloud */
function SelectionSpeaker({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const [popup, setPopup] = useState<{ x: number; y: number; text: string } | null>(null);
  const [state, setState] = useState<'idle' | 'done' | 'loading' | 'playing'>('idle');
  const mountedRef = useRef(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseUp = () => {
      requestAnimationFrame(() => {
        const sel = window.getSelection();
        const text = sel?.toString().trim();
        if (!text || text.length < 2) {
          if (state !== 'loading' && state !== 'playing') setPopup(null);
          return;
        }

        const range = sel!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setState('idle');
        setPopup({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top - containerRect.top - 8,
          text,
        });
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (popupRef.current?.contains(e.target as Node)) return;
      if (state !== 'loading' && state !== 'playing') {
        setPopup(null);
        setState('idle');
      }
    };

    container.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [containerRef, state]);

  const play = useCallback(async () => {
    if (!popup) return;
    stopKokoroAudio();
    setState('loading');
    try {
      await speakWithKokoro(popup.text, {
        onStart: () => { if (mountedRef.current) setState('playing'); },
        onEnd: () => {
          if (mountedRef.current) setState(hasSelection() ? 'done' : 'idle');
        },
      });
    } catch {
      if (mountedRef.current) setState(hasSelection() ? 'done' : 'idle');
    }
  }, [popup]);

  const stop = useCallback(() => {
    stopKokoroAudio();
    setState(hasSelection() ? 'done' : 'idle');
  }, []);

  if (!popup) return null;

  const isActive = state === 'loading' || state === 'playing';
  const isDone = state === 'done';

  return (
    <div
      ref={popupRef}
      className="absolute z-50 flex items-center rounded-lg shadow-lg border bg-bg-card border-border -translate-x-1/2 -translate-y-full"
      style={{ left: popup.x, top: popup.y }}
    >
      {/* Listen / Stop button */}
      <button
        onClick={isActive ? stop : play}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 transition-all cursor-pointer ${
          isActive ? 'text-accent-cyan' : isDone ? 'text-accent-green hover:text-accent-cyan' : 'text-text-secondary hover:text-accent-cyan'
        } ${isActive || isDone ? 'rounded-l-lg' : 'rounded-lg'}`}
      >
        {state === 'loading' ? (
          <svg width="12" height="12" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        ) : state === 'playing' ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="0" y="0" width="10" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
        <span className="text-xs font-medium">
          {state === 'playing' ? 'Stop' : state === 'loading' ? 'Loading...' : 'Listen'}
        </span>
      </button>

      {/* Repeat button — visible while playing or after done */}
      {(isActive || isDone) && (
        <button
          onClick={play}
          className="flex items-center gap-1 px-2 py-1.5 rounded-r-lg border-l border-border text-text-muted hover:text-accent-green transition-all cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span className="text-[11px] font-medium">Repeat</span>
        </button>
      )}
    </div>
  );
}

export function EnglishSpeakingPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      selectedTopic === 'all'
        ? speakingQuestions
        : speakingQuestions.filter((q) => q.topic === selectedTopic),
    [selectedTopic],
  );

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    speakingQuestions.forEach((q) => {
      map[q.topic] = (map[q.topic] || 0) + 1;
    });
    return map;
  }, []);

  return (
    <div className="max-w-3xl mx-auto relative" ref={contentRef}>
      <SelectionSpeaker containerRef={contentRef} />

      <h1 className="text-2xl font-display font-bold text-text-primary mb-1">
        English Speaking Practice
      </h1>
      <p className="text-sm text-text-muted mb-6">
        Common conversation questions with sample answers. Select any text to listen to it.
      </p>

      {/* Topic filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setSelectedTopic('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            selectedTopic === 'all'
              ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
              : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
          }`}
        >
          All <span className="ml-1 opacity-60">{speakingQuestions.length}</span>
        </button>
        {speakingTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              selectedTopic === topic
                ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            {topic} <span className="ml-1 opacity-60">{topicCounts[topic] || 0}</span>
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="rounded-lg border border-border bg-bg-card overflow-hidden transition-all"
            >
              {/* Question header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full text-left px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-bg-hover/50 transition-colors"
              >
                <span className="w-7 h-7 rounded-md bg-accent-green/15 text-accent-green flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  Q
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-text-primary leading-relaxed">
                    {q.question}
                  </p>
                  <span className="text-[11px] text-text-muted mt-1 block">{q.topic}</span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-text-muted shrink-0 mt-1 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border animate-fade-in">
                  {/* Sample answers */}
                  <div className="px-5 py-4 space-y-4">
                    {q.sampleAnswers.map((sa, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-accent-cyan">
                              Sample Answer
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted">
                              {sa.label}
                            </span>
                          </div>
                          <ReadAloud text={sa.answer} />
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                          {sa.answer}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Useful phrases */}
                  {q.usefulPhrases && q.usefulPhrases.length > 0 && (
                    <div className="px-5 py-3 bg-accent-yellow/5 border-t border-accent-yellow/10">
                      <p className="text-xs font-semibold text-accent-yellow mb-2">
                        Useful Phrases
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {q.usefulPhrases.map((phrase, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-full bg-accent-yellow/10 text-text-secondary border border-accent-yellow/15"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <p className="text-sm">No questions found for this topic.</p>
        </div>
      )}
    </div>
  );
}

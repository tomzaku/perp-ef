import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { speakingQuestions, speakingTopics } from '../data/englishSpeaking';
import { podcasts, podcastTopics } from '../data/englishPodcasts';
import { ieltsConversations, ieltsTopics, type IeltsConversation } from '../data/englishIelts';
import { ReadAloud } from './ReadAloud';
import { HoverSentence } from './HoverSentence';
import { speakWithKokoro, stopKokoroAudio, preloadKokoro } from '../lib/kokoroTts';
import { getTtsEngine } from '../hooks/useTtsSettings';

type Tab = 'conversation' | 'podcast' | 'ielts';

// Voice mapping for IELTS multi-speaker playback
// Examiner: British female (Emma - grade B-), Candidate: American male (Michael - grade C+)
const IELTS_VOICES: Record<string, { kokoro: string; piper: string }> = {
  examiner: { kokoro: 'bf_emma', piper: 'en_GB-cori-high' },
  candidate: { kokoro: 'am_michael', piper: 'en_US-hfc_male-medium' },
};

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

/* ─── Tab: Short Conversation ────────────────────────────────── */
function ConversationTab() {
  const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    <>
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

              {isExpanded && (
                <div className="border-t border-border animate-fade-in">
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
                          <HoverSentence text={sa.answer} />
                        </p>
                      </div>
                    ))}
                  </div>

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
    </>
  );
}

/* ─── Tab: Podcast ───────────────────────────────────────────── */
function PodcastTab() {
  const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      selectedTopic === 'all'
        ? podcasts
        : podcasts.filter((p) => p.topic === selectedTopic),
    [selectedTopic],
  );

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    podcasts.forEach((p) => {
      map[p.topic] = (map[p.topic] || 0) + 1;
    });
    return map;
  }, []);

  const levelColor = (level: string) => {
    switch (level) {
      case 'Intermediate': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      case 'Upper-Intermediate': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      case 'Advanced': return 'text-accent-red bg-accent-red/10 border-accent-red/20';
      default: return 'text-text-muted bg-bg-tertiary border-transparent';
    }
  };

  return (
    <>
      {/* Topic filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setSelectedTopic('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            selectedTopic === 'all'
              ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'
              : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
          }`}
        >
          All <span className="ml-1 opacity-60">{podcasts.length}</span>
        </button>
        {podcastTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              selectedTopic === topic
                ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'
                : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            {topic} <span className="ml-1 opacity-60">{topicCounts[topic] || 0}</span>
          </button>
        ))}
      </div>

      {/* Podcast cards */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const isExpanded = expandedId === p.id;
          return (
            <div
              key={p.id}
              className="rounded-lg border border-border bg-bg-card overflow-hidden transition-all"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : p.id)}
                className="w-full text-left px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-bg-hover/50 transition-colors"
              >
                <span className="w-7 h-7 rounded-md bg-accent-purple/15 text-accent-purple flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-text-primary leading-relaxed">
                    {p.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-text-muted">{p.topic}</span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {p.duration}
                    </span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${levelColor(p.level)}`}>
                      {p.level}
                    </span>
                  </div>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-text-muted shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border animate-fade-in">
                  {/* Description */}
                  <div className="px-5 py-3 bg-bg-tertiary/50">
                    <p className="text-xs text-text-secondary leading-relaxed">{p.description}</p>
                  </div>

                  {/* Play full script */}
                  <div className="px-5 py-3 flex items-center justify-between border-b border-border">
                    <span className="text-xs font-semibold text-accent-purple">Full Script</span>
                    <ReadAloud text={p.script} />
                  </div>

                  {/* Script text */}
                  <div className="px-5 py-4">
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                      <HoverSentence text={p.script} />
                    </p>
                  </div>

                  {/* Vocabulary */}
                  {p.vocabulary && p.vocabulary.length > 0 && (
                    <div className="px-5 py-3 bg-accent-cyan/5 border-t border-accent-cyan/10">
                      <p className="text-xs font-semibold text-accent-cyan mb-2">Key Vocabulary</p>
                      <div className="space-y-1.5">
                        {p.vocabulary.map((v, i) => (
                          <div key={i} className="flex items-baseline gap-2">
                            <span className="text-xs font-medium text-text-primary">{v.word}</span>
                            <span className="text-[11px] text-text-muted">— {v.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discussion questions */}
                  {p.discussionQuestions && p.discussionQuestions.length > 0 && (
                    <div className="px-5 py-3 bg-accent-yellow/5 border-t border-accent-yellow/10">
                      <p className="text-xs font-semibold text-accent-yellow mb-2">Discussion Questions</p>
                      <ul className="space-y-1">
                        {p.discussionQuestions.map((q, i) => (
                          <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                            <span className="text-accent-yellow/60 mt-0.5 shrink-0">{i + 1}.</span>
                            {q}
                          </li>
                        ))}
                      </ul>
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
          <p className="text-sm">No podcasts found for this topic.</p>
        </div>
      )}
    </>
  );
}

/** Read aloud button that uses a specific voice based on role */
function ReadAloudVoice({ text, role }: { text: string; role: 'examiner' | 'candidate' }) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopKokoroAudio();
    };
  }, []);

  useEffect(() => {
    stopKokoroAudio();
    setState('idle');
  }, [text]);

  const speak = useCallback(async () => {
    if (state === 'loading' || state === 'playing') {
      stopKokoroAudio();
      setState('idle');
      return;
    }
    setState('loading');
    const engine = getTtsEngine();
    const voice = engine === 'piper' ? IELTS_VOICES[role].piper : IELTS_VOICES[role].kokoro;
    try {
      await speakWithKokoro(text, {
        voice,
        onStart: () => { if (mountedRef.current) setState('playing'); },
        onEnd: () => { if (mountedRef.current) setState('idle'); },
      });
    } catch { /* ignore */ } finally {
      if (mountedRef.current) setState('idle');
    }
  }, [text, state, role]);

  const color = role === 'examiner' ? 'accent-orange' : 'accent-cyan';

  return (
    <button
      onClick={speak}
      className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
        state === 'playing'
          ? `bg-${color}/10 text-${color} border-${color}/20 hover:bg-${color}/20`
          : state === 'loading'
            ? `bg-${color}/5 text-${color}/60 border-${color}/10`
            : `bg-bg-tertiary text-text-muted border-border hover:text-${color} hover:border-${color}/30`
      }`}
      title={`${state === 'playing' ? 'Stop' : 'Listen'} (${role === 'examiner' ? 'Emma — British' : 'Michael — American'})`}
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
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      )}
    </button>
  );
}

/** Play all exchanges sequentially with different voices per role */
function PlayAllExchanges({ conversation }: { conversation: IeltsConversation }) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const mountedRef = useRef(true);
  const cancelledRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopKokoroAudio();
    };
  }, []);

  useEffect(() => {
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => preloadKokoro(), { timeout: 3000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(() => preloadKokoro(), 3000);
      return () => clearTimeout(id);
    }
  }, []);

  const playAll = useCallback(async () => {
    if (state === 'loading' || state === 'playing') {
      stopKokoroAudio();
      cancelledRef.current = true;
      setState('idle');
      setCurrentIndex(-1);
      return;
    }

    cancelledRef.current = false;
    setState('loading');

    const engine = getTtsEngine();
    const exchanges = conversation.exchanges;

    for (let i = 0; i < exchanges.length; i++) {
      if (cancelledRef.current || !mountedRef.current) break;

      const ex = exchanges[i];
      const voice = engine === 'piper'
        ? IELTS_VOICES[ex.role].piper
        : IELTS_VOICES[ex.role].kokoro;

      if (mountedRef.current) setCurrentIndex(i);

      await new Promise<void>((resolve) => {
        speakWithKokoro(ex.text, {
          voice,
          onStart: () => { if (mountedRef.current && i === 0) setState('playing'); },
          onEnd: () => resolve(),
        }).catch(() => resolve());
      });
    }

    if (mountedRef.current) {
      setState('idle');
      setCurrentIndex(-1);
    }
  }, [state, conversation]);

  return (
    <div className="flex items-center gap-2">
      {state === 'playing' && currentIndex >= 0 && (
        <span className="text-[10px] text-text-muted">
          {currentIndex + 1}/{conversation.exchanges.length}
        </span>
      )}
      <button
        onClick={playAll}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all cursor-pointer text-xs font-medium ${
          state === 'playing'
            ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
            : state === 'loading'
              ? 'bg-accent-cyan/5 text-accent-cyan/60 border-accent-cyan/10'
              : 'bg-bg-tertiary text-text-muted border-border hover:text-accent-cyan hover:border-accent-cyan/30'
        }`}
        title={state === 'playing' ? 'Stop conversation' : 'Play full conversation with different voices'}
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
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
        {state === 'playing' ? 'Stop' : state === 'loading' ? 'Loading...' : 'Play All'}
      </button>
    </div>
  );
}

/* ─── Tab: IELTS Long Conversation ───────────────────────────── */
function IeltsTab() {
  const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');
  const [selectedPart, setSelectedPart] = useState<string | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      ieltsConversations.filter((c) => {
        if (selectedTopic !== 'all' && c.topic !== selectedTopic) return false;
        if (selectedPart !== 'all' && c.part !== selectedPart) return false;
        return true;
      }),
    [selectedTopic, selectedPart],
  );

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    ieltsConversations.forEach((c) => {
      map[c.topic] = (map[c.topic] || 0) + 1;
    });
    return map;
  }, []);

  const partColor = (part: string) => {
    switch (part) {
      case 'Part 1': return 'text-accent-green bg-accent-green/10 border-accent-green/20';
      case 'Part 2': return 'text-accent-orange bg-accent-orange/10 border-accent-orange/20';
      case 'Part 3': return 'text-accent-red bg-accent-red/10 border-accent-red/20';
      default: return 'text-text-muted bg-bg-tertiary border-transparent';
    }
  };

  return (
    <>
      {/* Part filter */}
      <div className="flex gap-1.5 mb-3">
        {['all', 'Part 1', 'Part 2', 'Part 3'].map((part) => (
          <button
            key={part}
            onClick={() => setSelectedPart(part)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              selectedPart === part
                ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
                : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            {part === 'all' ? 'All Parts' : part}
          </button>
        ))}
      </div>

      {/* Topic filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setSelectedTopic('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            selectedTopic === 'all'
              ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
              : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
          }`}
        >
          All <span className="ml-1 opacity-60">{ieltsConversations.length}</span>
        </button>
        {ieltsTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              selectedTopic === topic
                ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
                : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            {topic} <span className="ml-1 opacity-60">{topicCounts[topic] || 0}</span>
          </button>
        ))}
      </div>

      {/* Conversation cards */}
      <div className="space-y-3">
        {filtered.map((c) => {
          const isExpanded = expandedId === c.id;
          return (
            <div
              key={c.id}
              className="rounded-lg border border-border bg-bg-card overflow-hidden transition-all"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                className="w-full text-left px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-bg-hover/50 transition-colors"
              >
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold shrink-0 mt-0.5 border ${partColor(c.part)}`}>
                  {c.part}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-text-primary leading-relaxed">
                    {c.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-text-muted">{c.topic}</span>
                    <span className="text-[10px] text-text-muted">·</span>
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {c.duration}
                    </span>
                  </div>
                </div>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className={`text-text-muted shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border animate-fade-in">
                  {/* Description + Play All */}
                  <div className="px-5 py-3 bg-bg-tertiary/50 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-secondary leading-relaxed">{c.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-accent-orange/30" />
                          <span className="text-[10px] text-text-muted">Examiner — Emma (British)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan/30" />
                          <span className="text-[10px] text-text-muted">Candidate — Michael (American)</span>
                        </div>
                      </div>
                    </div>
                    <PlayAllExchanges conversation={c} />
                  </div>

                  {/* Conversation exchanges */}
                  <div className="px-5 py-4 space-y-4">
                    {c.exchanges.map((ex, i) => (
                      <div key={i} className="flex gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          ex.role === 'examiner'
                            ? 'bg-accent-orange/15 text-accent-orange'
                            : 'bg-accent-cyan/15 text-accent-cyan'
                        }`}>
                          {ex.role === 'examiner' ? 'E' : 'C'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[10px] font-semibold block mb-1 ${
                            ex.role === 'examiner' ? 'text-accent-orange' : 'text-accent-cyan'
                          }`}>
                            {ex.role === 'examiner' ? 'Examiner' : 'Candidate'}
                          </span>
                          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                            <HoverSentence
                              text={ex.text}
                              voice={getTtsEngine() === 'piper' ? IELTS_VOICES[ex.role].piper : IELTS_VOICES[ex.role].kokoro}
                            />
                          </p>
                        </div>
                        <div className="shrink-0 mt-5">
                          <ReadAloudVoice text={ex.text} role={ex.role} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tips */}
                  {c.tips && c.tips.length > 0 && (
                    <div className="px-5 py-3 bg-accent-green/5 border-t border-accent-green/10">
                      <p className="text-xs font-semibold text-accent-green mb-2">Tips</p>
                      <ul className="space-y-1">
                        {c.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                            <span className="text-accent-green/60 mt-0.5 shrink-0">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key phrases */}
                  {c.keyPhrases && c.keyPhrases.length > 0 && (
                    <div className="px-5 py-3 bg-accent-yellow/5 border-t border-accent-yellow/10">
                      <p className="text-xs font-semibold text-accent-yellow mb-2">Key Phrases</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.keyPhrases.map((phrase, i) => (
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
          <p className="text-sm">No conversations found for this filter.</p>
        </div>
      )}
    </>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  {
    key: 'conversation',
    label: 'Short Conversation',
    color: 'accent-green',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    key: 'podcast',
    label: 'Podcast',
    color: 'accent-purple',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    ),
  },
  {
    key: 'ielts',
    label: 'IELTS Speaking',
    color: 'accent-cyan',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function EnglishSpeakingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('conversation');
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="max-w-3xl mx-auto relative" ref={contentRef}>
      <SelectionSpeaker containerRef={contentRef} />

      <h1 className="text-2xl font-display font-bold text-text-primary mb-1">
        English Speaking Practice
      </h1>
      <p className="text-sm text-text-muted mb-5">
        Practice speaking with conversations, podcasts, and IELTS exercises. Select any text to listen.
      </p>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg bg-bg-tertiary/50 border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeTab === tab.key
                ? `bg-bg-card text-${tab.color} shadow-sm border border-border`
                : 'text-text-muted hover:text-text-secondary border border-transparent'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'conversation' && <ConversationTab />}
      {activeTab === 'podcast' && <PodcastTab />}
      {activeTab === 'ielts' && <IeltsTab />}
    </div>
  );
}

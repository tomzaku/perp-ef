import { useState, useCallback, useEffect, useRef } from 'react';
import { speakWithKokoro, stopKokoroAudio, preloadKokoro } from '../lib/kokoroTts';

interface ReadAloudProps {
  text: string;
}

export function ReadAloud({ text }: ReadAloudProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const mountedRef = useRef(true);

  // Preload model when component first mounts
  useEffect(() => {
    const id = requestIdleCallback(() => preloadKokoro(), { timeout: 3000 });
    return () => cancelIdleCallback(id);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopKokoroAudio();
    };
  }, []);

  // Stop when text changes
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

    try {
      await speakWithKokoro(text, {
        onStart: () => {
          if (mountedRef.current) setState('playing');
        },
        onEnd: () => {
          if (mountedRef.current) setState('idle');
        },
      });
    } catch {
      // ignore
    } finally {
      if (mountedRef.current) setState('idle');
    }
  }, [text, state]);

  return (
    <button
      onClick={speak}
      className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
        state === 'playing'
          ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/20'
          : state === 'loading'
            ? 'bg-accent-cyan/5 text-accent-cyan/60 border-accent-cyan/10'
            : 'bg-bg-tertiary text-text-muted border-border hover:text-accent-cyan hover:border-accent-cyan/30'
      }`}
      title={state === 'playing' ? 'Stop reading' : state === 'loading' ? 'Generating audio...' : 'Read aloud'}
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

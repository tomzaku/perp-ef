import { useState, useCallback, useRef, useEffect } from 'react';
import { speakWithKokoro, stopKokoroAudio } from '../lib/kokoroTts';
import { getHoverRepeat } from '../hooks/useTtsSettings';

/**
 * Split text into sentences. Keeps delimiters attached.
 */
function splitSentences(text: string): string[] {
  const raw = text.match(/[^.!?]*[.!?]+[\s]?|[^.!?]+$/g);
  if (!raw) return text.trim() ? [text] : [];
  return raw.map((s) => s.trim()).filter(Boolean);
}

interface HoverSentenceProps {
  /** The full text to render with hoverable sentences */
  text: string;
  className?: string;
  /** Optional voice override (e.g. for IELTS roles) */
  voice?: string;
}

const idle =
  'hover:bg-accent-cyan/10 hover:underline hover:decoration-accent-cyan/30 hover:decoration-dotted hover:underline-offset-4';
const idleHoverRepeat =
  'hover:bg-accent-cyan/15 hover:text-accent-cyan hover:underline hover:decoration-accent-cyan/40 hover:decoration-dotted hover:underline-offset-4';
const playing = 'bg-accent-cyan/20 text-accent-cyan underline decoration-accent-cyan/40 decoration-dotted underline-offset-4';
const loading = 'bg-accent-cyan/10 text-accent-cyan/70 underline decoration-accent-cyan/30 decoration-dotted underline-offset-4';

/**
 * Renders text split into sentences.
 * - Click always reads the sentence aloud.
 * - Hover reads aloud only when hover-to-repeat setting is enabled.
 */
export function HoverSentence({ text, className = '', voice }: HoverSentenceProps) {
  const [activeSentence, setActiveSentence] = useState<number | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const mountedRef = useRef(true);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopKokoroAudio();
    };
  }, []);

  const speak = useCallback((sentence: string, index: number) => {
    stopKokoroAudio();
    setActiveSentence(index);
    setState('loading');

    speakWithKokoro(sentence, {
      ...(voice ? { voice } : {}),
      onStart: () => { if (mountedRef.current) setState('playing'); },
      onEnd: () => {
        if (mountedRef.current) {
          setState('idle');
          setActiveSentence(null);
        }
      },
    }).catch(() => {
      if (mountedRef.current) {
        setState('idle');
        setActiveSentence(null);
      }
    });
  }, [voice]);

  const handleMouseEnter = useCallback((sentence: string, index: number) => {
    if (!getHoverRepeat()) return;
    hoverTimerRef.current = setTimeout(() => {
      speak(sentence, index);
    }, 300);
  }, [speak]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const handleClick = useCallback((sentence: string, index: number) => {
    if (activeSentence === index && (state === 'loading' || state === 'playing')) {
      stopKokoroAudio();
      setState('idle');
      setActiveSentence(null);
    } else {
      speak(sentence, index);
    }
  }, [activeSentence, state, speak]);

  const sentences = splitSentences(text);
  const hoverEnabled = getHoverRepeat();

  const sentenceClass = (isActive: boolean, isPlaying: boolean, isLoading: boolean) =>
    `cursor-pointer rounded-sm px-0.5 -mx-0.5 transition-all duration-150 ${
      isPlaying ? playing :
      isLoading ? loading :
      !isActive ? (hoverEnabled ? idleHoverRepeat : idle) : ''
    }`;

  if (sentences.length <= 1) {
    const isActive = activeSentence === 0;

    return (
      <span
        className={`${className} ${sentenceClass(isActive, isActive && state === 'playing', isActive && state === 'loading')}`}
        onMouseEnter={() => sentences[0] && handleMouseEnter(sentences[0], 0)}
        onMouseLeave={handleMouseLeave}
        onClick={() => sentences[0] && handleClick(sentences[0], 0)}
      >
        {text}
      </span>
    );
  }

  return (
    <span className={className}>
      {sentences.map((sentence, i) => {
        const isActive = activeSentence === i;

        return (
          <span
            key={i}
            onMouseEnter={() => handleMouseEnter(sentence, i)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(sentence, i)}
            className={sentenceClass(isActive, isActive && state === 'playing', isActive && state === 'loading')}
          >
            {sentence}{i < sentences.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </span>
  );
}

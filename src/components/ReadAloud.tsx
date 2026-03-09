import { useState, useCallback, useEffect, useRef } from 'react';

interface ReadAloudProps {
  text: string;
}

export function ReadAloud({ text }: ReadAloudProps) {
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (speaking) {
      stop();
      return;
    }

    // Strip markdown syntax for cleaner speech
    const clean = text
      .replace(/```[\s\S]*?```/g, '') // code blocks
      .replace(/`([^`]+)`/g, '$1')    // inline code
      .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
      .replace(/\*([^*]+)\*/g, '$1')   // italic
      .replace(/#{1,6}\s/g, '')        // headings
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/[>\-|]/g, '')          // blockquotes, list markers, tables
      .replace(/\n{2,}/g, '. ')        // paragraph breaks → pauses
      .replace(/\n/g, ' ')
      .trim();

    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'en-US';
    utterance.rate = 1;

    utterance.onend = () => {
      utteranceRef.current = null;
      setSpeaking(false);
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setSpeaking(false);
    };

    utteranceRef.current = utterance;
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  }, [text, speaking, stop]);

  // Stop on unmount
  useEffect(() => {
    return () => { speechSynthesis.cancel(); };
  }, []);

  // Stop when text changes
  useEffect(() => {
    stop();
  }, [text, stop]);

  if (typeof speechSynthesis === 'undefined') return null;

  return (
    <button
      onClick={speak}
      className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
        speaking
          ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/20'
          : 'bg-bg-tertiary text-text-muted border-border hover:text-accent-cyan hover:border-accent-cyan/30'
      }`}
      title={speaking ? 'Stop reading' : 'Read aloud'}
    >
      {speaking ? (
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

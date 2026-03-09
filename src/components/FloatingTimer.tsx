import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerProps {
  questionId: string;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Timer({ questionId }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  // Reset when question changes
  useEffect(() => {
    setElapsed(0);
    setRunning(false);
    accumulatedRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [questionId]);

  const tick = useCallback(() => {
    const now = Date.now();
    setElapsed(accumulatedRef.current + Math.floor((now - startTimeRef.current) / 1000));
  }, []);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(tick, 1000);
  }, [running, tick]);

  const pause = useCallback(() => {
    if (!running) return;
    setRunning(false);
    accumulatedRef.current = elapsed;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [running, elapsed]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    accumulatedRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 shrink-0">
      {/* Time display */}
      <span className={`text-sm font-code tabular-nums tracking-wider ${
        running ? 'text-accent-cyan' : elapsed > 0 ? 'text-text-primary' : 'text-text-muted'
      }`}>
        {formatTime(elapsed)}
      </span>

      {/* Play / Pause */}
      {!running ? (
        <button
          onClick={start}
          className="w-7 h-7 rounded-md flex items-center justify-center bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20 transition-all cursor-pointer"
          title={elapsed > 0 ? 'Resume' : 'Start'}
        >
          <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
            <path d="M0 0L8 5L0 10Z" />
          </svg>
        </button>
      ) : (
        <button
          onClick={pause}
          className="w-7 h-7 rounded-md flex items-center justify-center bg-accent-orange/10 text-accent-orange border border-accent-orange/20 hover:bg-accent-orange/20 transition-all cursor-pointer"
          title="Pause"
        >
          <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
            <rect x="0" y="0" width="2.5" height="10" />
            <rect x="5.5" y="0" width="2.5" height="10" />
          </svg>
        </button>
      )}

      {/* Reset */}
      {elapsed > 0 && (
        <button
          onClick={reset}
          className="w-7 h-7 rounded-md flex items-center justify-center bg-bg-tertiary text-text-muted border border-border hover:text-text-primary hover:border-border-light transition-all cursor-pointer"
          title="Reset"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1v4h4" />
            <path d="M1 5a5 5 0 1 1 1.5 3.5" />
          </svg>
        </button>
      )}
    </div>
  );
}

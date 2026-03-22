import { useState, useRef, useCallback, useEffect } from 'react';
import { useFabStore } from '../hooks/useFabStore';

const PRESETS = [
  { label: '15m', seconds: 15 * 60 },
  { label: '30m', seconds: 30 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: '1h', seconds: 60 * 60 },
];

type Mode = 'idle' | 'running' | 'paused' | 'done';

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function Timer() {
  const { timerOpen: open, toggleTimer } = useFabStore();

  const [mode, setMode] = useState<Mode>('idle');
  const [totalSeconds, setTotalSeconds] = useState(30 * 60);
  const [remaining, setRemaining] = useState(30 * 60);
  const [isCountUp, setIsCountUp] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on close
  useEffect(() => {
    if (!open) clearTimer();
  }, [open, clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const playAlarm = useCallback(() => {
    try {
      const ctx = audioRef.current || new AudioContext();
      audioRef.current = ctx;
      // Play a short beep sequence
      const playBeep = (time: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + 0.15);
      };
      playBeep(0);
      playBeep(0.25);
      playBeep(0.5);
    } catch {
      // Audio not available
    }
  }, []);

  const start = useCallback((seconds?: number) => {
    clearTimer();
    const duration = seconds ?? totalSeconds;
    setTotalSeconds(duration);
    setMinimized(true);
    if (isCountUp) {
      setElapsed(0);
      setMode('running');
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setRemaining(duration);
      setMode('running');
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setMode('done');
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [totalSeconds, isCountUp, clearTimer, playAlarm]);

  const pause = useCallback(() => {
    clearTimer();
    setMode('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    setMode('running');
    if (isCountUp) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setMode('done');
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isCountUp, clearTimer, playAlarm]);

  const reset = useCallback(() => {
    clearTimer();
    setMode('idle');
    setRemaining(totalSeconds);
    setElapsed(0);
  }, [clearTimer, totalSeconds]);

  const adjustTime = useCallback((delta: number) => {
    if (mode !== 'idle') return;
    setTotalSeconds((prev) => Math.max(60, prev + delta));
    setRemaining((prev) => Math.max(60, prev + delta));
  }, [mode]);

  if (!open) return null;

  const displayTime = isCountUp ? elapsed : remaining;
  const progress = isCountUp ? 0 : totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0;
  const isLow = !isCountUp && mode === 'running' && remaining <= 60 && remaining > 0;
  const isActive = mode !== 'idle';

  // Minimized pill
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className={`fixed bottom-20 right-6 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full shadow-2xl border transition-all cursor-pointer ${
          mode === 'done'
            ? 'bg-accent-red/15 border-accent-red/30 text-accent-red animate-pulse'
            : isLow
              ? 'bg-accent-orange/15 border-accent-orange/30 text-accent-orange'
              : 'bg-bg-primary border-border hover:border-accent-yellow/30'
        }`}
        title="Expand timer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={mode === 'done' ? 'currentColor' : isLow ? 'currentColor' : 'var(--color-accent-yellow)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span className={`text-sm font-code font-bold tabular-nums ${
          mode === 'done' ? 'text-accent-red' : isLow ? 'text-accent-orange' : 'text-text-primary'
        }`}>
          {formatTime(displayTime)}
        </span>
        {mode === 'running' && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
        )}
        {mode === 'paused' && (
          <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-20 w-72 bg-bg-primary border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-bg-card/50">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-accent-yellow/15 text-accent-yellow flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <span className="text-sm font-display font-bold text-text-primary">Timer</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Count up / down toggle */}
          {mode === 'idle' && (
            <button
              onClick={() => setIsCountUp(!isCountUp)}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer ${
                isCountUp ? 'bg-accent-green/10 text-accent-green' : 'text-text-muted hover:text-text-secondary'
              }`}
              title={isCountUp ? 'Counting up (stopwatch)' : 'Counting down (timer)'}
            >
              {isCountUp ? 'Stopwatch' : 'Countdown'}
            </button>
          )}
          {/* Minimize (only when active) */}
          {isActive && (
            <button
              onClick={() => setMinimized(true)}
              className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              title="Minimize"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          )}
          <button
            onClick={toggleTimer}
            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress bar (countdown only) */}
      {!isCountUp && mode !== 'idle' && (
        <div className="h-1 bg-bg-tertiary">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-r-full ${
              mode === 'done' ? 'bg-accent-red' : isLow ? 'bg-accent-orange' : 'bg-accent-yellow'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Timer display */}
      <div className="px-4 py-5 text-center">
        {/* Time adjust (idle + countdown) */}
        {mode === 'idle' && !isCountUp && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              onClick={() => adjustTime(-60)}
              className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors cursor-pointer flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className={`text-4xl font-code font-bold text-text-primary tabular-nums`}>
              {formatTime(totalSeconds)}
            </span>
            <button
              onClick={() => adjustTime(60)}
              className="w-8 h-8 rounded-full border border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors cursor-pointer flex items-center justify-center"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        )}

        {/* Running / paused / done display */}
        {(mode !== 'idle' || isCountUp) && mode !== 'idle' && (
          <div className={`text-4xl font-code font-bold tabular-nums mb-3 ${
            mode === 'done' ? 'text-accent-red animate-pulse' : isLow ? 'text-accent-orange' : 'text-text-primary'
          }`}>
            {formatTime(displayTime)}
          </div>
        )}

        {/* Stopwatch idle display */}
        {mode === 'idle' && isCountUp && (
          <div className="text-4xl font-code font-bold tabular-nums mb-3 text-text-primary">
            {formatTime(0)}
          </div>
        )}

        {/* Done message */}
        {mode === 'done' && (
          <p className="text-xs text-accent-red font-medium mb-3">Time's up!</p>
        )}

        {/* Presets (idle + countdown) */}
        {mode === 'idle' && !isCountUp && (
          <div className="flex justify-center gap-1.5 mb-4">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => { setTotalSeconds(p.seconds); setRemaining(p.seconds); }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  totalSeconds === p.seconds
                    ? 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20'
                    : 'text-text-muted border-border hover:text-text-secondary'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {mode === 'idle' && (
            <button
              onClick={() => start()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent-yellow text-white font-medium text-sm hover:bg-accent-yellow/90 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start
            </button>
          )}
          {mode === 'running' && (
            <button
              onClick={pause}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/30 font-medium text-sm hover:bg-accent-yellow/20 transition-colors cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Pause
            </button>
          )}
          {mode === 'paused' && (
            <>
              <button
                onClick={resume}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-yellow text-white font-medium text-sm hover:bg-accent-yellow/90 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Resume
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-bg-tertiary text-text-secondary border border-border font-medium text-sm hover:text-text-primary transition-colors cursor-pointer"
              >
                Reset
              </button>
            </>
          )}
          {mode === 'done' && (
            <>
              <button
                onClick={() => start()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-accent-yellow text-white font-medium text-sm hover:bg-accent-yellow/90 transition-colors cursor-pointer"
              >
                Restart
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-bg-tertiary text-text-secondary border border-border font-medium text-sm hover:text-text-primary transition-colors cursor-pointer"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

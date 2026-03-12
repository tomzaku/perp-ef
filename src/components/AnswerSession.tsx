import { useState, useEffect, useRef, useCallback } from 'react';

interface AnswerSessionProps {
  questionId: string;
}

// ─── Whisper (offline STT fallback) ───────────────────────────────────
let transcriberPromise: Promise<TranscriberPipeline> | null = null;

interface TranscriberPipeline {
  (audio: Float32Array): Promise<{ text: string }>;
}

async function getTranscriber(
  onProgress?: (progress: number) => void,
): Promise<TranscriberPipeline> {
  if (!transcriberPromise) {
    transcriberPromise = (async () => {
      const { pipeline } = await import('@huggingface/transformers');
      const transcriber = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-tiny.en',
        {
          dtype: 'q8',
          device: 'wasm',
          progress_callback: (p) => {
            if ('progress' in p && typeof p.progress === 'number' && onProgress) {
              onProgress(p.progress);
            }
          },
        },
      );
      return (audio: Float32Array) =>
        transcriber(audio) as Promise<{ text: string }>;
    })();
  }
  return transcriberPromise;
}

async function decodeAudioBlob(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioCtx.decodeAudioData(arrayBuffer);
  const float32 = decoded.getChannelData(0);
  await audioCtx.close();
  return float32;
}

// ─── Web Speech API probe ─────────────────────────────────────────────
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onaudiostart: (() => void) | null;
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

let webSpeechProbeResult: boolean | null = null;
let webSpeechProbePromise: Promise<boolean> | null = null;

function probeWebSpeech(): Promise<boolean> {
  if (webSpeechProbeResult !== null) return Promise.resolve(webSpeechProbeResult);
  if (webSpeechProbePromise) return webSpeechProbePromise;

  const SpeechRec = getSpeechRecognition();
  if (!SpeechRec) {
    webSpeechProbeResult = false;
    return Promise.resolve(false);
  }

  webSpeechProbePromise = new Promise<boolean>((resolve) => {
    const recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    let resolved = false;
    const done = (result: boolean) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      try { recognition.abort(); } catch { /* ignore */ }
      webSpeechProbeResult = result;
      resolve(result);
    };

    const timeout = setTimeout(() => done(false), 3000);

    recognition.onaudiostart = () => done(true);
    recognition.onresult = () => done(true);
    recognition.onerror = (e) => {
      if (e.error === 'no-speech') done(true);
      else if (e.error !== 'aborted') done(false);
    };

    try {
      recognition.start();
    } catch {
      clearTimeout(timeout);
      webSpeechProbeResult = false;
      resolve(false);
    }
  });

  return webSpeechProbePromise;
}

// ─── Helpers ──────────────────────────────────────────────────────────
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Component ────────────────────────────────────────────────────────
type SessionState = 'idle' | 'answering' | 'done';

export function AnswerSession({ questionId }: AnswerSessionProps) {
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [transcript, setTranscript] = useState<string | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showLiveTranscript, setShowLiveTranscript] = useState(true);
  const [transcribing, setTranscribing] = useState(false);
  const [modelProgress, setModelProgress] = useState<number | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [webSpeechOk, setWebSpeechOk] = useState<boolean | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const liveFinalRef = useRef('');

  useEffect(() => {
    probeWebSpeech().then(setWebSpeechOk);
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (audioUrlRef.current) { URL.revokeObjectURL(audioUrlRef.current); audioUrlRef.current = null; }
    if (recognitionRef.current) { recognitionRef.current.abort(); recognitionRef.current = null; }
    chunksRef.current = [];
    audioBlobRef.current = null;
    liveFinalRef.current = '';
    setSessionState('idle');
    setElapsed(0);
    setIsLive(false);
    setLiveText('');
    setTranscript(null);
    setShowTranscript(false);
    setTranscribing(false);
    setModelProgress(null);
    setPlaybackTime(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => { cleanup(); }, [questionId, cleanup]);
  useEffect(() => cleanup, [cleanup]);

  // ─── Start mic ──────────────────────────────────────────────────────
  const startMicRecorder = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          audioBlobRef.current = blob;
          if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = URL.createObjectURL(blob);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      return stream;
    } catch {
      return null;
    }
  }, []);

  const stopMicRecorder = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // ─── Start answering (timer + recording + optional live STT) ────────
  const startAnswering = useCallback(async () => {
    const stream = await startMicRecorder();
    if (!stream) return;

    startTimeRef.current = Date.now();
    setElapsed(0);
    setTranscript(null);
    setShowTranscript(false);
    setLiveText('');
    setSessionState('answering');

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Try live STT if available
    const SpeechRec = getSpeechRecognition();
    if (webSpeechOk && SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      liveFinalRef.current = '';

      let stopped = false;

      recognition.onresult = (event) => {
        const finals: string[] = [];
        const interims: string[] = [];
        for (let i = 0; i < event.results.length; i++) {
          const text = event.results[i][0].transcript.trim();
          if (!text) continue;
          if (event.results[i].isFinal) {
            finals.push(text);
          } else {
            interims.push(text);
          }
        }
        const finalText = finals.join(' ');
        const interimText = interims.join(' ');
        liveFinalRef.current = finalText;
        setLiveText(
          finalText + (finalText && interimText ? ' ' : '') + interimText,
        );
      };

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          stopped = true;
          recognitionRef.current = null;
          webSpeechProbeResult = false;
          setWebSpeechOk(false);
          setIsLive(false);
        }
      };

      recognition.onend = () => {
        if (!stopped && recognitionRef.current === recognition) {
          try { recognition.start(); } catch { /* already stopped */ }
        }
      };

      try {
        recognition.start();
        recognitionRef.current = recognition;
        setIsLive(true);
      } catch {
        setIsLive(false);
      }
    }
  }, [startMicRecorder, webSpeechOk]);

  // ─── Stop answering ─────────────────────────────────────────────────
  const stopAnswering = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.stop();
    }
    stopMicRecorder();

    const finalText = liveText.trim();
    if (finalText) {
      setTranscript(finalText);
      setShowTranscript(true);
    }
    setIsLive(false);

    setTimeout(() => {
      setSessionState('done');
    }, 100);
  }, [liveText, stopMicRecorder]);

  // ─── Playback ───────────────────────────────────────────────────────
  const play = useCallback(() => {
    if (!audioUrlRef.current) return;
    const audio = new Audio(audioUrlRef.current);
    audioRef.current = audio;
    setPlaybackTime(0);
    setIsPlaying(true);

    timerRef.current = setInterval(() => {
      setPlaybackTime(Math.floor(audio.currentTime));
    }, 200);

    audio.onended = () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setIsPlaying(false);
      setPlaybackTime(0);
    };
    audio.play();
  }, []);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
    setPlaybackTime(0);
  }, []);

  // ─── Whisper offline transcription ──────────────────────────────────
  const transcribeWhisper = useCallback(async () => {
    if (!audioBlobRef.current || transcribing) return;
    setTranscribing(true);
    setModelProgress(null);
    try {
      const transcriber = await getTranscriber((p) => setModelProgress(p));
      setModelProgress(null);
      const audio = await decodeAudioBlob(audioBlobRef.current);
      const result = await transcriber(audio);
      setTranscript(result.text.trim());
      setShowTranscript(true);
    } catch (err) {
      setTranscript(`[Error] ${err instanceof Error ? err.message : String(err)}`);
      setShowTranscript(true);
    } finally {
      setTranscribing(false);
    }
  }, [transcribing]);

  // ─── Render ─────────────────────────────────────────────────────────

  // Idle state: show "Start Answering" button
  if (sessionState === 'idle') {
    return (
      <div className="relative">
        <button
          onClick={startAnswering}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30 hover:bg-accent-cyan/20"
        >
          <svg width="10" height="12" viewBox="0 0 8 10" fill="currentColor">
            <path d="M0 0L8 5L0 10Z" />
          </svg>
          Start Answering
        </button>

        {/* Show transcript toggle if we have one from a previous session */}
        {transcript && (
          <div className="mt-2">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-xs text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
            >
              {showTranscript ? 'Hide' : 'Show'} Transcript
            </button>
            {showTranscript && (
              <div className="mt-2 bg-bg-card border border-border rounded-lg p-3 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-code text-text-muted uppercase tracking-wider">Transcript</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(transcript)}
                    className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
                <div className="text-sm text-text-primary leading-relaxed max-h-48 overflow-y-auto">
                  {transcript}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Answering state: show recording indicator + timer + stop button
  if (sessionState === 'answering') {
    return (
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border bg-accent-red/10 text-accent-red border-accent-red/30">
            {/* Pulsing recording dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red" />
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
            <span className="font-code tabular-nums tracking-wider">
              {formatTime(elapsed)}
            </span>
          </div>
          <button
            onClick={stopAnswering}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border bg-bg-tertiary text-text-secondary border-border hover:border-accent-red/30 hover:text-accent-red"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="0" y="0" width="10" height="10" rx="1" />
            </svg>
            Stop
          </button>
          {isLive && liveText && (
            <button
              onClick={() => setShowLiveTranscript(!showLiveTranscript)}
              className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                showLiveTranscript
                  ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30'
                  : 'bg-bg-tertiary text-text-muted border-border hover:text-accent-cyan hover:border-accent-cyan/30'
              }`}
              title={showLiveTranscript ? 'Hide transcript' : 'Show transcript'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          )}
        </div>

        {/* Live transcript — absolute dropdown so it doesn't grow the header */}
        {isLive && liveText && showLiveTranscript && (
          <div className="absolute top-full right-0 mt-2 w-72 sm:w-96 bg-bg-card border border-accent-cyan/20 rounded-lg shadow-lg z-20 animate-fade-in">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-[10px] font-code text-accent-cyan uppercase tracking-wider">Live Transcript</span>
              <button
                onClick={() => navigator.clipboard.writeText(liveText)}
                className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
              >
                Copy
              </button>
            </div>
            <div className="p-3 text-sm text-text-primary leading-relaxed max-h-48 overflow-y-auto">
              {liveText}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Done state: show result with playback + transcript
  return (
    <div className="relative">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border bg-bg-card text-text-primary border-border">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-easy" />
          </svg>
          <span className="font-code tabular-nums tracking-wider">{formatTime(elapsed)}</span>
        </div>

        {/* Playback */}
        {!isPlaying ? (
          <button
            onClick={play}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border bg-bg-tertiary text-text-secondary border-border hover:border-accent-green/30 hover:text-accent-green"
            title="Play recording"
          >
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              <path d="M0 0L8 5L0 10Z" />
            </svg>
            Play
          </button>
        ) : (
          <button
            onClick={stopPlayback}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border bg-accent-green/10 text-accent-green border-accent-green/30"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="0" y="0" width="10" height="10" rx="1" />
            </svg>
            <span className="font-code tabular-nums">{formatTime(playbackTime)}</span>
          </button>
        )}

        {/* Whisper STT (only if no live transcript) */}
        {!webSpeechOk && !transcript && (
          <button
            onClick={transcribeWhisper}
            disabled={transcribing}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border bg-bg-tertiary text-text-secondary border-border hover:border-accent-purple/30 hover:text-accent-purple disabled:opacity-60"
            title="Transcribe with Whisper (offline)"
          >
            {transcribing ? (
              modelProgress != null ? (
                <span className="tabular-nums">{Math.round(modelProgress)}%</span>
              ) : (
                <span className="animate-pulse">Transcribing...</span>
              )
            ) : (
              'Transcribe'
            )}
          </button>
        )}

        {/* Transcript toggle */}
        {transcript && (
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              showTranscript
                ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30'
                : 'bg-bg-tertiary text-text-muted border-border hover:text-accent-cyan hover:border-accent-cyan/30'
            }`}
            title={showTranscript ? 'Hide transcript' : 'Show transcript'}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Transcript
          </button>
        )}

        {/* Restart */}
        <button
          onClick={cleanup}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border bg-bg-tertiary text-text-muted border-border hover:border-accent-cyan/30 hover:text-accent-cyan"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1v4h4" />
            <path d="M1 5a5 5 0 1 1 1.5 3.5" />
          </svg>
          Retry
        </button>
      </div>

      {/* Transcript dropdown */}
      {transcript && showTranscript && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-96 bg-bg-card border border-border rounded-lg shadow-lg z-20 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[10px] font-code text-text-muted uppercase tracking-wider">Transcript</span>
            <button
              onClick={() => navigator.clipboard.writeText(transcript)}
              className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
            >
              Copy
            </button>
          </div>
          <div className="p-3 text-sm text-text-primary leading-relaxed max-h-48 overflow-y-auto">
            {transcript}
          </div>
        </div>
      )}
    </div>
  );
}

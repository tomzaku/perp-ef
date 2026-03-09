import { useState, useEffect, useRef, useCallback } from 'react';

interface VoiceRecorderProps {
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

// Cached probe result: null = not tested, true/false = result
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

    // Timeout: if no positive signal (onaudiostart) within 3s, assume broken
    const timeout = setTimeout(() => done(false), 3000);

    recognition.onaudiostart = () => {
      // Audio started flowing — confirmed working
      done(true);
    };

    recognition.onresult = () => {
      // Got a result — definitely working
      done(true);
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') {
        // No speech detected but the API itself works
        done(true);
      } else if (e.error === 'aborted') {
        // We aborted it ourselves, ignore
      } else {
        // 'network', 'not-allowed', 'service-not-allowed', etc.
        done(false);
      }
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

// ─── Component ────────────────────────────────────────────────────────
type RecorderState = 'idle' | 'live' | 'recording' | 'recorded' | 'playing';

export function VoiceRecorder({ questionId }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [liveText, setLiveText] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const [modelProgress, setModelProgress] = useState<number | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [webSpeechOk, setWebSpeechOk] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const liveFinalRef = useRef('');

  // Probe Web Speech API on mount
  useEffect(() => {
    probeWebSpeech().then(setWebSpeechOk);
  }, []);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    chunksRef.current = [];
    audioBlobRef.current = null;
    liveFinalRef.current = '';
    setState('idle');
    setDuration(0);
    setPlaybackTime(0);
    setTranscript(null);
    setLiveText('');
    setTranscribing(false);
    setModelProgress(null);
    setShowTranscript(false);
  }, []);

  useEffect(() => { cleanup(); }, [questionId, cleanup]);
  useEffect(() => cleanup, [cleanup]);

  // ─── Start mic stream + MediaRecorder (shared by live & record) ───
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

  // ─── Live STT (+ recording) ──────────────────────────────────────
  const startLive = useCallback(async () => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) return;

    const stream = await startMicRecorder();
    if (!stream) return;

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    liveFinalRef.current = '';
    setLiveText('');
    setTranscript(null);
    setShowTranscript(false);
    startTimeRef.current = Date.now();
    setDuration(0);

    let stopped = false;

    recognition.onresult = (event) => {
      let finalText = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      liveFinalRef.current = finalText;
      setLiveText(finalText + interim);
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('SpeechRecognition error:', e.error);
        stopped = true;
        recognitionRef.current = null;
        // Mark Web Speech as broken — switch to Record + Whisper mode
        webSpeechProbeResult = false;
        setWebSpeechOk(false);
        // Keep recording running — just drop into recording state
        setState('recording');
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
      setState('live');
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.warn('Failed to start SpeechRecognition:', err);
      stopMicRecorder();
    }
  }, [startMicRecorder, stopMicRecorder]);

  const stopLive = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
    // Transition to recorded state (has audio for playback)
    // Small delay to let MediaRecorder finish writing chunks
    setTimeout(() => {
      if (audioBlobRef.current) {
        setState('recorded');
      } else {
        setState('idle');
      }
    }, 100);
  }, [liveText, stopMicRecorder]);

  // ─── Record only (fallback, no live STT) ──────────────────────────
  const startRecording = useCallback(async () => {
    const stream = await startMicRecorder();
    if (!stream) return;

    startTimeRef.current = Date.now();
    setDuration(0);
    setTranscript(null);
    setShowTranscript(false);
    setState('recording');

    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, [startMicRecorder]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    stopMicRecorder();
    setTimeout(() => {
      if (audioBlobRef.current) {
        setState('recorded');
      } else {
        setState('idle');
      }
    }, 100);
  }, [stopMicRecorder]);

  // ─── Playback ─────────────────────────────────────────────────────
  const play = useCallback(() => {
    if (!audioUrlRef.current) return;
    const audio = new Audio(audioUrlRef.current);
    audioRef.current = audio;
    setPlaybackTime(0);
    setState('playing');

    timerRef.current = setInterval(() => {
      setPlaybackTime(Math.floor(audio.currentTime));
    }, 200);

    audio.onended = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState('recorded');
      setPlaybackTime(0);
    };

    audio.play();
  }, []);

  const stopPlayback = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setState('recorded');
    setPlaybackTime(0);
  }, []);

  const discard = useCallback(() => { cleanup(); }, [cleanup]);

  // ─── Whisper offline transcription ────────────────────────────────
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

  // ─── Helpers ──────────────────────────────────────────────────────
  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const transcriptToggle = (
    <button
      onClick={() => setShowTranscript(!showTranscript)}
      className="w-7 h-7 rounded-md flex items-center justify-center bg-bg-tertiary text-text-muted border border-border hover:text-text-primary hover:border-border-light transition-all cursor-pointer"
      title={showTranscript ? 'Hide transcript' : 'Show transcript'}
    >
      <svg
        width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        className={`transition-transform ${showTranscript ? 'rotate-180' : ''}`}
      >
        <path d="M1 3.5L5 7.5L9 3.5" />
      </svg>
    </button>
  );

  // Still probing — show nothing
  if (webSpeechOk === null) return null;

  return (
    <div className="relative flex items-center gap-2 shrink-0">

      {/* ── Idle ── */}
      {state === 'idle' && (
        <>
          {webSpeechOk ? (
            /* Web Speech works: show Live button */
            <button
              onClick={startLive}
              className="h-7 px-2 rounded-md flex items-center justify-center gap-1 bg-bg-tertiary text-text-muted border border-border hover:text-accent-cyan hover:border-accent-cyan/30 hover:bg-accent-cyan/10 transition-all cursor-pointer text-xs font-medium"
              title="Record with live transcription"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              </svg>
              <span className="hidden sm:inline">Live</span>
            </button>
          ) : (
            /* Web Speech unavailable: show Record button */
            <button
              onClick={startRecording}
              className="w-7 h-7 rounded-md flex items-center justify-center bg-bg-tertiary text-text-muted border border-border hover:text-accent-red hover:border-accent-red/30 hover:bg-accent-red/10 transition-all cursor-pointer"
              title="Record voice note"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity="0.7">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </button>
          )}
          {transcript && transcriptToggle}
        </>
      )}

      {/* ── Live STT ── */}
      {state === 'live' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-cyan" />
          </span>
          <span className="text-sm font-code tabular-nums tracking-wider text-accent-cyan">
            {formatSec(duration)}
          </span>
          <button
            onClick={stopLive}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20 transition-all cursor-pointer"
            title="Stop"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="0" y="0" width="10" height="10" rx="1" />
            </svg>
          </button>
        </>
      )}

      {/* ── Recording (fallback, no live text) ── */}
      {state === 'recording' && (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red" />
          </span>
          <span className="text-sm font-code tabular-nums tracking-wider text-accent-red">
            {formatSec(duration)}
          </span>
          <button
            onClick={stopRecording}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-accent-red/10 text-accent-red border border-accent-red/20 hover:bg-accent-red/20 transition-all cursor-pointer"
            title="Stop recording"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="0" y="0" width="10" height="10" rx="1" />
            </svg>
          </button>
        </>
      )}

      {/* ── Recorded: play + optional Whisper STT + discard ── */}
      {state === 'recorded' && (
        <>
          <span className="text-sm font-code tabular-nums tracking-wider text-text-primary">
            {formatSec(duration)}
          </span>
          <button
            onClick={play}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-accent-green/10 text-accent-green border border-accent-green/20 hover:bg-accent-green/20 transition-all cursor-pointer"
            title="Play"
          >
            <svg width="8" height="10" viewBox="0 0 8 10" fill="currentColor">
              <path d="M0 0L8 5L0 10Z" />
            </svg>
          </button>
          {/* Only show Whisper STT if Web Speech is unavailable */}
          {!webSpeechOk && (
            <button
              onClick={transcribeWhisper}
              disabled={transcribing}
              className={`h-7 px-2 rounded-md flex items-center justify-center gap-1 text-xs font-medium border transition-all cursor-pointer disabled:opacity-60 ${
                transcript
                  ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20 hover:bg-accent-purple/20'
                  : 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/20'
              }`}
              title={transcript ? 'Re-transcribe (Whisper)' : 'Transcribe with Whisper (offline)'}
            >
              {transcribing ? (
                modelProgress != null ? (
                  <span className="tabular-nums">{Math.round(modelProgress)}%</span>
                ) : (
                  <span className="animate-pulse">...</span>
                )
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                  <span className="hidden sm:inline">{transcript ? 'Redo' : 'STT'}</span>
                </>
              )}
            </button>
          )}
          {transcript && transcriptToggle}
          <button
            onClick={discard}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-bg-tertiary text-text-muted border border-border hover:text-accent-red hover:border-accent-red/30 transition-all cursor-pointer"
            title="Discard"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 1L9 9M9 1L1 9" />
            </svg>
          </button>
        </>
      )}

      {/* ── Playing ── */}
      {state === 'playing' && (
        <>
          <span className="text-sm font-code tabular-nums tracking-wider text-accent-green">
            {formatSec(playbackTime)} / {formatSec(duration)}
          </span>
          <button
            onClick={stopPlayback}
            className="w-7 h-7 rounded-md flex items-center justify-center bg-accent-orange/10 text-accent-orange border border-accent-orange/20 hover:bg-accent-orange/20 transition-all cursor-pointer"
            title="Stop"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <rect x="0" y="0" width="10" height="10" rx="1" />
            </svg>
          </button>
          {transcript && transcriptToggle}
        </>
      )}

      {/* ── Transcript panel ── */}
      {showTranscript && transcript && (
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

      {/* ── Live text panel ── */}
      {state === 'live' && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-96 bg-bg-card border border-accent-cyan/30 rounded-lg shadow-lg z-20 animate-fade-in">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-[10px] font-code text-accent-cyan uppercase tracking-wider">Live Transcript</span>
            {liveText && (
              <button
                onClick={() => navigator.clipboard.writeText(liveText)}
                className="text-[10px] text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
              >
                Copy
              </button>
            )}
          </div>
          <div className="p-3 text-sm text-text-primary leading-relaxed max-h-48 overflow-y-auto">
            {liveText || <span className="text-text-muted italic">Listening...</span>}
          </div>
        </div>
      )}
    </div>
  );
}

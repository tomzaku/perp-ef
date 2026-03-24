import { useState, useRef, useCallback, useEffect } from 'react';
import { useFabStore } from '../hooks/useFabStore';
import { transcribeBlob } from '../lib/whisperStt';

// ─── Speech Recognition helpers ──────────────────────────────────────
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
}

function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  const w = window as unknown as Record<string, unknown>;
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as
    | (new () => SpeechRecognitionInstance)
    | null;
}

type RecordMode = 'audio' | 'video';

interface Recording {
  id: string;
  url: string;
  blob: Blob;
  mode: RecordMode;
  duration: number;
  transcript: string;
  createdAt: number;
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function Recorder() {
  const { panel, closePanel } = useFabStore();
  const open = panel === 'recorder';

  const [mode, setMode] = useState<RecordMode>('audio');
  const [transcriptEnabled, setTranscriptEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [maximized, setMaximized] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [whisperProgress, setWhisperProgress] = useState<number | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef('');
  const speechProducedTextRef = useRef(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Cleanup on unmount or close
  useEffect(() => {
    if (!open) {
      stopRecording();
    }
  }, [open]);

  // Wire video preview when recording starts and the <video> element mounts
  useEffect(() => {
    if (isRecording && mode === 'video' && videoPreviewRef.current && streamRef.current) {
      videoPreviewRef.current.srcObject = streamRef.current;
      videoPreviewRef.current.play().catch(() => {});
    }
  }, [isRecording, mode]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    setElapsed(0);
    setLiveTranscript('');
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints =
        mode === 'video' ? { audio: true, video: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      console.log('[recorder] mic stream acquired');

      const mimeType = mode === 'video'
        ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm')
        : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm');

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      transcriptRef.current = '';
      speechProducedTextRef.current = false;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - startTimeRef.current) / 1000;

        console.log('[recorder] onstop: speechProducedText=', speechProducedTextRef.current,
          'transcript=', JSON.stringify(transcriptRef.current),
          'blob=', blob.size, 'bytes');

        // If Web Speech produced no transcript, fall back to Whisper
        if (transcriptEnabled && !speechProducedTextRef.current && blob.size > 0) {
          console.log('[recorder] Web Speech produced no text, falling back to Whisper...');
          setIsTranscribing(true);
          setWhisperProgress(null);
          transcribeBlob(blob, (p) => {
            console.log('[recorder] Whisper progress:', p);
            setWhisperProgress(p);
          })
            .then((text) => {
              console.log('[recorder] Whisper result:', JSON.stringify(text));
              const transcript = text || '';
              transcriptRef.current = transcript;
              setRecordings((prev) => [
                {
                  id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                  url,
                  blob,
                  mode,
                  duration,
                  transcript,
                  createdAt: Date.now(),
                },
                ...prev,
              ]);
            })
            .catch((err) => {
              console.error('[recorder] Whisper failed:', err);
              // Still save the recording, just without transcript
              setRecordings((prev) => [
                { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, url, blob, mode, duration, transcript: '', createdAt: Date.now() },
                ...prev,
              ]);
            })
            .finally(() => {
              setIsTranscribing(false);
              setWhisperProgress(null);
            });
        } else {
          // Web Speech worked (or transcript disabled) — save immediately
          setRecordings((prev) => [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              url,
              blob,
              mode,
              duration,
              transcript: transcriptRef.current,
              createdAt: Date.now(),
            },
            ...prev,
          ]);
        }
      };

      recorder.start(1000); // collect in 1s chunks
      startTimeRef.current = Date.now();
      setElapsed(0);
      setIsRecording(true);

      // Timer
      timerRef.current = setInterval(() => {
        setElapsed((Date.now() - startTimeRef.current) / 1000);
      }, 500);

      // Speech recognition for transcript
      if (transcriptEnabled) {
        const SpeechRec = getSpeechRecognition();
        console.log('[recorder] SpeechRecognition:', SpeechRec ? 'available' : 'NOT available');
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          let processedCount = 0;
          recognition.onresult = (e) => {
            speechProducedTextRef.current = true;
            console.log('[recorder] SpeechRecognition onresult, results:', e.results.length);
            let interim = '';
            for (let i = 0; i < e.results.length; i++) {
              const result = e.results[i];
              if (result.isFinal) {
                if (i >= processedCount) {
                  const text = result[0].transcript.trim();
                  console.log('[recorder] final:', JSON.stringify(text));
                  if (text) transcriptRef.current += (transcriptRef.current ? ' ' : '') + text;
                  processedCount = i + 1;
                }
              } else {
                interim += result[0].transcript;
              }
            }
            setLiveTranscript((transcriptRef.current + (interim ? ' ' + interim : '')).trim());
          };
          recognition.onerror = (e) => {
            console.warn('[recorder] SpeechRecognition error:', e.error);
          };
          recognition.onend = () => {
            console.log('[recorder] SpeechRecognition onend');
            // Restart if still recording — reset processedCount since results reset
            if (mediaRecorderRef.current?.state === 'recording') {
              processedCount = 0;
              try { recognition.start(); } catch { /* ignore */ }
            }
          };
          try {
            recognition.start();
            recognitionRef.current = recognition;
            console.log('[recorder] SpeechRecognition started');
          } catch (err) {
            console.error('[recorder] SpeechRecognition start() failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('[recorder] Failed to start recording:', err);
    }
  }, [mode, transcriptEnabled]);

  const handleStop = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  const deleteRecording = useCallback((id: string) => {
    setRecordings((prev) => {
      const rec = prev.find((r) => r.id === id);
      if (rec) URL.revokeObjectURL(rec.url);
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const downloadRecording = useCallback((rec: Recording) => {
    const ext = rec.mode === 'video' ? 'webm' : 'webm';
    const a = document.createElement('a');
    a.href = rec.url;
    a.download = `recording-${new Date(rec.createdAt).toISOString().slice(0, 19).replace(/:/g, '-')}.${ext}`;
    a.click();
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
          <span className="w-7 h-7 rounded-lg bg-accent-red/15 text-accent-red flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="text-sm font-display font-bold text-text-primary">Recorder</span>
          {isRecording && (
            <span className="flex items-center gap-1 text-xs text-accent-red font-medium">
              <span className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
              {formatDuration(elapsed)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMaximized(!maximized)}
            className="w-7 h-7 rounded-md hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center"
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
            onClick={closePanel}
            className="w-7 h-7 rounded-md hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors cursor-pointer flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-4 border-b border-border shrink-0">
        {/* Mode toggle + transcript toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex rounded-full border border-border overflow-hidden">
            <button
              onClick={() => !isRecording && setMode('audio')}
              className={`text-xs px-3 py-1.5 transition-colors cursor-pointer ${
                mode === 'audio'
                  ? 'bg-accent-red/10 text-accent-red'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Audio
            </button>
            <button
              onClick={() => !isRecording && setMode('video')}
              className={`text-xs px-3 py-1.5 transition-colors cursor-pointer ${
                mode === 'video'
                  ? 'bg-accent-red/10 text-accent-red'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Video
            </button>
          </div>

          <button
            onClick={() => !isRecording && setTranscriptEnabled(!transcriptEnabled)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
              transcriptEnabled
                ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'
                : 'text-text-muted border-border hover:text-text-secondary'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16M4 12h10M4 17h12" />
            </svg>
            Transcript {transcriptEnabled ? 'on' : 'off'}
          </button>
        </div>

        {/* Video preview */}
        {mode === 'video' && isRecording && (
          <div className="mb-4 rounded-lg overflow-hidden bg-black">
            <video
              ref={videoPreviewRef}
              muted
              playsInline
              className="w-full max-h-48 object-contain"
            />
          </div>
        )}

        {/* Record / Stop button */}
        <div className="flex justify-center">
          {isRecording ? (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent-red/10 text-accent-red border border-accent-red/30 hover:bg-accent-red/20 transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="2" y="2" width="12" height="12" rx="2" />
              </svg>
              <span className="text-sm font-medium">Stop Recording</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent-red text-white hover:bg-accent-red/90 transition-all cursor-pointer hover:scale-105"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="8" />
              </svg>
              <span className="text-sm font-medium">Start Recording</span>
            </button>
          )}
        </div>

        {/* Live transcript */}
        {isRecording && transcriptEnabled && liveTranscript && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-bg-tertiary border border-border">
            <p className="text-[10px] text-text-muted mb-1 font-semibold uppercase tracking-wider">Live Transcript</p>
            <p className="text-xs text-text-secondary leading-relaxed">{liveTranscript}</p>
          </div>
        )}

        {/* Whisper transcription progress */}
        {isTranscribing && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20 flex items-center gap-2 animate-fade-in">
            <span className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin shrink-0" />
            <span className="text-xs text-accent-cyan font-medium">
              {whisperProgress != null && whisperProgress < 100
                ? `Loading Whisper model... ${Math.round(whisperProgress)}%`
                : 'Transcribing with Whisper...'}
            </span>
          </div>
        )}
      </div>

      {/* Recordings list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {recordings.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-40">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            <p className="text-xs">No recordings yet</p>
            <p className="text-[10px] mt-0.5">Hit the record button to start</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((rec) => (
              <div
                key={rec.id}
                className="rounded-lg border border-border bg-bg-card overflow-hidden"
              >
                {/* Player */}
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        rec.mode === 'video'
                          ? 'bg-accent-purple/10 text-accent-purple'
                          : 'bg-accent-cyan/10 text-accent-cyan'
                      }`}>
                        {rec.mode === 'video' ? 'Video' : 'Audio'}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {formatTime(rec.createdAt)} · {formatDuration(rec.duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadRecording(rec)}
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
                        title="Download"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteRecording(rec.id)}
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-accent-red transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {rec.mode === 'video' ? (
                    <video
                      src={rec.url}
                      controls
                      playsInline
                      className="w-full rounded max-h-48"
                    />
                  ) : (
                    <audio src={rec.url} controls className="w-full h-8" />
                  )}
                </div>

                {/* Transcript */}
                {rec.transcript && (
                  <div className="px-3 py-2 border-t border-border bg-accent-purple/3">
                    <p className="text-[10px] text-accent-purple font-semibold uppercase tracking-wider mb-1">Transcript</p>
                    <p className="text-xs text-text-secondary leading-relaxed">{rec.transcript}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

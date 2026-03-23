/**
 * Shared hook for voice recording with speech-to-text.
 * Tries Web Speech API first (live transcription), automatically falls back
 * to Whisper (offline, ~40MB model) if Web Speech produces no text.
 * Always records audio via MediaRecorder for playback.
 */
import { useState, useRef, useCallback } from 'react';
import { transcribeBlob } from '../lib/whisperStt';

// ─── Speech Recognition helpers ─────────────────────────────────────
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

export interface SpeechRecordingResult {
  /** Audio blob for playback */
  blob: Blob;
  /** Object URL for the audio blob */
  url: string;
  /** Transcribed text (from Web Speech or Whisper) */
  transcript: string;
  /** Duration in seconds */
  duration: number;
}

export interface UseSpeechRecordingOptions {
  /** Language for speech recognition (default: 'en-US') */
  lang?: string;
  /** Whether to attempt transcription (default: true) */
  transcribe?: boolean;
  /** Called on each interim/final speech result for live display */
  onLiveText?: (text: string) => void;
  /** Log prefix for console.log (default: '[speech]') */
  logTag?: string;
}

export interface UseSpeechRecordingReturn {
  /** Whether currently recording */
  isRecording: boolean;
  /** Whether Whisper is transcribing after recording stopped */
  isTranscribing: boolean;
  /** Whisper model download progress (0-100), null if not loading */
  whisperProgress: number | null;
  /** Live transcript text while recording */
  liveText: string;
  /** Start recording + speech recognition */
  startRecording: () => Promise<void>;
  /** Stop recording, returns result with blob + transcript (may trigger Whisper) */
  stopRecording: () => Promise<SpeechRecordingResult | null>;
  /** Abort recording without saving */
  cancelRecording: () => void;
}

export function useSpeechRecording(options: UseSpeechRecordingOptions = {}): UseSpeechRecordingReturn {
  const {
    lang = 'en-US',
    transcribe = true,
    onLiveText,
    logTag = '[speech]',
  } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [whisperProgress, setWhisperProgress] = useState<number | null>(null);
  const [liveText, setLiveText] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef('');
  const speechProducedTextRef = useRef(false);
  const startTimeRef = useRef(0);
  const resolveStopRef = useRef<((result: SpeechRecordingResult | null) => void) | null>(null);

  const log = useCallback((...args: unknown[]) => {
    console.log(logTag, ...args);
  }, [logTag]);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];
  }, []);

  const startRecording = useCallback(async () => {
    log('startRecording');

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      log('mic stream acquired');
    } catch (err) {
      log('getUserMedia failed:', err);
      return;
    }

    streamRef.current = stream;
    chunksRef.current = [];
    transcriptRef.current = '';
    speechProducedTextRef.current = false;
    setLiveText('');

    // Start MediaRecorder
    try {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        log('MediaRecorder onstop, chunks:', chunksRef.current.length);

        if (chunksRef.current.length === 0) {
          log('no audio chunks');
          resolveStopRef.current?.(null);
          resolveStopRef.current = null;
          return;
        }

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = (Date.now() - startTimeRef.current) / 1000;
        log('blob created:', blob.size, 'bytes, duration:', duration.toFixed(1) + 's');

        // Check if we need Whisper fallback
        const needsWhisper = transcribe && !speechProducedTextRef.current;
        log('speechProducedText=', speechProducedTextRef.current, 'needsWhisper=', needsWhisper);

        if (needsWhisper && blob.size > 0) {
          log('falling back to Whisper...');
          setIsTranscribing(true);
          setWhisperProgress(null);
          try {
            const text = await transcribeBlob(blob, (p) => {
              log('Whisper progress:', p);
              setWhisperProgress(p);
            });
            log('Whisper result:', JSON.stringify(text));
            transcriptRef.current = text || '';
          } catch (err) {
            log('Whisper failed:', err);
          } finally {
            setIsTranscribing(false);
            setWhisperProgress(null);
          }
        }

        const result: SpeechRecordingResult = {
          blob,
          url,
          transcript: transcriptRef.current,
          duration,
        };
        resolveStopRef.current?.(result);
        resolveStopRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      startTimeRef.current = Date.now();
      log('MediaRecorder started');
    } catch (err) {
      log('MediaRecorder failed:', err);
    }

    // Start Web Speech API if available
    if (transcribe) {
      const SpeechRec = getSpeechRecognition();
      log('SpeechRecognition:', SpeechRec ? 'available' : 'NOT available');

      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;

        let processedFinals = 0;
        let accumulatedFinals = '';

        recognition.onresult = (event) => {
          speechProducedTextRef.current = true;
          log('onresult, results:', event.results.length);
          let interim = '';
          for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              if (i >= processedFinals) {
                const text = event.results[i][0].transcript.trim();
                log('final:', JSON.stringify(text));
                if (text) accumulatedFinals += (accumulatedFinals ? ' ' : '') + text;
                processedFinals = i + 1;
              }
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          transcriptRef.current = accumulatedFinals;
          const combined = (accumulatedFinals + (interim ? ' ' + interim : '')).trim();
          setLiveText(combined);
          onLiveText?.(combined);
        };

        recognition.onerror = (e) => {
          log('SpeechRecognition error:', e.error);
        };

        recognition.onend = () => {
          log('SpeechRecognition onend');
          if (recognitionRef.current === recognition) {
            try { recognition.start(); } catch { /* done */ }
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
          log('SpeechRecognition started');
        } catch (err) {
          log('SpeechRecognition start() failed:', err);
        }
      }
    }

    setIsRecording(true);
  }, [lang, transcribe, onLiveText, log]);

  const stopRecording = useCallback((): Promise<SpeechRecordingResult | null> => {
    log('stopRecording');

    // Stop speech recognition
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.stop();
      log('SpeechRecognition stopped');
    }

    setIsRecording(false);

    return new Promise((resolve) => {
      resolveStopRef.current = resolve;

      // Stop MediaRecorder (triggers onstop which resolves the promise)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        log('MediaRecorder stopped');
      } else {
        log('MediaRecorder already inactive');
        resolve(null);
        resolveStopRef.current = null;
      }

      // Stop mic stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    });
  }, [log]);

  const cancelRecording = useCallback(() => {
    log('cancelRecording');
    cleanup();
    setIsRecording(false);
    setLiveText('');
    resolveStopRef.current?.(null);
    resolveStopRef.current = null;
  }, [cleanup, log]);

  return {
    isRecording,
    isTranscribing,
    whisperProgress,
    liveText,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}

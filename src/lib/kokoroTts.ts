import { cleanMarkdown } from './cleanMarkdown';
import { getTtsEngine, getTtsVoice, getTtsSpeed, getPiperVoice, PIPER_VOICES } from '../hooks/useTtsSettings';
import toast from 'react-hot-toast';

type KokoroTTSInstance = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate(text: string, options: { voice: any; speed: number }): Promise<{ toBlob(): Blob }>;
};

type PiperTTSModule = {
  predict(config: { text: string; voiceId: string }): Promise<Blob>;
};

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const TAG = '[tts]';

/** Max characters to send to TTS — prevents processing huge sections */
const MAX_TTS_CHARS = 5000;

/** Detect low-power devices that can't handle AI models in the browser */
function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // Android, iPhone, iPad, or any mobile device
  if (/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua)) return true;
  // Low memory (< 4GB) — navigator.deviceMemory is available in Chrome/Edge
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  if (typeof mem === 'number' && mem < 4) return true;
  // Low core count
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2) return true;
  return false;
}

const lowPower = isLowPowerDevice();

let sessionStart = 0;
function elapsed(): string {
  return `+${((performance.now() - sessionStart) / 1000).toFixed(2)}s`;
}
function log(...args: unknown[]) {
  console.log(TAG, elapsed(), ...args);
}

// ─── Kokoro (AI model) ─────────────────────────────────────────────

function isSafari(): boolean {
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
}

let kokoroUnavailable = isSafari() || lowPower;
let ttsInstance: KokoroTTSInstance | null = null;
let ttsPromise: Promise<KokoroTTSInstance> | null = null;

async function hasWebGPU(): Promise<boolean> {
  try {
    const gpu = (navigator as unknown as { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
    if (!gpu) return false;
    const adapter = await gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

export async function getKokoroTTS(): Promise<KokoroTTSInstance> {
  if (ttsInstance) {
    log('model already loaded (cached)');
    return ttsInstance;
  }
  if (ttsPromise) {
    log('model is loading, waiting...');
    return ttsPromise;
  }

  const useGPU = await hasWebGPU();
  const device = useGPU ? 'webgpu' : 'wasm';
  const dtype = useGPU ? 'fp32' : 'q8';

  log(`starting model download... device=${device} dtype=${dtype}`);
  toast.loading('Loading Kokoro AI voice model...', { id: 'tts-loading' });

  ttsPromise = import('kokoro-js').then(async ({ KokoroTTS }) => {
    const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
      dtype,
      device,
      progress_callback: (p: { progress?: number; status?: string; file?: string }) => {
        if (p.status === 'initiate') {
          log(`⬇ downloading: ${p.file}`);
        } else if (p.status === 'done') {
          log(`✓ done: ${p.file}`);
        } else if (typeof p.progress === 'number' && p.progress > 0 && p.progress % 10 < 1) {
          log(`⬇ ${p.file} — ${p.progress.toFixed(0)}%`);
          toast.loading(`Loading Kokoro AI... ${p.progress.toFixed(0)}%`, { id: 'tts-loading' });
        }
      },
    });
    ttsInstance = tts as unknown as KokoroTTSInstance;
    log('model ready');
    toast.success('Kokoro AI voice model ready', { id: 'tts-loading', duration: 2000 });
    return ttsInstance;
  }).catch((err) => {
    ttsPromise = null;
    kokoroUnavailable = true;
    toast.error('Kokoro AI failed to load', { id: 'tts-loading', duration: 3000 });
    throw err;
  });

  return ttsPromise!;
}

export function preloadKokoro() {
  const engine = getTtsEngine();
  if (engine === 'piper') {
    preloadPiper();
    return;
  }
  if (engine !== 'kokoro') return;
  if (kokoroUnavailable) return; // includes lowPower devices — skip heavy Kokoro model
  sessionStart = performance.now();
  log('preloading model...');
  getKokoroTTS().catch((err) => {
    console.warn(TAG, 'preload failed (will fall back to native TTS):', err);
  });
}

// ─── Piper TTS (Safari-compatible) ─────────────────────────────────

let piperModule: PiperTTSModule | null = null;
let piperPromise: Promise<PiperTTSModule> | null = null;

async function getPiperTTS(): Promise<PiperTTSModule> {
  if (piperModule) return piperModule;
  if (piperPromise) return piperPromise;

  log('loading Piper TTS module...');
  toast.loading('Loading Piper AI voice model...', { id: 'tts-loading' });
  piperPromise = import('@mintplex-labs/piper-tts-web').then((mod) => {
    piperModule = mod as unknown as PiperTTSModule;
    log('Piper TTS module ready');
    toast.success('Piper AI voice model ready', { id: 'tts-loading', duration: 2000 });
    return piperModule;
  }).catch((err) => {
    piperPromise = null;
    toast.error('Piper AI failed to load', { id: 'tts-loading', duration: 3000 });
    throw err;
  });

  return piperPromise;
}

export function preloadPiper() {
  if (getTtsEngine() !== 'piper') return;
  sessionStart = performance.now();
  log('preloading Piper TTS...');
  getPiperTTS().catch((err) => {
    console.warn(TAG, 'Piper preload failed:', err);
  });
}

async function speakPiper(
  text: string,
  options?: { voice?: string; onStart?: () => void; onEnd?: () => void },
): Promise<void> {
  const t0 = performance.now();
  const perf = (label: string) => console.log(`${TAG} [perf:piper] ${label}: ${(performance.now() - t0).toFixed(0)}ms`);

  perf('start');
  const piper = await getPiperTTS();
  perf('getPiperTTS() module loaded');
  if (cancelled) return;

  const chunks = splitIntoChunks(text);
  perf(`splitIntoChunks → ${chunks.length} chunks`);

  const rawVoice = options?.voice ?? getPiperVoice();
  const voiceId = PIPER_VOICES.some((v) => v.id === rawVoice) ? rawVoice : getPiperVoice();
  perf(`voice resolved: ${voiceId}`);

  // Generate first chunk
  perf(`chunk 0: calling predict (${chunks[0].length} chars)...`);
  let nextBlob: Blob | null = await piper.predict({ text: chunks[0], voiceId });
  perf(`chunk 0: predict returned (${nextBlob ? (nextBlob.size / 1024).toFixed(0) + 'KB' : 'null'})`);
  if (!nextBlob || cancelled) { options?.onEnd?.(); return; }

  options?.onStart?.();
  perf('onStart fired');

  for (let i = 0; i < chunks.length; i++) {
    if (cancelled) { perf('cancelled'); break; }

    const currentBlob = nextBlob!;

    // Pre-generate next chunk in parallel with playback
    const nextPromise = (i + 1 < chunks.length)
      ? (() => {
          perf(`chunk ${i + 1}: calling predict (${chunks[i + 1].length} chars)...`);
          return piper.predict({ text: chunks[i + 1], voiceId }).then(b => {
            perf(`chunk ${i + 1}: predict returned (${b ? (b.size / 1024).toFixed(0) + 'KB' : 'null'})`);
            return b;
          }).catch(() => null);
        })()
      : Promise.resolve(null);

    perf(`chunk ${i}: playing (${(currentBlob.size / 1024).toFixed(0)}KB)...`);
    await playBlob(currentBlob);
    perf(`chunk ${i}: playback done`);

    nextBlob = await nextPromise;
    if (!nextBlob && i + 1 < chunks.length) break;
  }
  perf('all chunks done');
}

// ─── Native browser TTS ────────────────────────────────────────────

function speakNative(
  text: string,
  options?: { speed?: number; onStart?: () => void; onEnd?: () => void },
): Promise<void> {
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = options?.speed ?? getTtsSpeed();

  return new Promise<void>((resolve) => {
    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => { options?.onEnd?.(); resolve(); };
    utterance.onerror = () => { options?.onEnd?.(); resolve(); };
    speechSynthesis.speak(utterance);
    log('playing (native)...');
  });
}

// ─── Kokoro playback ───────────────────────────────────────────────

let cancelled = false;
let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

function playBlob(blob: Blob): Promise<void> {
  return new Promise<void>((resolve) => {
    if (currentUrl) URL.revokeObjectURL(currentUrl);

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    currentUrl = url;

    const done = () => {
      if (currentAudio === audio) {
        currentAudio = null;
        URL.revokeObjectURL(url);
        currentUrl = null;
      }
      resolve();
    };

    audio.onended = done;
    audio.onerror = done;
    audio.play().catch(done);
  });
}

// ─── Public API ────────────────────────────────────────────────────

export function stopKokoroAudio() {
  cancelled = true;
  // Stop Kokoro audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
    currentUrl = null;
  }
  // Stop native TTS
  if (typeof speechSynthesis !== 'undefined') {
    speechSynthesis.cancel();
  }
}

export function isKokoroPlaying(): boolean {
  return (currentAudio !== null && !currentAudio.paused) || speechSynthesis.speaking;
}

/**
 * Split text into chunks that Kokoro can handle without truncation.
 * First chunk is kept small (~120 chars) for fast time-to-first-audio.
 * Subsequent chunks are up to 300 chars.
 */
const FIRST_CHUNK_CHARS = 120;
const MAX_CHUNK_CHARS = 300;

function splitIntoChunks(text: string): string[] {
  // Split into paragraphs first
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const chunks: string[] = [];
  for (const para of paragraphs) {
    const limit = chunks.length === 0 ? FIRST_CHUNK_CHARS : MAX_CHUNK_CHARS;
    if (para.length <= limit) {
      chunks.push(para);
      continue;
    }
    // Split long paragraphs on sentence boundaries
    const sentences = para.match(/[^.!?]+[.!?]+\s*/g) || [para];
    let current = '';
    for (const sentence of sentences) {
      const curLimit = chunks.length === 0 && current === '' ? FIRST_CHUNK_CHARS : MAX_CHUNK_CHARS;
      if (current.length + sentence.length > curLimit && current) {
        chunks.push(current.trim());
        current = '';
      }
      current += sentence;
    }
    if (current.trim()) chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

export async function speakWithKokoro(
  text: string,
  options?: {
    voice?: string;
    speed?: number;
    onStart?: () => void;
    onEnd?: () => void;
  },
): Promise<void> {
  const t0 = performance.now();
  const perf = (label: string) => console.log(`${TAG} [perf] ${label}: ${(performance.now() - t0).toFixed(0)}ms`);

  stopKokoroAudio();
  cancelled = false;
  sessionStart = performance.now();
  perf('start');

  let clean = cleanMarkdown(text);
  if (!clean) return;
  perf(`cleanMarkdown (${text.length} → ${clean.length} chars)`);

  // Truncate very long content to avoid overwhelming TTS
  if (clean.length > MAX_TTS_CHARS) {
    log(`text too long (${clean.length} chars), truncating to ${MAX_TTS_CHARS}`);
    const truncated = clean.slice(0, MAX_TTS_CHARS);
    const lastSentence = truncated.lastIndexOf('. ');
    clean = lastSentence > MAX_TTS_CHARS * 0.5
      ? truncated.slice(0, lastSentence + 1)
      : truncated;
    perf(`truncated to ${clean.length} chars`);
  }

  const engine = getTtsEngine();
  perf(`engine resolved: ${engine}`);

  if (engine === 'native') {
    options?.onStart?.();
    perf('native: starting');
    await speakNative(clean, options);
    perf('native: done');
    return;
  }

  if (engine === 'piper' || (kokoroUnavailable && engine === 'kokoro')) {
    if (kokoroUnavailable && engine === 'kokoro') {
      perf('kokoro unavailable, falling back to piper');
    }
    try {
      perf('piper: calling speakPiper...');
      await speakPiper(clean, options);
      perf('piper: done');
      options?.onEnd?.();
    } catch (err) {
      perf(`piper: FAILED — ${err}`);
      console.warn(TAG, 'Piper failed, falling back to native TTS:', err);
      options?.onStart?.();
      await speakNative(clean, options);
      perf('native fallback: done');
    }
    return;
  }

  // Kokoro engine — split into chunks, pre-generate next while current plays
  let tts: KokoroTTSInstance;
  try {
    perf('kokoro: loading model...');
    tts = await getKokoroTTS();
    perf('kokoro: model ready');
  } catch {
    perf('kokoro: FAILED to load');
    options?.onStart?.();
    await speakNative(clean, options);
    perf('native fallback: done');
    return;
  }
  if (cancelled) return;

  const chunks = splitIntoChunks(clean);
  perf(`kokoro: ${chunks.length} chunks`);

  const voice = (options?.voice ?? getTtsVoice()) as 'af_heart';
  const speed = options?.speed ?? getTtsSpeed();

  const generateChunk = async (i: number): Promise<Blob | null> => {
    if (cancelled || i >= chunks.length) return null;
    perf(`kokoro chunk ${i}: generating (${chunks[i].length} chars)...`);
    const result = await tts.generate(chunks[i], { voice, speed });
    if (cancelled) return null;
    const blob = result.toBlob();
    perf(`kokoro chunk ${i}: generated (${(blob.size / 1024).toFixed(0)}KB)`);
    return blob;
  };

  // Generate first chunk (small — ~120 chars for fast start)
  let currentBlob = await generateChunk(0);
  if (!currentBlob || cancelled) { options?.onEnd?.(); return; }

  options?.onStart?.();
  perf('kokoro: onStart fired');

  // Only pre-generate 1 chunk ahead — start next generation immediately,
  // then play current chunk. By the time playback finishes (~15-20s),
  // the next chunk (~2s generation) is already waiting.
  for (let i = 0; i < chunks.length; i++) {
    if (cancelled) { perf('kokoro: cancelled'); break; }

    // Kick off next chunk generation (if any) BEFORE playing current
    const nextPromise = (i + 1 < chunks.length) ? generateChunk(i + 1) : null;

    perf(`kokoro chunk ${i}: playing (${(currentBlob!.size / 1024).toFixed(0)}KB)...`);
    await playBlob(currentBlob!);
    perf(`kokoro chunk ${i}: playback done`);

    if (!nextPromise) break;
    currentBlob = await nextPromise;
    if (!currentBlob || cancelled) break;
  }

  perf('kokoro: all done');
  options?.onEnd?.();
}

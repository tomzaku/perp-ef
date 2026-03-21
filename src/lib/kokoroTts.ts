import { cleanMarkdown } from './cleanMarkdown';
import { getTtsEngine, getTtsVoice, getTtsSpeed } from '../hooks/useTtsSettings';

type KokoroTTSInstance = {
  generate(text: string, options: { voice: string; speed: number }): Promise<{ toBlob(): Blob }>;
};

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const TAG = '[tts]';

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

let kokoroUnavailable = isSafari();
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
        }
      },
    });
    ttsInstance = tts;
    log('model ready');
    return tts;
  }).catch((err) => {
    ttsPromise = null;
    kokoroUnavailable = true;
    throw err;
  });

  return ttsPromise;
}

export function preloadKokoro() {
  if (getTtsEngine() !== 'kokoro') return;
  if (kokoroUnavailable) return;
  sessionStart = performance.now();
  log('preloading model...');
  getKokoroTTS().catch((err) => {
    console.warn(TAG, 'preload failed (will fall back to native TTS):', err);
  });
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
 * Splits on paragraph breaks first, then on sentence boundaries if still too long.
 */
const MAX_CHUNK_CHARS = 300;

function splitIntoChunks(text: string): string[] {
  // Split into paragraphs first
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  const chunks: string[] = [];
  for (const para of paragraphs) {
    if (para.length <= MAX_CHUNK_CHARS) {
      chunks.push(para);
      continue;
    }
    // Split long paragraphs on sentence boundaries
    const sentences = para.match(/[^.!?]+[.!?]+\s*/g) || [para];
    let current = '';
    for (const sentence of sentences) {
      if (current.length + sentence.length > MAX_CHUNK_CHARS && current) {
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
  stopKokoroAudio();
  cancelled = false;
  sessionStart = performance.now();

  const clean = cleanMarkdown(text);
  if (!clean) return;

  const engine = getTtsEngine();
  log(`speak requested (engine=${engine}), text length: ${clean.length}`);

  if (engine === 'native' || kokoroUnavailable) {
    if (kokoroUnavailable && engine !== 'native') {
      log('kokoro unavailable on this browser, falling back to native TTS');
    }
    options?.onStart?.();
    await speakNative(clean, options);
    log('done');
    return;
  }

  // Kokoro engine — split into chunks, pre-generate next while current plays
  let tts: KokoroTTSInstance;
  try {
    tts = await getKokoroTTS();
  } catch {
    log('kokoro failed to load, falling back to native TTS');
    options?.onStart?.();
    await speakNative(clean, options);
    log('done');
    return;
  }
  if (cancelled) return;

  const chunks = splitIntoChunks(clean);
  log(`split into ${chunks.length} chunks`);

  const voice = (options?.voice ?? getTtsVoice()) as 'af_heart';
  const speed = options?.speed ?? getTtsSpeed();

  // Generate a chunk and return its blob
  const generateChunk = async (i: number): Promise<Blob | null> => {
    if (cancelled || i >= chunks.length) return null;
    log(`chunk ${i}/${chunks.length}: generating (${chunks[i].length} chars)...`);
    const result = await tts.generate(chunks[i], { voice, speed });
    if (cancelled) return null;
    const blob = result.toBlob();
    log(`chunk ${i}: generated — ${(blob.size / 1024).toFixed(0)} KB`);
    return blob;
  };

  // Generate first chunk
  let nextBlob = await generateChunk(0);
  if (!nextBlob || cancelled) { options?.onEnd?.(); return; }

  options?.onStart?.();

  for (let i = 0; i < chunks.length; i++) {
    if (cancelled) { log('cancelled'); break; }

    const currentBlob = nextBlob!;

    // Start generating next chunk in parallel with playback
    const nextPromise = (i + 1 < chunks.length) ? generateChunk(i + 1) : Promise.resolve(null);

    log(`chunk ${i}: playing...`);
    await playBlob(currentBlob);
    log(`chunk ${i}: playback done`);

    // Wait for next chunk to be ready (may already be done)
    nextBlob = await nextPromise;
    if (!nextBlob && i + 1 < chunks.length) break; // generation failed
  }

  log('done');
  options?.onEnd?.();
}

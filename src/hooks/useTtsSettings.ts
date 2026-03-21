import { useState, useCallback } from 'react';

export type TtsEngine = 'kokoro' | 'piper' | 'native';

export interface TtsVoice {
  id: string;
  name: string;
  language: string;
  accent: string;
  gender: 'Female' | 'Male';
  grade: string;
}

/** @deprecated Use TtsVoice instead */
export type KokoroVoice = TtsVoice;

export const KOKORO_VOICES: KokoroVoice[] = [
  // American English - Female
  { id: 'af_heart', name: 'Heart', language: 'en-us', accent: 'American', gender: 'Female', grade: 'A' },
  { id: 'af_bella', name: 'Bella', language: 'en-us', accent: 'American', gender: 'Female', grade: 'A-' },
  { id: 'af_nicole', name: 'Nicole', language: 'en-us', accent: 'American', gender: 'Female', grade: 'B-' },
  { id: 'af_aoede', name: 'Aoede', language: 'en-us', accent: 'American', gender: 'Female', grade: 'C+' },
  { id: 'af_kore', name: 'Kore', language: 'en-us', accent: 'American', gender: 'Female', grade: 'C+' },
  { id: 'af_sarah', name: 'Sarah', language: 'en-us', accent: 'American', gender: 'Female', grade: 'C+' },
  { id: 'af_nova', name: 'Nova', language: 'en-us', accent: 'American', gender: 'Female', grade: 'C' },
  { id: 'af_alloy', name: 'Alloy', language: 'en-us', accent: 'American', gender: 'Female', grade: 'C' },
  { id: 'af_sky', name: 'Sky', language: 'en-us', accent: 'American', gender: 'Female', grade: 'C-' },
  { id: 'af_jessica', name: 'Jessica', language: 'en-us', accent: 'American', gender: 'Female', grade: 'D' },
  { id: 'af_river', name: 'River', language: 'en-us', accent: 'American', gender: 'Female', grade: 'D' },
  // American English - Male
  { id: 'am_fenrir', name: 'Fenrir', language: 'en-us', accent: 'American', gender: 'Male', grade: 'C+' },
  { id: 'am_michael', name: 'Michael', language: 'en-us', accent: 'American', gender: 'Male', grade: 'C+' },
  { id: 'am_puck', name: 'Puck', language: 'en-us', accent: 'American', gender: 'Male', grade: 'C+' },
  { id: 'am_echo', name: 'Echo', language: 'en-us', accent: 'American', gender: 'Male', grade: 'D' },
  { id: 'am_eric', name: 'Eric', language: 'en-us', accent: 'American', gender: 'Male', grade: 'D' },
  { id: 'am_liam', name: 'Liam', language: 'en-us', accent: 'American', gender: 'Male', grade: 'D' },
  { id: 'am_onyx', name: 'Onyx', language: 'en-us', accent: 'American', gender: 'Male', grade: 'D' },
  { id: 'am_adam', name: 'Adam', language: 'en-us', accent: 'American', gender: 'Male', grade: 'F+' },
  // British English - Female
  { id: 'bf_emma', name: 'Emma', language: 'en-gb', accent: 'British', gender: 'Female', grade: 'B-' },
  { id: 'bf_isabella', name: 'Isabella', language: 'en-gb', accent: 'British', gender: 'Female', grade: 'C' },
  { id: 'bf_alice', name: 'Alice', language: 'en-gb', accent: 'British', gender: 'Female', grade: 'D' },
  { id: 'bf_lily', name: 'Lily', language: 'en-gb', accent: 'British', gender: 'Female', grade: 'D' },
  // British English - Male
  { id: 'bm_fable', name: 'Fable', language: 'en-gb', accent: 'British', gender: 'Male', grade: 'C' },
  { id: 'bm_george', name: 'George', language: 'en-gb', accent: 'British', gender: 'Male', grade: 'C' },
  { id: 'bm_daniel', name: 'Daniel', language: 'en-gb', accent: 'British', gender: 'Male', grade: 'D' },
  { id: 'bm_lewis', name: 'Lewis', language: 'en-gb', accent: 'British', gender: 'Male', grade: 'D+' },
];

export const PIPER_VOICES: TtsVoice[] = [
  // American English - Female
  { id: 'en_US-hfc_female-medium', name: 'HFC Female', language: 'en-us', accent: 'American', gender: 'Female', grade: 'A' },
  { id: 'en_US-lessac-high', name: 'Lessac', language: 'en-us', accent: 'American', gender: 'Female', grade: 'A-' },
  { id: 'en_US-kristin-medium', name: 'Kristin', language: 'en-us', accent: 'American', gender: 'Female', grade: 'B' },
  { id: 'en_US-amy-medium', name: 'Amy', language: 'en-us', accent: 'American', gender: 'Female', grade: 'B' },
  { id: 'en_US-ljspeech-high', name: 'LJ Speech', language: 'en-us', accent: 'American', gender: 'Female', grade: 'B-' },
  // American English - Male
  { id: 'en_US-hfc_male-medium', name: 'HFC Male', language: 'en-us', accent: 'American', gender: 'Male', grade: 'A' },
  { id: 'en_US-ryan-high', name: 'Ryan', language: 'en-us', accent: 'American', gender: 'Male', grade: 'A-' },
  { id: 'en_US-joe-medium', name: 'Joe', language: 'en-us', accent: 'American', gender: 'Male', grade: 'B' },
  { id: 'en_US-bryce-medium', name: 'Bryce', language: 'en-us', accent: 'American', gender: 'Male', grade: 'B' },
  { id: 'en_US-john-medium', name: 'John', language: 'en-us', accent: 'American', gender: 'Male', grade: 'B-' },
  // British English
  { id: 'en_GB-cori-high', name: 'Cori', language: 'en-gb', accent: 'British', gender: 'Female', grade: 'A-' },
  { id: 'en_GB-alba-medium', name: 'Alba', language: 'en-gb', accent: 'British', gender: 'Female', grade: 'B' },
  { id: 'en_GB-jenny_dioco-medium', name: 'Jenny', language: 'en-gb', accent: 'British', gender: 'Female', grade: 'B' },
  { id: 'en_GB-alan-medium', name: 'Alan', language: 'en-gb', accent: 'British', gender: 'Male', grade: 'B' },
  { id: 'en_GB-northern_english_male-medium', name: 'Northern Male', language: 'en-gb', accent: 'British', gender: 'Male', grade: 'B' },
];

const ENGINE_KEY = 'fe-prep-tts-engine';
const VOICE_KEY = 'fe-prep-tts-voice';
const SPEED_KEY = 'fe-prep-tts-speed';

function getStoredEngine(): TtsEngine {
  try {
    const v = localStorage.getItem(ENGINE_KEY);
    if (v === 'kokoro' || v === 'piper' || v === 'native') return v;
  } catch { /* ignore */ }
  return 'native';
}

const PIPER_VOICE_KEY = 'fe-prep-tts-piper-voice';

function getStoredVoice(): string {
  try {
    const v = localStorage.getItem(VOICE_KEY);
    if (v && KOKORO_VOICES.some((voice) => voice.id === v)) return v;
  } catch { /* ignore */ }
  return 'af_heart';
}

function getStoredPiperVoice(): string {
  try {
    const v = localStorage.getItem(PIPER_VOICE_KEY);
    if (v && PIPER_VOICES.some((voice) => voice.id === v)) return v;
  } catch { /* ignore */ }
  return 'en_US-hfc_female-medium';
}

function getStoredSpeed(): number {
  try {
    const v = parseFloat(localStorage.getItem(SPEED_KEY) ?? '');
    if (v >= 0.5 && v <= 2) return v;
  } catch { /* ignore */ }
  return 1;
}

export function useTtsSettings() {
  const [engine, setEngineState] = useState<TtsEngine>(getStoredEngine);
  const [voice, setVoiceState] = useState<string>(getStoredVoice);
  const [piperVoice, setPiperVoiceState] = useState<string>(getStoredPiperVoice);
  const [speed, setSpeedState] = useState<number>(getStoredSpeed);

  const setEngine = useCallback((e: TtsEngine) => {
    setEngineState(e);
    try { localStorage.setItem(ENGINE_KEY, e); } catch { /* ignore */ }
  }, []);

  const setVoice = useCallback((v: string) => {
    setVoiceState(v);
    try { localStorage.setItem(VOICE_KEY, v); } catch { /* ignore */ }
  }, []);

  const setPiperVoice = useCallback((v: string) => {
    setPiperVoiceState(v);
    try { localStorage.setItem(PIPER_VOICE_KEY, v); } catch { /* ignore */ }
  }, []);

  const setSpeed = useCallback((s: number) => {
    setSpeedState(s);
    try { localStorage.setItem(SPEED_KEY, String(s)); } catch { /* ignore */ }
  }, []);

  return { engine, setEngine, voice, setVoice, piperVoice, setPiperVoice, speed, setSpeed };
}

/** Read-only getters for non-hook contexts */
export function getTtsEngine(): TtsEngine {
  return getStoredEngine();
}

export function getTtsVoice(): string {
  return getStoredVoice();
}

export function getPiperVoice(): string {
  return getStoredPiperVoice();
}

export function getTtsSpeed(): number {
  return getStoredSpeed();
}

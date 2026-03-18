import { useState, useCallback } from 'react';

export type TtsEngine = 'kokoro' | 'native';

const STORAGE_KEY = 'fe-prep-tts-engine';

function getStoredEngine(): TtsEngine {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'kokoro' || v === 'native') return v;
  } catch { /* ignore */ }
  return 'native';
}

export function useTtsSettings() {
  const [engine, setEngineState] = useState<TtsEngine>(getStoredEngine);

  const setEngine = useCallback((e: TtsEngine) => {
    setEngineState(e);
    try { localStorage.setItem(STORAGE_KEY, e); } catch { /* ignore */ }
  }, []);

  return { engine, setEngine };
}

/** Read-only getter for non-hook contexts */
export function getTtsEngine(): TtsEngine {
  return getStoredEngine();
}

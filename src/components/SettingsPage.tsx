import { useTtsSettings, KOKORO_VOICES, PIPER_VOICES, type TtsEngine } from '../hooks/useTtsSettings';
import { speakWithKokoro, stopKokoroAudio } from '../lib/kokoroTts';
import { useState } from 'react';

const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent);

const engines: { id: TtsEngine; label: string; desc: string; badge?: string; hidden?: boolean }[] = [
  {
    id: 'native',
    label: 'Browser Native',
    desc: 'Uses your OS/browser built-in speech synthesis. Instant playback, no download required.',
    badge: 'Fast',
  },
  {
    id: 'piper',
    label: 'Piper AI',
    desc: 'Neural TTS running locally via WASM. Good voice quality, works on all browsers including Safari.',
    badge: 'Safari-friendly',
  },
  {
    id: 'kokoro',
    label: 'Kokoro AI',
    desc: isSafari
      ? 'High-quality neural TTS (82M params). Not available on Safari — use Piper AI instead.'
      : 'High-quality neural TTS (82M params) running locally via WebGPU/WASM. ~160MB download on first use.',
    badge: isSafari ? 'Unavailable' : 'Best voice',
  },
];

const gradeColor: Record<string, string> = {
  'A': 'text-green-400',
  'A-': 'text-green-400',
  'B': 'text-blue-400',
  'B-': 'text-blue-400',
  'C+': 'text-yellow-400',
  'C': 'text-yellow-400',
  'C-': 'text-yellow-400',
  'D+': 'text-orange-400',
  'D': 'text-orange-400',
  'D-': 'text-orange-400',
  'F+': 'text-red-400',
};

export function SettingsPage() {
  const { engine, setEngine, voice, setVoice, piperVoice, setPiperVoice, speed, setSpeed } = useTtsSettings();
  const [previewState, setPreviewState] = useState<{ id: string; phase: 'loading' | 'playing' } | null>(null);

  const preview = async (voiceId: string) => {
    stopKokoroAudio();
    setPreviewState({ id: voiceId, phase: 'loading' });
    try {
      await speakWithKokoro('Hello! This is a preview of my voice. How does it sound?', {
        voice: voiceId,
        onStart: () => setPreviewState({ id: voiceId, phase: 'playing' }),
        onEnd: () => setPreviewState(null),
      });
    } catch {
      setPreviewState(null);
    }
  };

  const stopPreview = () => {
    stopKokoroAudio();
    setPreviewState(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-1">Settings</h1>
      <p className="text-sm text-text-muted mb-8">Configure your preferences.</p>

      {/* TTS Engine */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Text-to-Speech Engine
        </h2>

        <div className="space-y-3">
          {engines.map((e) => {
            const disabled = e.id === 'kokoro' && isSafari;
            return (
            <button
              key={e.id}
              onClick={() => !disabled && setEngine(e.id)}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                disabled
                  ? 'opacity-40 cursor-not-allowed bg-bg-card border-border'
                  : engine === e.id
                    ? 'bg-accent-cyan/5 border-accent-cyan/30 ring-1 ring-accent-cyan/20 cursor-pointer'
                    : 'bg-bg-card border-border hover:border-text-muted/30 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    engine === e.id ? 'border-accent-cyan' : 'border-text-muted/40'
                  }`}
                >
                  {engine === e.id && <span className="w-2 h-2 rounded-full bg-accent-cyan" />}
                </span>
                <span className={`text-sm font-medium ${engine === e.id ? 'text-accent-cyan' : 'text-text-primary'}`}>
                  {e.label}
                </span>
                {e.badge && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    engine === e.id ? 'bg-accent-cyan/15 text-accent-cyan' : 'bg-bg-tertiary text-text-muted'
                  }`}>
                    {e.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted ml-7">{e.desc}</p>
            </button>
            );
          })}
        </div>
      </section>

      {/* Speed */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Speed
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted w-8 text-right">0.5x</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="flex-1 h-1.5 accent-accent-cyan cursor-pointer"
          />
          <span className="text-xs text-text-muted w-8">2x</span>
          <span className="text-sm font-code font-medium text-accent-cyan w-12 text-center">
            {speed.toFixed(1)}x
          </span>
        </div>
      </section>

      {/* Voice Picker — shown when Kokoro or Piper is selected */}
      {(engine === 'kokoro' || engine === 'piper') && (() => {
        const isKokoro = engine === 'kokoro';
        const voices = isKokoro ? KOKORO_VOICES : PIPER_VOICES;
        const currentVoice = isKokoro ? voice : piperVoice;
        const setCurrentVoice = isKokoro ? setVoice : setPiperVoice;
        const voiceGroups = [
          { label: 'American Female', voices: voices.filter((v) => v.accent === 'American' && v.gender === 'Female') },
          { label: 'American Male', voices: voices.filter((v) => v.accent === 'American' && v.gender === 'Male') },
          { label: 'British Female', voices: voices.filter((v) => v.accent === 'British' && v.gender === 'Female') },
          { label: 'British Male', voices: voices.filter((v) => v.accent === 'British' && v.gender === 'Male') },
        ].filter((g) => g.voices.length > 0);

        return (
        <section>
          <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
            Voice
          </h2>
          <p className="text-xs text-text-muted mb-4">
            Pick a voice for {isKokoro ? 'Kokoro' : 'Piper'} AI. Click the play button to preview.
          </p>

          <div className="space-y-5">
            {voiceGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-medium text-text-muted mb-2">{group.label}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.voices.map((v) => {
                    const selected = currentVoice === v.id;
                    const isLoading = previewState?.id === v.id && previewState.phase === 'loading';
                    const isPlaying = previewState?.id === v.id && previewState.phase === 'playing';

                    return (
                      <div
                        key={v.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          selected
                            ? 'bg-accent-cyan/5 border-accent-cyan/30'
                            : 'bg-bg-card border-border hover:border-text-muted/30'
                        }`}
                        onClick={() => setCurrentVoice(v.id)}
                      >
                        {/* Radio */}
                        <span
                          className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selected ? 'border-accent-cyan' : 'border-text-muted/40'
                          }`}
                        >
                          {selected && <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan" />}
                        </span>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${selected ? 'text-accent-cyan' : 'text-text-primary'}`}>
                              {v.name}
                            </span>
                            <span className={`text-[10px] font-code font-bold ${gradeColor[v.grade] ?? 'text-text-muted'}`}>
                              {v.grade}
                            </span>
                          </div>
                        </div>

                        {/* Preview button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            (isPlaying || isLoading) ? stopPreview() : preview(v.id);
                          }}
                          className={`w-7 h-7 rounded-md flex items-center justify-center border transition-all shrink-0 cursor-pointer ${
                            isPlaying || isLoading
                              ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20'
                              : 'bg-bg-tertiary text-text-muted border-border hover:text-accent-cyan hover:border-accent-cyan/30'
                          }`}
                          title={isPlaying ? 'Stop' : isLoading ? 'Generating...' : 'Preview voice'}
                        >
                          {isLoading ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" className="animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <path d="M12 2a10 10 0 0 1 10 10" />
                            </svg>
                          ) : isPlaying ? (
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
                              <rect x="0" y="0" width="10" height="10" rx="1" />
                            </svg>
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
        );
      })()}
    </div>
  );
}

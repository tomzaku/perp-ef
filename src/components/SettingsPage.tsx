import { useTtsSettings, type TtsEngine } from '../hooks/useTtsSettings';

const engines: { id: TtsEngine; label: string; desc: string; badge?: string }[] = [
  {
    id: 'native',
    label: 'Browser Native',
    desc: 'Uses your OS/browser built-in speech synthesis. Instant playback, no download required. Voice quality depends on your system.',
    badge: 'Fast',
  },
  {
    id: 'kokoro',
    label: 'Kokoro AI',
    desc: 'High-quality neural TTS model (82M params) running locally in your browser via WebGPU/WASM. ~160MB download on first use, cached afterward. Takes a few seconds to generate.',
    badge: 'Better voice',
  },
];

export function SettingsPage() {
  const { engine, setEngine } = useTtsSettings();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-1">Settings</h1>
      <p className="text-sm text-text-muted mb-8">Configure your preferences.</p>

      {/* TTS Engine */}
      <section>
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Text-to-Speech Engine
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Choose which engine powers the read-aloud feature on questions and mock interviews.
        </p>

        <div className="space-y-3">
          {engines.map((e) => (
            <button
              key={e.id}
              onClick={() => setEngine(e.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all cursor-pointer ${
                engine === e.id
                  ? 'bg-accent-cyan/5 border-accent-cyan/30 ring-1 ring-accent-cyan/20'
                  : 'bg-bg-card border-border hover:border-text-muted/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                {/* Radio indicator */}
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    engine === e.id
                      ? 'border-accent-cyan'
                      : 'border-text-muted/40'
                  }`}
                >
                  {engine === e.id && (
                    <span className="w-2 h-2 rounded-full bg-accent-cyan" />
                  )}
                </span>

                <span className={`text-sm font-medium ${engine === e.id ? 'text-accent-cyan' : 'text-text-primary'}`}>
                  {e.label}
                </span>

                {e.badge && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    engine === e.id
                      ? 'bg-accent-cyan/15 text-accent-cyan'
                      : 'bg-bg-tertiary text-text-muted'
                  }`}>
                    {e.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted ml-7">{e.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// AI Provider abstraction — supports Anthropic, OpenAI, Perplexity, Google AI

export type ProviderId = 'anthropic' | 'openai' | 'perplexity' | 'google';

export interface AIProvider {
  id: ProviderId;
  label: string;
  description: string;
  placeholder: string;
  keysUrl: string;
  keysLabel: string;
  defaultModel: string;
  models: { id: string; label: string }[];
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'anthropic',
    label: 'Anthropic',
    description: 'Claude models — excellent reasoning and instruction-following.',
    placeholder: 'sk-ant-...',
    keysUrl: 'https://console.anthropic.com/settings/keys',
    keysLabel: 'console.anthropic.com',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
      { id: 'claude-haiku-4-20250414', label: 'Claude Haiku 4' },
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    description: 'GPT models — widely used and versatile.',
    placeholder: 'sk-...',
    keysUrl: 'https://platform.openai.com/api-keys',
    keysLabel: 'platform.openai.com',
    defaultModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4.1', label: 'GPT-4.1' },
      { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    ],
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    description: 'Search-augmented AI — great for up-to-date knowledge.',
    placeholder: 'pplx-...',
    keysUrl: 'https://www.perplexity.ai/settings/api',
    keysLabel: 'perplexity.ai',
    defaultModel: 'sonar',
    models: [
      { id: 'sonar', label: 'Sonar' },
      { id: 'sonar-pro', label: 'Sonar Pro' },
      { id: 'sonar-reasoning', label: 'Sonar Reasoning' },
      { id: 'sonar-reasoning-pro', label: 'Sonar Reasoning Pro' },
    ],
  },
  {
    id: 'google',
    label: 'Google AI',
    description: 'Gemini models — multimodal with large context.',
    placeholder: 'AIza...',
    keysUrl: 'https://aistudio.google.com/apikey',
    keysLabel: 'aistudio.google.com',
    defaultModel: 'gemini-2.5-flash',
    models: [
      { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    ],
  },
];

// ─── Storage ────────────────────────────────────────────────────────

const PROVIDER_KEY = 'fe-interview-ai-provider';
const MODEL_KEY = 'fe-interview-ai-model';
const API_KEY_PREFIX = 'fe-interview-api-key'; // legacy key (Anthropic)

export function getProvider(): ProviderId {
  return (localStorage.getItem(PROVIDER_KEY) as ProviderId) || 'anthropic';
}

export function setProvider(id: ProviderId): void {
  localStorage.setItem(PROVIDER_KEY, id);
}

export function getModel(): string {
  const stored = localStorage.getItem(MODEL_KEY);
  if (stored) return stored;
  const provider = AI_PROVIDERS.find((p) => p.id === getProvider());
  return provider?.defaultModel || 'claude-sonnet-4-20250514';
}

export function setModel(model: string): void {
  localStorage.setItem(MODEL_KEY, model);
}

export function getApiKeyForProvider(providerId: ProviderId): string {
  // Legacy support: 'anthropic' uses the original key
  if (providerId === 'anthropic') {
    return localStorage.getItem(API_KEY_PREFIX) || '';
  }
  return localStorage.getItem(`${API_KEY_PREFIX}-${providerId}`) || '';
}

export function setApiKeyForProvider(providerId: ProviderId, key: string): void {
  if (providerId === 'anthropic') {
    localStorage.setItem(API_KEY_PREFIX, key);
  } else {
    localStorage.setItem(`${API_KEY_PREFIX}-${providerId}`, key);
  }
}

/** Get API key for the currently selected provider */
export function getCurrentApiKey(): string {
  return getApiKeyForProvider(getProvider());
}

export function getProviderConfig(): AIProvider {
  const id = getProvider();
  return AI_PROVIDERS.find((p) => p.id === id) || AI_PROVIDERS[0];
}

// ─── Unified API call ───────────────────────────────────────────────

interface CallOptions {
  system: string;
  messages: { role: string; content: string }[];
  maxTokens: number;
  signal?: AbortSignal;
}

export async function callAI(opts: CallOptions): Promise<string> {
  const providerId = getProvider();
  const apiKey = getCurrentApiKey();
  const model = getModel();

  if (!apiKey) {
    throw new Error(`Please set your ${getProviderConfig().label} API key first.`);
  }

  if (providerId === 'anthropic') {
    return callAnthropic(apiKey, model, opts);
  }
  // OpenAI, Perplexity, and Google AI all use OpenAI-compatible format
  return callOpenAICompatible(providerId, apiKey, model, opts);
}

async function callAnthropic(apiKey: string, model: string, opts: CallOptions): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
    }),
    signal: opts.signal,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    throw new Error(errData?.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text || 'No response received.';
}

function getOpenAICompatibleEndpoint(providerId: ProviderId): string {
  switch (providerId) {
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'perplexity':
      return 'https://api.perplexity.ai/chat/completions';
    case 'google':
      return 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
}

async function callOpenAICompatible(
  providerId: ProviderId,
  apiKey: string,
  model: string,
  opts: CallOptions,
): Promise<string> {
  const endpoint = getOpenAICompatibleEndpoint(providerId);

  const messages = [
    { role: 'system', content: opts.system },
    ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens,
      messages,
    }),
    signal: opts.signal,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const msg = errData?.error?.message || errData?.message || `API error: ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response received.';
}

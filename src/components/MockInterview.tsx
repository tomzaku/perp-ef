import { useState, useRef, useEffect } from 'react';
import type { Question } from '../types/question';
import { useAIChat, getApiKey, setApiKey } from '../hooks/useAIChat';
import { Markdown } from './Markdown';

interface MockInterviewProps {
  question: Question;
}

export function MockInterview({ question }: MockInterviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(() => !!getApiKey());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, error, sendMessage, startInterview, reset } =
    useAIChat(question);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isLoading && messages.length > 0 && expanded) {
      inputRef.current?.focus();
    }
  }, [isLoading, messages.length, expanded]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveApiKey = () => {
    const key = apiKeyInput.trim();
    if (key) {
      setApiKey(key);
      setHasApiKey(true);
      setShowApiKeyForm(false);
      setApiKeyInput('');
    }
  };

  const handleStart = () => {
    if (!hasApiKey) {
      setShowApiKeyForm(true);
      return;
    }
    setExpanded(true);
    startInterview();
  };

  const handleReset = () => {
    reset();
    setInput('');
  };

  // Not started yet
  if (!expanded) {
    return (
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Mock Interview
        </h2>
        <div className="bg-bg-card border border-border rounded-lg p-5">
          <p className="text-sm text-text-secondary mb-4">
            Practice this problem with an AI interviewer that asks follow-ups, probes edge cases, and gives feedback — just like a real interview.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border bg-accent-purple/10 text-accent-purple border-accent-purple/30 hover:bg-accent-purple/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Start Mock Interview
            </button>
            <button
              onClick={() => setShowApiKeyForm(!showApiKeyForm)}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              {hasApiKey ? 'Change API Key' : 'Set API Key'}
            </button>
          </div>

          {showApiKeyForm && (
            <div className="mt-4 animate-fade-in space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                  placeholder="sk-ant-..."
                  className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary font-code focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 placeholder:text-text-muted"
                  autoFocus
                />
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKeyInput.trim()}
                  className="px-3 py-2 bg-accent-purple text-bg-primary text-xs font-semibold rounded-lg hover:bg-accent-purple/90 transition-colors cursor-pointer disabled:opacity-40"
                >
                  Save
                </button>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Get your API key from{' '}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-purple hover:underline"
                >
                  console.anthropic.com
                </a>
                {' '}&rarr; API Keys &rarr; Create Key. It starts with <code className="text-[10px] font-code bg-bg-tertiary px-1 py-0.5 rounded">sk-ant-...</code> and is stored locally in your browser.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-3 text-xs text-accent-red">
              <span>{error}</span>
              <button
                onClick={() => { setShowApiKeyForm(true); setHasApiKey(false); }}
                className="text-text-muted hover:text-accent-purple transition-colors cursor-pointer underline shrink-0"
              >
                Reset API Key
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Active interview
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-display font-bold text-accent-purple uppercase tracking-wider">
          Mock Interview
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="text-xs text-text-muted hover:text-accent-purple transition-colors cursor-pointer"
          >
            Restart
          </button>
          <button
            onClick={() => { setExpanded(false); handleReset(); }}
            className="text-xs text-text-muted hover:text-accent-red transition-colors cursor-pointer"
          >
            End
          </button>
        </div>
      </div>

      <div className="bg-bg-card border border-accent-purple/20 rounded-lg overflow-hidden">
        {/* Messages */}
        <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-accent-purple/10 text-text-primary border border-accent-purple/20'
                    : 'bg-bg-tertiary text-text-primary border border-border'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <Markdown content={msg.content} />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-bg-tertiary border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between gap-3 text-xs text-accent-red bg-accent-red/5 border border-accent-red/20 rounded-lg px-3 py-2">
              <span>{error}</span>
              <button
                onClick={() => { setExpanded(false); handleReset(); setShowApiKeyForm(true); setHasApiKey(false); }}
                className="text-text-muted hover:text-accent-purple transition-colors cursor-pointer underline shrink-0"
              >
                Reset API Key
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              rows={2}
              disabled={isLoading}
              className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 placeholder:text-text-muted disabled:opacity-50 font-code"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-accent-purple text-bg-primary text-sm font-medium rounded-lg hover:bg-accent-purple/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              Send
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-text-muted">
              Enter to send, Shift+Enter for new line
            </span>
            <span className="text-[10px] text-text-muted">
              Powered by Claude
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

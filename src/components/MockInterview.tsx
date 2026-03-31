import { useState, useRef, useEffect, useCallback } from 'react';
import type { Question, SavedConversation } from '../types/question';
import { useAIChat } from '../hooks/useAIChat';
import { useConversations } from '../hooks/useConversations';
import { getCurrentApiKey, getProviderConfig } from '../lib/aiProviders';
import { Link } from 'react-router-dom';
import { Markdown } from './Markdown';
import { ReadAloud } from './ReadAloud';
import { speakWithKokoro, stopKokoroAudio } from '../lib/kokoroTts';

// ─── Web Speech API helpers ──────────────────────────────────────────
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

interface MockInterviewProps {
  question: Question;
}

export function MockInterview({ question }: MockInterviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(() => !!getCurrentApiKey());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [autoRead, setAutoRead] = useState(false);
  const lastReadIndexRef = useRef(-1);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, error, sendMessage, startInterview, reset, setMessages } =
    useAIChat(question);
  const { conversations, saveConversation, updateConversation, deleteConversation } =
    useConversations(question.id);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleLoadConversation = useCallback((conv: SavedConversation) => {
    setMessages(conv.messages);
    setActiveConvId(conv.id);
    setExpanded(true);
    setShowHistory(false);
    setInput('');
  }, [setMessages]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    if (activeConvId === id) setActiveConvId(null);
  }, [deleteConversation, activeConvId]);

  // Auto-save after each assistant response
  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    // Only save when a new message was added (not on load)
    if (messages.length > prevMessageCountRef.current && messages[messages.length - 1].role === 'assistant') {
      if (activeConvId) {
        updateConversation(activeConvId, messages);
      } else {
        const conv = saveConversation(messages);
        setActiveConvId(conv.id);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading, activeConvId, saveConversation, updateConversation]);

  // Auto-read new assistant messages
  const speakText = useCallback((text: string) => {
    stopKokoroAudio();
    speakWithKokoro(text).catch(() => {});
  }, []);

  useEffect(() => {
    if (!autoRead || isLoading || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && messages.length - 1 > lastReadIndexRef.current) {
      lastReadIndexRef.current = messages.length - 1;
      speakText(lastMsg.content);
    }
  }, [messages, isLoading, autoRead, speakText]);

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

  // Auto-resize textarea
  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    autoResize(inputRef.current);
  }, [input, autoResize]);

  // ─── Voice recording (Speech-to-Text) ─────────────────────────────
  const startRecording = useCallback(async () => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) return;

    // Request mic permission if needed
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
    } catch {
      return;
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    const baseText = input; // Text that was in the input before recording
    let processedFinals = 0; // Track how many results we've already finalized
    let accumulatedFinals = ''; // All finalized speech so far

    recognition.onresult = (event) => {
      let interim = '';
      // Only process new final results to avoid duplication
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          if (i >= processedFinals) {
            const text = event.results[i][0].transcript.trim();
            if (text) {
              accumulatedFinals += (accumulatedFinals ? ' ' : '') + text;
            }
            processedFinals = i + 1;
          }
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const combined = baseText + (baseText && accumulatedFinals ? ' ' : '') + accumulatedFinals;
      setInput(combined + (interim ? (combined ? ' ' : '') + interim : ''));
      setRecordingText(interim);
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setIsRecording(false);
        recognitionRef.current = null;
      }
    };

    recognition.onend = () => {
      // Auto-restart if still recording (browser stops after silence)
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch { /* already stopped */ }
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setRecordingText('');
    } catch {
      // Speech recognition not available
    }
  }, [input]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.stop();
    }
    setIsRecording(false);
    setRecordingText('');
    // Focus textarea so user can edit/send
    inputRef.current?.focus();
  }, []);

  // Cleanup recognition on unmount / reset
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleStart = () => {
    // Re-check in case user just came back from settings
    const keyNow = !!getCurrentApiKey();
    setHasApiKey(keyNow);
    if (!keyNow) return;
    setExpanded(true);
    startInterview();
  };

  const handleReset = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setRecordingText('');
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
          <p className="text-sm text-text-secondary mb-3">
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
          </div>

          {!hasApiKey && (
            <div className="mt-4 animate-fade-in flex items-center gap-2 text-xs text-text-muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-purple shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                Set up your API key in{' '}
                <Link to="/settings" className="text-accent-purple hover:underline font-medium">
                  Settings
                </Link>
                {' '}to get started. Google Gemini offers a free tier.
              </span>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-3 text-xs text-accent-red">
              <span>{error}</span>
              <Link
                to="/settings"
                className="text-text-muted hover:text-accent-purple transition-colors underline shrink-0"
              >
                Check Settings
              </Link>
            </div>
          )}

          {/* History panel in start view */}
          {conversations.length > 0 && (
            <div className="mt-4 border border-border rounded-lg overflow-hidden animate-fade-in">
              <div className="px-3 py-2 border-b border-border bg-bg-tertiary/50">
                <span className="text-xs font-medium text-text-secondary">Previous sessions</span>
              </div>
              <div className="max-h-[200px] overflow-y-auto divide-y divide-border">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="px-3 py-2 flex items-center gap-2 hover:bg-bg-tertiary transition-colors group"
                  >
                    <button
                      onClick={() => handleLoadConversation(conv)}
                      className="flex-1 text-left cursor-pointer min-w-0"
                    >
                      <div className="text-xs text-text-primary truncate">{conv.title}</div>
                      <div className="text-[10px] text-text-muted mt-0.5">
                        {conv.messages.length} messages
                      </div>
                    </button>
                    <button
                      onClick={() => handleDeleteConversation(conv.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all cursor-pointer p-1 shrink-0"
                      title="Delete"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
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
          {activeConvId && <span className="text-[10px] text-text-muted font-normal ml-2 normal-case tracking-normal">(saved)</span>}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRead(!autoRead)}
            className={`text-xs transition-colors cursor-pointer ${
              autoRead ? 'text-accent-cyan' : 'text-text-muted hover:text-accent-cyan'
            }`}
            title={autoRead ? 'Disable auto-read' : 'Auto-read questions'}
          >
            {autoRead ? '🔊 Auto-read on' : '🔇 Auto-read'}
          </button>
          <span className="text-border">|</span>
          <button
            onClick={() => { stopKokoroAudio(); handleReset(); setActiveConvId(null); }}
            className="text-xs text-text-muted hover:text-accent-purple transition-colors cursor-pointer"
          >
            Restart
          </button>
          <button
            onClick={() => { stopKokoroAudio(); setExpanded(false); handleReset(); setActiveConvId(null); }}
            className="text-xs text-text-muted hover:text-accent-red transition-colors cursor-pointer"
          >
            End
          </button>

          {/* Menu icon */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-text-muted hover:text-text-secondary transition-colors cursor-pointer rounded"
              title="Options"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-bg-card border border-border rounded-lg shadow-lg z-50 py-1 animate-fade-in">
                <div className="px-3 py-2 text-[10px] text-text-muted flex items-center gap-1.5 border-b border-border">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Auto-saving enabled
                </div>
                <button
                  onClick={() => { setShowHistory(!showHistory); setShowMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:bg-bg-tertiary transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {showHistory ? 'Hide history' : 'Conversation history'}
                  {conversations.length > 0 && (
                    <span className="ml-auto bg-accent-purple/20 text-accent-purple text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                      {conversations.length}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversation history panel */}
      {showHistory && (
        <div className="mb-3 bg-bg-card border border-border rounded-lg overflow-hidden animate-fade-in">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium text-text-secondary">Saved conversations</span>
            <button
              onClick={() => setShowHistory(false)}
              className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          {conversations.length === 0 ? (
            <div className="px-3 py-4 text-xs text-text-muted text-center">
              No saved conversations yet
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto divide-y divide-border">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`px-3 py-2 flex items-center gap-2 hover:bg-bg-tertiary transition-colors group ${
                    activeConvId === conv.id ? 'bg-accent-purple/5 border-l-2 border-l-accent-purple' : ''
                  }`}
                >
                  <button
                    onClick={() => handleLoadConversation(conv)}
                    className="flex-1 text-left cursor-pointer min-w-0"
                  >
                    <div className="text-xs text-text-primary truncate">{conv.title}</div>
                    <div className="text-[10px] text-text-muted mt-0.5">
                      {conv.messages.length} messages
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all cursor-pointer p-1 shrink-0"
                    title="Delete"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-bg-card border border-accent-purple/20 rounded-lg overflow-hidden">
        {/* Messages */}
        <div className="min-h-[300px] max-h-[70vh] overflow-y-auto p-4 space-y-4">
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
                  <>
                    <Markdown content={msg.content} />
                    <div className="mt-2 flex justify-end">
                      <ReadAloud text={msg.content} />
                    </div>
                  </>
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
              <Link
                to="/settings"
                className="text-text-muted hover:text-accent-purple transition-colors underline shrink-0"
              >
                Check Settings
              </Link>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          {/* Recording indicator */}
          {isRecording && (
            <div className="flex items-center gap-2 mb-2 px-1 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-red" />
              </span>
              <span className="text-xs text-accent-red font-medium">Recording...</span>
              {recordingText && (
                <span className="text-xs text-text-muted italic truncate">{recordingText}</span>
              )}
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? 'Listening...' : 'Type or hold mic to speak...'}
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-none focus:outline-none focus:border-accent-purple/50 focus:ring-1 focus:ring-accent-purple/20 placeholder:text-text-muted disabled:opacity-50 font-code min-h-[2.5rem] max-h-[200px]"
            />
            {/* Mic button */}
            {getSpeechRecognition() && (
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                  isRecording
                    ? 'bg-accent-red/10 text-accent-red border border-accent-red/30 hover:bg-accent-red/20'
                    : 'bg-bg-tertiary text-text-muted border border-border hover:text-accent-purple hover:border-accent-purple/30'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="3" y="3" width="10" height="10" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
            )}
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
              {getSpeechRecognition()
                ? 'Enter to send, Shift+Enter for new line, or use mic'
                : 'Enter to send, Shift+Enter for new line'
              }
            </span>
            <span className="text-[10px] text-text-muted">
              Powered by {getProviderConfig().label}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

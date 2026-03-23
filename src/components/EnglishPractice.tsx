import { useState, useRef, useEffect, useCallback } from 'react';
import { useEnglishChat, ENGLISH_TOPICS, type TopicId, type PracticeMode } from '../hooks/useEnglishChat';
import { useEnglishConversations, type EnglishConversation } from '../hooks/useEnglishConversations';
import { useLearnings, type LearningCategory } from '../hooks/useLearnings';
import { Markdown } from './Markdown';
import { ReadAloud } from './ReadAloud';
import { speakWithKokoro, stopKokoroAudio, preloadKokoro } from '../lib/kokoroTts';
import { getApiKey } from '../hooks/useAIChat';
import { useFabStore } from '../hooks/useFabStore';

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

// ─── Category UI config ─────────────────────────────────────────────
const CATEGORY_CONFIG: Record<LearningCategory, { icon: string; label: string; color: string; bg: string; border: string }> = {
  grammar: { icon: '📝', label: 'Grammar', color: 'text-accent-red', bg: 'bg-accent-red/8', border: 'border-accent-red/20' },
  vocabulary: { icon: '📖', label: 'Vocabulary', color: 'text-accent-cyan', bg: 'bg-accent-cyan/8', border: 'border-accent-cyan/20' },
  rephrase: { icon: '🔄', label: 'Rephrase', color: 'text-accent-purple', bg: 'bg-accent-purple/8', border: 'border-accent-purple/20' },
  tip: { icon: '💡', label: 'Tip', color: 'text-accent-yellow', bg: 'bg-accent-yellow/8', border: 'border-accent-yellow/20' },
};

type SetupStep = 'mode' | 'topic';
type DrawerTab = 'chat' | 'learnings';

export function EnglishPractice() {
  const { panel, closePanel } = useFabStore();
  const open = panel === 'englishPractice';
  const onClose = closePanel;

  const [input, setInput] = useState('');
  const [autoRead, setAutoRead] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [setupStep, setSetupStep] = useState<SetupStep>('mode');
  const [selectedMode, setSelectedMode] = useState<PracticeMode | null>(null);
  const [maximized, setMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>('chat');
  const [learningFilter, setLearningFilter] = useState<LearningCategory | 'all'>('all');

  // Voice recording storage: map message index → audio blob URL
  const [voiceRecordings, setVoiceRecordings] = useState<Record<number, string>>({});
  const [playingVoice, setPlayingVoice] = useState<number | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const lastReadIndexRef = useRef(-1);
  const autoReadQueueRef = useRef<string | null>(null);

  const {
    messages, isLoading, error, currentTopic, mode,
    sendMessage, startConversation, summarizeMistakes, reset, setMessages, setCurrentTopic, setMode,
    setOnLearnings,
  } = useEnglishChat();

  const {
    conversations, saveConversation, updateConversation, deleteConversation,
  } = useEnglishConversations();

  const { items: allLearnings, addItems: addLearningsToStore, removeItem: removeLearning, clear: clearLearnings } = useLearnings();
  const [showAllLearnings, setShowAllLearnings] = useState(false);

  // Preload TTS when drawer opens
  useEffect(() => {
    if (open) preloadKokoro();
  }, [open]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Auto-save after each assistant response
  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    if (isLoading || messages.length === 0 || !currentTopic || !mode) return;
    if (messages.length > prevMessageCountRef.current && messages[messages.length - 1].role === 'assistant') {
      if (activeConvId) {
        updateConversation(activeConvId, messages);
      } else {
        const topicLabel = ENGLISH_TOPICS.find((t) => t.id === currentTopic)?.label || currentTopic;
        const modeLabel = mode === 'smooth' ? 'Smooth' : 'Feedback';
        const conv = saveConversation(
          currentTopic, mode, messages,
          `${topicLabel} (${modeLabel}) — ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        );
        setActiveConvId(conv.id);
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading, activeConvId, currentTopic, mode, saveConversation, updateConversation]);

  // Wire up learnings extraction callback — the hook calls this
  // whenever it strips a ~~~learnings block from an AI response
  const activeConvIdRef = useRef<string | null>(null);
  activeConvIdRef.current = activeConvId;
  useEffect(() => {
    const addLearnings: typeof addLearningsToStore = (items) => {
      addLearningsToStore(items, activeConvIdRef.current ?? undefined);
    };
    setOnLearnings(addLearnings);
    return () => setOnLearnings(null);
  }, [setOnLearnings, addLearningsToStore]);

  // Auto-read new assistant messages
  useEffect(() => {
    if (!autoRead || isLoading || messages.length === 0 || !open) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant' && messages.length - 1 > lastReadIndexRef.current) {
      lastReadIndexRef.current = messages.length - 1;
      autoReadQueueRef.current = lastMsg.content;
      const timer = setTimeout(() => {
        const text = autoReadQueueRef.current;
        if (text) {
          autoReadQueueRef.current = null;
          speakWithKokoro(text).catch(() => {});
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading, autoRead, open]);

  // Stop audio when drawer closes
  useEffect(() => {
    if (!open) {
      autoReadQueueRef.current = null;
      stopKokoroAudio();
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, summaryText]);

  // Focus input after AI responds
  useEffect(() => {
    if (!isLoading && messages.length > 0 && currentTopic && open && activeTab === 'chat') {
      inputRef.current?.focus();
    }
  }, [isLoading, messages.length, currentTopic, open, activeTab]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setSummaryText(null);
    sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    autoResize(inputRef.current);
  }, [input, autoResize]);

  // ─── Summarize mistakes ───────────────────────────────────
  const handleSummarize = async () => {
    if (messages.length < 2 || isLoading || isSummarizing) return;
    stopKokoroAudio();
    setIsSummarizing(true);
    const result = await summarizeMistakes(messages);
    setIsSummarizing(false);
    if (result) {
      setSummaryText(result);
      // Learnings are auto-extracted by the hook via processResponse
    }
  };

  // ─── Voice recording (speech recognition + audio capture) ──
  const startRecording = useCallback(async () => {
    const SpeechRec = getSpeechRecognition();
    if (!SpeechRec) return;

    // Get mic stream for both MediaRecorder and speech recognition
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch { return; }

    // Start MediaRecorder to capture audio
    mediaStreamRef.current = stream;
    audioChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
    } catch {
      // MediaRecorder not available — continue without audio capture
    }

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    const baseText = input;
    let processedFinals = 0;
    let accumulatedFinals = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          if (i >= processedFinals) {
            const text = event.results[i][0].transcript.trim();
            if (text) accumulatedFinals += (accumulatedFinals ? ' ' : '') + text;
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
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch { /* done */ }
      }
    };
    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
      setRecordingText('');
    } catch { /* not available */ }
  }, [input]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      rec.stop();
    }

    // Stop MediaRecorder and save audio blob
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      recorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          // Store for the message that's about to be sent (current messages.length will be the user message index)
          const msgIndex = messages.length;
          setVoiceRecordings((prev) => ({ ...prev, [msgIndex]: url }));
        }
        audioChunksRef.current = [];
      };
      recorder.stop();
    }
    mediaRecorderRef.current = null;

    // Stop mic stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    setRecordingText('');
    inputRef.current?.focus();
  }, [messages.length]);

  // Play/stop voice recording
  const playVoiceRecording = useCallback((msgIndex: number) => {
    // Stop any currently playing recording
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current = null;
    }

    if (playingVoice === msgIndex) {
      setPlayingVoice(null);
      return;
    }

    const url = voiceRecordings[msgIndex];
    if (!url) return;

    const audio = new Audio(url);
    voiceAudioRef.current = audio;
    setPlayingVoice(msgIndex);

    audio.onended = () => {
      voiceAudioRef.current = null;
      setPlayingVoice(null);
    };
    audio.onerror = () => {
      voiceAudioRef.current = null;
      setPlayingVoice(null);
    };
    audio.play();
  }, [playingVoice, voiceRecordings]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
    };
  }, []);

  // ─── Mode & topic selection ───────────────────────────────
  const handleSelectMode = (m: PracticeMode) => {
    setSelectedMode(m);
    setSetupStep('topic');
  };

  const handlePickTopic = (topicId: TopicId) => {
    if (!getApiKey() || !selectedMode) return;
    lastReadIndexRef.current = -1;
    prevMessageCountRef.current = 0;

    setActiveConvId(null);
    setSummaryText(null);
    setActiveTab('chat');
    startConversation(topicId, selectedMode);
  };

  const handleNewConversation = useCallback(() => {
    stopKokoroAudio();
    autoReadQueueRef.current = null;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setRecordingText('');
    lastReadIndexRef.current = -1;
    prevMessageCountRef.current = 0;

    reset();
    setInput('');
    setActiveConvId(null);
    setSummaryText(null);
    setSelectedMode(null);
    setSetupStep('mode');
    setActiveTab('chat');
  }, [reset]);

  const handleLoadConversation = useCallback((conv: EnglishConversation) => {
    stopKokoroAudio();
    autoReadQueueRef.current = null;
    setMessages(conv.messages);
    setCurrentTopic(conv.topicId);
    setMode(conv.mode || 'smooth');
    setSelectedMode(conv.mode || 'smooth');
    setActiveConvId(conv.id);
    setShowHistory(false);
    setInput('');
    setSummaryText(null);
    setActiveTab('chat');
    lastReadIndexRef.current = conv.messages.length;
    prevMessageCountRef.current = conv.messages.length;

  }, [setMessages, setCurrentTopic, setMode]);

  const handleDeleteConversation = useCallback((id: string) => {
    deleteConversation(id);
    if (activeConvId === id) {
      setActiveConvId(null);
      handleNewConversation();
    }
  }, [deleteConversation, activeConvId, handleNewConversation]);

  const hasApiKey = !!getApiKey();
  const userMessageCount = messages.filter((m) => m.role === 'user').length;
  const inConversation = !!currentTopic;

  const learnings = showAllLearnings || !activeConvId
    ? allLearnings
    : allLearnings.filter((l) => l.conversationId === activeConvId);

  const filteredLearnings = learningFilter === 'all'
    ? learnings
    : learnings.filter((l) => l.category === learningFilter);

  // ─── Drawer width class ───────────────────────────────────
  const drawerWidth = maximized
    ? 'w-full'
    : 'w-full sm:w-[480px]';

  // ─── Setup screens ────────────────────────────────────────
  const renderSetup = () => {
    if (setupStep === 'mode') {
      return (
        <div className="p-5">
          <p className="text-base text-text-secondary mb-1">How would you like to practice?</p>
          <p className="text-sm text-text-muted mb-5">
            Choose your conversation style — you can always switch next time.
          </p>
          {!hasApiKey && (
            <div className="mb-4 p-3 rounded-lg bg-accent-yellow/10 border border-accent-yellow/20 text-sm text-accent-yellow">
              Set your Anthropic API key first — use the Mock Interview section or Settings.
            </div>
          )}
          <div className="grid gap-3">
            <button
              onClick={() => handleSelectMode('smooth')}
              disabled={!hasApiKey}
              className="w-full text-left p-4 rounded-lg border border-border bg-bg-card hover:border-accent-green/40 hover:bg-accent-green/5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-9 h-9 rounded-lg bg-accent-green/15 text-accent-green flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <span className="text-base font-semibold text-text-primary group-hover:text-accent-green transition-colors">
                  Smooth Conversation
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Natural flowing chat — no interruptions. Get a full feedback summary at the end with grammar, vocabulary, and native phrasing.
              </p>
            </button>
            <button
              onClick={() => handleSelectMode('feedback')}
              disabled={!hasApiKey}
              className="w-full text-left p-4 rounded-lg border border-border bg-bg-card hover:border-accent-purple/40 hover:bg-accent-purple/5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-9 h-9 rounded-lg bg-accent-purple/15 text-accent-purple flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </span>
                <span className="text-base font-semibold text-text-primary group-hover:text-accent-purple transition-colors">
                  Feedback on Every Message
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Instant corrections after each response — grammar fixes, vocabulary, rephrased sentences, and tips to sound more native.
              </p>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSetupStep('mode')}
            className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <p className="text-base text-text-secondary">Pick a topic</p>
            <p className="text-xs text-text-muted">
              {selectedMode === 'smooth' ? 'Smooth Conversation' : 'Feedback on Every Message'}
            </p>
          </div>
        </div>
        <div className="grid gap-2">
          {ENGLISH_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handlePickTopic(topic.id)}
              disabled={!hasApiKey}
              className="w-full text-left px-4 py-3 rounded-lg border border-border bg-bg-card hover:border-accent-green/40 hover:bg-accent-green/5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed group"
            >
              <span className="text-[15px] font-medium text-text-primary group-hover:text-accent-green transition-colors">
                {topic.label}
              </span>
              <span className="text-sm text-text-muted block mt-0.5">{topic.desc}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ─── Learnings tab ────────────────────────────────────────
  const renderLearnings = () => {
    return (
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-base font-semibold text-text-primary">My Learnings</p>
            <p className="text-sm text-text-muted">{learnings.length} items{!showAllLearnings && activeConvId ? ' from this conversation' : ' from all conversations'}</p>
          </div>
          <div className="flex items-center gap-2">
            {activeConvId && (
              <div className="flex rounded-full border border-border overflow-hidden">
                <button
                  onClick={() => setShowAllLearnings(false)}
                  className={`text-xs px-2.5 py-1 transition-colors cursor-pointer ${
                    !showAllLearnings
                      ? 'bg-accent-purple/10 text-accent-purple'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  This conv
                </button>
                <button
                  onClick={() => setShowAllLearnings(true)}
                  className={`text-xs px-2.5 py-1 transition-colors cursor-pointer ${
                    showAllLearnings
                      ? 'bg-accent-purple/10 text-accent-purple'
                      : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  All
                </button>
              </div>
            )}
            {learnings.length > 0 && (
              <button
                onClick={clearLearnings}
                className="text-xs text-text-muted hover:text-accent-red transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(['all', 'grammar', 'vocabulary', 'rephrase', 'tip'] as const).map((cat) => {
            const count = cat === 'all' ? learnings.length : learnings.filter((l) => l.category === cat).length;
            const isActive = learningFilter === cat;
            const config = cat !== 'all' ? CATEGORY_CONFIG[cat] : null;
            return (
              <button
                key={cat}
                onClick={() => setLearningFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  isActive
                    ? cat === 'all'
                      ? 'bg-text-primary/10 text-text-primary border-text-primary/20'
                      : `${config!.bg} ${config!.color} ${config!.border}`
                    : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
                }`}
              >
                {cat === 'all' ? 'All' : `${config!.icon} ${config!.label}`}
                <span className="ml-1 opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Learning cards */}
        {filteredLearnings.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="text-sm mb-1">No learnings yet</p>
            <p className="text-xs">Start a conversation with "Feedback" mode, or use "Get feedback" in smooth mode — corrections will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLearnings.map((item) => {
              const config = CATEGORY_CONFIG[item.category];
              return (
                <div
                  key={item.id}
                  className={`rounded-lg border ${config.border} ${config.bg} p-3.5 group`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className={`text-xs font-semibold ${config.color} flex items-center gap-1.5`}>
                      {config.icon} {config.label}
                    </span>
                    <button
                      onClick={() => removeLearning(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all cursor-pointer p-0.5"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  {item.category === 'tip' ? (
                    <p className="text-[15px] text-text-primary leading-relaxed">{item.corrected}</p>
                  ) : (
                    <>
                      {item.original && (
                        <p className="text-[15px] text-text-muted line-through mb-1">{item.original}</p>
                      )}
                      <p className="text-[15px] text-text-primary font-medium mb-1">{item.corrected}</p>
                      {item.explanation && (
                        <p className="text-sm text-text-secondary">{item.explanation}</p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => { stopKokoroAudio(); onClose(); }}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 ${drawerWidth} bg-bg-secondary border-l border-border flex flex-col transition-all duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-md bg-accent-green/20 text-accent-green flex items-center justify-center text-sm font-bold">EN</span>
            <div>
              <h2 className="text-base font-display font-bold text-text-primary">English Practice</h2>
              {currentTopic && (
                <span className="text-xs text-text-muted">
                  {ENGLISH_TOPICS.find((t) => t.id === currentTopic)?.label}
                  {' · '}
                  {mode === 'smooth' ? 'Smooth' : 'Feedback'}
                  {activeConvId && ' · saved'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {inConversation && (
              <>
                <button
                  onClick={() => setAutoRead(!autoRead)}
                  className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                    autoRead ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-accent-cyan'
                  }`}
                >
                  {autoRead ? 'Auto-read on' : 'Auto-read'}
                </button>
                <button
                  onClick={handleNewConversation}
                  className="text-xs px-2 py-1 rounded text-text-muted hover:text-accent-green transition-colors cursor-pointer"
                >
                  New
                </button>
              </>
            )}
            {conversations.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                  showHistory ? 'bg-accent-purple/10 text-accent-purple' : 'text-text-muted hover:text-accent-purple'
                }`}
              >
                History ({conversations.length})
              </button>
            )}
            {/* Maximize / restore */}
            <button
              onClick={() => setMaximized(!maximized)}
              className="hidden sm:flex p-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer rounded"
              title={maximized ? 'Restore size' : 'Maximize'}
            >
              {maximized ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" /><line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                </svg>
              )}
            </button>
            <button
              onClick={() => { stopKokoroAudio(); onClose(); }}
              className="p-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs — show when in conversation or have learnings */}
        {(inConversation || allLearnings.length > 0) && (
          <div className="flex border-b border-border shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'text-accent-green border-b-2 border-accent-green'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('learnings')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'learnings'
                  ? 'text-accent-purple border-b-2 border-accent-purple'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              My Learnings
              {allLearnings.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === 'learnings' ? 'bg-accent-purple/20 text-accent-purple' : 'bg-bg-tertiary text-text-muted'
                }`}>
                  {learnings.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* History panel */}
        {showHistory && (
          <div className="border-b border-border bg-bg-card shrink-0 animate-fade-in">
            <div className="max-h-[200px] overflow-y-auto divide-y divide-border">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`px-4 py-2.5 flex items-center gap-2 hover:bg-bg-tertiary transition-colors group ${
                    activeConvId === conv.id ? 'bg-accent-green/5 border-l-2 border-l-accent-green' : ''
                  }`}
                >
                  <button
                    onClick={() => handleLoadConversation(conv)}
                    className="flex-1 text-left cursor-pointer min-w-0"
                  >
                    <div className="text-sm text-text-primary truncate">{conv.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{conv.messages.length} messages</div>
                  </button>
                  <button
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent-red transition-all cursor-pointer p-1 shrink-0"
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'learnings' ? (
            renderLearnings()
          ) : !inConversation ? (
            renderSetup()
          ) : (
            <div className={`p-5 space-y-4 ${maximized ? 'max-w-3xl mx-auto' : ''}`}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`${maximized ? 'max-w-[70%]' : 'max-w-[85%]'} rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-accent-green/10 text-text-primary border border-accent-green/20'
                        : 'bg-bg-tertiary text-text-primary border border-border'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <>
                        <Markdown content={msg.content} className={maximized ? 'eng-text-lg' : ''} />
                        <div className="mt-2 flex justify-end">
                          <ReadAloud text={msg.content} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`${maximized ? 'text-2xl' : 'text-sm'} leading-relaxed whitespace-pre-wrap`}>{msg.content}</div>
                        {voiceRecordings[i] && (
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => playVoiceRecording(i)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                                playingVoice === i
                                  ? 'bg-accent-green/20 text-accent-green border-accent-green/30'
                                  : 'bg-accent-green/5 text-accent-green/70 border-accent-green/15 hover:bg-accent-green/15 hover:text-accent-green'
                              }`}
                              title={playingVoice === i ? 'Stop playback' : 'Play your recording'}
                            >
                              {playingVoice === i ? (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                                  <rect x="0" y="0" width="10" height="10" rx="1" />
                                </svg>
                              ) : (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              )}
                              {playingVoice === i ? 'Stop' : 'My voice'}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && !isSummarizing && (
                <div className="flex justify-start">
                  <div className="bg-bg-tertiary border border-border rounded-lg px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-accent-green animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-accent-green animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-accent-green animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-accent-red bg-accent-red/5 border border-accent-red/20 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              {/* Summary section */}
              {(summaryText || isSummarizing) && (
                <div className="mt-4 border border-accent-purple/30 rounded-lg overflow-hidden animate-fade-in">
                  <div className="px-4 py-2.5 bg-accent-purple/10 border-b border-accent-purple/20 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-purple">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    <span className="text-sm font-medium text-accent-purple">Feedback Summary</span>
                  </div>
                  <div className={`p-4 leading-relaxed ${maximized ? 'eng-text-lg' : ''}`}>
                    {isSummarizing ? (
                      <div className="flex items-center gap-2 text-text-muted text-sm py-3">
                        <span className="w-4 h-4 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
                        Analyzing your conversation...
                      </div>
                    ) : summaryText ? (
                      <Markdown content={summaryText} />
                    ) : null}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area — only when in chat conversation */}
        {inConversation && activeTab === 'chat' && (
          <div className={`border-t border-border p-4 shrink-0 ${maximized ? 'max-w-3xl mx-auto w-full' : ''}`}>
            {isRecording && (
              <div className="flex items-center gap-2 mb-2 px-1 animate-fade-in">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-red opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-red" />
                </span>
                <span className="text-sm text-accent-red font-medium">Recording...</span>
                {recordingText && (
                  <span className="text-sm text-text-muted italic truncate">{recordingText}</span>
                )}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? 'Listening...' : 'Type or use mic to speak...'}
                rows={1}
                disabled={isLoading}
                className={`flex-1 bg-bg-primary border border-border rounded-lg px-3 text-text-primary resize-none focus:outline-none focus:border-accent-green/50 focus:ring-1 focus:ring-accent-green/20 placeholder:text-text-muted disabled:opacity-50 max-h-[200px] ${maximized ? 'py-3 text-2xl min-h-[3.25rem]' : 'py-2 text-sm min-h-[2.5rem]'}`}
              />
              {getSpeechRecognition() && (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`p-2.5 rounded-lg transition-all cursor-pointer shrink-0 ${
                    isRecording
                      ? 'bg-accent-red/10 text-accent-red border border-accent-red/30 hover:bg-accent-red/20'
                      : 'bg-bg-tertiary text-text-muted border border-border hover:text-accent-green hover:border-accent-green/30'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  title={isRecording ? 'Stop recording' : 'Voice input'}
                >
                  {isRecording ? (
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="3" y="3" width="10" height="10" rx="1" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className={`bg-accent-green text-bg-primary font-medium rounded-lg hover:bg-accent-green/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${maximized ? 'px-5 py-3 text-xl' : 'px-4 py-2 text-sm'}`}
              >
                Send
              </button>
            </div>
            {/* Feedback summary button */}
            {userMessageCount >= 1 && (
              <button
                onClick={handleSummarize}
                disabled={isLoading || isSummarizing}
                className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  mode === 'smooth'
                    ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/25 hover:bg-accent-purple/20'
                    : 'text-accent-purple hover:bg-accent-purple/10'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                {mode === 'smooth' ? 'Get feedback & corrections' : 'Summarize all feedback'}
              </button>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-text-muted">
                {getSpeechRecognition()
                  ? 'Enter to send · Shift+Enter for new line · Mic for voice'
                  : 'Enter to send · Shift+Enter for new line'
                }
              </span>
              <span className="text-xs text-text-muted">Powered by Claude</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

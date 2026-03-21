import { useState, useMemo } from 'react';
import { speakingQuestions, speakingTopics } from '../data/englishSpeaking';
import { ReadAloud } from './ReadAloud';

export function EnglishSpeakingPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      selectedTopic === 'all'
        ? speakingQuestions
        : speakingQuestions.filter((q) => q.topic === selectedTopic),
    [selectedTopic],
  );

  const topicCounts = useMemo(() => {
    const map: Record<string, number> = {};
    speakingQuestions.forEach((q) => {
      map[q.topic] = (map[q.topic] || 0) + 1;
    });
    return map;
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-1">
        English Speaking Practice
      </h1>
      <p className="text-sm text-text-muted mb-6">
        Common conversation questions with sample answers. Read them aloud and practice speaking naturally.
      </p>

      {/* Topic filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setSelectedTopic('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            selectedTopic === 'all'
              ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
              : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
          }`}
        >
          All <span className="ml-1 opacity-60">{speakingQuestions.length}</span>
        </button>
        {speakingTopics.map((topic) => (
          <button
            key={topic}
            onClick={() => setSelectedTopic(topic)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
              selectedTopic === topic
                ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            {topic} <span className="ml-1 opacity-60">{topicCounts[topic] || 0}</span>
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="rounded-lg border border-border bg-bg-card overflow-hidden transition-all"
            >
              {/* Question header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full text-left px-5 py-4 flex items-start gap-3 cursor-pointer hover:bg-bg-hover/50 transition-colors"
              >
                <span className="w-7 h-7 rounded-md bg-accent-green/15 text-accent-green flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  Q
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-text-primary leading-relaxed">
                    {q.question}
                  </p>
                  <span className="text-[11px] text-text-muted mt-1 block">{q.topic}</span>
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-text-muted shrink-0 mt-1 transition-transform duration-200 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-border animate-fade-in">
                  {/* Sample answers */}
                  <div className="px-5 py-4 space-y-4">
                    {q.sampleAnswers.map((sa, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-accent-cyan">
                              Sample Answer
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-tertiary text-text-muted">
                              {sa.label}
                            </span>
                          </div>
                          <ReadAloud text={sa.answer} />
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                          {sa.answer}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Useful phrases */}
                  {q.usefulPhrases && q.usefulPhrases.length > 0 && (
                    <div className="px-5 py-3 bg-accent-yellow/5 border-t border-accent-yellow/10">
                      <p className="text-xs font-semibold text-accent-yellow mb-2">
                        Useful Phrases
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {q.usefulPhrases.map((phrase, i) => (
                          <span
                            key={i}
                            className="text-xs px-2.5 py-1 rounded-full bg-accent-yellow/10 text-text-secondary border border-accent-yellow/15"
                          >
                            {phrase}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <p className="text-sm">No questions found for this topic.</p>
        </div>
      )}
    </div>
  );
}

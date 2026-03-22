import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '../hooks/useProgress';
import { useLabels } from '../hooks/useLabels';
import { allQuestions } from '../data';
import type { Question } from '../types/question';
import { DifficultyBadge } from './DifficultyBadge';

const LABEL_COLORS = [
  { bg: 'bg-accent-cyan/10', text: 'text-accent-cyan', border: 'border-accent-cyan/20' },
  { bg: 'bg-accent-purple/10', text: 'text-accent-purple', border: 'border-accent-purple/20' },
  { bg: 'bg-accent-orange/10', text: 'text-accent-orange', border: 'border-accent-orange/20' },
  { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/20' },
  { bg: 'bg-accent-green/10', text: 'text-accent-green', border: 'border-accent-green/20' },
  { bg: 'bg-accent-yellow/10', text: 'text-accent-yellow', border: 'border-accent-yellow/20' },
];

function getLabelColor(index: number) {
  return LABEL_COLORS[index % LABEL_COLORS.length];
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { completed, bookmarked } = useProgressStore();
  const { labelNames, questionLabels, createLabel, deleteLabel, getQuestionsByLabel } = useLabels();
  const [newLabel, setNewLabel] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'completed' | 'bookmarked' | string>('completed');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreateLabel = () => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    createLabel(trimmed);
    setNewLabel('');
  };

  const handleDeleteLabel = (name: string) => {
    if (confirmDelete === name) {
      deleteLabel(name);
      setConfirmDelete(null);
      if (selectedFilter === name) setSelectedFilter('completed');
    } else {
      setConfirmDelete(name);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  // Build question map for quick lookup
  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    allQuestions.forEach((q) => map.set(q.id, q));
    return map;
  }, []);

  // Get filtered question IDs
  const filteredIds = useMemo(() => {
    if (selectedFilter === 'all') return allQuestions.map((q) => q.id);
    if (selectedFilter === 'completed') return Array.from(completed);
    if (selectedFilter === 'bookmarked') return Array.from(bookmarked);
    return getQuestionsByLabel(selectedFilter);
  }, [selectedFilter, completed, bookmarked, questionLabels, labelNames]);

  const filteredQuestions = useMemo(
    () => filteredIds.map((id) => questionMap.get(id)).filter(Boolean) as Question[],
    [filteredIds, questionMap],
  );

  // Stats
  const stats = useMemo(() => {
    const byCategory: Record<string, { total: number; completed: number }> = {};
    allQuestions.forEach((q) => {
      if (!byCategory[q.category]) byCategory[q.category] = { total: 0, completed: 0 };
      byCategory[q.category].total++;
      if (completed.has(q.id)) byCategory[q.category].completed++;
    });
    return byCategory;
  }, [completed]);

  const labelStats = useMemo(() => {
    const map: Record<string, number> = {};
    labelNames.forEach((name) => {
      map[name] = getQuestionsByLabel(name).length;
    });
    return map;
  }, [labelNames, questionLabels]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-display font-bold text-text-primary mb-1">Profile</h1>
      <p className="text-sm text-text-muted mb-6">Track your progress and organize questions with labels.</p>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="p-4 rounded-lg border border-border bg-bg-card">
          <p className="text-2xl font-bold text-accent-green font-code">{completed.size}</p>
          <p className="text-xs text-text-muted mt-1">Completed</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-bg-card">
          <p className="text-2xl font-bold text-accent-orange font-code">{bookmarked.size}</p>
          <p className="text-xs text-text-muted mt-1">Bookmarked</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-bg-card">
          <p className="text-2xl font-bold text-accent-cyan font-code">{allQuestions.length}</p>
          <p className="text-xs text-text-muted mt-1">Total Questions</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-bg-card">
          <p className="text-2xl font-bold text-accent-purple font-code">{labelNames.length}</p>
          <p className="text-xs text-text-muted mt-1">Labels</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Progress by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(stats).sort((a, b) => a[0].localeCompare(b[0])).map(([cat, { total, completed: done }]) => {
            const pct = Math.round((done / total) * 100);
            return (
              <div key={cat} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-bg-card">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary truncate">{cat}</span>
                    <span className="text-xs font-code text-text-muted">{done}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-cyan to-accent-green rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Labels Management */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Custom Labels
        </h2>
        <p className="text-xs text-text-muted mb-3">Create labels to organize questions (e.g., "1st attempt failure", "top30", "review later").</p>

        {/* Create new label */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
            placeholder="New label name..."
            className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20"
          />
          <button
            onClick={handleCreateLabel}
            disabled={!newLabel.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>

        {/* Label list */}
        {labelNames.length === 0 ? (
          <div className="text-center py-6 text-text-muted border border-dashed border-border rounded-lg">
            <p className="text-xs">No labels yet. Create one above to get started.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {labelNames.map((name, i) => {
              const color = getLabelColor(i);
              const count = labelStats[name] || 0;
              return (
                <div
                  key={name}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${color.bg} ${color.text} ${color.border} group`}
                >
                  <span>{name}</span>
                  <span className="opacity-60">{count}</span>
                  <button
                    onClick={() => handleDeleteLabel(name)}
                    className="ml-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity cursor-pointer"
                    title={confirmDelete === name ? 'Click again to confirm' : 'Delete label'}
                  >
                    {confirmDelete === name ? (
                      <span className="text-[10px]">confirm?</span>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Filtered Question List */}
      <section>
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Questions
        </h2>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(['completed', 'bookmarked', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                selectedFilter === filter
                  ? filter === 'completed'
                    ? 'bg-accent-green/10 text-accent-green border-accent-green/20'
                    : filter === 'bookmarked'
                      ? 'bg-accent-orange/10 text-accent-orange border-accent-orange/20'
                      : 'bg-text-primary/10 text-text-primary border-text-primary/20'
                  : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
              }`}
            >
              {filter === 'completed' ? `Completed (${completed.size})` : filter === 'bookmarked' ? `Bookmarked (${bookmarked.size})` : `All (${allQuestions.length})`}
            </button>
          ))}
          {labelNames.map((name, i) => {
            const color = getLabelColor(i);
            const count = labelStats[name] || 0;
            return (
              <button
                key={name}
                onClick={() => setSelectedFilter(name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                  selectedFilter === name
                    ? `${color.bg} ${color.text} ${color.border}`
                    : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
                }`}
              >
                {name} ({count})
              </button>
            );
          })}
        </div>

        {/* Question list */}
        <div className="space-y-1.5">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-text-muted">
              <p className="text-sm">No questions found.</p>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => navigate(`/question/${q.id}`)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-bg-card hover:border-accent-cyan/30 hover:bg-bg-hover transition-all cursor-pointer group"
              >
                <span className="text-xs font-code text-text-muted w-16 shrink-0">{q.id}</span>
                <span className="text-sm font-medium text-text-primary group-hover:text-accent-cyan transition-colors flex-1 min-w-0 truncate">
                  {q.title}
                </span>
                <DifficultyBadge difficulty={q.difficulty} />
                {/* Labels */}
                <div className="flex items-center gap-1 shrink-0">
                  {(questionLabels[q.id] || []).map((label) => {
                    const idx = labelNames.indexOf(label);
                    const color = getLabelColor(idx >= 0 ? idx : 0);
                    return (
                      <span key={label} className={`text-[10px] px-1.5 py-0.5 rounded ${color.bg} ${color.text}`}>
                        {label}
                      </span>
                    );
                  })}
                </div>
                {completed.has(q.id) && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-easy shrink-0">
                    <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

import { useState, useMemo } from 'react';
import type { Question, Difficulty, Category } from '../types/question';
import { SearchBar } from './SearchBar';
import { QuestionCard } from './QuestionCard';
import { useTags } from '../hooks/useTags';

interface QuestionListPageProps {
  title: string;
  description?: string;
  questions: Question[];
  category?: Category | 'All';
  isCompleted: (id: string) => boolean;
  isBookmarked: (id: string) => boolean;
  toggleCompleted: (id: string) => void;
  toggleBookmarked: (id: string) => void;
}

export function QuestionListPage({
  title,
  description,
  questions,
  isCompleted,
  isBookmarked,
  toggleCompleted,
  toggleBookmarked,
}: QuestionListPageProps) {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | 'All'>('All');
  const [company, setCompany] = useState('All');
  const [subcategory, setSubcategory] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  const { tagNames, questionTags } = useTags();

  const filteredQuestions = useMemo(() => {
    let qs = questions;

    if (search) {
      const lower = search.toLowerCase();
      qs = qs.filter(
        (q) =>
          q.title.toLowerCase().includes(lower) ||
          q.description.toLowerCase().includes(lower) ||
          q.pattern.toLowerCase().includes(lower) ||
          q.companies.some((c) => c.toLowerCase().includes(lower))
      );
    }
    if (difficulty !== 'All') qs = qs.filter((q) => q.difficulty === difficulty);
    if (company !== 'All') qs = qs.filter((q) => q.companies.includes(company));
    if (subcategory !== 'All') qs = qs.filter((q) => q.subcategory === subcategory);
    if (tagFilter !== 'All') qs = qs.filter((q) => (questionTags[q.id] || []).includes(tagFilter));

    return qs;
  }, [questions, search, difficulty, company, subcategory, tagFilter, questionTags]);

  const allCompanies = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.companies.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [questions]);

  const allSubcategories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.subcategory));
    return Array.from(set).sort();
  }, [questions]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold text-text-primary mb-1">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary mb-1">{description}</p>
        )}
        <p className="text-xs text-text-muted">
          {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
        </p>
      </div>

      <SearchBar
        search={search}
        onSearchChange={setSearch}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        company={company}
        onCompanyChange={setCompany}
        companies={allCompanies}
        subcategory={subcategory}
        onSubcategoryChange={setSubcategory}
        subcategories={allSubcategories}
      />

      {tagNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setTagFilter('All')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
              tagFilter === 'All'
                ? 'bg-text-primary/10 text-text-primary border-text-primary/20'
                : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            All tags
          </button>
          {tagNames.map((name) => (
            <button
              key={name}
              onClick={() => setTagFilter(tagFilter === name ? 'All' : name)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                tagFilter === name
                  ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'
                  : 'bg-bg-tertiary text-text-muted border-transparent hover:text-text-secondary'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3 stagger">
        {filteredQuestions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            isCompleted={isCompleted(q.id)}
            isBookmarked={isBookmarked(q.id)}
            onToggleCompleted={() => toggleCompleted(q.id)}
            onToggleBookmarked={() => toggleBookmarked(q.id)}
          />
        ))}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-16 text-text-muted">
            <p className="text-lg mb-2">No questions found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </>
  );
}

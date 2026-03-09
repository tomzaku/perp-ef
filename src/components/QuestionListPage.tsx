import { useState, useMemo } from 'react';
import type { Question, Difficulty, Category } from '../types/question';
import { SearchBar } from './SearchBar';
import { QuestionCard } from './QuestionCard';

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

    return qs;
  }, [questions, search, difficulty, company, subcategory]);

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

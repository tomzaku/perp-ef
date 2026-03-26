import type { Question, Category } from '../types/question';
import { FilterableQuestionList } from './FilterableQuestionList';

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
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold text-text-primary mb-1">{title}</h1>
        {description && (
          <p className="text-sm text-text-secondary mb-1">{description}</p>
        )}
      </div>

      <FilterableQuestionList
        questions={questions}
        isCompleted={isCompleted}
        isBookmarked={isBookmarked}
        toggleCompleted={toggleCompleted}
        toggleBookmarked={toggleBookmarked}
      />
    </>
  );
}

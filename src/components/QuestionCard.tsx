import { useNavigate } from 'react-router-dom';
import type { Question } from '../types/question';
import { DifficultyBadge } from './DifficultyBadge';
import { PriorityBadge } from './PriorityBadge';
import { CompanyTag } from './CompanyTag';
import { useAuth } from '../hooks/useAuth';
import { useTagsStore } from '../hooks/useTags';
import { useShallow } from 'zustand/react/shallow';

interface QuestionCardProps {
  question: Question;
  isCompleted: boolean;
  isBookmarked: boolean;
  onToggleCompleted: () => void;
  onToggleBookmarked: () => void;
}

export function QuestionCard({
  question,
  isCompleted,
  isBookmarked,
  onToggleCompleted,
  onToggleBookmarked,
}: QuestionCardProps) {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const questionTags = useTagsStore(useShallow((s) => s.questionTags[question.id] ?? []));

  const handleProtectedAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      action();
    } else {
      signInWithGoogle();
    }
  };

  return (
    <div
      className={`group relative border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:border-accent-cyan/30 hover:bg-bg-hover ${
        isCompleted
          ? 'border-easy/20 bg-easy/[0.03]'
          : 'border-border bg-bg-card'
      }`}
      onClick={() => navigate(`/question/${question.id}`)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleProtectedAction(onToggleCompleted)}
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            isCompleted
              ? 'border-easy bg-easy/20 text-easy'
              : 'border-border-light hover:border-accent-cyan/50'
          }`}
        >
          {isCompleted && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-code text-text-muted">{question.id}</span>
            <DifficultyBadge difficulty={question.difficulty} />
            {question.priority && <PriorityBadge priority={question.priority} />}
            <span className="text-xs text-text-muted px-1.5 py-0.5 bg-bg-tertiary rounded">
              {question.pattern}
            </span>
            {question.leetcodeUrl && (
              <a
                href={question.leetcodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] text-accent-orange hover:text-accent-orange/80 transition-colors"
              >
                LeetCode
              </a>
            )}
          </div>

          <h3
            className={`text-sm font-semibold mb-2 transition-colors ${
              isCompleted ? 'text-text-secondary line-through decoration-easy/30' : 'text-text-primary group-hover:text-accent-cyan'
            }`}
          >
            {question.title}
          </h3>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {question.companies.map((c) => (
              <CompanyTag key={c} company={c} />
            ))}
            {questionTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-accent-purple/10 text-accent-purple border border-accent-purple/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[11px] text-text-muted">
            <span>{question.subcategory}</span>
            <span className="text-border hidden sm:inline">|</span>
            <span>Time: {question.timeComplexity}</span>
            <span className="text-border hidden sm:inline">|</span>
            <span>Space: {question.spaceComplexity}</span>
          </div>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleProtectedAction(onToggleBookmarked)}
          className={`mt-0.5 p-1 transition-colors cursor-pointer ${
            isBookmarked ? 'text-accent-orange' : 'text-text-muted/30 hover:text-accent-orange/50'
          }`}
        >
          <svg width="14" height="18" viewBox="0 0 14 18" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <path d="M1 3C1 1.89543 1.89543 1 3 1H11C12.1046 1 13 1.89543 13 3V17L7 13L1 17V3Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

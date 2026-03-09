import type { Difficulty } from '../types/question';

const colorMap: Record<Difficulty, string> = {
  Easy: 'bg-easy/10 text-easy border-easy/20',
  Medium: 'bg-medium/10 text-medium border-medium/20',
  Hard: 'bg-hard/10 text-hard border-hard/20',
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${colorMap[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

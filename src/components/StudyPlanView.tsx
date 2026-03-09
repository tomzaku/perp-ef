import { Link } from 'react-router-dom';
import type { StudyPlanItem } from '../types/question';
import type { Question } from '../types/question';

interface StudyPlanViewProps {
  plan: StudyPlanItem[];
  questions: Question[];
  isCompleted: (id: string) => boolean;
}

const categoryColors: Record<string, string> = {
  Algorithm: 'border-accent-cyan/30 bg-accent-cyan/5',
  JavaScript: 'border-accent-orange/30 bg-accent-orange/5',
  'Node.js': 'border-accent-green/30 bg-accent-green/5',
  React: 'border-accent-blue/30 bg-accent-blue/5',
  'Design System': 'border-accent-purple/30 bg-accent-purple/5',
  'Design Patterns': 'border-medium/30 bg-medium/5',
  'System Design': 'border-hard/30 bg-hard/5',
};

const categoryAccents: Record<string, string> = {
  Algorithm: 'text-accent-cyan',
  JavaScript: 'text-accent-orange',
  'Node.js': 'text-accent-green',
  React: 'text-accent-blue',
  'Design System': 'text-accent-purple',
  'Design Patterns': 'text-medium',
  'System Design': 'text-hard',
};

export function StudyPlanView({ plan, questions, isCompleted }: StudyPlanViewProps) {
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-text-primary mb-2">
          15-Week Study Plan
        </h1>
        <p className="text-sm text-text-secondary">
          A structured roadmap from algorithms to design systems. Follow week by week for comprehensive preparation.
        </p>
      </div>

      <div className="space-y-6 stagger">
        {plan.map((week) => {
          const weekQuestions = week.questionIds
            .map((id) => questionMap.get(id))
            .filter(Boolean) as Question[];
          const completedInWeek = weekQuestions.filter((q) => isCompleted(q.id)).length;
          const pct = weekQuestions.length > 0 ? Math.round((completedInWeek / weekQuestions.length) * 100) : 0;

          return (
            <div
              key={week.week}
              className={`border rounded-xl p-5 transition-all ${categoryColors[week.category] || 'border-border bg-bg-card'}`}
            >
              {/* Week header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xs font-code text-text-muted">
                      WEEK {String(week.week).padStart(2, '0')}
                    </span>
                    <span className={`text-xs font-semibold ${categoryAccents[week.category] || 'text-text-secondary'}`}>
                      {week.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary">{week.title}</h2>
                </div>
                <div className="text-right">
                  <span className="text-xs font-code text-text-muted">
                    {completedInWeek}/{weekQuestions.length}
                  </span>
                  <div className="w-20 h-1.5 bg-bg-primary/50 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-accent-green rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Topics */}
              <div className="flex flex-wrap gap-2 mb-4">
                {week.topics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-1 text-[11px] bg-bg-primary/40 text-text-secondary rounded border border-white/5"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Questions grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {weekQuestions.map((q) => {
                  const done = isCompleted(q.id);
                  return (
                    <Link
                      key={q.id}
                      to={`/question/${q.id}`}
                      className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all border ${
                        done
                          ? 'border-easy/20 bg-easy/5'
                          : 'border-white/5 bg-bg-primary/30 hover:bg-bg-primary/60 hover:border-white/10'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 text-[10px] ${
                          done ? 'border-easy bg-easy/20 text-easy' : 'border-border-light'
                        }`}
                      >
                        {done && '✓'}
                      </span>
                      <span className={`text-xs flex-1 truncate ${done ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                        {q.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          q.difficulty === 'Easy'
                            ? 'text-easy'
                            : q.difficulty === 'Medium'
                            ? 'text-medium'
                            : 'text-hard'
                        }`}
                      >
                        {q.difficulty[0]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

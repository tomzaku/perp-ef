import { useParams, Link } from 'react-router-dom';
import type { LearningPathCategory } from '../types/question';
import type { Question } from '../types/question';
import { CodeBlock } from './CodeBlock';
import { DifficultyBadge } from './DifficultyBadge';
import { Markdown } from './Markdown';

interface LearningPathViewProps {
  paths: LearningPathCategory[];
  questions: Question[];
  isCompleted: (id: string) => boolean;
  basePath: string;
  title: string;
  subtitle: string;
}

function PathList({ paths, questions, isCompleted, basePath, title, subtitle }: LearningPathViewProps) {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-display font-bold text-text-primary mb-2">
          {title}
        </h1>
        <p className="text-sm text-text-secondary">
          {subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
        {paths.map((path) => {
          const pathQuestions = path.questionIds
            .map((id) => questions.find((q) => q.id === id))
            .filter(Boolean) as Question[];
          const completed = pathQuestions.filter((q) => isCompleted(q.id)).length;
          const pct = pathQuestions.length > 0 ? Math.round((completed / pathQuestions.length) * 100) : 0;

          return (
            <Link
              key={path.slug}
              to={`${basePath}/path/${path.slug}`}
              className="block border border-border bg-bg-card rounded-xl p-5 hover:border-accent-cyan/30 hover:bg-bg-hover transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-lg bg-accent-cyan/10 text-accent-cyan flex items-center justify-center font-code font-bold text-sm">
                  {path.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-cyan transition-colors">
                    {path.title}
                  </h3>
                  <span className="text-[11px] text-text-muted">{pathQuestions.length} problems</span>
                </div>
              </div>

              <p className="text-xs text-text-secondary mb-3 line-clamp-2">
                {path.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-cyan to-accent-green rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-code text-text-muted">
                  {completed}/{pathQuestions.length}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PathDetail({ paths, questions, isCompleted, basePath }: LearningPathViewProps) {
  const { slug } = useParams<{ slug: string }>();
  const path = paths.find((p) => p.slug === slug);

  if (!path) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p>Path not found</p>
        <Link to={basePath} className="text-accent-cyan hover:underline text-sm mt-2 block">
          Back to paths
        </Link>
      </div>
    );
  }

  const pathQuestions = path.questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter(Boolean) as Question[];

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Back */}
      <Link
        to={basePath}
        className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors mb-6 text-sm"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 12L6 8L10 4" />
        </svg>
        All Paths
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-12 h-12 rounded-lg bg-accent-cyan/10 text-accent-cyan flex items-center justify-center font-code font-bold text-lg">
            {path.icon}
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-text-primary">
              {path.title}
            </h1>
            <p className="text-sm text-text-secondary">{pathQuestions.length} problems</p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Introduction
        </h2>
        <div className="bg-bg-card border border-border rounded-lg p-5 text-sm text-text-primary leading-relaxed">
          {path.description}
        </div>
      </section>

      {/* ELI5 */}
      {path.eli5 && (
        <section className="mb-8">
          <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
            Explain Like I'm 5
          </h2>
          <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-5">
            <Markdown content={path.eli5} />
          </div>
        </section>
      )}

      {/* Deep Dive Article */}
      {path.article && (
        <section className="mb-8">
          <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
            Deep Dive
          </h2>
          <div className="bg-bg-card border border-border rounded-lg p-5">
            <Markdown content={path.article} />
          </div>
        </section>
      )}

      {/* Poem */}
      {path.poem && (
        <section className="mb-8">
          <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg p-5">
            <h2 className="text-xs font-display font-bold text-accent-cyan uppercase tracking-wider mb-3">
              A Poem to Remember
            </h2>
            <pre className="text-sm text-text-secondary leading-relaxed font-body whitespace-pre-wrap italic">
              {path.poem}
            </pre>
          </div>
        </section>
      )}

      {/* Pattern */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          The Pattern
        </h2>
        <div className="bg-bg-card border border-border rounded-lg p-5 text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
          {path.pattern}
        </div>
      </section>

      {/* When to Use */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          When to Use
        </h2>
        <div className="bg-bg-card border border-border rounded-lg p-5">
          <ul className="space-y-2">
            {path.whenToUse.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                <span className="text-accent-cyan mt-0.5 shrink-0">&#x2022;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Key Insights */}
      {path.keyInsights.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
            Key Insights
          </h2>
          <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg p-5">
            <ul className="space-y-2">
              {path.keyInsights.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                  <span className="text-accent-green mt-0.5 shrink-0">&#x2713;</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Template Code */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Code Template
        </h2>
        <CodeBlock code={path.template} title={`${path.title} Template`} />
      </section>

      {/* Problem List */}
      <section className="mb-8">
        <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
          Practice Problems ({pathQuestions.length})
        </h2>
        <div className="space-y-2">
          {pathQuestions.map((q, i) => {
            const done = isCompleted(q.id);
            return (
              <Link
                key={q.id}
                to={`/question/${q.id}`}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:border-accent-cyan/30 ${
                  done ? 'border-easy/20 bg-easy/[0.03]' : 'border-border bg-bg-card hover:bg-bg-hover'
                }`}
              >
                <span className="text-xs font-code text-text-muted w-6 text-right">
                  {i + 1}.
                </span>
                <span
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 text-[10px] ${
                    done ? 'border-easy bg-easy/20 text-easy' : 'border-border-light'
                  }`}
                >
                  {done && '✓'}
                </span>
                <span className={`flex-1 text-sm truncate ${done ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
                  {q.title}
                </span>
                <DifficultyBadge difficulty={q.difficulty} />
                <div className="hidden sm:flex gap-1">
                  {q.companies.slice(0, 3).map((c) => (
                    <span key={c} className="text-[9px] text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export { PathList, PathDetail };

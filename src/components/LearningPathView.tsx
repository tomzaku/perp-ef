import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { LearningPathCategory } from '../types/question';
import type { Question } from '../types/question';
import { CodeBlock } from './CodeBlock';
import { DifficultyBadge } from './DifficultyBadge';
import { Markdown } from './Markdown';
import { AskChatGpt } from './AskChatGpt';
import { ReadAloud } from './ReadAloud';
import { FilterableQuestionList } from './FilterableQuestionList';

interface LearningPathViewProps {
  paths: LearningPathCategory[];
  questions: Question[];
  isCompleted: (id: string) => boolean;
  isBookmarked?: (id: string) => boolean;
  toggleCompleted?: (id: string) => void;
  toggleBookmarked?: (id: string) => void;
  basePath: string;
  title: string;
  subtitle: string;
}

function PathList({ paths, questions, isCompleted, isBookmarked, toggleCompleted, toggleBookmarked, basePath, title, subtitle }: LearningPathViewProps) {
  const [activeTab, setActiveTab] = useState<'learning' | 'questions'>('learning');

  // Collect all unique questions referenced by paths in this scope
  const scopeQuestions = useMemo(() => {
    const seen = new Set<string>();
    const result: Question[] = [];
    for (const p of paths) {
      for (const id of p.questionIds) {
        if (!seen.has(id)) {
          seen.add(id);
          const q = questions.find((q) => q.id === id);
          if (q) result.push(q);
        }
      }
    }
    return result;
  }, [paths, questions]);

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

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        <button
          onClick={() => setActiveTab('learning')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'learning'
              ? 'border-accent-cyan text-accent-cyan'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Learning Paths
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
            activeTab === 'questions'
              ? 'border-accent-cyan text-accent-cyan'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          All Questions
          <span className="ml-1.5 text-xs text-text-muted">({scopeQuestions.length})</span>
        </button>
      </div>

      {activeTab === 'learning' ? (
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
      ) : (
        <FilterableQuestionList
          questions={scopeQuestions}
          isCompleted={isCompleted}
          isBookmarked={isBookmarked ?? (() => false)}
          toggleCompleted={toggleCompleted ?? (() => {})}
          toggleBookmarked={toggleBookmarked ?? (() => {})}
          hideCount
        />
      )}
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

  // Group questions by subcategory (sub-domain)
  const subDomains = useMemo(() => {
    const groups: { name: string; questions: Question[] }[] = [];
    const seen = new Map<string, number>();
    for (const q of pathQuestions) {
      const sub = q.subcategory;
      if (seen.has(sub)) {
        groups[seen.get(sub)!].questions.push(q);
      } else {
        seen.set(sub, groups.length);
        groups.push({ name: sub, questions: [q] });
      }
    }
    return groups;
  }, [pathQuestions]);

  const [activeSubDomain, setActiveSubDomain] = useState<string | null>(null);

  const filteredQuestions = activeSubDomain
    ? pathQuestions.filter((q) => q.subcategory === activeSubDomain)
    : pathQuestions;

  return (
    <div className="max-w-5xl animate-fade-in">
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
            <p className="text-sm text-text-secondary">{pathQuestions.length} problems &middot; {subDomains.length} sub-domains</p>
          </div>
        </div>
      </div>

      {/* Two-column layout: Content + Sections sidebar */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
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
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider">
                  Explain Like I'm 5
                </h2>
                <ReadAloud text={path.eli5} />
              </div>
              <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-5">
                <Markdown content={path.eli5} />
              </div>
            </section>
          )}

          {/* Deep Dive Article */}
          {path.article && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider">
                  Deep Dive
                </h2>
                <ReadAloud text={path.article} />
              </div>
              <div className="bg-bg-card border border-border rounded-lg p-5">
                <Markdown content={path.article} />
              </div>
            </section>
          )}

          {/* Poem */}
          {path.poem && (
            <section className="mb-8">
              <div className="bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-display font-bold text-accent-cyan uppercase tracking-wider">
                    A Poem to Remember
                  </h2>
                  <ReadAloud text={path.poem} />
                </div>
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

          {/* Problem List - grouped by sub-domain */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider">
                Practice Problems ({filteredQuestions.length})
              </h2>
              {activeSubDomain && (
                <button
                  onClick={() => setActiveSubDomain(null)}
                  className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                >
                  Show all
                </button>
              )}
            </div>

            {/* Section links (mobile - shown above questions) */}
            {path.sections.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
                {path.sections.map((s) => (
                  <Link
                    key={s.slug}
                    to={`${basePath}/path/${path.slug}/section/${s.slug}`}
                    className="text-xs px-3 py-1.5 rounded-full border border-border text-text-secondary hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
                  >
                    {s.title}
                  </Link>
                ))}
              </div>
            )}

            {activeSubDomain ? (
              /* Filtered: flat list */
              <div className="space-y-2">
                {filteredQuestions.map((q, i) => {
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
            ) : (
              /* Default: grouped by sub-domain */
              <div className="space-y-6">
                {subDomains.map((sd) => {
                  const completedCount = sd.questions.filter((q) => isCompleted(q.id)).length;
                  return (
                    <div key={sd.name}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xs font-display font-bold text-accent-cyan uppercase tracking-wider">
                          {sd.name}
                        </h3>
                        <span className="text-[10px] font-code text-text-muted">
                          {completedCount}/{sd.questions.length}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <div className="space-y-2">
                        {sd.questions.map((q, i) => {
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
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar - Sections Navigation (desktop only) */}
        {path.sections.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-8">
              <h3 className="text-xs font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
                Sections
              </h3>
              <nav className="space-y-1">
                {path.sections.map((s, i) => (
                  <Link
                    key={s.slug}
                    to={`${basePath}/path/${path.slug}/section/${s.slug}`}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm transition-all text-text-secondary hover:text-accent-cyan hover:bg-bg-hover block"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-code text-text-muted w-4 text-right shrink-0">{i + 1}.</span>
                      <span className="truncate">{s.title}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      <AskChatGpt title={path.title} description={path.description} />
    </div>
  );
}

function SectionDetail({ paths, questions, isCompleted, basePath }: LearningPathViewProps) {
  const { slug, sectionSlug } = useParams<{ slug: string; sectionSlug: string }>();
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

  const section = path.sections.find((s) => s.slug === sectionSlug);
  const sectionIdx = path.sections.findIndex((s) => s.slug === sectionSlug);
  const prevSection = sectionIdx > 0 ? path.sections[sectionIdx - 1] : null;
  const nextSection = sectionIdx < path.sections.length - 1 ? path.sections[sectionIdx + 1] : null;

  if (!section) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p>Section not found</p>
        <Link to={`${basePath}/path/${slug}`} className="text-accent-cyan hover:underline text-sm mt-2 block">
          Back to {path.title}
        </Link>
      </div>
    );
  }

  // Find questions whose subcategory matches this section title (fuzzy: check if either contains the other)
  const sectionQuestions = path.questionIds
    .map((id) => questions.find((q) => q.id === id))
    .filter(Boolean)
    .filter((q) => {
      const sub = (q as Question).subcategory.toLowerCase();
      const title = section.title.toLowerCase();
      return sub === title || title.includes(sub) || sub.includes(title.split('&')[0].trim());
    }) as Question[];

  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary mb-6 flex-wrap">
        <Link to={basePath} className="hover:text-accent-cyan transition-colors">
          All Paths
        </Link>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
          <path d="M6 4L10 8L6 12" />
        </svg>
        <Link to={`${basePath}/path/${slug}`} className="hover:text-accent-cyan transition-colors">
          {path.title}
        </Link>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
          <path d="M6 4L10 8L6 12" />
        </svg>
        <span className="text-text-primary font-medium">{section.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-12 h-12 rounded-lg bg-accent-cyan/10 text-accent-cyan flex items-center justify-center font-code font-bold text-lg">
            {path.icon}
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-text-primary">
              {section.title}
            </h1>
            <p className="text-xs text-text-muted">
              Section {sectionIdx + 1} of {path.sections.length} in {path.title}
            </p>
          </div>
        </div>
      </div>

      {/* Two-column layout: Content + Sections sidebar */}
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Section content */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider">
                Deep Dive
              </h2>
              <ReadAloud text={section.content} />
            </div>
            <div className="bg-bg-card border border-border rounded-lg p-5">
              <Markdown content={section.content} />
            </div>
          </section>

          {/* Related Practice Problems */}
          {sectionQuestions.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
                Practice Problems ({sectionQuestions.length})
              </h2>
              <div className="space-y-2">
                {sectionQuestions.map((q, i) => {
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
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* All Sections Navigator (mobile only) */}
          <section className="mb-8 lg:hidden">
            <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
              All Sections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {path.sections.map((s, i) => (
                <Link
                  key={s.slug}
                  to={`${basePath}/path/${slug}/section/${s.slug}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-all ${
                    s.slug === sectionSlug
                      ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan font-medium'
                      : 'border-border bg-bg-card hover:border-accent-cyan/30 hover:bg-bg-hover text-text-primary'
                  }`}
                >
                  <span className="text-xs font-code text-text-muted w-5 text-right shrink-0">{i + 1}.</span>
                  <span className="truncate">{s.title}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t border-border">
            {prevSection ? (
              <Link
                to={`${basePath}/path/${slug}/section/${prevSection.slug}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10 12L6 8L10 4" />
                </svg>
                <span className="truncate max-w-[200px]">{prevSection.title}</span>
              </Link>
            ) : <div />}
            {nextSection ? (
              <Link
                to={`${basePath}/path/${slug}/section/${nextSection.slug}`}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent-cyan transition-colors"
              >
                <span className="truncate max-w-[200px]">{nextSection.title}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 4L10 8L6 12" />
                </svg>
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* Right Sidebar - All Sections Navigation (desktop only) */}
        {path.sections.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-8">
              <h3 className="text-xs font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
                All Sections
              </h3>
              <nav className="space-y-1">
                {path.sections.map((s, i) => (
                  <Link
                    key={s.slug}
                    to={`${basePath}/path/${slug}/section/${s.slug}`}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all block ${
                      s.slug === sectionSlug
                        ? 'text-accent-cyan bg-accent-cyan/10 font-medium'
                        : 'text-text-secondary hover:text-accent-cyan hover:bg-bg-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-code text-text-muted w-4 text-right shrink-0">{i + 1}.</span>
                      <span className="truncate">{s.title}</span>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      <AskChatGpt title={section.title} description={section.content.slice(0, 300)} />
    </div>
  );
}

export { PathList, PathDetail, SectionDetail };

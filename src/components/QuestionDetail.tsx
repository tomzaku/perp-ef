import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question, NoteVersion } from '../types/question';
import { DifficultyBadge } from './DifficultyBadge';
import { PriorityBadge } from './PriorityBadge';
import { CompanyTag } from './CompanyTag';
import { CodeBlock } from './CodeBlock';
import { NotesSection } from './NotesSection';
import { CodeEditor } from './CodeEditor';
import { Markdown } from './Markdown';
import { MockInterview } from './MockInterview';
import { ReadAloud } from './ReadAloud';
import { AuthGuard } from './AuthGuard';
import { AskChatGpt } from './AskChatGpt';
import { testConfigs } from '../data';
import { useTags } from '../hooks/useTags';

interface QuestionDetailProps {
  question: Question;
  isCompleted: boolean;
  isBookmarked: boolean;
  onToggleCompleted: () => void;
  onToggleBookmarked: () => void;
  notes: NoteVersion[];
  onAddNote: (questionId: string, content: string) => void;
  onUpdateNote: (questionId: string, noteId: string, content: string) => void;
  onDeleteNote: (questionId: string, noteId: string) => void;
}

function buildDefaultCode(question: Question): string {
  const config = testConfigs[question.id];
  if (config) {
    // Extract parameter names from the solution
    const match = question.solution.match(/^function\s+\w+\(([^)]*)\)/);
    const params = match ? match[1] : '';
    return `// ${question.title}\n\nfunction ${config.functionName}(${params}) {\n  // Write your solution here\n  \n}\n`;
  }
  return `// ${question.title}\n// Write your solution here\n\nfunction solution() {\n  \n}\n\n// Test\nconsole.log(solution());\n`;
}

export function QuestionDetail({
  question,
  isCompleted,
  isBookmarked,
  onToggleCompleted,
  onToggleBookmarked,
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: QuestionDetailProps) {
  const navigate = useNavigate();
  const [showSolution, setShowSolution] = useState(false);
  const [showSolutionExplanation, setShowSolutionExplanation] = useState(true);
  const [showBruteForce, setShowBruteForce] = useState(false);
  const [showBruteForceExplanation, setShowBruteForceExplanation] = useState(false);
  const [showTakeaway, setShowTakeaway] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const tagMenuRef = useRef<HTMLDivElement>(null);
  const { tagNames, getTags, toggleTag, createTag } = useTags();
  const questionTags = getTags(question.id);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    if (!showTagMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (tagMenuRef.current && !tagMenuRef.current.contains(e.target as Node)) {
        setShowTagMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showTagMenu]);
  return (
    <div className="animate-fade-in">
      {/* Sticky header bar */}
      <div className="sticky -top-16 lg:-top-8 z-10 -mx-4 px-4 lg:-mx-8 lg:px-8 -mt-16 pt-16 lg:-mt-8 lg:pt-8 pb-3 bg-bg-primary/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-secondary hover:text-accent-cyan transition-colors cursor-pointer text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 12L6 8L10 4" />
            </svg>
            Back
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-display font-bold text-text-primary truncate">
            {question.title}
          </h1>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-code text-text-muted">{question.id}</span>
          <DifficultyBadge difficulty={question.difficulty} />
          {question.priority && <PriorityBadge priority={question.priority} />}
          <span className="text-xs text-accent-purple bg-accent-purple/10 px-2 py-0.5 rounded border border-accent-purple/20">
            {question.pattern}
          </span>
          <span className="text-xs text-text-muted">
            {question.category} / {question.subcategory}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          {question.companies.map((c) => (
            <CompanyTag key={c} company={c} />
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onToggleCompleted}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
              isCompleted
                ? 'bg-easy/10 text-easy border-easy/30'
                : 'bg-bg-tertiary text-text-secondary border-border hover:border-easy/30'
            }`}
          >
            {isCompleted ? (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Completed
              </>
            ) : (
              'Mark Complete'
            )}
          </button>
          <button
            onClick={onToggleBookmarked}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
              isBookmarked
                ? 'bg-accent-orange/10 text-accent-orange border-accent-orange/30'
                : 'bg-bg-tertiary text-text-secondary border-border hover:border-accent-orange/30'
            }`}
          >
            <svg width="12" height="16" viewBox="0 0 14 18" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
              <path d="M1 3C1 1.89543 1.89543 1 3 1H11C12.1046 1 13 1.89543 13 3V17L7 13L1 17V3Z" />
            </svg>
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          {question.leetcodeUrl && (
            <a
              href={question.leetcodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border bg-accent-orange/10 text-accent-orange border-accent-orange/30 hover:bg-accent-orange/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l.287.246c.572.514 1.5.467 2.07-.103a1.481 1.481 0 0 0-.048-2.067l-.287-.247c-.663-.578-1.402-.905-2.155-1.02V3.5c0-.772-.627-1.399-1.399-1.399H13.5L13.483 0z"/>
              </svg>
              LeetCode
            </a>
          )}
          {/* Tag button */}
          <div className="relative" ref={tagMenuRef}>
            <button
              onClick={() => setShowTagMenu(!showTagMenu)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border ${
                questionTags.length > 0
                  ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/30'
                  : 'bg-bg-tertiary text-text-secondary border-border hover:border-accent-purple/30'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Tag{questionTags.length > 0 ? ` (${questionTags.length})` : ''}
            </button>

            {showTagMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-bg-card border border-border rounded-lg shadow-lg z-20 py-1 animate-fade-in">
                {tagNames.map((name) => {
                  const active = questionTags.includes(name);
                  return (
                    <button
                      key={name}
                      onClick={() => toggleTag(question.id, name)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-bg-hover transition-colors cursor-pointer"
                    >
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                        active ? 'border-accent-purple bg-accent-purple/20 text-accent-purple' : 'border-border'
                      }`}>
                        {active && (
                          <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className={active ? 'text-text-primary' : 'text-text-secondary'}>{name}</span>
                    </button>
                  );
                })}
                <div className="border-t border-border mt-1 pt-1 px-2 pb-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) {
                        createTag(newTagInput.trim());
                        toggleTag(question.id, newTagInput.trim());
                        setNewTagInput('');
                      }
                    }}
                    placeholder="Create new tag..."
                    className="w-full bg-bg-primary border border-border rounded px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-purple/50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applied tags */}
        {questionTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {questionTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded-full bg-accent-purple/10 text-accent-purple border border-accent-purple/20"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two-column layout: content left, notes right on desktop */}
      <div className="lg:flex lg:gap-6 lg:items-start">
        {/* Main content */}
        <div className="lg:flex-3 min-w-0">
          {/* Description */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider">
                Problem Description
              </h2>
              <ReadAloud text={question.description} />
            </div>
            <div className="bg-bg-card border border-border rounded-lg p-5">
              <Markdown content={question.description} />
            </div>
          </section>

          {/* ELI5 */}
          {question.eli5 && (
            <section className="mb-8">
              <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
                Explain Like I'm 5
              </h2>
              <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-5">
                <Markdown content={question.eli5} />
              </div>
            </section>
          )}

          {/* Examples */}
          {question.examples && question.examples.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
                Examples
              </h2>
              <div className="space-y-3">
                {question.examples.map((ex, i) => (
                  <div key={i} className="bg-bg-card border border-border rounded-lg p-4">
                    <div className="space-y-1.5 text-sm font-code">
                      <div>
                        <span className="text-text-muted">Input: </span>
                        <span className="text-accent-cyan">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-text-muted">Output: </span>
                        <span className="text-accent-green">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-text-secondary text-xs mt-2 pt-2 border-t border-border">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Complexity */}
          <section className="mb-8">
            <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
              Complexity
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-card border border-border rounded-lg px-4 py-3">
                <span className="text-xs text-text-muted block mb-1">Time</span>
                <span className="text-sm font-code text-accent-cyan break-all">{question.timeComplexity}</span>
              </div>
              <div className="bg-bg-card border border-border rounded-lg px-4 py-3">
                <span className="text-xs text-text-muted block mb-1">Space</span>
                <span className="text-sm font-code text-accent-green break-all">{question.spaceComplexity}</span>
              </div>
            </div>
          </section>

          {/* Mock Interview + Notes on mobile only */}
          <div className="lg:hidden mb-8">
            <MockInterview question={question} />
          </div>
          <div className="lg:hidden mb-8">
            <AuthGuard feature="save notes">
              <NotesSection
                questionId={question.id}
                notes={notes}
                onAddNote={onAddNote}
                onUpdateNote={onUpdateNote}
                onDeleteNote={onDeleteNote}
              />
            </AuthGuard>
          </div>

          {/* Code Playground */}
          <CodeEditor
            defaultCode={buildDefaultCode(question)}
            testConfig={testConfigs[question.id]}
          />

          {/* Show Solution */}
          <section className="mb-8">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="flex items-center gap-2 text-sm font-display font-bold text-accent-cyan uppercase tracking-wider mb-3 cursor-pointer hover:text-accent-cyan/80 transition-colors"
            >
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-200 ${showSolution ? 'rotate-90' : ''}`}
              >
                <path d="M4 2L8 6L4 10" />
              </svg>
              {showSolution ? 'Hide Solution' : 'Show Solution'}
            </button>
            {showSolution && (
              <div className="animate-fade-in space-y-6">
                {/* Brute Force (inside solution) */}
                {question.bruteForce && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowBruteForce(!showBruteForce)}
                      className="flex items-center gap-2 text-sm font-display font-bold text-accent-orange uppercase tracking-wider cursor-pointer hover:text-accent-orange/80 transition-colors"
                    >
                      <svg
                        width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`transition-transform duration-200 ${showBruteForce ? 'rotate-90' : ''}`}
                      >
                        <path d="M4 2L8 6L4 10" />
                      </svg>
                      Brute Force Approach
                    </button>
                    {showBruteForce && (
                      <div className="animate-fade-in space-y-4">
                        <CodeBlock code={question.bruteForce} title="Brute Force" />
                        {question.bruteForceExplanation && (
                          <>
                            <button
                              onClick={() => setShowBruteForceExplanation(!showBruteForceExplanation)}
                              className="flex items-center gap-2 text-xs text-text-muted hover:text-accent-orange transition-colors cursor-pointer"
                            >
                              <svg
                                width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                                className={`transition-transform duration-200 ${showBruteForceExplanation ? 'rotate-90' : ''}`}
                              >
                                <path d="M4 2L8 6L4 10" />
                              </svg>
                              {showBruteForceExplanation ? 'Hide' : 'Show'} Explanation
                            </button>
                            {showBruteForceExplanation && (
                              <div className="bg-accent-orange/5 border border-accent-orange/15 rounded-lg p-5">
                                <Markdown content={question.bruteForceExplanation} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Optimal Solution */}
                <div className="space-y-4">
                  <h3 className="text-sm font-display font-bold text-accent-cyan uppercase tracking-wider">
                    Optimal Solution
                  </h3>
                  <CodeBlock code={question.solution} title="Optimal Solution" />
                  {question.solutionExplanation && (
                    <>
                      <button
                        onClick={() => setShowSolutionExplanation(!showSolutionExplanation)}
                        className="flex items-center gap-2 text-xs text-text-muted hover:text-accent-cyan transition-colors cursor-pointer"
                      >
                        <svg
                          width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`transition-transform duration-200 ${showSolutionExplanation ? 'rotate-90' : ''}`}
                        >
                          <path d="M4 2L8 6L4 10" />
                        </svg>
                        {showSolutionExplanation ? 'Hide' : 'Show'} Detailed Explanation
                      </button>
                      {showSolutionExplanation && (
                        <div className="bg-accent-cyan/5 border border-accent-cyan/15 rounded-lg p-5">
                          <Markdown content={question.solutionExplanation} />
                        </div>
                      )}
                    </>
                  )}
                  {question.diagram && (
                    <div>
                      <h3 className="text-xs font-display font-bold text-text-secondary uppercase tracking-wider mb-2">
                        Algorithm Diagram
                      </h3>
                      <div className="bg-bg-card border border-border rounded-lg p-4">
                        <Markdown content={question.diagram} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Key Takeaway - collapsed by default */}
          <section className="mb-8">
            <button
              onClick={() => setShowTakeaway(!showTakeaway)}
              className="flex items-center gap-2 text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3 cursor-pointer hover:text-accent-cyan transition-colors"
            >
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
                className={`transition-transform duration-200 ${showTakeaway ? 'rotate-90' : ''}`}
              >
                <path d="M4 2L8 6L4 10" />
              </svg>
              Key Takeaway
            </button>
            {showTakeaway && (
              <div className="animate-fade-in bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg p-4">
                <Markdown content={question.keyTakeaway} />
              </div>
            )}
          </section>

          {/* Similar Problems */}
          {question.similarProblems.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-display font-bold text-text-secondary uppercase tracking-wider mb-3">
                Similar Problems
              </h2>
              <div className="flex flex-wrap gap-2">
                {question.similarProblems.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1.5 bg-bg-card border border-border rounded-lg text-sm text-text-secondary"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar - desktop only */}
        <div className="hidden lg:block lg:flex-2">
          <div className="sticky top-4">
            <MockInterview question={question} />
            <AuthGuard feature="save notes">
              <NotesSection
                questionId={question.id}
                notes={notes}
                onAddNote={onAddNote}
                onUpdateNote={onUpdateNote}
                onDeleteNote={onDeleteNote}
              />
            </AuthGuard>
          </div>
        </div>
      </div>

      <AskChatGpt title={question.title} description={question.description} />
    </div>
  );
}

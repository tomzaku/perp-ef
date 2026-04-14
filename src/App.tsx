import { useMemo, useEffect, useRef } from 'react';
import { Routes, Route, useParams, useLocation } from 'react-router-dom';
import type { Question } from './types/question';
import { allQuestions, studyPlan, learningPaths, backendPaths, designPatternPaths } from './data';
import { useProgress } from './hooks/useProgress';
import { useNotes } from './hooks/useNotes';
import { useTheme } from './hooks/useTheme';
import { ThemeContext } from './hooks/ThemeContext';
import { AuthProvider } from './hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { StudyPlanView } from './components/StudyPlanView';
import { QuestionDetail } from './components/QuestionDetail';
import { QuestionListPage } from './components/QuestionListPage';
import { PathList, PathDetail, SectionDetail } from './components/LearningPathView';
import { LearningMindMap, DESIGN_PATTERNS_MAP, ALGORITHM_MAP, BACKEND_MAP } from './components/LearningMindMap';
import { AlgoCheatSheet } from './components/AlgoCheatSheet';
import { SettingsPage } from './components/SettingsPage';
import { FabMenu } from './components/FabMenu';
import { EnglishPractice } from './components/EnglishPractice';
import { Recorder } from './components/Recorder';
import { ReadAloudPanel } from './components/ReadAloudPanel';
import { Timer } from './components/Timer';
import { EnglishSpeakingPage } from './components/EnglishSpeakingPage';
import { ProfilePage } from './components/ProfilePage';
import { Toaster } from 'react-hot-toast';
import { useVisibleSections } from './hooks/useVisibleSections';

function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const {
    toggleCompleted,
    toggleBookmarked,
    isCompleted,
    isBookmarked,
  } = useProgress();
  const { getNotes, addNote, updateNote, deleteNote } = useNotes();

  const question = allQuestions.find((q) => q.id === id);

  if (!question) {
    return (
      <div className="text-center py-16 text-text-muted">
        <p className="text-lg mb-2">Question not found</p>
        <p className="text-sm">ID: {id}</p>
      </div>
    );
  }

  return (
    <QuestionDetail
      question={question}
      isCompleted={isCompleted(question.id)}
      isBookmarked={isBookmarked(question.id)}
      onToggleCompleted={() => toggleCompleted(question.id)}
      onToggleBookmarked={() => toggleBookmarked(question.id)}
      notes={getNotes(question.id)}
      onAddNote={addNote}
      onUpdateNote={updateNote}
      onDeleteNote={deleteNote}
    />
  );
}

function ScrollToTop({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const { pathname } = useLocation();
  useEffect(() => {
    containerRef.current?.scrollTo(0, 0);
  }, [pathname, containerRef]);
  return null;
}

function App() {
  const mainRef = useRef<HTMLElement>(null);
  const themeValue = useTheme();
  const {
    completedCount,
    toggleCompleted,
    toggleBookmarked,
    isCompleted,
    isBookmarked,
  } = useProgress();
  const { isVisible } = useVisibleSections();

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allQuestions.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, []);

  const questionsByCategory = useMemo(() => {
    const map: Record<string, Question[]> = {};
    allQuestions.forEach((q) => {
      if (!map[q.category]) map[q.category] = [];
      map[q.category].push(q);
    });
    return map;
  }, []);

  const sharedProps = {
    isCompleted,
    isBookmarked,
    toggleCompleted,
    toggleBookmarked,
  };

  return (
    <AuthProvider>
    <ThemeContext value={themeValue}>
    <div className="flex min-h-screen">
      <Sidebar
        counts={categoryCounts}
        completedCount={completedCount}
        totalCount={allQuestions.length}
        isVisible={isVisible}
      />

      <main ref={mainRef} className="flex-1 p-4 pt-16 lg:p-8 lg:pt-8 overflow-y-auto max-h-screen">
        <ScrollToTop containerRef={mainRef} />
        <Routes>
          {/* Study Plan */}
          <Route
            path="/"
            element={
              <StudyPlanView
                plan={studyPlan}
                questions={allQuestions}
                isCompleted={isCompleted}
              />
            }
          />

          {/* All Questions */}
          <Route
            path="/all"
            element={
              <QuestionListPage
                title="All Questions"
                description="Browse the complete question bank across all categories."
                questions={allQuestions}
                {...sharedProps}
              />
            }
          />

          {/* Algorithm - Learning Paths */}
          <Route
            path="/algorithm"
            element={
              <PathList
                paths={learningPaths}
                questions={allQuestions}
                basePath="/algorithm"
                title="Algorithm Learning Paths"
                subtitle="Master each pattern with structured introductions, templates, and curated problem sets."
                mindMap={<LearningMindMap config={ALGORITHM_MAP} basePath="/algorithm" />}
                cheatSheet={<AlgoCheatSheet basePath="/algorithm" />}
                {...sharedProps}
              />
            }
          />
          <Route
            path="/algorithm/path/:slug"
            element={
              <PathDetail
                paths={learningPaths}
                questions={allQuestions}
                isCompleted={isCompleted}
                basePath="/algorithm"
                title="Algorithm Learning Paths"
                subtitle=""
              />
            }
          />
          <Route
            path="/algorithm/path/:slug/section/:sectionSlug"
            element={
              <SectionDetail
                paths={learningPaths}
                questions={allQuestions}
                isCompleted={isCompleted}
                basePath="/algorithm"
                title=""
                subtitle=""
              />
            }
          />

          {/* Category Pages */}
          <Route
            path="/javascript"
            element={
              <QuestionListPage
                title="JavaScript"
                description="Core language concepts — closures, prototypes, event loop, async patterns, and implementations."
                questions={questionsByCategory['JavaScript'] || []}
                {...sharedProps}
              />
            }
          />
          <Route
            path="/nodejs"
            element={
              <QuestionListPage
                title="Node.js"
                description="Runtime internals — event loop phases, streams, clustering, memory management, and error handling."
                questions={questionsByCategory['Node.js'] || []}
                {...sharedProps}
              />
            }
          />
          <Route
            path="/react"
            element={
              <QuestionListPage
                title="React"
                description="Hooks internals, Fiber architecture, rendering patterns, and performance optimization."
                questions={questionsByCategory['React'] || []}
                {...sharedProps}
              />
            }
          />
          <Route
            path="/design-system"
            element={
              <QuestionListPage
                title="Design System"
                description="Building UI component libraries — API design, compound components, theming, tokens, and accessibility."
                questions={questionsByCategory['Design System'] || []}
                {...sharedProps}
              />
            }
          />
          {/* Design Patterns - Learning Paths */}
          <Route
            path="/design-patterns"
            element={
              <PathList
                paths={designPatternPaths}
                questions={allQuestions}
                basePath="/design-patterns"
                title="Design Patterns Learning Paths"
                subtitle="OOP fundamentals, SOLID principles, and Gang of Four patterns — learn the concepts before tackling the questions."
                mindMap={<LearningMindMap config={DESIGN_PATTERNS_MAP} basePath="/design-patterns" />}
                {...sharedProps}
              />
            }
          />
          <Route
            path="/design-patterns/path/:slug"
            element={
              <PathDetail
                paths={designPatternPaths}
                questions={allQuestions}
                isCompleted={isCompleted}
                basePath="/design-patterns"
                title="Design Patterns Learning Paths"
                subtitle=""
              />
            }
          />
          <Route
            path="/design-patterns/path/:slug/section/:sectionSlug"
            element={
              <SectionDetail
                paths={designPatternPaths}
                questions={allQuestions}
                isCompleted={isCompleted}
                basePath="/design-patterns"
                title=""
                subtitle=""
              />
            }
          />
          <Route
            path="/system-design"
            element={
              <QuestionListPage
                title="System Design"
                description="Architecture topics for frontend engineers — authentication, payments, API design, caching, and real-time systems."
                questions={questionsByCategory['System Design'] || []}
                {...sharedProps}
              />
            }
          />

          <Route
            path="/behavioral"
            element={
              <QuestionListPage
                title="Behavioral"
                description="Common behavioral interview questions — use the STAR method to structure compelling stories about your experience."
                questions={questionsByCategory['Behavioral'] || []}
                {...sharedProps}
              />
            }
          />
          <Route
            path="/ai"
            element={
              <QuestionListPage
                title="AI"
                description="Prompt engineering, RAG pipelines, AI agents, embeddings, LLM architecture, and production AI application patterns."
                questions={questionsByCategory['AI'] || []}
                {...sharedProps}
              />
            }
          />

          {/* Backend - Learning Paths */}
          <Route
            path="/backend"
            element={
              <PathList
                paths={backendPaths}
                questions={allQuestions}
                basePath="/backend"
                title="Backend Learning Paths"
                subtitle="Core backend fundamentals — databases, architecture, infrastructure, DevOps, and security."
                mindMap={<LearningMindMap config={BACKEND_MAP} basePath="/backend" />}
                {...sharedProps}
              />
            }
          />
          <Route
            path="/backend/path/:slug"
            element={
              <PathDetail
                paths={backendPaths}
                questions={allQuestions}
                isCompleted={isCompleted}
                basePath="/backend"
                title="Backend Learning Paths"
                subtitle=""
              />
            }
          />
          <Route
            path="/backend/path/:slug/section/:sectionSlug"
            element={
              <SectionDetail
                paths={backendPaths}
                questions={allQuestions}
                isCompleted={isCompleted}
                basePath="/backend"
                title=""
                subtitle=""
              />
            }
          />

          {/* English Speaking */}
          <Route path="/english-speaking" element={<EnglishSpeakingPage />} />

          {/* Profile */}
          <Route path="/profile" element={<ProfilePage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Question Detail */}
          <Route path="/question/:id" element={<QuestionPage />} />
        </Routes>
      </main>

      {/* FAB menu + English Practice drawer */}
      <FabMenu />
      <EnglishPractice />
      <Recorder />
      <ReadAloudPanel />
      <Timer />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--color-bg-card)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            fontSize: '13px',
          },
        }}
      />
    </div>
    </ThemeContext>
    </AuthProvider>
  );
}

export default App;

import type { Question, StudyPlanItem, LearningPathCategory, TestConfig } from '../types/question.ts';
import { parseQuestionMd } from './parseQuestionMd.ts';
import { parseLearningPathMd } from './parseLearningPathMd.ts';
import studyPlanData from '../content/study-plan.json';

// Load all markdown files eagerly as raw strings at build time
const allMdModules = import.meta.glob('../content/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

// Separate question files from learning path files
const questionEntries: string[] = [];
const learningPathEntries: string[] = [];
const backendPathEntries: string[] = [];

for (const [path, raw] of Object.entries(allMdModules)) {
  if (path.includes('/learning-paths/')) {
    learningPathEntries.push(raw);
  } else if (path.includes('/backend-paths/')) {
    backendPathEntries.push(raw);
  } else {
    questionEntries.push(raw);
  }
}

// Natural sort by id: algo-1, algo-2, ..., algo-10 (not lexicographic)
function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

// Parse all questions and extract test configs
const parsed = questionEntries.map((raw) => parseQuestionMd(raw));

export const allQuestions: Question[] = parsed
  .map((p) => p.question)
  .sort((a, b) => naturalCompare(a.id, b.id));

// Build testConfigs map from co-located test data in each question's markdown
export const testConfigs: Record<string, TestConfig> = {};
for (const p of parsed) {
  if (p.testConfig) {
    testConfigs[p.question.id] = p.testConfig;
  }
}

export const learningPaths: LearningPathCategory[] = learningPathEntries
  .map((raw) => parseLearningPathMd(raw));

export const backendPaths: LearningPathCategory[] = backendPathEntries
  .map((raw) => parseLearningPathMd(raw));

export const studyPlan: StudyPlanItem[] = studyPlanData as StudyPlanItem[];

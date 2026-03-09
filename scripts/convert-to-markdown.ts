/**
 * Converts all existing question data from TypeScript files to markdown with frontmatter.
 *
 * Run: npx tsx scripts/convert-to-markdown.ts
 *
 * Output:
 *   src/content/algorithm/two-sum.md
 *   src/content/javascript/closures.md
 *   src/content/learning-paths/arrays-hashing.md
 *   ...
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Import existing data
import { algorithmQuestions } from '../src/data/algorithms.js';
import { javascriptQuestions } from '../src/data/javascript.js';
import { nodejsQuestions } from '../src/data/nodejs.js';
import { reactQuestions } from '../src/data/react-questions.js';
import { designSystemQuestions } from '../src/data/design-system.js';
import { designPatternsQuestions } from '../src/data/design-patterns.js';
import { systemDesignQuestions } from '../src/data/system-design.js';
import { explanations } from '../src/data/explanations.js';
import { diagrams } from '../src/data/diagrams.js';
import { learningPaths } from '../src/data/learningPaths.js';
import { studyPlan } from '../src/data/studyPlan.js';
import type { Question } from '../src/types/question.js';

const ROOT = join(import.meta.dirname, '..');
const CONTENT_DIR = join(ROOT, 'src', 'content');

// ── Helpers ──────────────────────────────────────────────────────────

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Escape YAML string value — wrap in quotes if it contains special chars */
function yamlStr(val: string): string {
  if (/[:\n#\[\]{}"'|>,`@!&*?]/.test(val) || val.startsWith(' ') || val.startsWith('-')) {
    // Use double quotes, escape inner quotes and backslashes
    return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`;
  }
  return val;
}

function yamlArray(arr: string[], indent = 0): string {
  const pad = ' '.repeat(indent);
  if (arr.length === 0) return '[]';
  if (arr.every((s) => s.length < 40 && !/[:\n#\[\]{}]/.test(s))) {
    return `[${arr.map((s) => yamlStr(s)).join(', ')}]`;
  }
  return '\n' + arr.map((s) => `${pad}  - ${yamlStr(s)}`).join('\n');
}

// ── Category mapping ─────────────────────────────────────────────────

const categoryFolder: Record<string, string> = {
  Algorithm: 'algorithm',
  JavaScript: 'javascript',
  'Node.js': 'nodejs',
  React: 'react',
  'Design System': 'design-system',
  'Design Patterns': 'design-patterns',
  'System Design': 'system-design',
};

// ── Merge all questions (same logic as data/index.ts) ────────────────

const rawQuestions: Question[] = [
  ...algorithmQuestions,
  ...javascriptQuestions,
  ...nodejsQuestions,
  ...reactQuestions,
  ...designSystemQuestions,
  ...designPatternsQuestions,
  ...systemDesignQuestions,
];

const allQuestions = rawQuestions.map((q) => {
  const extra = explanations[q.id];
  if (!extra)
    return { ...q, diagram: q.diagram || diagrams[q.id] };
  return {
    ...q,
    solutionExplanation: q.solutionExplanation || extra.solutionExplanation,
    bruteForceExplanation: q.bruteForceExplanation || extra.bruteForceExplanation,
    diagram: q.diagram || diagrams[q.id],
  };
});

// ── Convert questions ────────────────────────────────────────────────

let questionCount = 0;

for (const q of allQuestions) {
  const folder = categoryFolder[q.category];
  if (!folder) {
    console.warn(`Unknown category "${q.category}" for ${q.id}, skipping`);
    continue;
  }

  const dir = join(CONTENT_DIR, folder);
  mkdirSync(dir, { recursive: true });

  const slug = q.id;
  const filePath = join(dir, `${slug}.md`);

  // Build frontmatter
  const fm: string[] = [
    '---',
    `id: ${yamlStr(q.id)}`,
    `title: ${yamlStr(q.title)}`,
    `category: ${yamlStr(q.category)}`,
    `subcategory: ${yamlStr(q.subcategory)}`,
    `difficulty: ${q.difficulty}`,
    `pattern: ${yamlStr(q.pattern)}`,
    `companies: ${yamlArray(q.companies)}`,
    `timeComplexity: ${yamlStr(q.timeComplexity)}`,
    `spaceComplexity: ${yamlStr(q.spaceComplexity)}`,
    `keyTakeaway: ${yamlStr(q.keyTakeaway)}`,
    `similarProblems: ${yamlArray(q.similarProblems)}`,
  ];

  if (q.leetcodeUrl) {
    fm.push(`leetcodeUrl: ${q.leetcodeUrl}`);
  }

  fm.push('---');

  // Build body
  const body: string[] = [];

  // Description
  body.push(q.description);

  // Examples
  if (q.examples && q.examples.length > 0) {
    body.push('\n## Examples\n');
    for (const ex of q.examples) {
      body.push(`**Input:** ${ex.input}`);
      body.push(`**Output:** ${ex.output}`);
      if (ex.explanation) {
        body.push(`*${ex.explanation}*`);
      }
      body.push('');
    }
  }

  // Brute Force
  if (q.bruteForce) {
    body.push('\n## Brute Force\n');
    body.push('```js');
    body.push(q.bruteForce);
    body.push('```');

    if (q.bruteForceExplanation) {
      body.push('\n### Brute Force Explanation\n');
      body.push(q.bruteForceExplanation);
    }
  }

  // Solution
  body.push('\n## Solution\n');
  body.push('```js');
  body.push(q.solution);
  body.push('```');

  // Solution Explanation
  if (q.solutionExplanation) {
    body.push('\n## Explanation\n');
    body.push(q.solutionExplanation);
  }

  // Diagram
  if (q.diagram) {
    body.push('\n## Diagram\n');
    body.push(q.diagram);
  }

  const content = fm.join('\n') + '\n\n' + body.join('\n') + '\n';
  writeFileSync(filePath, content, 'utf-8');
  questionCount++;
}

console.log(`✓ Converted ${questionCount} questions`);

// ── Convert learning paths ───────────────────────────────────────────

const lpDir = join(CONTENT_DIR, 'learning-paths');
mkdirSync(lpDir, { recursive: true });

for (const lp of learningPaths) {
  const fm: string[] = [
    '---',
    `slug: ${yamlStr(lp.slug)}`,
    `title: ${yamlStr(lp.title)}`,
    `icon: ${yamlStr(lp.icon)}`,
    `description: ${yamlStr(lp.description)}`,
    `pattern: ${yamlStr(lp.pattern)}`,
    `whenToUse: ${yamlArray(lp.whenToUse)}`,
    `keyInsights: ${yamlArray(lp.keyInsights)}`,
    `questionIds: ${yamlArray(lp.questionIds)}`,
    '---',
  ];

  const body: string[] = [];

  // Article
  if (lp.article) {
    body.push(lp.article);
  }

  // Poem
  if (lp.poem) {
    body.push('\n## Poem\n');
    body.push(lp.poem);
  }

  // Template
  if (lp.template) {
    body.push('\n## Template\n');
    body.push('```ts');
    body.push(lp.template);
    body.push('```');
  }

  const content = fm.join('\n') + '\n\n' + body.join('\n') + '\n';
  writeFileSync(join(lpDir, `${lp.slug}.md`), content, 'utf-8');
}

console.log(`✓ Converted ${learningPaths.length} learning paths`);

// ── Copy study plan as JSON (small, keep structured) ─────────────────

const spPath = join(CONTENT_DIR, 'study-plan.json');
writeFileSync(spPath, JSON.stringify(studyPlan, null, 2), 'utf-8');
console.log(`✓ Wrote study plan`);

console.log(`\nDone! Files written to src/content/`);

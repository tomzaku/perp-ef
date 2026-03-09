import type { LearningPathCategory } from '../types/question.ts';
import { parseFrontmatter } from './parseFrontmatter.ts';

export function parseLearningPathMd(raw: string): LearningPathCategory {
  const { frontmatter: fm, body } = parseFrontmatter(raw);

  // Split body into article, eli5, poem, template by ## markers
  const eli5Idx = body.indexOf('\n## ELI5');
  const poemIdx = body.indexOf('\n## Poem');
  const templateIdx = body.indexOf('\n## Template');

  // Collect all section boundaries in order
  const boundaries: { name: string; idx: number }[] = [];
  if (eli5Idx !== -1) boundaries.push({ name: 'eli5', idx: eli5Idx });
  if (poemIdx !== -1) boundaries.push({ name: 'poem', idx: poemIdx });
  if (templateIdx !== -1) boundaries.push({ name: 'template', idx: templateIdx });
  boundaries.sort((a, b) => a.idx - b.idx);

  let article = '';
  let eli5 = '';
  let poem = '';
  let template = '';

  // Article is everything before the first boundary
  const firstBoundary = boundaries.length > 0 ? boundaries[0].idx : body.length;
  article = body.slice(0, firstBoundary).trim();

  // Extract each section
  for (let i = 0; i < boundaries.length; i++) {
    const { name, idx } = boundaries[i];
    const headerLen = name === 'eli5' ? '\n## ELI5'.length
      : name === 'poem' ? '\n## Poem'.length
      : '\n## Template'.length;
    const end = i + 1 < boundaries.length ? boundaries[i + 1].idx : body.length;
    const content = body.slice(idx + headerLen, end).trim();

    if (name === 'eli5') {
      eli5 = content;
    } else if (name === 'poem') {
      poem = content;
    } else if (name === 'template') {
      const codeMatch = content.match(/```\w*\n([\s\S]*?)```/);
      template = codeMatch ? codeMatch[1].trim() : '';
    }
  }

  return {
    slug: fm.slug as string,
    title: fm.title as string,
    icon: fm.icon as string,
    description: fm.description as string,
    article,
    eli5,
    poem,
    pattern: fm.pattern as string,
    whenToUse: (fm.whenToUse as string[]) ?? [],
    keyInsights: (fm.keyInsights as string[]) ?? [],
    template,
    questionIds: (fm.questionIds as string[]) ?? [],
  };
}

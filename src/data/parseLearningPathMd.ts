import type { LearningPathCategory, ArticleSection } from '../types/question.ts';
import { parseFrontmatter } from './parseFrontmatter.ts';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Extract ### subsections from article text */
function extractSections(article: string): ArticleSection[] {
  const sections: ArticleSection[] = [];
  const regex = /^### (.+)$/gm;
  const matches: { title: string; idx: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(article)) !== null) {
    matches.push({ title: m[1].trim(), idx: m.index });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx + article.slice(matches[i].idx).indexOf('\n') + 1;
    const end = i + 1 < matches.length ? matches[i + 1].idx : article.length;
    sections.push({
      slug: slugify(matches[i].title),
      title: matches[i].title,
      content: article.slice(start, end).trim(),
    });
  }
  return sections;
}

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

  const sections = extractSections(article);

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
    sections,
  };
}

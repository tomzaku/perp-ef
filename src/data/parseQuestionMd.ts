import type { Question, Example, Category, Difficulty, Priority, TestConfig } from '../types/question.ts';
import { parseFrontmatter } from './parseFrontmatter.ts';
import { validators } from './validators.ts';

export interface ParsedQuestion {
  question: Question;
  testConfig?: TestConfig;
}

function extractSections(body: string): Map<string, string> {
  const sections = new Map<string, string>();
  const parts = body.split(/^## /m);
  sections.set('_description', parts[0].trim());
  for (let i = 1; i < parts.length; i++) {
    const newlineIdx = parts[i].indexOf('\n');
    if (newlineIdx === -1) {
      sections.set(parts[i].trim(), '');
      continue;
    }
    const heading = parts[i].slice(0, newlineIdx).trim();
    const content = parts[i].slice(newlineIdx + 1).trim();
    sections.set(heading, content);
  }
  return sections;
}

function extractCodeBlock(section: string): string {
  const match = section.match(/```\w*\n([\s\S]*?)```/);
  return match ? match[1].trim() : '';
}

function parseExamples(section: string): Example[] {
  const examples: Example[] = [];
  const blocks = section.split(/\*\*Input:\*\*/).slice(1);
  for (const block of blocks) {
    const inputMatch = block.match(/^\s*([\s\S]*?)(?:\n\*\*Output:\*\*)/);
    const outputMatch = block.match(/\*\*Output:\*\*\s*(.*?)(?:\n|$)/);
    const explanationMatch = block.match(/\*\*Explanation:\*\*\s*(.+)/);
    const input = inputMatch?.[1]?.trim() ?? '';
    const output = outputMatch?.[1]?.trim() ?? '';
    if (!input && !output) continue;
    const ex: Example = { input, output };
    if (explanationMatch) ex.explanation = explanationMatch[1].trim();
    examples.push(ex);
  }
  return examples;
}

function parseTestConfig(section: string): TestConfig | undefined {
  const jsonStr = extractCodeBlock(section);
  if (!jsonStr) return undefined;
  try {
    const raw = JSON.parse(jsonStr);
    const config: TestConfig = {
      functionName: raw.functionName,
      testCases: raw.testCases,
    };
    if (raw.argTypes) config.argTypes = raw.argTypes;
    if (raw.returnType) config.returnType = raw.returnType;
    if (raw.compareType) config.compareType = raw.compareType;
    if (raw.validator && typeof raw.validator === 'string') {
      config.validator = validators[raw.validator];
    }
    return config;
  } catch {
    return undefined;
  }
}

export function parseQuestionMd(raw: string): ParsedQuestion {
  const { frontmatter: fm, body } = parseFrontmatter(raw);
  const sections = extractSections(body);

  const description = sections.get('_description') ?? '';

  // Examples
  const examplesSection = sections.get('Examples');
  const examples = examplesSection ? parseExamples(examplesSection) : undefined;

  // Brute Force
  const bruteForceSection = sections.get('Brute Force');
  const bruteForce = bruteForceSection ? extractCodeBlock(bruteForceSection) : undefined;

  // Brute Force Explanation - may be a subsection within Brute Force
  let bruteForceExplanation: string | undefined;
  if (bruteForceSection) {
    const subMatch = bruteForceSection.match(/### Brute Force Explanation\n+([\s\S]*?)$/);
    if (subMatch) bruteForceExplanation = subMatch[1].trim();
  }

  // Solution
  const solutionSection = sections.get('Solution') ?? '';
  const solution = extractCodeBlock(solutionSection);

  // Explanation
  const solutionExplanation = sections.get('Explanation') || undefined;

  // ELI5
  const eli5 = sections.get('ELI5') || undefined;

  // Diagram - return the full content including mermaid fences
  const diagramSection = sections.get('Diagram');
  const diagram = diagramSection ? diagramSection.trim() : undefined;

  // TestConfig
  const testConfigSection = sections.get('TestConfig');
  const testConfig = testConfigSection ? parseTestConfig(testConfigSection) : undefined;

  return {
    question: {
      id: fm.id as string,
      title: fm.title as string,
      category: fm.category as Category,
      subcategory: fm.subcategory as string,
      difficulty: fm.difficulty as Difficulty,
      priority: (fm.priority as Priority) || undefined,
      pattern: fm.pattern as string,
      companies: (fm.companies as string[]) ?? [],
      timeComplexity: fm.timeComplexity as string,
      spaceComplexity: fm.spaceComplexity as string,
      keyTakeaway: fm.keyTakeaway as string,
      similarProblems: (fm.similarProblems as string[]) ?? [],
      leetcodeUrl: (fm.leetcodeUrl as string) || undefined,
      description,
      examples: examples && examples.length > 0 ? examples : undefined,
      solution,
      solutionExplanation,
      eli5,
      bruteForce: bruteForce || undefined,
      bruteForceExplanation,
      diagram,
    },
    testConfig,
  };
}

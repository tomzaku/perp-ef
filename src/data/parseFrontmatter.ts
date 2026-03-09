import { parse as parseYaml } from 'yaml';

export function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };
  return { frontmatter: parseYaml(match[1]) ?? {}, body: match[2] };
}

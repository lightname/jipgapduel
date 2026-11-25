import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type Guide = {
  slug: string;
  title: string;
  description: string;
  reviewed: boolean;
  updatedAt: string;
  body: string;
  hasBody: boolean;
};

const DIR = join(process.cwd(), 'content/ko/guide');
const TOKEN_LINE = /^\{\{(table|meta|cta):[A-Za-z]+\}\}$/;

export function parseGuide(slug: string, raw: string): Guide {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`frontmatter missing: ${slug}`);
  const meta = Object.fromEntries(
    m[1].split('\n').map((l) => {
      const i = l.indexOf(':');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
  );
  for (const k of ['title', 'description', 'reviewed', 'updatedAt']) {
    if (!meta[k]) throw new Error(`${slug}: ${k} missing`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.updatedAt)) {
    throw new Error(`${slug}: updatedAt format`);
  }
  const body = m[2];
  const prose = body
    .split('\n')
    .filter((l) => !TOKEN_LINE.test(l.trim()))
    .join('')
    .trim();
  return {
    slug,
    title: meta.title,
    description: meta.description,
    reviewed: meta.reviewed === 'true',
    updatedAt: meta.updatedAt,
    body,
    hasBody: prose.length > 0,
  };
}

export function listGuides(): Guide[] {
  if (!existsSync(DIR)) return [];
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => parseGuide(f.slice(0, -3), readFileSync(join(DIR, f), 'utf8')));
}

export function getGuide(slug: string): Guide | null {
  return listGuides().find((g) => g.slug === slug) ?? null;
}

export function isGuideLinkable(slug: string): boolean {
  const g = getGuide(slug);
  return !!g && g.reviewed && g.hasBody;
}

import { describe, expect, it } from 'vitest';
import { parseGuide } from '@/lib/content/load';

describe('content guide parser', () => {
  it('parses valid frontmatter and detects body text', () => {
    const g = parseGuide(
      'data-source',
      '---\ntitle: 제목\ndescription: 설명\nreviewed: true\nupdatedAt: 2026-11-21\n---\n{{table:filterFunnel}}\n본문 문장입니다.',
    );
    expect(g.reviewed).toBe(true);
    expect(g.hasBody).toBe(true);
  });

  it('marks hasBody false when only tokens exist', () => {
    const g = parseGuide(
      'empty',
      '---\ntitle: 제목\ndescription: 설명\nreviewed: true\nupdatedAt: 2026-11-21\n---\n{{table:filterFunnel}}\n{{cta:primary}}\n',
    );
    expect(g.hasBody).toBe(false);
  });

  it('throws when required frontmatter fields are missing or malformed', () => {
    expect(() => parseGuide('bad', 'no frontmatter')).toThrow();
    expect(() =>
      parseGuide('missing', '---\ntitle: 제목\nreviewed: true\nupdatedAt: 2026-11-21\n---\n본문'),
    ).toThrow();
    expect(() =>
      parseGuide('date', '---\ntitle: 제목\ndescription: 설명\nreviewed: true\nupdatedAt: 2026/11/21\n---\n본문'),
    ).toThrow();
  });
});

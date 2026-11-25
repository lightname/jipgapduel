import { formatYm } from '@/lib/format';

export type TableTokenName = 'filterFunnel' | 'pairBands' | 'bySgg' | 'byArea' | 'byAge';
export type MetaTokenName = 'period' | 'generatedAt';
export type CtaTokenName = 'primary' | 'secondary';

export type BodyBlock =
  | { type: 'md'; text: string }
  | { type: 'token'; kind: 'table'; name: TableTokenName }
  | { type: 'token'; kind: 'meta'; name: MetaTokenName }
  | { type: 'token'; kind: 'cta'; name: CtaTokenName };

const ALLOWED: Record<'table' | 'meta' | 'cta', ReadonlySet<string>> = {
  table: new Set<TableTokenName>(['filterFunnel', 'pairBands', 'bySgg', 'byArea', 'byAge']),
  meta: new Set<MetaTokenName>(['period', 'generatedAt']),
  cta: new Set<CtaTokenName>(['primary', 'secondary']),
};

const FULL_TOKEN_RE = /^\{\{(table|meta|cta):([A-Za-z]+)\}\}$/;
const ANY_TOKEN_RE = /\{\{[^}]*\}\}/;

export function splitBody(body: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  let mdLines: string[] = [];

  const flushMd = () => {
    const text = mdLines.join('\n').trim();
    if (text.length > 0) blocks.push({ type: 'md', text });
    mdLines = [];
  };

  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    const match = trimmed.match(FULL_TOKEN_RE);
    if (match) {
      const kind = match[1] as 'table' | 'meta' | 'cta';
      const name = match[2];
      if (!ALLOWED[kind].has(name)) {
        throw new Error(`unknown token: ${trimmed}`);
      }
      flushMd();
      if (kind === 'table') blocks.push({ type: 'token', kind, name: name as TableTokenName });
      else if (kind === 'meta') blocks.push({ type: 'token', kind, name: name as MetaTokenName });
      else blocks.push({ type: 'token', kind, name: name as CtaTokenName });
      continue;
    }

    if (ANY_TOKEN_RE.test(line)) {
      throw new Error(`unknown or inline token: ${trimmed}`);
    }

    mdLines.push(line);
  }

  flushMd();
  return blocks;
}

export function formatMetaToken(
  name: MetaTokenName,
  stats: { period: { from: string; to: string }; generatedAt: string },
): string {
  if (name === 'period') {
    return `${formatYm(stats.period.from)} ~ ${formatYm(stats.period.to)}`;
  }
  return stats.generatedAt.slice(0, 10);
}

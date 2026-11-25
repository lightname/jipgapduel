import { marked } from 'marked';
import type { Stats } from '@/lib/stats';
import { formatMetaToken, splitBody } from '../logic/tokens';
import { DataTable } from './DataTable';
import { GuideCta } from './GuideCta';

export type GuideBodyProps = {
  body: string;
  stats: Stats | null;
};

export function GuideBody({ body, stats }: GuideBodyProps) {
  if (!stats) {
    throw new Error('stats.json is required to render GuideBody');
  }

  const blocks = splitBody(body);

  return (
    <div className="mt-[var(--space-6)]">
      {blocks.map((block, idx) => {
        if (block.type === 'md') {
          const html = marked.parse(block.text, { async: false });
          return (
            <div
              key={idx}
              className="prose-guide text-text"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        if (block.kind === 'meta') {
          return (
            <p key={idx} className="type-small my-[var(--space-3)] text-text-muted">
              {formatMetaToken(block.name, stats)}
            </p>
          );
        }

        if (block.kind === 'table') {
          return <DataTable key={idx} name={block.name} stats={stats} />;
        }

        return <GuideCta key={idx} variant={block.name} />;
      })}
    </div>
  );
}

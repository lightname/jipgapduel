'use client';

import { Button } from '@/components/Button';
import { Img } from '@/components/Img';
import { t, type MessageKey } from '@/lib/i18n/t';
import type { PoolErrorCode } from '../logic/load-pool';

const ERROR_KEY: Record<PoolErrorCode, MessageKey> = {
  POOL_FETCH_FAILED: 'common.error.POOL_FETCH_FAILED',
  POOL_SCHEMA_MISMATCH: 'common.error.POOL_SCHEMA_MISMATCH',
  POOL_EMPTY: 'common.error.POOL_EMPTY',
};

function toErrorKey(code: string | null): MessageKey {
  if (code && code in ERROR_KEY) return ERROR_KEY[code as PoolErrorCode];
  return 'common.error.POOL_FETCH_FAILED';
}

export type GameErrorProps = {
  errorCode: string | null;
  onRetry: () => void;
};

export function GameError({ errorCode, onRetry }: GameErrorProps) {
  return (
    <section
      data-testid="game-error"
      className="mx-auto flex w-full max-w-[880px] flex-col items-center px-5 py-[var(--space-12)] text-center md:px-8"
    >
      <Img
        id="IMG-08"
        className="h-[150px] w-[200px] object-contain md:h-[180px] md:w-[240px]"
      />
      <h2 className="type-h3 mt-[var(--space-6)] text-text">{t(toErrorKey(errorCode))}</h2>
      <p className="type-body mt-[var(--space-2)] text-text-muted">{t('s02.error.desc')}</p>
      <div className="mt-[var(--space-6)] w-full md:w-auto">
        <Button variant="primary" onClick={onRetry}>
          {t('s02.error.retry')}
        </Button>
      </div>
    </section>
  );
}

'use client';

export function GameLoading({ showProgress = false }: { showProgress?: boolean }) {
  return (
    <section
      data-testid="game-loading"
      aria-busy="true"
      className="mx-auto w-full max-w-[880px] px-5 py-[var(--space-6)] md:px-8"
    >
      {showProgress ? (
        <div className="skeleton-pulse mb-[var(--space-6)] h-1.5 w-full rounded-[var(--radius-full)] bg-border" />
      ) : null}

      <div className="grid grid-cols-2 items-stretch gap-[var(--space-3)] md:gap-[var(--space-6)]">
        {[0, 1].map((idx) => (
          <div
            key={idx}
            className="skeleton-pulse flex flex-col gap-[var(--space-3)] rounded-[var(--radius-lg)] border border-border bg-surface p-[var(--space-3)] shadow-[var(--shadow-card)] md:p-[var(--space-4)] xl:p-[var(--space-6)]"
          >
            <div className="h-5 w-3/4 rounded-[var(--radius-sm)] bg-border" />
            <div className="h-4 w-1/2 rounded-[var(--radius-sm)] bg-border" />
            <div className="h-4 w-2/3 rounded-[var(--radius-sm)] bg-border" />
            <div className="h-4 w-1/3 rounded-[var(--radius-sm)] bg-border" />
            <div className="aspect-[4/3] w-full rounded-[var(--radius-sm)] bg-border" />
            <div className="mt-[var(--space-2)] flex h-12 items-center justify-center border-t border-border pt-[var(--space-2)] md:h-14">
              <div className="h-6 w-20 rounded-[var(--radius-sm)] bg-border" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

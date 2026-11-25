'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const emptySubscribe = () => () => {};

export function HeaderStatusPortal({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!isClient) return null;
  const target = document.getElementById('header-status');
  if (target) return createPortal(children, target);

  return (
    <div
      data-testid="header-status-fallback"
      className="mx-auto flex w-full max-w-[880px] items-center justify-end gap-3 px-5 pt-[var(--space-2)] md:px-8"
    >
      {children}
    </div>
  );
}

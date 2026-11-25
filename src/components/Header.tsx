import Link from 'next/link';
import { Img } from '@/components/Img';
import { t } from '@/lib/i18n/t';

export function Header() {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-[1120px] items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          aria-label={t('common.header.homeAriaLabel')}
          className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          <Img id="IMG-01" className="h-7 w-7 object-contain" priority />
          <span className="type-h4 font-extrabold text-text">
            {t('common.brand.name')}
          </span>
        </Link>
        <div id="header-status" className="flex items-center gap-3" />
      </div>
    </header>
  );
}

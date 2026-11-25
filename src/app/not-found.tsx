import { t } from '@/lib/i18n/t';

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-[480px] px-5 py-12 text-center md:px-8">
      <h1 className="type-h2 text-text">{t('s08.title')}</h1>
    </section>
  );
}

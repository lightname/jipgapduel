import { t } from '@/lib/i18n/t';

export default function HomePage() {
  return (
    <section className="mx-auto max-w-[1120px] px-5 py-12 md:px-8">
      <h1 className="type-h1 text-text">{t('s01.hero.title')}</h1>
    </section>
  );
}

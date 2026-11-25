import type { Metadata } from 'next';
import { NotFoundView } from '@/features/landing';
import { t } from '@/lib/i18n/t';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata: Metadata = buildMetadata({
  path: '/404',
  title: t('meta.s08.title'),
  description: t('meta.s08.description'),
  og: 'S-01',
  page: { kind: 'notFound' },
});

export default function NotFoundPage() {
  return <NotFoundView />;
}

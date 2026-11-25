import type { Metadata } from 'next';
import { PrivacyBody } from '@/features/legal';
import { t } from '@/lib/i18n/t';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata: Metadata = buildMetadata({
  path: '/privacy',
  title: t('meta.s07.title'),
  description: t('meta.s07.description'),
  og: 'S-01',
  page: { kind: 'legal' },
});

export default function PrivacyPage() {
  return <PrivacyBody />;
}

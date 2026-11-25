import { Img } from '@/components/Img';
import { t, type MessageKey } from '@/lib/i18n/t';
import type { ImageId } from '@/lib/images';

const STEPS: { img: ImageId; titleKey: MessageKey; bodyKey: MessageKey }[] = [
  { img: 'IMG-05', titleKey: 's01.how.step1Title', bodyKey: 's01.how.step1Body' },
  { img: 'IMG-06', titleKey: 's01.how.step2Title', bodyKey: 's01.how.step2Body' },
  { img: 'IMG-07', titleKey: 's01.how.step3Title', bodyKey: 's01.how.step3Body' },
];

export function HowToSection() {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-5 pt-[var(--space-12)] md:px-8 md:pt-[var(--space-16)]">
      <h2 className="type-h2 text-text">{t('s01.how.title')}</h2>

      <div className="mt-[var(--space-6)] grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-3 md:gap-[var(--space-6)]">
        {STEPS.map((step) => (
          <div
            key={step.img}
            className="flex flex-col rounded-[var(--radius-lg)] bg-surface p-[var(--space-6)] shadow-[var(--shadow-card)]"
          >
            <Img id={step.img} className="h-24 w-24 object-contain" />
            <h3 className="type-h3 mt-[var(--space-4)] text-text">{t(step.titleKey)}</h3>
            <p className="type-body mt-[var(--space-2)] text-text-muted">{t(step.bodyKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

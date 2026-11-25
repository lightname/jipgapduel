import { site } from '@config';
import { Img } from '@/components/Img';
import { t } from '@/lib/i18n/t';

export type PrivacyBodyProps = {
  effectiveDate?: string;
  adsEnabled?: boolean;
  contactEmail?: string;
};

export function PrivacyBody({
  effectiveDate = site.privacyEffectiveDate,
  adsEnabled = site.ads.enabled,
  contactEmail = site.contactEmail,
}: PrivacyBodyProps) {
  const email = contactEmail.trim();
  if (!email) {
    console.warn('[privacy] WARN contactEmail empty');
  }

  return (
    <article className="mx-auto w-full max-w-[720px] px-5 py-[var(--space-8)] md:px-0 xl:pt-[var(--space-16)]">
      <header>
        <Img id="IMG-13" className="h-[90px] w-[120px] object-contain" priority />
        <h1 className="type-h1 mt-[var(--space-4)] text-text">{t('s07.title')}</h1>
        <p className="type-small mt-[var(--space-2)] text-text-muted">
          {t('s07.effectiveDate', { date: effectiveDate })}
        </p>
      </header>

      <div className="prose-guide mt-[var(--space-8)] text-text">
        <section>
          <h2>{t('s07.noCollectTitle')}</h2>
          <p>{t('s07.noCollectBody')}</p>
        </section>

        <section>
          <h2>{t('s07.storageTitle')}</h2>
          <p>{t('s07.storageBody')}</p>
        </section>

        <section>
          <h2>{t('s07.analyticsTitle')}</h2>
          <p>{t('s07.analyticsBody')}</p>
        </section>

        {adsEnabled ? (
          <section>
            <h2>{t('s07.adsTitle')}</h2>
            <p>{t('s07.adsBody')}</p>
          </section>
        ) : null}

        <section>
          <h2>{t('s07.cookieTitle')}</h2>
          <p>{t('s07.cookieBody')}</p>
        </section>

        <section>
          <h2>{t('s07.contactTitle')}</h2>
          <p>
            {email ? (
              <>
                {t('s07.contactLabel')}
                <a href={`mailto:${email}`}>{email}</a>
              </>
            ) : (
              t('s07.contactPending')
            )}
          </p>
        </section>
      </div>
    </article>
  );
}

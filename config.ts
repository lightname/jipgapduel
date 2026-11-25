export const site = {
  name: '집값대결',
  SITE_URL: 'https://price-duel.pages.dev',
  indexLevel: 1 as 1 | 2 | 3 | 4,
  launchDate: '2026-12-01',
  ga4Id: '',
  searchConsoleVerification: '',
  naverSiteVerification: '',
  contactEmail: '',
  privacyEffectiveDate: '2026-12-01',
  ads: {
    enabled: false,
    adsenseClientId: '',
    slots: {
      resultBottom: '',
      landingBottom: '',
    },
  },
} as const;

export const secrets = {
  dataGoKrKey: '',
  vworldKey: '',
} as const;

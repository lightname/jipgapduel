import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { site } from '@config';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { loadStats } from '@/lib/stats';
import { isGuideLinkable } from '@/lib/content/load';
import { adsScriptEnabled } from '@/lib/ads';
import './globals.css';

const pretendard = localFont({
  src: '../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-pretendard',
});

function buildVerification(): Metadata['verification'] {
  const hasGoogle = site.searchConsoleVerification.trim() !== '';
  const hasNaver = site.naverSiteVerification.trim() !== '';
  if (!hasGoogle && !hasNaver) return undefined;
  return {
    ...(hasGoogle ? { google: site.searchConsoleVerification } : {}),
    ...(hasNaver ? { other: { 'naver-site-verification': site.naverSiteVerification } } : {}),
  };
}

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  manifest: '/manifest.webmanifest',
  verification: buildVerification(),
};

export const viewport: Viewport = {
  themeColor: '#2447D8',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const stats = loadStats();
  const showDataSource = isGuideLinkable('data-source');
  const showMedianPrice = isGuideLinkable('median-price');
  const ga4Enabled = process.env.NODE_ENV === 'production' && site.ga4Id.trim() !== '';
  const adsEnabled = adsScriptEnabled();

  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="flex min-h-screen flex-col bg-bg font-sans text-text antialiased">
        {ga4Enabled ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${site.ga4Id}');
              }`}
            </Script>
          </>
        ) : null}
        {adsEnabled ? (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.ads.adsenseClientId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        ) : null}
        <Header />
        <main className="flex-1">{children}</main>
        <Footer
          generatedAt={stats?.generatedAt}
          showDataSource={showDataSource}
          showMedianPrice={showMedianPrice}
        />
      </body>
    </html>
  );
}

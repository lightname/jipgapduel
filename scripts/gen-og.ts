import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

type OgTarget = { name: string; title: string; sub: string };

type KoMessages = {
  common: { brand: { name: string } };
  og: {
    s01: { title: string; sub: string };
    s02: { title: string; sub: string };
    s03: { title: string; sub: string };
    guide: { sub: string };
  };
};

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function toDataUrl(filePath: string, mime: string): string {
  const b64 = readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${b64}`;
}

function readGuideTargets(guideSub: string): OgTarget[] {
  const dir = join(process.cwd(), 'content/ko/guide');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((f) => {
      const slug = f.slice(0, -3);
      const raw = readFileSync(join(dir, f), 'utf8');
      const m = raw.match(/^---\n([\s\S]*?)\n---/);
      const titleLine = m?.[1]
        .split('\n')
        .find((l) => l.trim().startsWith('title:'));
      const title = titleLine ? titleLine.slice(titleLine.indexOf(':') + 1).trim() : slug;
      return { name: `guide-${slug}`, title, sub: guideSub };
    });
}

function buildHtml(opts: {
  fontDataUrl: string;
  bgDataUrl: string;
  logoDataUrl: string;
  brand: string;
  title: string;
  sub: string;
}): string {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Pretendard Variable';
    src: url('${opts.fontDataUrl}') format('woff2');
    font-weight: 100 900;
    font-style: normal;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    position: relative;
    overflow: hidden;
    background: #F6F5F1;
    font-family: 'Pretendard Variable', sans-serif;
    word-break: keep-all;
  }
  .bg {
    position: absolute;
    inset: 0;
    width: 1200px;
    height: 630px;
    object-fit: cover;
  }
  .content {
    position: relative;
    z-index: 1;
    left: 64px;
    top: 0;
    width: 600px;
    height: 630px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 28px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .brand img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }
  .brand span {
    font-size: 32px;
    font-weight: 800;
    line-height: 40px;
    color: #17181C;
  }
  .title {
    font-size: 56px;
    font-weight: 800;
    line-height: 70px;
    color: #17181C;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sub {
    font-size: 28px;
    font-weight: 500;
    line-height: 38px;
    color: #5B5F6A;
  }
</style>
</head>
<body>
  <img class="bg" src="${opts.bgDataUrl}" alt="" />
  <div class="content">
    <div class="brand">
      <img src="${opts.logoDataUrl}" alt="" />
      <span>${escapeHtml(opts.brand)}</span>
    </div>
    <div class="title">${escapeHtml(opts.title)}</div>
    <div class="sub">${escapeHtml(opts.sub)}</div>
  </div>
</body>
</html>`;
}

export async function generateOgImages(): Promise<string[]> {
  const ko = JSON.parse(readFileSync('src/messages/ko.json', 'utf8')) as KoMessages;
  const targets: OgTarget[] = [
    { name: 'S-01', title: ko.og.s01.title, sub: ko.og.s01.sub },
    { name: 'S-02', title: ko.og.s02.title, sub: ko.og.s02.sub },
    { name: 'S-03', title: ko.og.s03.title, sub: ko.og.s03.sub },
    ...readGuideTargets(ko.og.guide.sub),
  ];

  const fontDataUrl = toDataUrl(
    'node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2',
    'font/woff2',
  );
  const bgDataUrl = toDataUrl('public/images/og-base.svg', 'image/svg+xml');
  const logoDataUrl = toDataUrl('public/images/logo-symbol.svg', 'image/svg+xml');

  mkdirSync('public/og', { recursive: true });

  const browser = await chromium.launch();
  const created: string[] = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    for (const target of targets) {
      const html = buildHtml({
        fontDataUrl,
        bgDataUrl,
        logoDataUrl,
        brand: ko.common.brand.name,
        title: target.title,
        sub: target.sub,
      });
      await page.setContent(html, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const outPath = join('public/og', `${target.name}.png`);
      await page.screenshot({ path: outPath, type: 'png' });
      created.push(outPath);
      console.log(`[gen-og] OK ${outPath}`);
    }
  } finally {
    await browser.close();
  }
  return created;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  generateOgImages().catch((err) => {
    console.error(`[gen-og] FAIL OG_FAILED: ${String(err)}`);
    process.exit(1);
  });
}

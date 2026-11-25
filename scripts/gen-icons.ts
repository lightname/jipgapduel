import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

function toSvgDataUrl(filePath: string): string {
  const b64 = readFileSync(filePath).toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

export function packIco(entries: { size: number; png: Buffer }[]): Buffer {
  const count = entries.length;
  const headerSize = 6;
  const dirSize = 16 * count;
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(dirSize);
  let offset = headerSize + dirSize;
  for (let i = 0; i < count; i++) {
    const { size, png } = entries[i];
    const base = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, base);
    dir.writeUInt8(size >= 256 ? 0 : size, base + 1);
    dir.writeUInt8(0, base + 2);
    dir.writeUInt8(0, base + 3);
    dir.writeUInt16LE(1, base + 4);
    dir.writeUInt16LE(32, base + 6);
    dir.writeUInt32LE(png.length, base + 8);
    dir.writeUInt32LE(offset, base + 12);
    offset += png.length;
  }

  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

function iconHtml(dataUrl: string, size: number, bg: string | null, scalePct: number): string {
  const symbolSize = Math.round((size * scalePct) / 100);
  return `<!doctype html>
<html>
<head>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: ${size}px;
    height: ${size}px;
    background: ${bg ?? 'transparent'};
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  img {
    width: ${symbolSize}px;
    height: ${symbolSize}px;
    object-fit: contain;
    display: block;
  }
</style>
</head>
<body><img src="${dataUrl}" alt="" /></body>
</html>`;
}

export async function generateIcons(): Promise<void> {
  const logoUrl = toSvgDataUrl('public/images/logo-symbol.svg');
  const faviconUrl = toSvgDataUrl('public/images/favicon-symbol.svg');

  const appIcons = [
    { size: 192, path: 'public/icons/icon-192.png' },
    { size: 512, path: 'public/icons/icon-512.png' },
    { size: 180, path: 'public/apple-touch-icon.png' },
  ];

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    for (const item of appIcons) {
      mkdirSync(dirname(item.path), { recursive: true });
      await page.setViewportSize({ width: item.size, height: item.size });
      await page.setContent(iconHtml(logoUrl, item.size, '#FFFFFF', 70), { waitUntil: 'load' });
      await page.screenshot({ path: item.path, type: 'png' });
      console.log(`[gen-icons] OK ${item.path}`);
    }

    const favEntries: { size: number; png: Buffer }[] = [];
    for (const size of [16, 32, 48]) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent(iconHtml(faviconUrl, size, null, 100), { waitUntil: 'load' });
      const png = await page.screenshot({ type: 'png', omitBackground: true });
      favEntries.push({ size, png });
    }

    writeFileSync('public/favicon.ico', packIco(favEntries));
    console.log('[gen-icons] OK public/favicon.ico');

    copyFileSync('public/images/favicon-symbol.svg', 'public/icon.svg');
    console.log('[gen-icons] OK public/icon.svg');
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  generateIcons().catch((err) => {
    console.error(`[gen-icons] FAIL ICON_FAILED: ${String(err)}`);
    process.exit(1);
  });
}

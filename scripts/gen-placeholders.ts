import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

type Entry = {
  id: string;
  file: string;
  width: number;
  height: number;
  status: string;
};

const list = JSON.parse(readFileSync('public/images/manifest.json', 'utf8')) as Entry[];

for (const e of list) {
  if (e.status === 'final') continue;
  const out = join('public', e.file);
  if (existsSync(out) && e.status !== 'placeholder') continue;
  mkdirSync(dirname(out), { recursive: true });
  const fs = Math.max(10, Math.round(Math.min(e.width, e.height) / 8));
  writeFileSync(
    out,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${e.width}" height="${e.height}" viewBox="0 0 ${e.width} ${e.height}">` +
      `<rect width="100%" height="100%" fill="#E2E0DA"/>` +
      `<text x="50%" y="46%" text-anchor="middle" font-family="sans-serif" font-size="${fs}" fill="#5B5F6A">${e.id}</text>` +
      `<text x="50%" y="${46 + 14}%" text-anchor="middle" font-family="sans-serif" font-size="${Math.round(fs * 0.6)}" fill="#5B5F6A">${e.width}×${e.height}</text>` +
      `</svg>`,
  );
  console.log(`[placeholder] OK ${e.file}`);
}

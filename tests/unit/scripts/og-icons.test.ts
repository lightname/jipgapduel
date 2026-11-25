import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function readPngSize(relPath: string): { width: number; height: number } {
  const buf = readFileSync(join(process.cwd(), relPath));
  expect(buf.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  expect(buf.subarray(12, 16).toString('ascii')).toBe('IHDR');
  return {
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
  };
}

describe('OG images and icons (T-17)', () => {
  it('모든 OG PNG 파일이 1200×630 IHDR 크기를 가진다', () => {
    const ogFiles = [
      'public/og/S-01.png',
      'public/og/S-02.png',
      'public/og/S-03.png',
      'public/og/guide-data-source.png',
      'public/og/guide-median-price.png',
    ];
    for (const file of ogFiles) {
      expect(existsSync(file)).toBe(true);
      expect(readPngSize(file)).toEqual({ width: 1200, height: 630 });
    }
  });

  it('앱 아이콘 PNG들이 지정된 정사각 크기를 가진다', () => {
    expect(readPngSize('public/icons/icon-192.png')).toEqual({ width: 192, height: 192 });
    expect(readPngSize('public/icons/icon-512.png')).toEqual({ width: 512, height: 512 });
    expect(readPngSize('public/apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
  });

  it('favicon.ico 헤더가 3개 이미지(16, 32, 48)를 포함하고 icon.svg가 존재한다', () => {
    const ico = readFileSync(join(process.cwd(), 'public/favicon.ico'));
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);

    const sizes = [0, 1, 2].map((i) => ico.readUInt8(6 + i * 16));
    expect(sizes).toEqual([16, 32, 48]);

    const svg = readFileSync(join(process.cwd(), 'public/icon.svg'), 'utf8');
    expect(svg).toContain('<svg');
  });
});

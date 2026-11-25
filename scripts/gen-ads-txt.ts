import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { adsTxtLine } from '../src/lib/ads';

export function syncAdsTxt(targetPath = 'public/ads.txt'): void {
  const line = adsTxtLine();
  if (line) {
    mkdirSync(dirname(targetPath), { recursive: true });
    writeFileSync(targetPath, `${line}\n`, 'utf8');
    console.log(`[ads] OK ${targetPath}`);
  } else if (existsSync(targetPath)) {
    rmSync(targetPath, { force: true });
    console.log(`[ads] OK removed ${targetPath}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  syncAdsTxt();
}

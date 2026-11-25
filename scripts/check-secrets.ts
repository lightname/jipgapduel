import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { secrets } from '../config';

const OUT_DIR = join(process.cwd(), 'out');

if (!existsSync(OUT_DIR)) {
  console.error('[secrets] FAIL out/ directory missing');
  process.exit(1);
}

const needles = Object.values(secrets).filter((v) => v.length >= 8);

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

if (needles.length > 0) {
  for (const file of walk(OUT_DIR)) {
    const text = readFileSync(file, 'utf8');
    for (const secret of needles) {
      if (text.includes(secret)) {
        console.error(`[secrets] FAIL ${file}`);
        process.exit(1);
      }
    }
  }
}

console.log('[secrets] OK');

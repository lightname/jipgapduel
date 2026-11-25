export function hashString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function kstDate(now: Date = new Date()): string {
  return new Date(now.getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export function dailyNumber(date: string, launchDate: string): number {
  return Math.max(1, Math.floor((Date.parse(date) - Date.parse(launchDate)) / 86400000) + 1);
}

export function msUntilNextKstMidnight(now: Date = new Date()): number {
  const k = now.getTime() + 9 * 3600 * 1000;
  return 86400000 - (k % 86400000);
}

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export type SggStat = { code: string; name: string; median: number; count: number };
export type BandStat = { band: string; median: number; count: number };
export type PairBandStat = { count: number; minPct: number; maxPct: number | null };

export type Stats = {
  schemaVersion: 1;
  generatedAt: string;
  poolVersion: string;
  period: { from: string; to: string };
  sggCount: number;
  counts: {
    fetched: number;
    afterCancel: number;
    afterDirect: number;
    afterNonIndividual: number;
    afterLeasehold: number;
    afterOutlier: number;
    poolTrades: number;
  };
  pairBands: {
    easy: PairBandStat;
    medium: PairBandStat;
    hard: PairBandStat;
  };
  bySgg: SggStat[];
  byArea: BandStat[];
  byAge: BandStat[];
};

const STATS_PATH = join(process.cwd(), 'src/generated/stats.json');

export function loadStats(): Stats | null {
  if (!existsSync(STATS_PATH)) return null;
  return JSON.parse(readFileSync(STATS_PATH, 'utf8')) as Stats;
}

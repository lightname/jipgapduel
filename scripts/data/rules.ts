export const COLLECT = {
  months: 24,
  recentMonths: 3,
} as const;

export const OUTLIER = {
  areaTolM2: 3,
  lookbackMonths: 12,
  recentN: 5,
  minComps: 2,
  maxDev: 0.4,
} as const;

export const POOL = {
  maxTrades: 8000,
  minPerSgg: 30,
  maxPerComplex: 5,
} as const;

export const PAIRS = {
  targetPerBand: 3000,
  sampleTargetPerBand: 300,
  sampleMinPerBand: 100,
  bands: {
    easy: { min: 0.3, max: Infinity },
    medium: { min: 0.1, max: 0.3 },
    hard: { min: 0.02, max: 0.1 },
  },
} as const;

export const VERIFY = {
  schemaVersion: 1,
  minPoolTrades: 5000,
  sampleMinPoolTrades: 300,
  minSggCoverage: 0.9,
  maxBytes: 2 * 1024 * 1024,
} as const;

export const STATS_BANDS = {
  minSggCount: 30,
  area: [
    { band: '60㎡ 이하', min: -Infinity, max: 60 },
    { band: '60~85㎡', min: 60, max: 85 },
    { band: '85~102㎡', min: 85, max: 102 },
    { band: '102~135㎡', min: 102, max: 135 },
    { band: '135㎡ 초과', min: 135, max: Infinity },
  ],
  age: [
    { band: '5년 이내', min: -Infinity, max: 5 },
    { band: '6~10년', min: 6, max: 10 },
    { band: '11~20년', min: 11, max: 20 },
    { band: '21~30년', min: 21, max: 30 },
    { band: '30년 초과', min: 31, max: Infinity },
  ],
} as const;

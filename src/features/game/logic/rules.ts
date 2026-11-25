import type { Band } from './types';

export const BANDS: Record<Band, { min: number; max: number }> = {
  easy: { min: 0.3, max: Infinity },
  medium: { min: 0.1, max: 0.3 },
  hard: { min: 0.02, max: 0.1 },
};

export const DAILY_BANDS: readonly Band[] = [
  'easy',
  'easy',
  'easy',
  'medium',
  'medium',
  'medium',
  'medium',
  'hard',
  'hard',
  'hard',
];

export type InfiniteStage = {
  minStreak: number;
  band: Band;
  min: number;
  max: number;
};

export const INFINITE_STAGES: readonly InfiniteStage[] = [
  { minStreak: 0, band: 'easy', min: 0.3, max: Infinity },
  { minStreak: 3, band: 'medium', min: 0.2, max: 0.3 },
  { minStreak: 6, band: 'medium', min: 0.1, max: 0.2 },
  { minStreak: 10, band: 'hard', min: 0.05, max: 0.1 },
  { minStreak: 15, band: 'hard', min: 0.02, max: 0.05 },
];

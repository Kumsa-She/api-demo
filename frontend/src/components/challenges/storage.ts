import type { ChallengeProgress } from './types';

const KEY = 'challenges:progress';

export const loadProgress = (): ChallengeProgress => {
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return {};

    const parsed: unknown = JSON.parse(stored);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => value === 'completed'),
    ) as ChallengeProgress;
  } catch {
    return {};
  }
};

export const saveProgress = (progress: ChallengeProgress): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
};

export const markCompleted = (
  progress: ChallengeProgress,
  id: string,
): ChallengeProgress => ({
  ...progress,
  [id]: 'completed',
});
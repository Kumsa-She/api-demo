export type Difficulty = 'easy' | 'medium' | 'hard';

export type Challenge = {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  hint?: string;
  endpoint: { method: 'GET' | 'POST' | 'PUT' | 'DELETE'; path: string };
  expectedRequest: {
    headers?: Record<string, string>;
    body?: Record<string, unknown>;
  };
  expectedStatus: number;
};

export type ChallengeProgress = Record<string, 'completed'>;
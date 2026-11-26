import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CHALLENGES } from '../components/challenges/constants';
import { loadProgress } from '../components/challenges/storage';
import type {
  ChallengeProgress,
  Difficulty,
} from '../components/challenges/types';

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  medium:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
  hard: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400',
};

export default function Challenges() {
  const [progress] = useState<ChallengeProgress>(loadProgress);
  const completedCount = Object.keys(progress).length;

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8 dark:bg-[#010409] md:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-widest text-blue-600 dark:text-blue-400">
              LEARN BY DOING
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-slate-100">
              Challenges
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Practice working with API endpoints through hands-on challenges.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-slate-800 dark:bg-[#0d1117] dark:text-slate-300">
            {completedCount}/{CHALLENGES.length} completed
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CHALLENGES.map((challenge) => (
            <Link
              className="group"
              key={challenge.id}
              to={`/challenges/${challenge.id}`}
            >
              <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl dark:border-slate-800 dark:bg-[#0d1117]">
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`rounded-md border px-2 py-1 text-xs font-semibold ${difficultyStyles[challenge.difficulty]}`}
                  >
                    {challenge.difficulty}
                  </span>
                  {progress[challenge.id] && (
                    <CheckCircle2
                      aria-label="Completed"
                      className="h-5 w-5 text-emerald-500"
                    />
                  )}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-slate-100">
                  {challenge.title}
                </h3>
                <p className="mb-3 font-mono text-xs text-gray-500 dark:text-slate-400">
                  {challenge.endpoint.method} {challenge.endpoint.path}
                </p>
                <p className="line-clamp-2 text-sm text-gray-600 dark:text-slate-400">
                  {challenge.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {challenge.expectedStatus} expected response
                  </span>
                  <span className="text-sm font-semibold text-gray-600 transition-colors group-hover:text-blue-600 dark:text-slate-300 dark:group-hover:text-blue-400">
                    Start →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

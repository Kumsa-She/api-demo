import { GitBranch } from 'lucide-react';
import type { TraceStage } from './types';

type LifecycleTraceProps = {
  sending: boolean;
  trace: TraceStage[] | null;
};

export default function LifecycleTrace({
  sending,
  trace,
}: LifecycleTraceProps) {
  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
        <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        Request lifecycle
      </h2>

      {!sending && !trace && (
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Run a request to see the trace
        </p>
      )}

      {sending && (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((item) => (
            <div
              className="h-10 animate-pulse rounded-lg border border-gray-200 bg-gray-100 dark:border-slate-800 dark:bg-slate-800/60"
              key={item}
            />
          ))}
        </div>
      )}

      {trace && !sending && (
        <div>
          <div className="space-y-1">
            {trace.map((stage, index) => (
              <div
                className="relative flex items-center gap-3 py-2"
                key={stage.id}
              >
                {index < trace.length - 1 && (
                  <div className="absolute left-1.5 top-8 h-full border-l border-gray-300 dark:border-slate-700" />
                )}
                <div
                  className={`relative z-10 h-3 w-3 shrink-0 rounded-full ${
                    stage.status === 'ok'
                      ? 'bg-emerald-500'
                      : 'bg-red-500'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                    {stage.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {stage.detail}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-[#010409] dark:text-slate-400">
                  {stage.durationMs} ms
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-right text-xs font-semibold text-gray-600 dark:text-slate-300">
            Total:{' '}
            {trace.reduce(
              (sum, stage) => sum + stage.durationMs,
              0,
            )}{' '}
            ms
          </p>
        </div>
      )}
    </div>
  );
}

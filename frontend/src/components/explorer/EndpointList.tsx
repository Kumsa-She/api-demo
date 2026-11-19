import { List } from 'lucide-react';
import { methodStyles } from './constants';
import type { Endpoint } from './types';

type EndpointListProps = {
  endpoints: Endpoint[];
  selectedId: string | null;
  onSelect: (endpoint: Endpoint) => void;
};

export default function EndpointList({
  endpoints,
  selectedId,
  onSelect,
}: EndpointListProps) {
  return (
    <aside className="flex min-h-80 flex-col rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-[#0d1117]">
      <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-slate-800">
        <List className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
          Endpoints
        </h2>
        <span className="ml-auto rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500 dark:bg-[#010409] dark:text-slate-400">
          {endpoints.length}
        </span>
      </div>

      <div className="max-h-128 space-y-2 overflow-y-auto p-3">
        {endpoints.map((endpoint) => {
          const isSelected = selectedId === endpoint.id;

          return (
            <button
              className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                isSelected
                  ? 'border-blue-500/40 bg-blue-500/10'
                  : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-800 dark:bg-[#010409] dark:hover:border-slate-700'
              }`}
              key={endpoint.id}
              onClick={() => onSelect(endpoint)}
              type="button"
            >
              <span
                className={`w-16 shrink-0 rounded-md border px-2 py-1 text-center text-xs font-bold ${methodStyles[endpoint.method]}`}
              >
                {endpoint.method}
              </span>
              <span className="min-w-0 break-all text-sm text-gray-700 dark:text-slate-300">
                {endpoint.path}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
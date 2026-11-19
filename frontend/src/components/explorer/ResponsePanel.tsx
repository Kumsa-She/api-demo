import type { MockResponse } from './types';

type ResponsePanelProps = {
  sending: boolean;
  response: MockResponse | null;
  activeTab: 'body' | 'headers';
  onTabChange: (tab: 'body' | 'headers') => void;
};

export default function ResponsePanel({
  sending,
  response,
  activeTab,
  onTabChange,
}: ResponsePanelProps) {
  const responseBadgeStyles = response
    ? response.status >= 500
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
      : response.status >= 400
        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
    : '';

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
          Response
        </h2>
        {sending ? (
          <span className="animate-pulse text-xs font-medium text-blue-600 dark:text-blue-400">
            Sending…
          </span>
        ) : response ? (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md border px-2 py-1 text-xs font-semibold ${responseBadgeStyles}`}
            >
              {response.status} {response.statusText}
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-[#010409] dark:text-slate-400">
              {response.timeMs} ms
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-[#010409] dark:text-slate-400">
              {response.sizeBytes} B
            </span>
          </div>
        ) : null}
      </div>
      {response && (
        <div>
          <div className="mb-2 flex border-b border-gray-200 dark:border-slate-800">
            {(['body', 'headers'] as const).map((tab) => (
              <button
                className={`px-3 py-2 text-xs font-semibold ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-slate-400'
                }`}
                key={tab}
                onClick={() => onTabChange(tab)}
                type="button"
              >
                {tab === 'body' ? 'Body' : 'Headers'}
              </button>
            ))}
          </div>

          {activeTab === 'body' ? (
            <pre className="max-h-72 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs leading-relaxed text-gray-700 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300">
              {response.body}
            </pre>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 font-mono text-xs dark:border-slate-800">
              {response.headers.map((header) => (
                <div
                  className="grid grid-cols-2 border-b border-gray-100 last:border-b-0 dark:border-slate-800"
                  key={header.name}
                >
                  <div className="px-3 py-2 font-semibold text-gray-700 dark:text-slate-300">
                    {header.name}
                  </div>
                  <div className="px-3 py-2 text-gray-500 dark:text-slate-400">
                    {header.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

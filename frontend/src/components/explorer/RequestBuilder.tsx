import { Copy, Send, X } from 'lucide-react';
import { methodStyles } from './constants';
import type { Endpoint, HeaderRow } from './types';

type RequestBuilderProps = {
  endpoint: Endpoint;
  path: string;
  onPathChange: (value: string) => void;
  method: Endpoint['method'];
  activeTab: 'headers' | 'body';
  onTabChange: (tab: 'headers' | 'body') => void;
  headerRows: HeaderRow[];
  onHeaderChange: (
    id: number,
    field: 'key' | 'value',
    value: string,
  ) => void;
  onHeaderRemove: (id: number) => void;
  onHeaderAdd: () => void;
  body: string;
  onBodyChange: (value: string) => void;
  sending: boolean;
  onSend: () => void;
  copied: boolean;
  onCopyCurl: () => void;
};

export default function RequestBuilder({
  endpoint,
  path,
  onPathChange,
  method,
  activeTab,
  onTabChange,
  headerRows,
  onHeaderChange,
  onHeaderRemove,
  onHeaderAdd,
  body,
  onBodyChange,
  sending,
  onSend,
  copied,
  onCopyCurl,
}: RequestBuilderProps) {
  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
        <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        Request builder
      </h2>
      <p className="mb-4 text-xs text-gray-500 dark:text-slate-400">
        {endpoint.description}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <span
          className={`flex h-11 items-center justify-center rounded-lg border px-3 text-xs font-bold ${methodStyles[method]}`}
        >
          {method}
        </span>
        <input
          aria-label="Request path"
          className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
          onChange={(event) => onPathChange(event.target.value)}
          type="text"
          value={path}
        />
        <div className="flex gap-2">
          <button
            className="h-11 shrink-0 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#010409] dark:text-slate-300"
            disabled={sending}
            onClick={onCopyCurl}
            type="button"
          >
            <span className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy cURL'}
            </span>
          </button>
          <button
            className="h-11 shrink-0 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={sending}
            onClick={onSend}
            type="button"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 dark:border-slate-800">
        <div className="flex border-b border-gray-200 dark:border-slate-800">
          {(['headers', 'body'] as const).map((tab) => (
            <button
              className={`px-4 py-3 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              key={tab}
              onClick={() => onTabChange(tab)}
              type="button"
            >
              {tab === 'headers' ? 'Headers' : 'Body'}
            </button>
          ))}
        </div>

        {activeTab === 'headers' ? (
          <div className="space-y-3 p-4">
            {headerRows.map((row) => (
              <div
                className="grid grid-cols-[1fr_1fr_auto] gap-2"
                key={row.id}
              >
                <input
                  aria-label="Header key"
                  className="h-10 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
                  onChange={(event) =>
                    onHeaderChange(row.id, 'key', event.target.value)
                  }
                  placeholder="Key"
                  type="text"
                  value={row.key}
                />
                <input
                  aria-label="Header value"
                  className="h-10 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
                  onChange={(event) =>
                    onHeaderChange(row.id, 'value', event.target.value)
                  }
                  placeholder="Value"
                  type="text"
                  value={row.value}
                />
                <button
                  aria-label="Remove header"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:text-red-400"
                  onClick={() => onHeaderRemove(row.id)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={onHeaderAdd}
              type="button"
            >
              + Add header
            </button>
          </div>
        ) : (
          <div className="p-4">
            <textarea
              aria-label="Request body"
              className="min-h-40 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
              onChange={(event) => onBodyChange(event.target.value)}
              value={body}
            />
          </div>
        )}
      </div>
    </div>
  );
}

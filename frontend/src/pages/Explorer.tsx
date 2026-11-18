import { useState } from 'react';
import { Copy, GitBranch, List, Send, X } from 'lucide-react';

type Endpoint = {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  exampleBody?: string;
  exampleHeaders?: Record<string, string>;
};

type HeaderRow = {
  id: number;
  key: string;
  value: string;
};

type MockResponse = {
  status: number;
  statusText: string;
  timeMs: number;
  sizeBytes: number;
  body: string;
  headers: { name: string; value: string }[];
};

type TraceStage = {
  id: string;
  label: string;
  detail: string;
  durationMs: number;
  status: 'ok' | 'fail';
};

const endpoints: Endpoint[] = [
  {
    id: 'products-list',
    method: 'GET',
    path: '/api/products',
    description: 'Fetch all products from the catalog.',
    exampleHeaders: { Accept: 'application/json' },
  },
  {
    id: 'product-create',
    method: 'POST',
    path: '/api/products',
    description: 'Create a new product in the catalog.',
    exampleHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    exampleBody: JSON.stringify(
      {
        name: 'Wireless Keyboard',
        price: 79.99,
        category: 'Accessories',
        stock: 25,
        description: 'Compact wireless keyboard',
      },
      null,
      2,
    ),
  },
  {
    id: 'product-detail',
    method: 'GET',
    path: '/api/products/:id',
    description: 'Fetch a single product by its ID.',
    exampleHeaders: { Accept: 'application/json' },
  },
  {
    id: 'product-update',
    method: 'PUT',
    path: '/api/products/:id',
    description: 'Update an existing product by its ID.',
    exampleHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    exampleBody: JSON.stringify(
      {
        name: 'Wireless Keyboard Pro',
        price: 89.99,
        stock: 18,
      },
      null,
      2,
    ),
  },
  {
    id: 'product-delete',
    method: 'DELETE',
    path: '/api/products/:id',
    description: 'Delete a product from the catalog.',
    exampleHeaders: { Accept: 'application/json' },
  },
  {
    id: 'health-check',
    method: 'GET',
    path: '/health',
    description: 'Check whether the API service is available.',
    exampleHeaders: { Accept: 'application/json' },
  },
];

const methodStyles: Record<Endpoint['method'], string> = {
  GET: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  POST: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
  PUT: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
  DELETE:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400',
};

export default function Explorer() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(
    null,
  );
  const [path, setPath] = useState('');
  const [activeTab, setActiveTab] = useState<'headers' | 'body'>('headers');
  const [headerRows, setHeaderRows] = useState<HeaderRow[]>([
    { id: 1, key: '', value: '' },
  ]);
  const [body, setBody] = useState('');
  const [nextHeaderId, setNextHeaderId] = useState(2);
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<MockResponse | null>(null);
  const [trace, setTrace] = useState<TraceStage[] | null>(null);
  const [copied, setCopied] = useState(false);
  const [responseTab, setResponseTab] = useState<'body' | 'headers'>('body');

  const selectEndpoint = (endpoint: Endpoint) => {
    setSelectedEndpoint(endpoint);
    setPath(endpoint.path);
    setActiveTab(
      endpoint.method === 'POST' || endpoint.method === 'PUT'
        ? 'body'
        : 'headers',
    );
    setHeaderRows([{ id: 1, key: '', value: '' }]);
    setNextHeaderId(2);
    setBody(endpoint.exampleBody ?? '');
    setResponse(null);
    setTrace(null);
  };

  const buildCurl = () => {
    if (!selectedEndpoint) return '';

    const lines = [
      `curl -X ${selectedEndpoint.method} '${window.location.origin}${path}'`,
    ];

    headerRows.forEach((row) => {
      if (row.key.trim()) {
        lines.push(`  -H '${row.key.trim()}: ${row.value}'`);
      }
    });

    if (
      (selectedEndpoint.method === 'POST' ||
        selectedEndpoint.method === 'PUT') &&
      body.trim()
    ) {
      lines.push(`  -d '${body.replace(/'/g, "'\\''")}'`);
    }

    if (lines.length === 1) return lines[0];

    return lines
      .map((line, index) =>
        index === 0
          ? line
          : `  ${index === lines.length - 1 ? line.trim() : `${line.trim()} \\`}`,
      )
      .join(' \\\n');
  };

  const copyCurl = () => {
    void navigator.clipboard.writeText(buildCurl());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const sendRequest = async () => {
    if (!selectedEndpoint || sending) return;

    setSending(true);
    const delay = 600 + Math.random() * 600;
    await new Promise((resolve) => setTimeout(resolve, delay));

    let status = 200;
    let statusText = 'OK';
    let mockBody: object;

    if (selectedEndpoint.id === 'products-list') {
      mockBody = {
        success: true,
        data: [
          {
            id: '65f1b2c3d4e5f67890123456',
            name: 'Wireless Keyboard',
            price: 79.99,
          },
          {
            id: '65f1b2c3d4e5f67890123457',
            name: 'Mechanical Mouse',
            price: 49.99,
          },
        ],
        count: 2,
      };
    } else if (selectedEndpoint.id === 'product-detail') {
      mockBody = {
        success: true,
        data: {
          id: '65f1b2c3d4e5f67890123456',
          name: 'Wireless Keyboard',
          price: 79.99,
          category: 'Accessories',
          stock: 25,
        },
      };
    } else if (selectedEndpoint.method === 'POST') {
      status = 201;
      statusText = 'Created';
      mockBody = {
        success: true,
        data: {
          id: '65f1b2c3d4e5f67890123458',
          name: 'Wireless Keyboard',
          price: 79.99,
          category: 'Accessories',
          stock: 25,
        },
      };
    } else if (selectedEndpoint.method === 'PUT') {
      mockBody = {
        success: true,
        data: {
          id: '65f1b2c3d4e5f67890123456',
          name: 'Wireless Keyboard Pro',
          price: 89.99,
          stock: 18,
        },
      };
    } else if (selectedEndpoint.method === 'DELETE') {
      mockBody = {
        success: true,
        data: {
          id: '65f1b2c3d4e5f67890123456',
          name: 'Wireless Keyboard',
          deleted: true,
        },
      };
    } else {
      mockBody = { status: 'ok' };
    }

    const bodyString = JSON.stringify(mockBody, null, 2);
    const timeMs = Math.round(delay);
    setResponse({
      status,
      statusText,
      timeMs,
      sizeBytes: new Blob([bodyString]).size,
      body: bodyString,
      headers: [
        { name: 'content-type', value: 'application/json; charset=utf-8' },
        { name: 'x-powered-by', value: 'Express' },
        { name: 'x-ratelimit-limit', value: '100' },
        {
          name: 'x-ratelimit-remaining',
          value: String(Math.floor(Math.random() * 100)),
        },
        { name: 'cache-control', value: 'no-store' },
        { name: 'date', value: new Date().toUTCString() },
      ],
    });
    setResponseTab('body');

    const stageWeights = [0.08, 0.008, 0.002, 0.005, 0.09, 0.005];
    const stageSpecs = [
      {
        id: 'client-server',
        label: 'Client → Server',
        detail: 'network',
        status: 'ok' as const,
      },
      {
        id: 'middleware',
        label: 'Rate limit / CORS',
        detail: 'middleware',
        status: 'ok' as const,
      },
      {
        id: 'route',
        label: 'Route match',
        detail: 'router',
        status: 'ok' as const,
      },
      {
        id: 'validation',
        label: 'Validation',
        detail: 'request checks',
        status: 'ok' as const,
      },
      {
        id: 'database',
        label: 'Database query',
        detail: 'MongoDB',
        status: 'ok' as const,
      },
      {
        id: 'serialize',
        label: 'Response serialize',
        detail: 'JSON',
        status: 'ok' as const,
      },
    ];

    const stages = stageSpecs.map((stage, index) => {
      const duration =
        index === stageSpecs.length - 1
          ? timeMs -
            stageSpecs.slice(0, -1).reduce((sum, _, stageIndex) => {
              return (
                sum + Math.max(1, Math.round(timeMs * stageWeights[stageIndex]))
              );
            }, 0)
          : Math.max(1, Math.round(timeMs * stageWeights[index]));

      return { ...stage, durationMs: duration };
    });

    setTrace(stages);
    setSending(false);
  };

  const responseBadgeStyles = response
    ? response.status >= 500
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
      : response.status >= 400
        ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
    : '';

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8 dark:bg-[#010409] md:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold tracking-widest text-blue-600 dark:text-blue-400">
            API WORKSPACE
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-slate-100">
            Explorer
          </h1>
        </div>

        <div className="grid gap-6 md:grid-cols-[2fr_3fr]">
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
                const isSelected = selectedEndpoint?.id === endpoint.id;

                return (
                  <button
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                      isSelected
                        ? 'border-blue-500/40 bg-blue-500/10'
                        : 'border-gray-200 bg-white hover:border-gray-300 dark:border-slate-800 dark:bg-[#010409] dark:hover:border-slate-700'
                    }`}
                    key={endpoint.id}
                    onClick={() => selectEndpoint(endpoint)}
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

          <div className="min-h-80 rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-[#0d1117]">
            {!selectedEndpoint ? (
              <div className="flex min-h-80 items-center justify-center px-6 text-center">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Select an endpoint to start
                </p>
              </div>
            ) : (
              <div className="space-y-5 p-5 md:p-6">
                <div>
                  <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
                    <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Request builder
                  </h2>
                  <p className="mb-4 text-xs text-gray-500 dark:text-slate-400">
                    {selectedEndpoint.description}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <span
                      className={`flex h-11 items-center justify-center rounded-lg border px-3 text-xs font-bold ${methodStyles[selectedEndpoint.method]}`}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <input
                      aria-label="Request path"
                      className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
                      onChange={(event) => setPath(event.target.value)}
                      type="text"
                      value={path}
                    />
                    <div className="flex gap-2">
                      <button
                        className="h-11 shrink-0 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-[#010409] dark:text-slate-300"
                        disabled={sending}
                        onClick={copyCurl}
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
                        onClick={sendRequest}
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
                          onClick={() => setActiveTab(tab)}
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
                                setHeaderRows((rows) =>
                                  rows.map((item) =>
                                    item.id === row.id
                                      ? { ...item, key: event.target.value }
                                      : item,
                                  ),
                                )
                              }
                              placeholder="Key"
                              type="text"
                              value={row.key}
                            />
                            <input
                              aria-label="Header value"
                              className="h-10 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
                              onChange={(event) =>
                                setHeaderRows((rows) =>
                                  rows.map((item) =>
                                    item.id === row.id
                                      ? { ...item, value: event.target.value }
                                      : item,
                                  ),
                                )
                              }
                              placeholder="Value"
                              type="text"
                              value={row.value}
                            />
                            <button
                              aria-label="Remove header"
                              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-red-500/40 dark:hover:text-red-400"
                              onClick={() =>
                                setHeaderRows((rows) =>
                                  rows.filter((item) => item.id !== row.id),
                                )
                              }
                              type="button"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => {
                            setHeaderRows((rows) => [
                              ...rows,
                              { id: nextHeaderId, key: '', value: '' },
                            ]);
                            setNextHeaderId((id) => id + 1);
                          }}
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
                          onChange={(event) => setBody(event.target.value)}
                          value={body}
                        />
                      </div>
                    )}
                  </div>
                </div>

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
                              responseTab === tab
                                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-slate-400'
                            }`}
                            key={tab}
                            onClick={() => setResponseTab(tab)}
                            type="button"
                          >
                            {tab === 'body' ? 'Body' : 'Headers'}
                          </button>
                        ))}
                      </div>

                      {responseTab === 'body' ? (
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
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

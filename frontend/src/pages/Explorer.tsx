import { useState } from 'react';
import EndpointList from '../components/explorer/EndpointList';
import LifecycleTrace from '../components/explorer/LifecycleTrace';
import RequestBuilder from '../components/explorer/RequestBuilder';
import ResponsePanel from '../components/explorer/ResponsePanel';
import { endpoints } from '../components/explorer/constants';
import type {
  Endpoint,
  HeaderRow,
  MockResponse,
  TraceStage,
} from '../components/explorer/types';

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

  const onHeaderChange = (
    id: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    setHeaderRows((rows) =>
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    );
  };

  const onHeaderRemove = (id: number) => {
    setHeaderRows((rows) => rows.filter((row) => row.id !== id));
  };

  const onHeaderAdd = () => {
    setHeaderRows((rows) => [
      ...rows,
      { id: nextHeaderId, key: '', value: '' },
    ]);
    setNextHeaderId((id) => id + 1);
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
          { id: '65f1b2c3d4e5f67890123456', name: 'Wireless Keyboard', price: 79.99 },
          { id: '65f1b2c3d4e5f67890123457', name: 'Mechanical Mouse', price: 49.99 },
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
      { id: 'client-server', label: 'Client → Server', detail: 'network', status: 'ok' as const },
      { id: 'middleware', label: 'Rate limit / CORS', detail: 'middleware', status: 'ok' as const },
      { id: 'route', label: 'Route match', detail: 'router', status: 'ok' as const },
      { id: 'validation', label: 'Validation', detail: 'request checks', status: 'ok' as const },
      { id: 'database', label: 'Database query', detail: 'MongoDB', status: 'ok' as const },
      { id: 'serialize', label: 'Response serialize', detail: 'JSON', status: 'ok' as const },
    ];

    const stages = stageSpecs.map((stage, index) => {
      const duration =
        index === stageSpecs.length - 1
          ? timeMs -
            stageSpecs.slice(0, -1).reduce((sum, _, stageIndex) => {
              return sum + Math.max(1, Math.round(timeMs * stageWeights[stageIndex]));
            }, 0)
          : Math.max(1, Math.round(timeMs * stageWeights[index]));

      return { ...stage, durationMs: duration };
    });

    setTrace(stages);
    setSending(false);
  };

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
          <EndpointList
            endpoints={endpoints}
            selectedId={selectedEndpoint?.id ?? null}
            onSelect={selectEndpoint}
          />

          <div className="min-h-80 rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-slate-800 dark:bg-[#0d1117]">
            {!selectedEndpoint ? (
              <div className="flex min-h-80 items-center justify-center px-6 text-center">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Select an endpoint to start
                </p>
              </div>
            ) : (
              <div className="space-y-5 p-5 md:p-6">
                <RequestBuilder
                  endpoint={selectedEndpoint}
                  path={path}
                  onPathChange={setPath}
                  method={selectedEndpoint.method}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  headerRows={headerRows}
                  onHeaderChange={onHeaderChange}
                  onHeaderRemove={onHeaderRemove}
                  onHeaderAdd={onHeaderAdd}
                  body={body}
                  onBodyChange={setBody}
                  sending={sending}
                  onSend={sendRequest}
                  copied={copied}
                  onCopyCurl={copyCurl}
                />

                <ResponsePanel
                  sending={sending}
                  response={response}
                  activeTab={responseTab}
                  onTabChange={setResponseTab}
                />

                <LifecycleTrace sending={sending} trace={trace} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

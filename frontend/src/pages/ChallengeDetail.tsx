import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle2, Info, Send, XCircle } from 'lucide-react';
import { CHALLENGES } from '../components/challenges/constants';
import {
  loadProgress,
  markCompleted,
  saveProgress,
} from '../components/challenges/storage';
import type { Difficulty } from '../components/challenges/types';

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  medium:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
  hard: 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400',
};

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const challenge = CHALLENGES.find((item) => item.id === id);

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-gray-50 py-8 dark:bg-[#010409] md:py-12">
      <div className="mx-auto max-w-4xl px-4">
        {!challenge ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 text-center shadow-lg dark:border-slate-800 dark:bg-[#0d1117]">
            <h1 className="mb-4 text-xl font-semibold text-gray-900 dark:text-slate-100">
              Challenge not found
            </h1>
            <Link
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              to="/challenges"
            >
              ← Back to challenges
            </Link>
          </div>
        ) : (
          <ChallengeDetailContent key={challenge.id} challenge={challenge} />
        )}
      </div>
    </section>
  );
}

function ChallengeDetailContent({
  challenge,
}: {
  challenge: (typeof CHALLENGES)[number];
}) {
  const supportsBody =
    challenge.endpoint.method === 'POST' ||
    challenge.endpoint.method === 'PUT';
  const [path, setPath] = useState(challenge.endpoint.path);
  const [body, setBody] = useState(() =>
    JSON.stringify(challenge.expectedRequest.body ?? {}, null, 2),
  );
  const [headers, setHeaders] = useState<
    { id: number; key: string; value: string }[]
  >(
    supportsBody
      ? [{ id: 1, key: 'Content-Type', value: 'application/json' }]
      : [],
  );
  const [nextHeaderId, setNextHeaderId] = useState(2);
  const [activeTab, setActiveTab] = useState<'headers' | 'body'>('headers');
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    timeMs: number;
    body: string;
  } | null>(null);
  const [trace, setTrace] = useState<
    {
      id: string;
      label: string;
      detail: string;
      status: 'ok' | 'fail';
      timeMs: number;
    }[] | null
  >(null);
  const [isCompleted, setIsCompleted] = useState(
    () => loadProgress()[challenge.id] === 'completed',
  );

  const handleSend = async () => {
    setSending(true);
    setResponse(null);
    setTrace(null);
    const startedAt = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 800));

    const normalizePath = (value: string) => value.replace(/\/+$/, '');
    const expectedPath = normalizePath(challenge.endpoint.path);
    const submittedPath = normalizePath(path);
    const dynamicPathPrefix = expectedPath.includes('/:id')
      ? expectedPath.slice(0, expectedPath.indexOf(':id'))
      : null;
    const pathMatches = dynamicPathPrefix
      ? submittedPath.startsWith(dynamicPathPrefix)
      : submittedPath === expectedPath;
    let validationError: string | null = pathMatches
      ? null
      : 'Path does not match the challenge endpoint.';
    let validationDetail = pathMatches
      ? 'The request path matches the challenge endpoint.'
      : 'The request path does not match the challenge endpoint.';

    if (pathMatches && supportsBody) {
      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = null;
        validationError = 'Invalid JSON body.';
        validationDetail = 'The server could not parse your JSON body.';
      }

      if (!validationError) {
        const expectedBody = challenge.expectedRequest.body ?? {};
        const bodyMatches =
          typeof parsedBody === 'object' &&
          parsedBody !== null &&
          !Array.isArray(parsedBody) &&
          Object.entries(expectedBody).every(
            ([key, value]) =>
              Object.prototype.hasOwnProperty.call(parsedBody, key) &&
              (parsedBody as Record<string, unknown>)[key] === value,
          );

        if (!bodyMatches) {
          validationError = 'Request body does not match the expected values.';
          validationDetail =
            'The server checked your JSON body and found a mismatch.';
        } else {
          validationDetail =
            'The server checked your JSON body; all expected values match.';
        }
      }
    }

    const succeeded = validationError === null;
    const status = succeeded ? challenge.expectedStatus : 400;
    const statusText = succeeded
      ? status === 201
        ? 'Created'
        : status === 404
          ? 'Not Found'
          : 'OK'
      : 'Bad Request';
    const responseBody = succeeded
      ? { success: true, message: 'Your request matched the challenge.' }
      : {
          success: false,
          error: validationError ?? 'Request validation failed.',
        };

    setResponse({
      status,
      statusText,
      timeMs: Date.now() - startedAt,
      body: JSON.stringify(responseBody, null, 2),
    });
    setTrace([
      {
        id: 'client',
        label: 'Client → Server',
        detail: 'Your request was sent to the mock challenge server.',
        status: 'ok',
        timeMs: 2,
      },
      {
        id: 'validation',
        label: 'Validation',
        detail: validationDetail,
        status: succeeded ? 'ok' : 'fail',
        timeMs: 5,
      },
      {
        id: 'response',
        label: 'Database / Response',
        detail: succeeded
          ? 'The challenge response was generated and progress was saved.'
          : 'The server returned an error; no successful challenge response was generated.',
        status: succeeded ? 'ok' : 'fail',
        timeMs: 15,
      },
    ]);

    if (succeeded && !isCompleted) {
      saveProgress(markCompleted(loadProgress(), challenge.id));
      setIsCompleted(true);
    }
    setSending(false);
  };

  return (
    <>
      <Link
        className="mb-6 inline-block text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        to="/challenges"
      >
        ← Back to challenges
      </Link>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
            {challenge.title}
          </h1>
          <span
            className={`rounded-md border px-2 py-1 text-xs font-semibold ${difficultyStyles[challenge.difficulty]}`}
          >
            {challenge.difficulty}
          </span>
        </div>
        <p className="mb-3 font-mono text-sm text-gray-500 dark:text-slate-400">
          {challenge.endpoint.method} {challenge.endpoint.path}
        </p>
        <p className="text-sm text-gray-600 dark:text-slate-400">
          {challenge.description}
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-200">
              Hint
            </h2>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {challenge.hint ?? 'No hint available.'}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0d1117]">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
          <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Request Builder
        </h2>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <span className="flex h-11 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-xs font-bold text-gray-700 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300">
            {challenge.endpoint.method}
          </span>
          <input
            className="h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
            value={path}
            onChange={(event) => setPath(event.target.value)}
            placeholder="Request path"
          />
        </div>
        <div className="mb-4 flex gap-4 border-b border-gray-200 dark:border-slate-800">
          <button
            className={`border-b-2 px-1 pb-2 text-sm font-medium ${
              activeTab === 'headers'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            onClick={() => setActiveTab('headers')}
            type="button"
          >
            Headers
          </button>
          {supportsBody && (
            <button
              className={`border-b-2 px-1 pb-2 text-sm font-medium ${
                activeTab === 'body'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              onClick={() => setActiveTab('body')}
              type="button"
            >
              Body
            </button>
          )}
        </div>
        {activeTab === 'headers' ? (
          <div className="mb-4 space-y-3">
            {headers.map((header) => (
              <div className="flex items-center gap-2" key={header.id}>
                <input
                  aria-label="Header name"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
                  onChange={(event) =>
                    setHeaders((current) =>
                      current.map((item) =>
                        item.id === header.id
                          ? { ...item, key: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Header name"
                  value={header.key}
                />
                <input
                  aria-label="Header value"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
                  onChange={(event) =>
                    setHeaders((current) =>
                      current.map((item) =>
                        item.id === header.id
                          ? { ...item, value: event.target.value }
                          : item,
                      ),
                    )
                  }
                  placeholder="Header value"
                  value={header.value}
                />
                <button
                  aria-label="Remove header"
                  className="rounded p-1 text-gray-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
                  onClick={() =>
                    setHeaders((current) =>
                      current.filter((item) => item.id !== header.id),
                    )
                  }
                  type="button"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              onClick={() => {
                setHeaders((current) => [
                  ...current,
                  { id: nextHeaderId, key: '', value: '' },
                ]);
                setNextHeaderId((current) => current + 1);
              }}
              type="button"
            >
              + Add header
            </button>
          </div>
        ) : supportsBody ? (
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-slate-300">
              JSON Body
            </label>
            <textarea
              className="min-h-[120px] w-full resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-700 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder={'{\n  "key": "value"\n}'}
            />
          </div>
        ) : null}
        <button
          className="w-full rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={sending}
          onClick={handleSend}
        >
          <span className="inline-flex items-center gap-2">
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Request'}
          </span>
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0d1117]">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-slate-100">
            Response
          </h2>
          {sending ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-32 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-28 rounded-lg bg-gray-100 dark:bg-[#010409]" />
            </div>
          ) : response ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    response.status >= 200 && response.status < 300
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : response.status >= 500
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                  }`}
                >
                  {response.status >= 200 && response.status < 300 ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {response.status} {response.statusText}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {response.timeMs} ms
                </span>
                {isCompleted && (
                  <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    Challenge saved to progress
                  </span>
                )}
              </div>
              <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-700 dark:bg-[#010409] dark:text-slate-300">
                {response.body}
              </pre>
            </>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Send your request to see the mock response.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0d1117]">
          <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-slate-100">
            Request Lifecycle
          </h2>
          {sending ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
            </div>
          ) : trace ? (
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
                      stage.status === 'ok' ? 'bg-emerald-500' : 'bg-red-500'
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
                    {stage.timeMs} ms
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              The request steps will appear here after you send it.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

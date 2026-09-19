import {
  ArrowRight,
  Check,
  Database,
  GitBranch,
  List,
  Monitor,
  Send,
  Server,
} from 'lucide-react';

function MockupShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-80 w-full flex-col justify-center rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-lg dark:border-slate-800 dark:bg-[#0d1117]">
      {children}
    </div>
  );
}

function EndpointList() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/products',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      method: 'POST',
      path: '/api/products',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      method: 'PUT',
      path: '/api/products/:id',
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      method: 'DELETE',
      path: '/api/products/:id',
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <MockupShell>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
          <List className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Endpoints
        </div>
        <span className="rounded-md bg-white px-2 py-1 text-xs font-medium text-gray-500 shadow-sm dark:bg-[#010409] dark:text-slate-400">
          12 available
        </span>
      </div>
      <div className="space-y-3">
        {endpoints.map(({ method, path, color }) => (
          <div
            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#010409]"
            key={`${method}-${path}`}
          >
            <span className={`w-14 text-xs font-bold ${color}`}>{method}</span>
            <span className="text-sm text-gray-700 dark:text-slate-300">
              {path}
            </span>
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

function RequestBuilder() {
  return (
    <MockupShell>
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
        <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        Request builder
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm font-semibold text-blue-600 dark:border-slate-800 dark:bg-[#010409] dark:text-blue-400">
          POST
        </div>
        <div className="flex min-w-0 flex-1 items-center rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm text-gray-500 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-400">
          /api/products
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
          type="button"
        >
          Send
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
          Headers
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-4 text-sm text-gray-500 dark:border-slate-700 dark:text-slate-400">
          JSON body
        </div>
      </div>
    </MockupShell>
  );
}

function LifecycleTimeline() {
  const steps = [
    { label: 'Client', icon: Monitor },
    { label: 'Server', icon: Server },
    { label: 'Database', icon: Database },
    { label: 'Response', icon: Check },
  ];

  return (
    <MockupShell>
      <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
        <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        Request lifecycle
      </div>
      <div className="space-y-4">
        {steps.map(({ label, icon: Icon }, index) => (
          <div className="relative flex items-center gap-3" key={label}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 dark:border-slate-800 dark:bg-[#010409] dark:text-slate-300">
              {label}
            </div>
            {index < steps.length - 1 && (
              <div className="absolute top-12 left-4 h-4 border-l border-blue-500/40" />
            )}
          </div>
        ))}
      </div>
    </MockupShell>
  );
}

export default function HowItWorks() {
  return (
    <section className="bg-white py-24 dark:bg-[#010409] md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight text-gray-900 md:mb-24 md:text-4xl dark:text-slate-100">
          How It Works
        </h2>

        <div className="mb-24 grid items-center gap-12 md:mb-32 md:grid-cols-2 md:gap-16">
          <div className="self-center">
            <p className="mb-4 text-sm font-semibold tracking-widest text-blue-600 dark:text-blue-400">
              01
            </p>
            <h3 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-slate-100">
              Pick an Endpoint
            </h3>
            <p className="max-w-md text-lg leading-relaxed text-gray-600 dark:text-slate-400">
              Browse a library of real API endpoints - GET, POST, PUT, DELETE -
              each with clear documentation.
            </p>
          </div>
          <div className="w-full self-center">
            <EndpointList />
          </div>
        </div>

        <div className="mb-24 grid items-center gap-12 md:mb-32 md:grid-cols-2 md:gap-16">
          <div className="w-full self-center md:order-first">
            <RequestBuilder />
          </div>
          <div className="self-center">
            <p className="mb-4 text-sm font-semibold tracking-widest text-blue-600 dark:text-blue-400">
              02
            </p>
            <h3 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-slate-100">
              Send a Real Request
            </h3>
            <p className="max-w-md text-lg leading-relaxed text-gray-600 dark:text-slate-400">
              Test any endpoint with real HTTP calls. Add headers, body, and
              parameters just like in production.
            </p>
          </div>
        </div>

        <div className="mb-24 grid items-center gap-12 md:mb-32 md:grid-cols-2 md:gap-16">
          <div className="self-center">
            <p className="mb-4 text-sm font-semibold tracking-widest text-blue-600 dark:text-blue-400">
              03
            </p>
            <h3 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-slate-100">
              Trace the Full Lifecycle
            </h3>
            <p className="max-w-md text-lg leading-relaxed text-gray-600 dark:text-slate-400">
              Watch your request travel through every layer - client, server,
              middleware, database - and see the exact response.
            </p>
          </div>
          <div className="w-full self-center">
            <LifecycleTimeline />
          </div>
        </div>
      </div>
    </section>
  );
}

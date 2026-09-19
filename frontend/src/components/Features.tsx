import { GitBranch, Send, Target } from 'lucide-react';

const features = [
  {
    icon: Send,
    title: 'Real API Requests',
    description: 'Send actual HTTP requests and see live responses.',
  },
  {
    icon: GitBranch,
    title: 'Visual Lifecycle',
    description: 'Trace every request through the complete API lifecycle.',
  },
  {
    icon: Target,
    title: 'Hands-on Challenges',
    description: 'Learn by completing guided challenges with real scenarios.',
  },
];

export default function Features() {
  return (
    <section className="bg-gray-50 py-24 dark:bg-[#0d1117] md:py-32">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-slate-100">
            Everything you need to master APIs
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-slate-400">
            Build confidence by working with real requests, visualizing their
            lifecycle, and solving practical challenges.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article
              className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 before:absolute before:top-0 before:left-0 before:h-1 before:w-0 before:bg-blue-600 before:transition-all before:duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:before:w-full dark:border-slate-800 dark:bg-[#010409]"
              key={title}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/20 to-blue-600/10">
                <Icon className="h-6.5 w-6.5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900 md:text-xl dark:text-slate-100">
                {title}
              </h3>
              <p className="text-base leading-relaxed text-gray-600 dark:text-slate-400">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

import apiDesignImage from '../assets/api_design.png';
import Button from './Button';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-24 md:py-32 dark:from-[#0d1117] dark:to-[#010409]">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 md:grid-cols-2 md:gap-20">
        <div className="text-left">
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-gray-900 md:text-7xl dark:text-white">
            Learn APIs by Doing
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-gray-600 md:text-xl dark:text-slate-400">
            Master the API request lifecycle with real requests, live responses,
            and hands-on challenges.
          </p>
          <Button className="mt-10" to="/explorer" variant="primary">
            Get Started
          </Button>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-72 w-72 rounded-full bg-blue-500/10 blur-3xl md:h-96 md:w-96" />
          </div>
          <img
            alt="API request and response illustration"
            className="relative w-full max-w-md drop-shadow-2xl md:max-w-xl"
            src={apiDesignImage}
          />
        </div>
      </div>
    </section>
  );
}

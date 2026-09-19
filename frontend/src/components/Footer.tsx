import { Link } from 'react-router-dom';

const footerLinks = ['Home', 'Explorer', 'Challenges', 'Docs', 'Privacy'];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <nav className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              className="text-sm font-medium"
              key={link}
              to={link === 'Home' ? '/' : '#'}
            >
              {link}
            </Link>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} API Demo</p>
      </div>
    </footer>
  );
}

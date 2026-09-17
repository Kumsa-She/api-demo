import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Explorer', path: '/explorer' },
  { label: 'Challenges', path: '/challenges' },
  { label: 'Docs', path: '/docs' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/95 backdrop-blur dark:border-slate-800/80 dark:bg-[#010409]/95">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <Link
          className="flex w-fit items-center gap-2 text-base font-semibold tracking-tight text-gray-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
          to="/"
        >
          <Code
            className="text-blue-600 dark:text-blue-400"
            size={19}
            strokeWidth={2.25}
          />
          <span>API Demo</span>
        </Link>

        <nav
          className={`${isMenuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-16 z-10 flex-col gap-1 border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:static md:flex md:flex-row md:items-center md:justify-center md:gap-1 md:border-0 md:bg-transparent md:p-0 md:shadow-none dark:border-slate-800 dark:bg-[#010409] md:dark:bg-transparent`}
        >
          {navLinks.map((link) => (
            <Link
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors md:py-1.5 ${location.pathname === link.path ? 'text-blue-600 md:bg-blue-50 dark:text-blue-400 md:dark:bg-blue-400/10' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'}`}
              key={link.label}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1">
          <button
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={toggleTheme}
            type="button"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            aria-expanded={isMenuOpen}
            aria-label={
              isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

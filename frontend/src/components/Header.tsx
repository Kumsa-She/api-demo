import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
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

  return (
    <header className="border-b border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          className="text-xl font-bold text-gray-900 dark:text-slate-100"
          to="/"
        >
          API Demo
        </Link>

        <nav
          className={`${isMenuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-[73px] z-10 flex-col gap-4 border-b border-gray-200 bg-white px-4 py-4 md:static md:flex md:flex-row md:items-center md:border-0 md:bg-transparent md:p-0 dark:border-slate-800 dark:bg-slate-900 md:dark:bg-transparent`}
        >
          {navLinks.map((link) => (
            <Link
              className="text-sm text-gray-700 hover:text-gray-900 dark:text-slate-300 dark:hover:text-slate-100"
              key={link.label}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
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
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
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

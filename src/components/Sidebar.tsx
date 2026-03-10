import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThemeContext } from '../hooks/ThemeContext';

interface SidebarProps {
  counts: Record<string, number>;
  completedCount: number;
  totalCount: number;
}

const navItems: { path: string; label: string; icon: string; desc: string }[] = [
  { path: '/', label: 'Study Plan', icon: '>>', desc: '15-week structured roadmap' },
  { path: '/all', label: 'All Questions', icon: '{}', desc: 'Browse the full question bank' },
  { path: '/algorithm', label: 'Algorithm', icon: 'fn', desc: 'Data structures & algorithms (LeetCode-style)' },
  { path: '/javascript', label: 'JavaScript', icon: 'JS', desc: 'Core language concepts & implementations' },
  { path: '/nodejs', label: 'Node.js', icon: 'NJ', desc: 'Runtime internals, streams & concurrency' },
  { path: '/react', label: 'React', icon: 'Rx', desc: 'Hooks, Fiber, patterns & performance' },
  { path: '/design-system', label: 'Design System', icon: 'DS', desc: 'Component APIs, theming & accessibility' },
  { path: '/design-patterns', label: 'Design Patterns', icon: 'DP', desc: 'OOP, SOLID & GoF patterns in JS' },
  { path: '/system-design', label: 'System Design', icon: 'SD', desc: 'Auth, payments, APIs & real-time systems' },
  { path: '/behavioral', label: 'Behavioral', icon: 'BQ', desc: 'STAR method, leadership & conflict stories' },
  { path: '/ai', label: 'AI', icon: 'AI', desc: 'Prompting, RAG, agents & LLM architecture' },
];

export function Sidebar({ counts, completedCount, totalCount }: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useThemeContext();
  const [open, setOpen] = useState(false);
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function getCount(path: string) {
    if (path === '/') return 15;
    if (path === '/all') return totalCount;
    const map: Record<string, string> = {
      '/algorithm': 'Algorithm',
      '/javascript': 'JavaScript',
      '/nodejs': 'Node.js',
      '/react': 'React',
      '/design-system': 'Design System',
      '/design-patterns': 'Design Patterns',
      '/system-design': 'System Design',
      '/behavioral': 'Behavioral',
      '/ai': 'AI',
    };
    return counts[map[path] || ''] || 0;
  }

  const sidebarContent = (
    <>
      {/* Logo + Theme Toggle */}
      <div className="flex items-center justify-between p-5 border-b border-border">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <h1 className="font-display text-lg font-bold tracking-tight text-text-primary">
            <span className="text-accent-cyan">&lt;</span>
            FE
            <span className="text-accent-cyan">/</span>
            Prep
            <span className="text-accent-cyan">&gt;</span>
          </h1>
          <p className="text-xs text-text-muted mt-1">Frontend Interview Training</p>
        </Link>
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all cursor-pointer"
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary font-medium">Progress</span>
          <span className="text-xs font-code text-accent-cyan">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-green rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[10px] text-text-muted mt-1 block">{progressPct}% complete</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            const count = getCount(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-cyan/10 text-accent-cyan'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-code font-bold shrink-0 ${
                    isActive
                      ? 'bg-accent-cyan/20 text-accent-cyan'
                      : 'bg-bg-tertiary text-text-muted'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium block truncate">{item.label}</span>
                  <span className={`text-[10px] block truncate ${isActive ? 'text-accent-cyan/50' : 'text-text-muted/70'}`}>{item.desc}</span>
                </div>
                <span
                  className={`text-xs font-code ${
                    isActive ? 'text-accent-cyan/70' : 'text-text-muted'
                  }`}
                >
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-bg-secondary border-b border-border flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 text-text-secondary hover:text-accent-cyan transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <h1 className="font-display text-sm font-bold tracking-tight text-text-primary">
          <span className="text-accent-cyan">&lt;</span>FE<span className="text-accent-cyan">/</span>Prep<span className="text-accent-cyan">&gt;</span>
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <span className="text-[10px] font-code text-accent-cyan">{completedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-bg-secondary flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary transition-colors cursor-pointer z-10"
          aria-label="Close menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-bg-secondary border-r border-border flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
}

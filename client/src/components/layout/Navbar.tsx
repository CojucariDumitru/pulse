import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { NAV_LINKS } from '../../lib/site';
import { useAuth } from '../../context/AuthContext';

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={clsx('font-display font-black uppercase tracking-[0.08em] text-bone', className)}
      style={{ fontStretch: '118%' }}
    >
      PULSE<span className="text-volt">.</span>
    </span>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, member } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  return (
    <header
      className={clsx(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b',
        scrolled
          ? 'bg-ink/85 backdrop-blur-md border-white/10 py-4'
          : 'bg-transparent border-transparent py-6',
      )}
    >
      <nav className="mx-auto max-w-[1600px] px-6 md:px-10 flex items-center justify-between">
        <Link to="/" aria-label="PULSE home">
          <Logo className="text-xl md:text-2xl" />
        </Link>

        {/* desktop */}
        <ul className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              {l.to.startsWith('/#') ? (
                <a href={l.to} className="label text-ash hover:text-bone transition-colors">
                  {l.label}
                </a>
              ) : (
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    clsx('label transition-colors', isActive ? 'text-volt' : 'text-ash hover:text-bone')
                  }
                >
                  {l.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="label text-bone border border-white/20 rounded-full px-6 py-3 hover:border-volt hover:text-volt transition-colors"
            >
              {member?.name.split(' ')[0]}
            </Link>
          ) : (
            <Link to="/schedule" className="label text-ink bg-volt rounded-full px-6 py-3 hover:shadow-volt transition-all">
              Book now
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-bone p-1"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-ink border-t border-white/10 overflow-hidden"
          >
            <ul className="flex flex-col px-6 py-6">
              {NAV_LINKS.map((l, i) => (
                <li key={l.to} className="border-b border-white/5 last:border-0">
                  {l.to.startsWith('/#') ? (
                    <a href={l.to} className="flex items-baseline gap-4 py-4">
                      <span className="font-mono text-[10px] text-ash">0{i + 1}</span>
                      <span className="display text-3xl">{l.label}</span>
                    </a>
                  ) : (
                    <Link to={l.to} className="flex items-baseline gap-4 py-4">
                      <span className="font-mono text-[10px] text-ash">0{i + 1}</span>
                      <span className="display text-3xl">{l.label}</span>
                    </Link>
                  )}
                </li>
              ))}
              <li className="pt-6">
                <Link to={isAuthenticated ? '/dashboard' : '/login'} className="btn-volt w-full">
                  {isAuthenticated ? 'My dashboard' : 'Sign in'}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

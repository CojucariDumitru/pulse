import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, User } from 'lucide-react';
import clsx from 'clsx';
import { NAV_LINKS } from '../../lib/site';
import { useAuth } from '../../context/AuthContext';

export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx('font-display font-extrabold tracking-[0.28em] text-bone', className)}>
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

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx('label transition-colors hover:text-volt', isActive ? 'text-volt' : 'text-ash');

  return (
    <header
      className={clsx(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-ink/90 backdrop-blur border-b border-steel py-3' : 'bg-transparent py-5',
      )}
    >
      <nav className="mx-auto max-w-7xl px-5 flex items-center justify-between">
        <Link to="/" aria-label="PULSE home">
          <Logo className="text-2xl md:text-3xl" />
        </Link>

        {/* desktop */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              {l.to.startsWith('/#') ? (
                <a href={l.to} className="label text-ash hover:text-volt transition-colors">
                  {l.label}
                </a>
              ) : (
                <NavLink to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              )}
            </li>
          ))}
          <li>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-volt/50 text-volt px-5 py-2 label hover:bg-volt hover:text-ink transition-colors"
              >
                <User size={14} /> {member?.name.split(' ')[0]}
              </Link>
            ) : (
              <Link to="/login" className="btn-volt !px-5 !py-2 !text-xs">
                Sign in
              </Link>
            )}
          </li>
        </ul>

        <button
          className="md:hidden text-bone p-1"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden bg-ink border-t border-steel overflow-hidden"
          >
            <ul className="flex flex-col px-5 py-4">
              {NAV_LINKS.map((l) => (
                <li key={l.to} className="border-b border-steel/50 last:border-0">
                  {l.to.startsWith('/#') ? (
                    <a href={l.to} className="block py-4 font-display font-bold text-2xl text-bone">
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.to} className="block py-4 font-display font-bold text-2xl text-bone">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
              <li className="pt-4">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/login'}
                  className="btn-volt w-full"
                >
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

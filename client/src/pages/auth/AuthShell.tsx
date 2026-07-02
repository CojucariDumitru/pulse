import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/layout/Navbar';

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-ink bg-grid flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <Logo className="text-4xl" />
        </Link>
        <div className="card p-8">
          <h1 className="font-display font-extrabold text-3xl">{title}</h1>
          <p className="text-ash text-sm mt-1 mb-6">{sub}</p>
          {children}
        </div>
        <Link to="/" className="block text-center mt-6 label text-ash hover:text-volt transition-colors">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}

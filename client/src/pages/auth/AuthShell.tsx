import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../../components/layout/Navbar';

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-grid flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center mb-10">
          <Logo className="text-3xl" />
        </Link>
        <div className="card p-9">
          <h1 className="display text-3xl">{title}</h1>
          <p className="text-ash text-sm mt-2 mb-7">{sub}</p>
          {children}
        </div>
        <Link to="/" className="block text-center mt-6 label text-ash hover:text-volt transition-colors">
          ← Back to site
        </Link>
      </div>
    </div>
  );
}

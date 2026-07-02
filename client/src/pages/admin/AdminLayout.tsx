import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Users, MessageSquare, LogOut, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/layout/Navbar';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/members', label: 'Members', icon: Users, end: false },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare, end: false },
];

export default function AdminLayout() {
  const { adminLogout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink flex flex-col md:flex-row">
      <aside className="md:w-60 bg-coal border-b md:border-b-0 md:border-r border-steel flex md:flex-col">
        <div className="p-5 border-r md:border-r-0 md:border-b border-steel">
          <Link to="/">
            <Logo className="text-2xl" />
          </Link>
          <p className="label text-ash/50 mt-1 hidden md:block">Admin</p>
        </div>

        <nav className="flex md:flex-col flex-1 overflow-x-auto no-scrollbar">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-5 py-4 font-display font-bold whitespace-nowrap transition-colors',
                  isActive ? 'text-volt bg-volt/5 md:border-r-2 border-volt' : 'text-ash hover:text-bone',
                )
              }
            >
              <l.icon size={17} /> {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block p-4 border-t border-steel">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-2 py-2 label text-ash/60 hover:text-bone transition-colors">
            <ExternalLink size={13} /> View site
          </a>
          <button
            onClick={() => {
              adminLogout();
              navigate('/admin/login', { replace: true });
            }}
            className="flex items-center gap-2 px-2 py-2 label text-ash/60 hover:text-ember transition-colors w-full"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

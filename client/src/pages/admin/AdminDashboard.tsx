import { useQuery } from '@tanstack/react-query';
import { Users, CreditCard, CalendarDays, BookOpen, Hourglass, Mail } from 'lucide-react';
import { fetchAdminDashboard } from '../../api/endpoints';

function fmt(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(iso));
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: fetchAdminDashboard });

  const cards = [
    { label: 'Members', value: data?.stats.totalMembers, icon: Users },
    { label: 'Active memberships', value: data?.stats.activeMemberships, icon: CreditCard },
    { label: "Today's classes", value: data?.stats.todaysSessions, icon: CalendarDays },
    { label: 'Bookings (7d)', value: data?.stats.weekBookings, icon: BookOpen },
    { label: 'On waitlists', value: data?.stats.waitlistCount, icon: Hourglass },
    { label: 'Unread messages', value: data?.stats.unreadMessages, icon: Mail },
  ];

  return (
    <div>
      <h1 className="font-display font-extrabold text-4xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <c.icon size={20} className="text-volt" />
            <div className="font-display font-extrabold text-4xl mt-4">
              {isLoading ? <span className="text-steel">—</span> : (c.value ?? 0)}
            </div>
            <p className="label text-ash/60 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display font-bold text-2xl mb-4">Upcoming classes</h2>
      <div className="card divide-y divide-steel/60">
        {isLoading && <div className="p-6 font-mono text-ash text-sm">Loading…</div>}
        {data?.upcoming.map((s) => (
          <div key={s.id} className="flex items-center gap-4 px-5 py-4">
            <span className="w-1 self-stretch rounded-full" style={{ backgroundColor: s.color }} />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold">{s.className}</p>
              <p className="font-mono text-xs text-ash mt-0.5">
                {fmt(s.startsAt)} · {s.instructor}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">
                <span className={s.booked >= s.capacity ? 'text-ember' : 'text-volt'}>{s.booked}</span>
                <span className="text-ash">/{s.capacity}</span>
              </p>
              {s.waitlist > 0 && <p className="font-mono text-[10px] text-ember">+{s.waitlist} waitlist</p>}
            </div>
          </div>
        ))}
        {data && data.upcoming.length === 0 && (
          <div className="p-6 font-mono text-ash text-sm">No upcoming classes.</div>
        )}
      </div>
    </div>
  );
}

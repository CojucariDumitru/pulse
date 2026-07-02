import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, CreditCard, X, Hourglass, ArrowRight } from 'lucide-react';
import { fetchMyBookings, cancelBooking, openPortal, demoCancelMembership, fetchPlans } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';

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

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'text-volt border-volt/50 bg-volt/10',
  TRIALING: 'text-volt border-volt/50 bg-volt/10',
  PAST_DUE: 'text-ember border-ember/50 bg-ember/10',
  CANCELED: 'text-ash border-steel bg-ink',
  INACTIVE: 'text-ash border-steel bg-ink',
};

export default function Dashboard() {
  const { member, refresh, logout } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: fetchMyBookings,
  });
  const { data: plansData } = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });

  const cancel = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      qc.invalidateQueries({ queryKey: ['schedule'] });
      toast('Booking cancelled.', 'info');
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const portal = useMutation({
    mutationFn: openPortal,
    onSuccess: (r) => {
      window.location.href = r.url;
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const demoCancel = useMutation({
    mutationFn: demoCancelMembership,
    onSuccess: async () => {
      await refresh();
      toast('Membership cancelled (demo).', 'info');
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const m = member?.membership;
  const active = m && ['ACTIVE', 'TRIALING'].includes(m.status);
  const stripeMode = plansData?.stripeConfigured ?? false;

  return (
    <div className="pt-28 pb-24 min-h-screen bg-ink bg-grid">
      <div className="mx-auto max-w-4xl px-5">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
          <div>
            <p className="label text-volt mb-2">Member dashboard</p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl">
              Hey, {member?.name.split(' ')[0]}.
            </h1>
          </div>
          <button onClick={logout} className="label text-ash hover:text-ember transition-colors">
            Sign out
          </button>
        </div>

        {/* membership card */}
        <div className="card p-6 md:p-8 mb-8 flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <CreditCard className="text-volt" size={26} />
            <div>
              <p className="label text-ash/60 mb-1">Membership</p>
              {m ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-display font-extrabold text-2xl">{m.plan}</span>
                  <span className={`font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${STATUS_STYLE[m.status]}`}>
                    {m.status}
                  </span>
                  {m.currentPeriodEnd && (
                    <span className="font-mono text-xs text-ash">
                      renews {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(m.currentPeriodEnd))}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-ash">No membership yet</span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {active ? (
              stripeMode ? (
                <button onClick={() => portal.mutate()} disabled={portal.isPending} className="btn-ghost !px-5 !py-2.5 !text-xs">
                  Manage billing
                </button>
              ) : (
                <button onClick={() => demoCancel.mutate()} disabled={demoCancel.isPending} className="btn-ghost !px-5 !py-2.5 !text-xs">
                  Cancel (demo)
                </button>
              )
            ) : (
              <Link to="/pricing" className="btn-volt !px-5 !py-2.5 !text-xs">
                Choose a plan <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* upcoming bookings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-2xl flex items-center gap-2">
              <CalendarCheck size={20} className="text-volt" /> Upcoming classes
            </h2>
            <Link to="/schedule" className="label text-ash hover:text-volt transition-colors">
              Book more →
            </Link>
          </div>

          {isLoading && <div className="card h-24 animate-pulse" />}

          {!isLoading && (bookings?.upcoming.length ?? 0) === 0 && (
            <div className="card p-8 text-center">
              <p className="text-ash mb-4">Nothing booked yet. The schedule's waiting.</p>
              <Link to="/schedule" className="btn-volt !px-6 !py-2.5 !text-xs">
                Browse classes
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {bookings?.upcoming.map((b) => (
              <div key={b.id} className="card p-4 flex items-center gap-4">
                <span className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: b.session.classType.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-lg">{b.session.classType.name}</span>
                    {b.status === 'WAITLIST' && (
                      <span className="font-mono text-[10px] uppercase text-ember flex items-center gap-1">
                        <Hourglass size={10} /> waitlist
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-ash mt-1">
                    {fmt(b.session.startsAt)} · w/ {b.session.instructor.name}
                    {b.session.room ? ` · ${b.session.room}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => cancel.mutate(b.session.id)}
                  disabled={cancel.isPending}
                  className="p-2 rounded-full border border-steel text-ash hover:border-ember hover:text-ember transition-colors"
                  title="Cancel booking"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* past */}
        {(bookings?.past.length ?? 0) > 0 && (
          <div>
            <h2 className="font-display font-bold text-xl text-ash mb-4">History</h2>
            <div className="space-y-2">
              {bookings?.past.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-coal/50 border border-steel/50">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.session.classType.color }} />
                  <span className="text-sm text-ash flex-1">{b.session.classType.name}</span>
                  <span className="font-mono text-[11px] text-ash/60">{fmt(b.session.startsAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

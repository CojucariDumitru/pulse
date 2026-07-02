import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Check, Hourglass, X } from 'lucide-react';
import { fetchSchedule, bookSession, cancelBooking } from '../api/endpoints';
import { getErrorMessage, isMembershipRequired } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { INTENSITY_LABEL, type ScheduleSession } from '../lib/types';

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function fmtDay(key: string): { dow: string; date: string } {
  const d = new Date(`${key}T12:00:00Z`);
  return {
    dow: new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(d),
    date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(d),
  };
}

function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(iso));
}

function SessionCard({ s }: { s: ScheduleSession }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const invalidate = () => qc.invalidateQueries({ queryKey: ['schedule'] });

  const book = useMutation({
    mutationFn: () => bookSession(s.id),
    onSuccess: (r) => {
      invalidate();
      toast(
        r.waitlisted ? 'Class is full — you joined the waitlist.' : `Booked ${s.classType.name}. See you there!`,
        r.waitlisted ? 'info' : 'success',
      );
    },
    onError: (err) => {
      if (isMembershipRequired(err)) {
        toast('You need an active membership to book. Pick a plan first.', 'info');
        navigate('/pricing');
        return;
      }
      toast(getErrorMessage(err), 'error');
    },
  });

  const cancel = useMutation({
    mutationFn: () => cancelBooking(s.id),
    onSuccess: () => {
      invalidate();
      toast('Booking cancelled.', 'info');
    },
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  const full = s.spotsLeft === 0;
  const mine = s.myStatus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35 }}
      className={`card p-4 flex items-center gap-4 ${mine ? 'border-volt/60' : 'hover:border-ash/40'} transition-colors`}
    >
      {/* time */}
      <div className="w-16 text-center shrink-0">
        <div className="font-display font-extrabold text-xl">{fmtTime(s.startsAt)}</div>
        <div className="font-mono text-[10px] text-ash">{s.durationMin} min</div>
      </div>

      <span className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: s.classType.color }} />

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display font-bold text-lg leading-none">{s.classType.name}</h3>
          <span className="font-mono text-[10px] uppercase tracking-wider text-ash">
            {INTENSITY_LABEL[s.classType.intensity]}
          </span>
        </div>
        <p className="font-mono text-xs text-ash mt-1.5 flex items-center gap-3 flex-wrap">
          <span>w/ {s.instructor.name}</span>
          {s.room && (
            <span className="flex items-center gap-1">
              <MapPin size={10} /> {s.room}
            </span>
          )}
          <span className={`flex items-center gap-1 ${full ? 'text-ember' : 'text-volt'}`}>
            <Users size={10} />
            {full ? `Full · ${s.waitlist} waiting` : `${s.spotsLeft} spots left`}
          </span>
        </p>
      </div>

      {/* action */}
      <div className="shrink-0">
        {mine ? (
          <button
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
            className="group flex items-center gap-2 rounded-full border border-volt/60 text-volt px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-ember hover:text-ember transition-colors"
            title="Cancel booking"
          >
            <span className="group-hover:hidden flex items-center gap-1.5">
              {mine === 'WAITLIST' ? <Hourglass size={13} /> : <Check size={13} />}
              {mine === 'WAITLIST' ? 'Waitlisted' : 'Booked'}
            </span>
            <span className="hidden group-hover:flex items-center gap-1.5">
              <X size={13} /> Cancel
            </span>
          </button>
        ) : isAuthenticated ? (
          <button
            onClick={() => book.mutate()}
            disabled={book.isPending}
            className={`rounded-full px-5 py-2 font-mono text-xs uppercase tracking-wider transition-all ${
              full
                ? 'border border-steel text-ash hover:border-ember hover:text-ember'
                : 'bg-volt text-ink hover:shadow-volt-sm'
            } disabled:opacity-50`}
          >
            {book.isPending ? '...' : full ? 'Join waitlist' : 'Book'}
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-full border border-steel text-ash px-5 py-2 font-mono text-xs uppercase tracking-wider hover:border-volt hover:text-volt transition-colors"
          >
            Sign in to book
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function Schedule() {
  const { data, isLoading } = useQuery({
    queryKey: ['schedule'],
    queryFn: () => fetchSchedule({ days: 7 }),
  });

  const days = useMemo(() => {
    const map = new Map<string, ScheduleSession[]>();
    (data ?? []).forEach((s) => {
      const key = dayKey(s.startsAt);
      map.set(key, [...(map.get(key) ?? []), s]);
    });
    return Array.from(map.entries());
  }, [data]);

  const [active, setActive] = useState(0);
  const activeDay = days[Math.min(active, Math.max(days.length - 1, 0))];

  return (
    <div className="pt-28 pb-24 min-h-screen bg-ink bg-grid">
      <div className="mx-auto max-w-4xl px-5">
        <p className="label text-volt mb-3 flex items-center gap-2">
          <Clock size={13} /> Next 7 days
        </p>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl mb-10">The schedule.</h1>

        {/* day tabs */}
        {days.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 -mx-5 px-5">
            {days.map(([key], i) => {
              const { dow, date } = fmtDay(key);
              return (
                <button
                  key={key}
                  onClick={() => setActive(i)}
                  className={`shrink-0 rounded-2xl border px-5 py-3 text-center transition-colors ${
                    i === active ? 'border-volt bg-volt/10 text-volt' : 'border-steel text-ash hover:text-bone'
                  }`}
                >
                  <div className="font-display font-bold text-lg leading-none">{dow}</div>
                  <div className="font-mono text-[10px] mt-1">{date}</div>
                </button>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-20 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && days.length === 0 && (
          <p className="font-mono text-ash">No upcoming classes scheduled. Check back soon.</p>
        )}

        {activeDay && (
          <div className="space-y-3">
            {activeDay[1].map((s) => (
              <SessionCard key={s.id} s={s} />
            ))}
          </div>
        )}

        <div className="card mt-10 p-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-ash text-sm">
            Booking requires an active membership. Plans start at <span className="text-volt">$49/mo</span>.
          </p>
          <Link to="/pricing" className="btn-volt !px-5 !py-2.5 !text-xs">
            See memberships
          </Link>
        </div>
      </div>
    </div>
  );
}

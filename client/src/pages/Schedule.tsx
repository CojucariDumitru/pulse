import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Hourglass, X, ArrowUpRight } from 'lucide-react';
import { fetchSchedule, bookSession, cancelBooking } from '../api/endpoints';
import { getErrorMessage, isMembershipRequired } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { ScheduleSession } from '../lib/types';

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

function SessionRow({ s, index }: { s: ScheduleSession; index: number }) {
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group grid grid-cols-[64px_1fr_auto] md:grid-cols-[90px_1fr_220px_140px] items-center gap-4 md:gap-8 py-6 md:py-7 border-b hairline"
    >
      {/* time */}
      <div>
        <div className="font-mono font-bold text-lg md:text-xl">{fmtTime(s.startsAt)}</div>
        <div className="font-mono text-[10px] text-ash mt-0.5">{s.durationMin} MIN</div>
      </div>

      {/* class */}
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.classType.color }} />
          <h3 className="display text-2xl md:text-4xl truncate">{s.classType.name}</h3>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-ash mt-1.5 truncate">
          w/ {s.instructor.name}
          {s.room ? ` · ${s.room}` : ''}
        </p>
      </div>

      {/* capacity (desktop) */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between mb-2">
          <span className={`font-mono text-[11px] uppercase tracking-[0.15em] ${full ? 'text-ember' : 'text-ash'}`}>
            {full ? `Full — ${s.waitlist} waiting` : `${s.spotsLeft} / ${s.capacity} open`}
          </span>
        </div>
        <div className="h-px bg-white/10 relative">
          <div
            className={`absolute inset-y-0 left-0 ${full ? 'bg-ember' : 'bg-volt'}`}
            style={{ width: `${Math.min(100, (s.booked / s.capacity) * 100)}%`, height: '2px', top: '-0.5px' }}
          />
        </div>
      </div>

      {/* action */}
      <div className="justify-self-end">
        {mine ? (
          <button
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
            className="group/b inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-volt border border-volt/50 px-5 py-3 hover:border-ember hover:text-ember transition-colors"
          >
            <span className="group-hover/b:hidden inline-flex items-center gap-2">
              {mine === 'WAITLIST' ? <Hourglass size={12} /> : <Check size={12} />}
              {mine === 'WAITLIST' ? 'Listed' : 'Booked'}
            </span>
            <span className="hidden group-hover/b:inline-flex items-center gap-2">
              <X size={12} /> Cancel
            </span>
          </button>
        ) : isAuthenticated ? (
          <button
            onClick={() => book.mutate()}
            disabled={book.isPending}
            className={`font-mono text-[11px] uppercase tracking-[0.18em] px-6 py-3 transition-all disabled:opacity-40 ${
              full
                ? 'border border-white/20 text-ash hover:border-ember hover:text-ember'
                : 'bg-volt text-ink hover:shadow-volt-sm'
            }`}
          >
            {book.isPending ? '···' : full ? 'Waitlist' : 'Book'}
          </button>
        ) : (
          <Link
            to="/login"
            className="font-mono text-[11px] uppercase tracking-[0.18em] border border-white/20 text-ash px-5 py-3 hover:border-volt hover:text-volt transition-colors whitespace-nowrap"
          >
            Sign in
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
    <div className="pt-32 pb-28 min-h-screen">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10">
        <p className="label text-volt mb-5">Next 7 days</p>
        <h1 className="display text-6xl md:text-[9vw] lg:text-8xl mb-14">
          The
          <br className="md:hidden" /> schedule<span className="text-volt">.</span>
        </h1>

        {/* day tabs — underline style */}
        {days.length > 0 && (
          <div className="flex gap-8 overflow-x-auto no-scrollbar border-b hairline mb-2 -mx-6 px-6 md:mx-0 md:px-0">
            {days.map(([key], i) => {
              const { dow, date } = fmtDay(key);
              const isActive = i === active;
              return (
                <button
                  key={key}
                  onClick={() => setActive(i)}
                  className={`relative shrink-0 pb-4 text-left transition-colors ${
                    isActive ? 'text-bone' : 'text-ash hover:text-bone/80'
                  }`}
                >
                  <span className="display text-xl md:text-2xl block">{dow}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{date}</span>
                  {isActive && <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-volt" />}
                </button>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="space-y-px mt-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && days.length === 0 && (
          <p className="font-mono text-ash mt-10">No upcoming classes scheduled. Check back soon.</p>
        )}

        {activeDay && (
          <div>
            {activeDay[1].map((s, i) => (
              <SessionRow key={s.id} s={s} index={i} />
            ))}
          </div>
        )}

        <div className="mt-14 flex flex-wrap items-center justify-between gap-5 border hairline p-7">
          <p className="text-ash text-sm max-w-md">
            Booking requires an active membership — plans from{' '}
            <span className="text-bone">$49/mo</span>. Every format included.
          </p>
          <Link to="/pricing" className="label text-volt hover:text-bone transition-colors inline-flex items-center gap-2">
            See memberships <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

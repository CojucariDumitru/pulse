import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { fetchClasses, fetchSchedule, fetchPlans } from '../api/endpoints';
import { Img } from '../components/ui/Img';
import { img, cld } from '../lib/img';
import { SITE, MAPS_EMBED, MAPS_DIRECTIONS } from '../lib/site';
import type { ClassType } from '../lib/types';

/* ─────────────────────────── hero ─────────────────────────── */

const reveal = {
  hidden: { y: '110%' },
  show: (i: number) => ({
    y: 0,
    transition: { delay: 0.15 + i * 0.11, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function HeroLine({ children, i }: { children: React.ReactNode; i: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span initial="hidden" animate="show" custom={i} variants={reveal} className="block">
        {children}
      </motion.span>
    </span>
  );
}

function NextClassChip() {
  const { data } = useQuery({ queryKey: ['schedule'], queryFn: () => fetchSchedule({ days: 2 }) });
  const next = data?.find((s) => new Date(s.startsAt) > new Date());
  if (!next) return null;

  const time = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).format(new Date(next.startsAt));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1, duration: 0.7 }}
    >
      <Link
        to="/schedule"
        className="group inline-flex items-center gap-4 border border-white/15 bg-ink/60 backdrop-blur-md pl-5 pr-4 py-3.5 hover:border-volt/60 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse-dot" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bone/90">
          Next class — {next.classType.name} · {time} · {next.spotsLeft} spots
        </span>
        <ArrowUpRight size={14} className="text-ash group-hover:text-volt transition-colors" />
      </Link>
    </motion.div>
  );
}

const TICKER = ['SPIN', 'HIIT', 'STRENGTH', 'YOGA FLOW', 'NO EGO', 'ALL OUTPUT', 'SOHO NYC'];

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      {/* full-bleed image */}
      <div className="absolute inset-0">
        <Img
          src={cld('class-spin', 'c_fill,g_auto,w_2000,h_1300')}
          alt="Rhythm spin at PULSE"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-transparent" />
      </div>

      {/* top-right vertical meta */}
      <div className="absolute top-28 right-6 md:right-10 hidden lg:flex flex-col items-end gap-1.5 z-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50">Est. 2024</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/50">40.723° N / 74.001° W</p>
      </div>

      {/* content — bottom-left editorial */}
      <div className="relative z-10 mx-auto max-w-[1600px] w-full px-6 md:px-10 pb-24 pt-40">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="label text-volt mb-6"
        >
          Boutique training — SoHo, New York
        </motion.p>

        <h1 className="display text-[16vw] md:text-[11.5vw] lg:text-[10vw] max-w-[12ch]">
          <HeroLine i={0}>Find</HeroLine>
          <HeroLine i={1}>your</HeroLine>
          <HeroLine i={2}>
            <span className="text-volt">rhythm.</span>
          </HeroLine>
        </h1>

        <div className="mt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.7 }}
            className="text-bone/70 text-base md:text-lg max-w-sm leading-relaxed"
          >
            Rhythm spin, HIIT, coached strength and yoga flow — 45 minutes at a time, in a room
            that hits like a club.
          </motion.p>
          <NextClassChip />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link to="/schedule" className="btn-volt">
            Book a class
          </Link>
          <Link to="/program" className="btn-line">
            Free 12-week program
          </Link>
        </motion.div>
      </div>

      {/* ticker */}
      <div className="relative z-10 border-t border-white/10 bg-ink/70 backdrop-blur-sm py-4 overflow-hidden pause-hover">
        <div className="flex w-max animate-marquee">
          {[...TICKER, ...TICKER, ...TICKER].map((w, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-bone/50">{w}</span>
              <span className="mx-8 w-1 h-1 rounded-full bg-volt/70 inline-block" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── manifesto ─────────────────────── */

function Manifesto() {
  return (
    <section className="py-28 md:py-40 border-b hairline">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 grid lg:grid-cols-12 gap-10">
        <p className="label text-ash lg:col-span-3">The idea</p>
        <p
          className="font-display font-bold text-3xl md:text-5xl lg:col-span-9 max-w-4xl leading-[1.08] tracking-tight"
          style={{ fontStretch: '105%' }}
        >
          Forty-five minutes. Zero filler. Coaches who actually coach, music that actually moves
          you, and a room where <span className="text-volt">effort is the only flex.</span>
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────── classes — editorial rows ─────────────────────── */

function ClassRow({ ct, index }: { ct: ClassType; index: number }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to="/schedule"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative block border-b hairline"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-10 md:py-14 flex items-center gap-6 md:gap-12">
        <span className="font-mono text-xs text-ash w-8 shrink-0">0{index + 1}</span>

        <h3 className="display text-4xl md:text-7xl flex-1 transition-colors duration-300 group-hover:text-volt">
          {ct.name}
        </h3>

        <div className="hidden md:flex flex-col items-end gap-1 shrink-0 text-right">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
            {ct.intensity.replace('_', ' ')}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ash">
            {ct.durationMin} min
          </span>
        </div>

        <ArrowRight
          size={28}
          className="shrink-0 text-ash transition-all duration-300 group-hover:text-volt group-hover:translate-x-2"
        />
      </div>

      {/* floating image reveal (desktop) */}
      <motion.div
        className="hidden lg:block absolute right-[16%] top-1/2 z-10 pointer-events-none"
        initial={false}
        animate={
          hover
            ? { opacity: 1, y: '-50%', rotate: -3, scale: 1 }
            : { opacity: 0, y: '-42%', rotate: 0, scale: 0.92 }
        }
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Img
          src={ct.image}
          alt={ct.name}
          fallbackLabel={ct.name}
          className="w-72 h-48 object-cover shadow-lift"
        />
      </motion.div>
    </Link>
  );
}

function Classes() {
  const { data } = useQuery({ queryKey: ['classes'], queryFn: fetchClasses });
  const classTypes = data?.classTypes ?? [];

  return (
    <section id="classes" className="scroll-mt-20">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-24 md:pt-32">
        <div className="section-head">
          <div className="flex items-baseline gap-6">
            <span className="font-mono text-xs text-volt">01</span>
            <h2 className="display text-4xl md:text-6xl">The lineup</h2>
          </div>
          <Link to="/schedule" className="label text-ash hover:text-volt transition-colors hidden sm:inline-flex items-center gap-2">
            Full schedule <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>

      <div className="border-t hairline">
        {classTypes.map((ct, i) => (
          <ClassRow key={ct.id} ct={ct} index={i} />
        ))}
        {classTypes.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-b hairline">
              <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-14">
                <div className="h-12 w-64 bg-white/5 animate-pulse" />
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

/* ─────────────────────── stats band ─────────────────────── */

const STATS = [
  { value: '22', label: 'Classes / week' },
  { value: '45', label: 'Minutes / session' },
  { value: '04', label: 'Formats' },
  { value: '16', label: 'Max riders / room' },
];

function Stats() {
  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 grid grid-cols-2 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            className={`py-14 md:py-20 px-2 ${i > 0 ? 'lg:border-l hairline' : ''} ${i % 2 === 1 ? 'border-l hairline lg:border-l' : ''}`}
          >
            <div className="display text-6xl md:text-8xl">
              {s.value}
              <span className="text-volt">.</span>
            </div>
            <p className="label text-ash mt-4">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────── program CTA ─────────────────────── */

function ProgramCTA() {
  return (
    <section className="relative overflow-hidden border-b hairline">
      <div className="absolute inset-0">
        <Img
          src={img.wide('program-bg')}
          alt=""
          className="w-full h-full object-cover opacity-20 img-duo"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-10 py-28 md:py-40 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="label text-volt mb-6">02 — The engine</p>
          <h2 className="display text-5xl md:text-7xl">
            Your next
            <br />
            12 weeks,
            <br />
            <span className="text-outline">engineered.</span>
          </h2>
          <p className="mt-8 text-bone/60 text-lg max-w-md leading-relaxed">
            Your stats in — a periodized 3-month plan out. Calories, macros, splits, progression,
            deloads. An AI coach signs off on every brief. Free, 60 seconds.
          </p>
          <Link to="/program" className="btn-volt mt-10">
            Generate my program
          </Link>
        </div>

        {/* receipt mock */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="justify-self-center lg:justify-self-end w-full max-w-sm"
        >
          <div className="bg-coal border hairline p-8 font-mono text-sm shadow-lift rotate-1">
            <div className="flex justify-between items-baseline pb-4 border-b hairline">
              <span className="font-bold tracking-[0.2em]">PULSE//ENGINE</span>
              <span className="text-[10px] text-ash">v2.0</span>
            </div>
            {[
              ['INPUT', 'M · 28Y · 180CM · 84KG'],
              ['GOAL', 'BUILD MUSCLE'],
              ['SPLIT', 'UPPER / LOWER — 4D'],
              ['TDEE', '2,837 KCAL'],
              ['TARGET', '3,120 KCAL (+10%)'],
              ['PROTEIN', '168G / DAY'],
              ['PHASES', 'BASE → BUILD → PEAK'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5 border-b border-white/5 text-[12px]">
                <span className="text-ash">{k}</span>
                <span className="text-bone text-right">{v}</span>
              </div>
            ))}
            <div className="flex justify-between pt-4 text-[12px]">
              <span className="text-ash">STATUS</span>
              <span className="text-volt">✓ READY IN 60s</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────── coaches — staggered ─────────────────────── */

function Coaches() {
  const { data } = useQuery({ queryKey: ['classes'], queryFn: fetchClasses });
  const instructors = data?.instructors ?? [];

  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
        <div className="section-head">
          <div className="flex items-baseline gap-6">
            <span className="font-mono text-xs text-volt">03</span>
            <h2 className="display text-4xl md:text-6xl">The coaches</h2>
          </div>
          <p className="label text-ash hidden md:block">Loud music. Louder standards.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 md:gap-10">
          {instructors.map((coach, i) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.7 }}
              className={`group ${i === 1 ? 'sm:mt-16' : ''}`}
            >
              <div className="relative overflow-hidden">
                <Img
                  src={coach.image}
                  alt={coach.name}
                  fallbackLabel={coach.name}
                  className="w-full aspect-[3/4] object-cover img-duo transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <span className="absolute top-4 left-4 font-mono text-[10px] text-bone/70 tracking-[0.25em]">
                  0{i + 1}
                </span>
              </div>
              <div className="pt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="display text-2xl md:text-3xl">{coach.name}</h3>
                  <p className="label text-volt mt-2">{coach.specialties.join(' / ')}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ash leading-relaxed max-w-xs">{coach.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── pricing — hairline list ─────────────────────── */

function Pricing() {
  const { data } = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });
  const plans = data?.plans ?? [];

  return (
    <section className="border-b hairline">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 py-24 md:py-32">
        <div className="section-head">
          <div className="flex items-baseline gap-6">
            <span className="font-mono text-xs text-volt">04</span>
            <h2 className="display text-4xl md:text-6xl">Memberships</h2>
          </div>
          <Link to="/pricing" className="label text-ash hover:text-volt transition-colors hidden sm:inline-flex items-center gap-2">
            Compare plans <ArrowUpRight size={13} />
          </Link>
        </div>

        <div>
          {plans.map((p) => (
            <Link
              key={p.id}
              to="/pricing"
              className="group flex items-baseline justify-between gap-6 py-8 md:py-10 border-b hairline last:border-0 hover:pl-3 transition-all duration-300"
            >
              <div className="flex items-baseline gap-5 min-w-0">
                <h3 className="display text-3xl md:text-5xl group-hover:text-volt transition-colors">
                  {p.name}
                </h3>
                {p.featured && (
                  <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.2em] text-ink bg-volt px-2.5 py-1">
                    Popular
                  </span>
                )}
              </div>
              <p className="hidden md:block font-mono text-xs text-ash max-w-[260px] truncate">
                {p.tagline}
              </p>
              <div className="shrink-0 text-right">
                <span className="display text-3xl md:text-5xl">${p.price}</span>
                <span className="font-mono text-[11px] text-ash ml-1">{p.cadence}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── location ─────────────────────── */

function Location() {
  return (
    <section className="relative h-[80vh] min-h-[560px]">
      <iframe
        title="PULSE studio location"
        src={MAPS_EMBED}
        className="absolute inset-0 w-full h-full grayscale invert-[0.92] contrast-[0.9] opacity-70"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-ink/60 to-transparent h-40" />

      <div className="absolute left-6 md:left-10 bottom-8 md:bottom-12 bg-ink border hairline p-8 md:p-10 max-w-md shadow-lift">
        <p className="label text-volt mb-5">05 — The studio</p>
        <h2 className="display text-4xl md:text-5xl mb-6">
          Middle of
          <br />
          SoHo.
        </h2>
        <div className="space-y-3 font-mono text-xs uppercase tracking-[0.15em] text-bone/80">
          <p>{SITE.address.full}</p>
          {SITE.hours.map((h) => (
            <p key={h.days} className="flex justify-between gap-6">
              <span className="text-ash">{h.days}</span>
              <span>{h.time}</span>
            </p>
          ))}
        </div>
        <a
          href={MAPS_DIRECTIONS}
          target="_blank"
          rel="noreferrer"
          className="btn-line mt-8 !px-6 !py-3"
        >
          Get directions <ArrowUpRight size={13} />
        </a>
      </div>
    </section>
  );
}

/* ─────────────────────── page ─────────────────────── */

export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Classes />
      <Stats />
      <ProgramCTA />
      <Coaches />
      <Pricing />
      <Location />
    </>
  );
}

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Clock, MapPin, Phone, Dumbbell, Sparkles } from 'lucide-react';
import { fetchClasses, fetchPlans } from '../api/endpoints';
import { Img } from '../components/ui/Img';
import { img } from '../lib/img';
import { SITE, MAPS_EMBED, MAPS_DIRECTIONS } from '../lib/site';
import { INTENSITY_LABEL } from '../lib/types';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.55, ease: [0.2, 0.65, 0.3, 0.9] as const },
  }),
};

const MARQUEE = ['SPIN', 'HIIT', 'STRENGTH', 'YOGA FLOW', 'NO EGO', 'ALL OUTPUT'];

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-grid">
      {/* volt ambient glow */}
      <div className="absolute -top-32 right-[-15%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,rgba(204,255,0,0.12)_0%,transparent_65%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center w-full">
        <div>
          <motion.p initial="hidden" animate="show" custom={0} variants={fadeUp} className="label text-volt mb-5 flex items-center gap-2">
            <Zap size={14} /> Boutique studio · SoHo NYC
          </motion.p>
          <h1 className="font-display font-extrabold leading-[0.95] text-6xl sm:text-7xl lg:text-8xl">
            {['FIND', 'YOUR'].map((w, i) => (
              <motion.span key={w} initial="hidden" animate="show" custom={i + 1} variants={fadeUp} className="block">
                {w}
              </motion.span>
            ))}
            <motion.span initial="hidden" animate="show" custom={3} variants={fadeUp} className="block text-volt glow-volt">
              RHYTHM.
            </motion.span>
          </h1>
          <motion.p initial="hidden" animate="show" custom={4} variants={fadeUp} className="mt-6 text-ash text-lg max-w-md leading-relaxed">
            Rhythm spin, HIIT, coached strength and yoga flow — 45 minutes at a time, in a room
            that feels more like a club than a gym.
          </motion.p>
          <motion.div initial="hidden" animate="show" custom={5} variants={fadeUp} className="mt-9 flex flex-wrap gap-4">
            <Link to="/schedule" className="btn-volt">
              Book a class <ArrowRight size={17} />
            </Link>
            <Link to="/program" className="btn-ghost">
              <Sparkles size={16} /> Free 12-week program
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="relative hidden lg:block"
        >
          <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle,rgba(204,255,0,0.25)_0%,transparent_70%)] blur-2xl" />
          <div className="relative animate-floaty">
            <Img
              src={img.square('hero', 900)}
              alt="Training at PULSE"
              className="w-full aspect-square rounded-[2rem] border border-steel shadow-lift"
            />
            <div className="absolute -bottom-4 -left-4 card px-5 py-3 flex items-center gap-3 shadow-lift">
              <span className="w-2.5 h-2.5 rounded-full bg-volt animate-pulse" />
              <span className="font-mono text-xs text-bone">22 classes this week</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* marquee */}
      <div className="absolute bottom-0 inset-x-0 border-t border-steel bg-ink/80 backdrop-blur py-3 overflow-hidden pause-hover">
        <div className="flex w-max animate-marquee">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((w, i) => (
            <span key={i} className="flex items-center whitespace-nowrap font-display font-bold text-lg tracking-[0.2em] text-ash/70">
              {w}
              <span className="mx-6 text-volt">⚡</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Classes() {
  const { data } = useQuery({ queryKey: ['classes'], queryFn: fetchClasses });
  const classTypes = data?.classTypes ?? [];

  return (
    <section id="classes" className="scroll-mt-24 py-24 bg-ink">
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="label text-volt mb-3">The lineup</p>
            <h2 className="font-display font-extrabold text-5xl md:text-6xl">Four ways to move.</h2>
          </div>
          <Link to="/schedule" className="label text-ash hover:text-volt transition-colors flex items-center gap-2">
            Full schedule <ArrowRight size={14} />
          </Link>
        </div>

        {classTypes.length === 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-96 animate-pulse" />
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {classTypes.map((ct, i) => {
            return (
              <motion.div
                key={ct.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group card overflow-hidden hover:border-volt/50 transition-colors"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Img
                    src={ct.image}
                    alt={ct.name}
                    fallbackLabel={ct.name}
                    className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  <span
                    className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full text-ink"
                    style={{ backgroundColor: ct.color }}
                  >
                    {INTENSITY_LABEL[ct.intensity]}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display font-bold text-2xl">{ct.name}</h3>
                    <span className="font-mono text-xs text-ash flex items-center gap-1">
                      <Clock size={11} /> {ct.durationMin}m
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-ash leading-relaxed">{ct.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProgramCTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <Img src={img.wide('program-bg')} alt="" className="absolute inset-0 w-full h-full opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/40" />
      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <div className="max-w-2xl">
          <p className="label text-volt mb-3 flex items-center gap-2">
            <Sparkles size={14} /> AI-personalized · Free
          </p>
          <h2 className="font-display font-extrabold text-5xl md:text-6xl leading-tight">
            Your next 12 weeks, <span className="text-volt">engineered.</span>
          </h2>
          <p className="mt-5 text-ash text-lg leading-relaxed">
            Tell us your stats, goal and schedule. Our engine computes your calories and macros,
            builds a periodized 3-month training plan, and our AI coach adds notes written just
            for you. Takes 60 seconds.
          </p>
          <Link to="/program" className="btn-volt mt-8">
            <Dumbbell size={17} /> Generate my program
          </Link>
        </div>
      </div>
    </section>
  );
}

function Coaches() {
  const { data } = useQuery({ queryKey: ['classes'], queryFn: fetchClasses });
  const instructors = data?.instructors ?? [];

  return (
    <section className="py-24 bg-coal border-y border-steel">
      <div className="mx-auto max-w-7xl px-5">
        <p className="label text-volt mb-3">The coaches</p>
        <h2 className="font-display font-extrabold text-5xl md:text-6xl mb-12">
          Loud music. Louder standards.
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {instructors.map((coach, i) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group card overflow-hidden hover:border-volt/50 transition-colors"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <Img
                  src={coach.image}
                  alt={coach.name}
                  fallbackLabel={coach.name}
                  className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold text-2xl">{coach.name}</h3>
                <p className="font-mono text-[11px] uppercase tracking-wider text-volt mt-1">
                  {coach.specialties.join(' · ')}
                </p>
                <p className="mt-3 text-sm text-ash leading-relaxed">{coach.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  const { data } = useQuery({ queryKey: ['plans'], queryFn: fetchPlans });
  const plans = data?.plans ?? [];

  return (
    <section className="py-24 bg-ink bg-grid">
      <div className="mx-auto max-w-7xl px-5">
        <div className="text-center mb-12">
          <p className="label text-volt mb-3">Memberships</p>
          <h2 className="font-display font-extrabold text-5xl md:text-6xl">Pick your pace.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`card p-6 text-center ${p.featured ? 'border-volt shadow-volt-sm' : ''}`}
            >
              {p.featured && <p className="label text-volt mb-2">Most popular</p>}
              <h3 className="font-display font-bold text-xl">{p.name}</h3>
              <div className="mt-3">
                <span className="font-display font-extrabold text-5xl">${p.price}</span>
                <span className="text-ash font-mono text-xs">{p.cadence}</span>
              </div>
              <p className="text-ash text-sm mt-2">{p.tagline}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/pricing" className="btn-volt">
            Compare plans <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section className="py-24 bg-ink border-t border-steel">
      <div className="mx-auto max-w-7xl px-5 grid lg:grid-cols-2 gap-10 items-stretch">
        <div className="relative min-h-[320px] rounded-2xl overflow-hidden border border-steel">
          <iframe
            title="PULSE studio location"
            src={MAPS_EMBED}
            className="absolute inset-0 w-full h-full grayscale contrast-110"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="label text-volt mb-3">The studio</p>
          <h2 className="font-display font-extrabold text-5xl md:text-6xl mb-8">Middle of SoHo.</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <MapPin className="text-volt shrink-0 mt-1" size={20} />
              <div>
                <p className="label text-ash/60 mb-1">Address</p>
                <p className="text-bone">{SITE.address.full}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="text-volt shrink-0 mt-1" size={20} />
              <div className="w-full max-w-xs">
                <p className="label text-ash/60 mb-2">Hours</p>
                <table className="w-full font-mono text-sm">
                  <tbody>
                    {SITE.hours.map((h) => (
                      <tr key={h.days} className="border-b border-steel/60">
                        <td className="py-1.5 text-ash uppercase">{h.days}</td>
                        <td className="py-1.5 text-volt text-right">{h.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone className="text-volt shrink-0 mt-1" size={20} />
              <div>
                <p className="label text-ash/60 mb-1">Phone</p>
                <a href={SITE.phoneHref} className="text-bone hover:text-volt">
                  {SITE.phone}
                </a>
              </div>
            </div>
          </div>
          <a href={MAPS_DIRECTIONS} target="_blank" rel="noreferrer" className="btn-ghost mt-9 self-start">
            Get directions
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <Classes />
      <ProgramCTA />
      <Coaches />
      <PricingPreview />
      <Location />
    </>
  );
}

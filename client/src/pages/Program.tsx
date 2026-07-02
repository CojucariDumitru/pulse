import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Dumbbell,
  HeartPulse,
  Trophy,
  Home as HomeIcon,
  Building2,
  Mail,
  RotateCcw,
  Droplets,
  Beef,
  Wheat,
  Salad,
} from 'lucide-react';
import { generateProgram, emailProgram } from '../api/endpoints';
import { getErrorMessage } from '../api/client';
import { useToast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import type { ProgramIntake, GeneratedProgram, CoachNotes, ProgramPhase } from '../lib/types';

/* ─────────────────────────── intake wizard ─────────────────────────── */

type Partial_ = Partial<ProgramIntake>;

const GOALS = [
  { id: 'lose_fat', label: 'Lose fat', icon: Flame, blurb: 'Drop weight, keep muscle' },
  { id: 'build_muscle', label: 'Build muscle', icon: Dumbbell, blurb: 'Add size, stay lean' },
  { id: 'get_fit', label: 'Get fit', icon: HeartPulse, blurb: 'Energy, health, consistency' },
  { id: 'gain_strength', label: 'Gain strength', icon: Trophy, blurb: 'Move heavier weight' },
] as const;

const EXPERIENCE = [
  { id: 'beginner', label: 'Beginner', blurb: '< 1 year of training' },
  { id: 'intermediate', label: 'Intermediate', blurb: '1–3 years consistent' },
  { id: 'advanced', label: 'Advanced', blurb: '3+ years, knows the grind' },
] as const;

function ChoiceGrid<T extends string>({
  options,
  value,
  onPick,
  cols = 2,
}: {
  options: readonly { id: T; label: string; blurb?: string; icon?: typeof Flame }[];
  value: T | undefined;
  onPick: (v: T) => void;
  cols?: number;
}) {
  return (
    <div className={`grid gap-3 ${cols === 2 ? 'sm:grid-cols-2' : cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'}`}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onPick(o.id)}
          className={`card p-5 text-left transition-all hover:border-volt/60 ${
            value === o.id ? 'border-volt shadow-volt-sm' : ''
          }`}
        >
          {o.icon && <o.icon size={22} className={value === o.id ? 'text-volt' : 'text-ash'} />}
          <div className="font-display font-bold text-lg mt-2">{o.label}</div>
          {o.blurb && <div className="text-ash text-xs mt-1">{o.blurb}</div>}
        </button>
      ))}
    </div>
  );
}

function Wizard({ onDone }: { onDone: (intake: ProgramIntake, result: { program: GeneratedProgram; coachNotes: CoachNotes | null }) => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial_>({ daysPerWeek: 4, equipment: 'full_gym' });

  const set = (patch: Partial_) => setForm((f) => ({ ...f, ...patch }));

  const mutation = useMutation({
    mutationFn: (intake: ProgramIntake) => generateProgram(intake),
    onSuccess: (result, intake) => onDone(intake, result),
    onError: (err) => toast(getErrorMessage(err, 'Could not generate your program'), 'error'),
  });

  const steps: { title: string; valid: boolean; body: JSX.Element }[] = [
    {
      title: 'What are you chasing?',
      valid: Boolean(form.goal),
      body: <ChoiceGrid options={GOALS} value={form.goal} onPick={(goal) => set({ goal })} />,
    },
    {
      title: 'About you',
      valid:
        Boolean(form.gender) &&
        Number(form.age) >= 14 &&
        Number(form.heightCm) >= 120 &&
        Number(form.weightKg) >= 35,
      body: (
        <div className="space-y-5">
          <ChoiceGrid
            cols={3}
            options={[
              { id: 'male', label: 'Male' },
              { id: 'female', label: 'Female' },
              { id: 'other', label: 'Other' },
            ] as const}
            value={form.gender}
            onPick={(gender) => set({ gender })}
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Age"
              id="age"
              type="number"
              placeholder="28"
              value={form.age ?? ''}
              onChange={(e) => set({ age: Number(e.target.value) })}
            />
            <Input
              label="Height (cm)"
              id="height"
              type="number"
              placeholder="180"
              value={form.heightCm ?? ''}
              onChange={(e) => set({ heightCm: Number(e.target.value) })}
            />
            <Input
              label="Weight (kg)"
              id="weight"
              type="number"
              placeholder="80"
              value={form.weightKg ?? ''}
              onChange={(e) => set({ weightKg: Number(e.target.value) })}
            />
            <Input
              label="Target (kg)"
              id="target"
              type="number"
              placeholder="optional"
              value={form.targetWeightKg ?? ''}
              onChange={(e) =>
                set({ targetWeightKg: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Your experience',
      valid: Boolean(form.experience),
      body: (
        <ChoiceGrid
          cols={3}
          options={EXPERIENCE}
          value={form.experience}
          onPick={(experience) => set({ experience })}
        />
      ),
    },
    {
      title: 'Schedule & gear',
      valid: Boolean(form.daysPerWeek && form.equipment),
      body: (
        <div className="space-y-6">
          <div>
            <p className="label text-ash mb-3">Training days per week</p>
            <div className="grid grid-cols-4 gap-3">
              {([3, 4, 5, 6] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set({ daysPerWeek: d })}
                  className={`card py-4 text-center font-display font-extrabold text-2xl transition-all hover:border-volt/60 ${
                    form.daysPerWeek === d ? 'border-volt text-volt shadow-volt-sm' : 'text-bone'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label text-ash mb-3">Where will you train?</p>
            <ChoiceGrid
              options={[
                { id: 'full_gym', label: 'Full gym', blurb: 'Barbells, machines, cables', icon: Building2 },
                { id: 'home_minimal', label: 'Home / minimal', blurb: 'Bodyweight + improvised load', icon: HomeIcon },
              ] as const}
              value={form.equipment}
              onPick={(equipment) => set({ equipment })}
            />
          </div>
        </div>
      ),
    },
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  const submit = () => mutation.mutate(form as ProgramIntake);

  return (
    <div className="card p-6 md:p-10">
      {/* progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-volt' : 'bg-steel'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <p className="label text-ash mb-2">
            Step {step + 1} / {steps.length}
          </p>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl mb-7">{current.title}</h2>
          {current.body}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-9">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-ghost !px-5 !py-2.5 !text-xs disabled:opacity-30"
        >
          <ChevronLeft size={15} /> Back
        </button>
        {last ? (
          <button
            type="button"
            onClick={submit}
            disabled={!current.valid || mutation.isPending}
            className="btn-volt"
          >
            {mutation.isPending ? (
              <>
                <Sparkles size={16} className="animate-pulse" /> Building your program…
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate program
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!current.valid}
            className="btn-volt !px-6 !py-2.5 !text-xs"
          >
            Next <ChevronRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── results ─────────────────────────── */

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-5 text-center">
      <div className="font-display font-extrabold text-3xl md:text-4xl text-volt">{value}</div>
      <div className="label text-ash mt-2">{label}</div>
      {sub && <div className="font-mono text-[10px] text-ash/60 mt-1">{sub}</div>}
    </div>
  );
}

function PhaseBlock({ phase, index }: { phase: ProgramPhase; index: number }) {
  const [openDay, setOpenDay] = useState(0);
  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-steel bg-gradient-to-r from-volt/10 to-transparent">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display font-extrabold text-2xl">
            <span className="text-volt">0{index + 1}</span> {phase.name}
          </h3>
          <span className="font-mono text-xs text-ash">Weeks {phase.weeks} · {phase.intensity}</span>
        </div>
        <p className="text-ash text-sm mt-2">{phase.progression}</p>
      </div>

      <div className="flex gap-1 overflow-x-auto no-scrollbar p-3 border-b border-steel">
        {phase.days.map((d, i) => (
          <button
            key={d.label}
            onClick={() => setOpenDay(i)}
            className={`shrink-0 rounded-full px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
              openDay === i ? 'bg-volt text-ink' : 'text-ash hover:text-bone'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        <p className="font-mono text-xs text-ash mb-4">{phase.days[openDay].focus}</p>
        <table className="w-full">
          <tbody>
            {phase.days[openDay].exercises.map((e) => (
              <tr key={e.name} className="border-b border-steel/50 last:border-0">
                <td className="py-2.5 text-sm text-bone">
                  {e.name}
                  {e.notes && <span className="block font-mono text-[10px] text-ash/60">{e.notes}</span>}
                </td>
                <td className="py-2.5 font-mono text-sm text-volt text-right whitespace-nowrap">
                  {e.sets} × {e.reps}
                </td>
                <td className="py-2.5 font-mono text-[11px] text-ash text-right whitespace-nowrap pl-3">
                  rest {e.restSec}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {phase.days[openDay].finisher && (
          <p className="mt-3 font-mono text-xs text-ember flex items-center gap-2">
            <Flame size={12} /> Finisher: {phase.days[openDay].finisher}
          </p>
        )}
      </div>
    </div>
  );
}

function Results({
  intake,
  program,
  coachNotes,
  onReset,
}: {
  intake: ProgramIntake;
  program: GeneratedProgram;
  coachNotes: CoachNotes | null;
  onReset: () => void;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const emailMutation = useMutation({
    mutationFn: () => emailProgram(email, intake),
    onSuccess: (r) =>
      toast(r.emailSent ? 'Program sent — check your inbox!' : 'Saved, but email could not be sent.', r.emailSent ? 'success' : 'info'),
    onError: (err) => toast(getErrorMessage(err), 'error'),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      {/* AI coach notes */}
      {coachNotes && (
        <div className="card p-6 md:p-8 border-volt/40 shadow-volt-sm">
          <p className="label text-volt mb-3 flex items-center gap-2">
            <Sparkles size={13} /> Coach's notes — written for you
          </p>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl">{coachNotes.headline}</h2>
          <p className="text-ash mt-3 leading-relaxed">{coachNotes.summary}</p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {coachNotes.phaseTips.map((tip, i) => (
              <div key={i} className="rounded-xl bg-ink border border-steel p-4">
                <p className="font-mono text-[10px] text-volt uppercase tracking-wider mb-2">
                  Phase 0{i + 1}
                </p>
                <p className="text-sm text-bone/90 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
          {coachNotes.watchOuts.length > 0 && (
            <div className="mt-5 space-y-1.5">
              {coachNotes.watchOuts.map((w, i) => (
                <p key={i} className="text-sm text-ember/90 flex gap-2">
                  <Flame size={14} className="shrink-0 mt-0.5" /> {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* metrics */}
      <div>
        <p className="label text-volt mb-4">Your numbers</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Daily calories" value={String(program.profile.targetCalories)} sub={program.profile.calorieStrategy} />
          <Stat label="BMI" value={String(program.profile.bmi)} sub={program.profile.bmiCategory} />
          <Stat label="TDEE" value={`${program.profile.tdee}`} sub="maintenance kcal" />
          <Stat label="Session length" value={`~${program.overview.sessionLengthMin}m`} sub={program.overview.split} />
        </div>
      </div>

      {/* macros */}
      <div>
        <p className="label text-volt mb-4">Daily nutrition</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Beef, label: 'Protein', value: `${program.nutrition.proteinG}g` },
            { icon: Wheat, label: 'Carbs', value: `${program.nutrition.carbsG}g` },
            { icon: Salad, label: 'Fat', value: `${program.nutrition.fatG}g` },
            { icon: Droplets, label: 'Water', value: `${(program.nutrition.waterMl / 1000).toFixed(1)}L` },
          ].map((m) => (
            <div key={m.label} className="card p-4 flex items-center gap-3">
              <m.icon size={20} className="text-volt shrink-0" />
              <div>
                <div className="font-display font-extrabold text-xl">{m.value}</div>
                <div className="font-mono text-[10px] text-ash uppercase">{m.label}</div>
              </div>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-1.5">
          {program.nutrition.notes.map((n, i) => (
            <li key={i} className="text-sm text-ash flex gap-2">
              <span className="text-volt">→</span> {n}
            </li>
          ))}
        </ul>
      </div>

      {/* phases */}
      <div className="space-y-6">
        <p className="label text-volt">The 12-week plan — {program.overview.split}</p>
        {program.phases.map((phase, i) => (
          <PhaseBlock key={phase.name} phase={phase} index={i} />
        ))}
      </div>

      {/* guidance */}
      <div className="card p-6">
        <p className="label text-volt mb-3">Rules of the road</p>
        <ul className="space-y-2">
          {program.guidance.map((g, i) => (
            <li key={i} className="text-sm text-ash flex gap-2">
              <span className="text-volt font-mono">{String(i + 1).padStart(2, '0')}</span> {g}
            </li>
          ))}
        </ul>
      </div>

      {/* email + reset */}
      <div className="card p-6 md:p-8 border-volt/30">
        <p className="font-display font-bold text-xl mb-1">Take it with you</p>
        <p className="text-ash text-sm mb-4">We'll send the full plan to your inbox.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 rounded-full bg-ink border border-steel text-bone px-5 py-3 placeholder:text-ash/50 focus:outline-none focus:border-volt"
          />
          <button
            onClick={() => emailMutation.mutate()}
            disabled={!email.includes('@') || emailMutation.isPending}
            className="btn-volt !py-3"
          >
            <Mail size={16} /> {emailMutation.isPending ? 'Sending…' : 'Email my program'}
          </button>
        </div>
      </div>

      <button onClick={onReset} className="label text-ash hover:text-volt transition-colors flex items-center gap-2 mx-auto">
        <RotateCcw size={13} /> Start over with different inputs
      </button>
    </motion.div>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function Program() {
  const [result, setResult] = useState<{
    intake: ProgramIntake;
    program: GeneratedProgram;
    coachNotes: CoachNotes | null;
  } | null>(null);

  return (
    <div className="pt-28 pb-24 min-h-screen bg-ink bg-grid">
      <div className="mx-auto max-w-4xl px-5">
        <p className="label text-volt mb-3 flex items-center gap-2">
          <Sparkles size={13} /> Free · AI-personalized · 60 seconds
        </p>
        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] mb-4">
          Your 12-week <span className="text-volt">program.</span>
        </h1>
        <p className="text-ash text-lg max-w-2xl mb-12">
          Science-based programming: we compute your energy needs, build a periodized plan around
          your schedule, and an AI coach personalizes the brief.
        </p>

        {result ? (
          <Results
            intake={result.intake}
            program={result.program}
            coachNotes={result.coachNotes}
            onReset={() => setResult(null)}
          />
        ) : (
          <Wizard onDone={(intake, r) => setResult({ intake, ...r })} />
        )}
      </div>
    </div>
  );
}

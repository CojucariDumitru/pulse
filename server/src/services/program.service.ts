// ──────────────────────────────────────────────────────────────
// PULSE — 12-week program generator
// A science-based, deterministic engine: it computes the member's
// energy needs (Mifflin-St Jeor BMR → TDEE → goal-adjusted calories
// + macros), picks a training split from their available days, and
// periodizes 12 weeks into 3 progressive mesocycles with a deload.
// Pure functions, zero external dependencies.
// ──────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female' | 'other';
export type Goal = 'lose_fat' | 'build_muscle' | 'get_fit' | 'gain_strength';
export type Experience = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'full_gym' | 'home_minimal';
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export interface ProgramIntake {
  gender: Gender;
  age: number; // years
  heightCm: number;
  weightKg: number;
  goal: Goal;
  experience: Experience;
  daysPerWeek: 3 | 4 | 5 | 6;
  equipment: Equipment;
  activityLevel?: ActivityLevel;
  targetWeightKg?: number;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g. "8–12", "5", "12–15"
  restSec: number;
  notes?: string;
}

export interface WorkoutDay {
  label: string; // "Push", "Lower A", "Full Body A"
  focus: string;
  exercises: Exercise[];
  finisher?: string;
}

export interface Phase {
  name: string;
  weeks: string; // "1–4"
  focus: string;
  intensity: string; // RPE guidance
  progression: string;
  days: WorkoutDay[];
}

export interface GeneratedProgram {
  profile: {
    bmi: number;
    bmiCategory: string;
    bmr: number;
    tdee: number;
    targetCalories: number;
    calorieStrategy: string;
  };
  nutrition: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    waterMl: number;
    notes: string[];
  };
  overview: {
    goalLabel: string;
    split: string;
    daysPerWeek: number;
    durationWeeks: number;
    sessionLengthMin: number;
  };
  phases: Phase[];
  guidance: string[];
}

// ───────────────────────── Metrics ─────────────────────────

const ACTIVITY_FACTOR: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const round = (n: number, step = 1) => Math.round(n / step) * step;

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Healthy';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/** Mifflin-St Jeor BMR. "other" averages the male/female constants. */
function calcBMR(i: ProgramIntake): number {
  const base = 10 * i.weightKg + 6.25 * i.heightCm - 5 * i.age;
  const constant = i.gender === 'male' ? 5 : i.gender === 'female' ? -161 : -78;
  return base + constant;
}

/** Derive an activity factor from daysPerWeek when not explicitly given. */
function activityFactor(i: ProgramIntake): number {
  if (i.activityLevel) return ACTIVITY_FACTOR[i.activityLevel];
  if (i.daysPerWeek >= 6) return ACTIVITY_FACTOR.active;
  if (i.daysPerWeek >= 4) return ACTIVITY_FACTOR.moderate;
  return ACTIVITY_FACTOR.light;
}

const GOAL_LABEL: Record<Goal, string> = {
  lose_fat: 'Lose fat',
  build_muscle: 'Build muscle',
  get_fit: 'Get fitter',
  gain_strength: 'Gain strength',
};

// ───────────────────── Exercise library ─────────────────────
// Each movement pattern has gym + home variants. Two options per
// pattern so "A/B" days within a split feel different.

type Pattern =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'h_push'
  | 'v_push'
  | 'incline_push'
  | 'h_pull'
  | 'v_pull'
  | 'lateral'
  | 'rear_delt'
  | 'triceps'
  | 'biceps'
  | 'quad_iso'
  | 'ham_iso'
  | 'calf'
  | 'core'
  | 'conditioning';

const LIBRARY: Record<Pattern, { gym: string; home: string; compound: boolean }[]> = {
  squat: [
    { gym: 'Barbell Back Squat', home: 'Goblet Squat (backpack)', compound: true },
    { gym: 'Front Squat', home: 'Bulgarian Split Squat', compound: true },
  ],
  hinge: [
    { gym: 'Conventional Deadlift', home: 'Single-leg Romanian Deadlift', compound: true },
    { gym: 'Romanian Deadlift', home: 'Hip Thrust (floor)', compound: true },
  ],
  lunge: [
    { gym: 'Walking Lunge', home: 'Reverse Lunge', compound: true },
    { gym: 'Bulgarian Split Squat', home: 'Step-up (chair)', compound: true },
  ],
  h_push: [
    { gym: 'Barbell Bench Press', home: 'Push-up', compound: true },
    { gym: 'Flat Dumbbell Press', home: 'Decline Push-up (feet up)', compound: true },
  ],
  v_push: [
    { gym: 'Standing Overhead Press', home: 'Pike Push-up', compound: true },
    { gym: 'Seated Dumbbell Press', home: 'Backpack Overhead Press', compound: true },
  ],
  incline_push: [
    { gym: 'Incline Dumbbell Press', home: 'Incline Push-up', compound: true },
    { gym: 'Cable Fly', home: 'Wide Push-up', compound: false },
  ],
  h_pull: [
    { gym: 'Barbell Row', home: 'Backpack Bent-over Row', compound: true },
    { gym: 'Seated Cable Row', home: 'Inverted Row (under table)', compound: true },
  ],
  v_pull: [
    { gym: 'Lat Pulldown', home: 'Pull-up / Doorway Row', compound: true },
    { gym: 'Pull-up', home: 'Towel Door Row', compound: true },
  ],
  lateral: [
    { gym: 'Dumbbell Lateral Raise', home: 'Water-bottle Lateral Raise', compound: false },
    { gym: 'Cable Lateral Raise', home: 'Backpack Lateral Raise', compound: false },
  ],
  rear_delt: [
    { gym: 'Face Pull', home: 'Towel Face Pull', compound: false },
    { gym: 'Reverse Pec Deck', home: 'Prone Y-Raise', compound: false },
  ],
  triceps: [
    { gym: 'Triceps Rope Pushdown', home: 'Bench Dips', compound: false },
    { gym: 'Overhead Cable Extension', home: 'Diamond Push-up', compound: false },
  ],
  biceps: [
    { gym: 'Dumbbell Curl', home: 'Backpack Curl', compound: false },
    { gym: 'Cable Curl', home: 'Towel Isometric Curl', compound: false },
  ],
  quad_iso: [
    { gym: 'Leg Press', home: 'Wall Sit', compound: false },
    { gym: 'Leg Extension', home: 'Sissy Squat', compound: false },
  ],
  ham_iso: [
    { gym: 'Seated Leg Curl', home: 'Nordic Curl (assisted)', compound: false },
    { gym: 'Lying Leg Curl', home: 'Glute Bridge March', compound: false },
  ],
  calf: [
    { gym: 'Standing Calf Raise', home: 'Single-leg Calf Raise', compound: false },
    { gym: 'Seated Calf Raise', home: 'Stair Calf Raise', compound: false },
  ],
  core: [
    { gym: 'Hanging Leg Raise', home: 'Lying Leg Raise', compound: false },
    { gym: 'Cable Crunch', home: 'Plank (60s)', compound: false },
  ],
  conditioning: [
    { gym: 'Assault Bike Intervals', home: 'Burpee Intervals', compound: true },
    { gym: 'Rowing Intervals', home: 'Mountain Climber Intervals', compound: true },
  ],
};

function pick(pattern: Pattern, equipment: Equipment, variant: 0 | 1) {
  const opts = LIBRARY[pattern];
  const choice = opts[variant % opts.length];
  return { name: equipment === 'full_gym' ? choice.gym : choice.home, compound: choice.compound };
}

// ───────────────────── Splits by frequency ─────────────────────

type DayPlan = { label: string; focus: string; patterns: Pattern[]; variant: 0 | 1 };

function splitFor(days: 3 | 4 | 5 | 6, goal: Goal): { name: string; days: DayPlan[] } {
  const core: Pattern = 'core';
  const cond: Pattern[] = goal === 'lose_fat' || goal === 'get_fit' ? ['conditioning'] : [];

  if (days === 3) {
    return {
      name: 'Full Body (3-day)',
      days: [
        { label: 'Full Body A', focus: 'Squat + Push focus', variant: 0, patterns: ['squat', 'h_push', 'h_pull', 'lateral', core, ...cond] },
        { label: 'Full Body B', focus: 'Hinge + Pull focus', variant: 1, patterns: ['hinge', 'v_push', 'v_pull', 'biceps', core, ...cond] },
        { label: 'Full Body C', focus: 'Unilateral + Power', variant: 0, patterns: ['lunge', 'incline_push', 'h_pull', 'triceps', core, ...cond] },
      ],
    };
  }
  if (days === 4) {
    return {
      name: 'Upper / Lower (4-day)',
      days: [
        { label: 'Upper A', focus: 'Horizontal push/pull', variant: 0, patterns: ['h_push', 'h_pull', 'incline_push', 'lateral', 'triceps', 'biceps'] },
        { label: 'Lower A', focus: 'Squat dominant', variant: 0, patterns: ['squat', 'hinge', 'lunge', 'quad_iso', 'calf', core] },
        { label: 'Upper B', focus: 'Vertical push/pull', variant: 1, patterns: ['v_push', 'v_pull', 'h_pull', 'rear_delt', 'biceps', 'triceps'] },
        { label: 'Lower B', focus: 'Hinge dominant', variant: 1, patterns: ['hinge', 'squat', 'lunge', 'ham_iso', 'calf', core] },
      ],
    };
  }
  if (days === 5) {
    return {
      name: 'Push / Pull / Legs + Upper / Lower (5-day)',
      days: [
        { label: 'Push', focus: 'Chest, shoulders, triceps', variant: 0, patterns: ['h_push', 'v_push', 'incline_push', 'lateral', 'triceps'] },
        { label: 'Pull', focus: 'Back, rear delts, biceps', variant: 0, patterns: ['v_pull', 'h_pull', 'hinge', 'rear_delt', 'biceps'] },
        { label: 'Legs', focus: 'Quads, hams, calves', variant: 0, patterns: ['squat', 'hinge', 'lunge', 'ham_iso', 'calf', core] },
        { label: 'Upper', focus: 'Whole upper body', variant: 1, patterns: ['h_push', 'v_pull', 'v_push', 'h_pull', 'lateral', 'biceps'] },
        { label: 'Lower', focus: 'Whole lower body', variant: 1, patterns: ['squat', 'hinge', 'lunge', 'quad_iso', 'calf', core] },
      ],
    };
  }
  return {
    name: 'Push / Pull / Legs ×2 (6-day)',
    days: [
      { label: 'Push A', focus: 'Chest emphasis', variant: 0, patterns: ['h_push', 'incline_push', 'v_push', 'lateral', 'triceps'] },
      { label: 'Pull A', focus: 'Width emphasis', variant: 0, patterns: ['v_pull', 'h_pull', 'rear_delt', 'biceps', core] },
      { label: 'Legs A', focus: 'Quad emphasis', variant: 0, patterns: ['squat', 'lunge', 'quad_iso', 'calf', core] },
      { label: 'Push B', focus: 'Shoulder emphasis', variant: 1, patterns: ['v_push', 'h_push', 'lateral', 'incline_push', 'triceps'] },
      { label: 'Pull B', focus: 'Thickness emphasis', variant: 1, patterns: ['h_pull', 'v_pull', 'hinge', 'rear_delt', 'biceps'] },
      { label: 'Legs B', focus: 'Hamstring emphasis', variant: 1, patterns: ['hinge', 'squat', 'lunge', 'ham_iso', 'calf'] },
    ],
  };
}

// ───────────────────── Set/rep prescription ─────────────────────

interface Scheme {
  sets: number;
  reps: string;
  restSec: number;
}

/** Prescription by goal × phase (0–2) × compound. */
function schemeFor(goal: Goal, phase: number, compound: boolean, experience: Experience): Scheme {
  const beginnerTrim = experience === 'beginner' ? -1 : 0;

  if (goal === 'gain_strength') {
    if (compound) {
      const table: Scheme[] = [
        { sets: 4, reps: '5', restSec: 150 },
        { sets: 5, reps: '4', restSec: 180 },
        { sets: 4, reps: '3', restSec: 180 },
      ];
      const s = table[phase];
      return { ...s, sets: Math.max(3, s.sets + beginnerTrim) };
    }
    return { sets: 3, reps: '8', restSec: 90 };
  }

  if (goal === 'build_muscle') {
    if (compound) {
      const table: Scheme[] = [
        { sets: 4, reps: '8–10', restSec: 105 },
        { sets: 4, reps: '6–8', restSec: 120 },
        { sets: 5, reps: '6–8', restSec: 120 },
      ];
      const s = table[phase];
      return { ...s, sets: Math.max(3, s.sets + beginnerTrim) };
    }
    const acc: Scheme[] = [
      { sets: 3, reps: '12–15', restSec: 60 },
      { sets: 3, reps: '10–12', restSec: 75 },
      { sets: 4, reps: '10–12', restSec: 75 },
    ];
    return acc[phase];
  }

  if (goal === 'lose_fat') {
    if (compound) {
      const table: Scheme[] = [
        { sets: 3, reps: '12', restSec: 60 },
        { sets: 4, reps: '12', restSec: 50 },
        { sets: 4, reps: '15', restSec: 45 },
      ];
      return table[phase];
    }
    return { sets: 3, reps: '15–20', restSec: 40 };
  }

  // get_fit
  if (compound) {
    const table: Scheme[] = [
      { sets: 3, reps: '10', restSec: 75 },
      { sets: 3, reps: '8–10', restSec: 90 },
      { sets: 4, reps: '8–10', restSec: 90 },
    ];
    return table[phase];
  }
  return { sets: 2, reps: '12–15', restSec: 60 };
}

// ───────────────────── Build a workout day ─────────────────────

function buildDay(plan: DayPlan, i: ProgramIntake, phase: number): WorkoutDay {
  // Beginners cap exercises to keep sessions focused.
  const cap = i.experience === 'beginner' ? 5 : i.experience === 'intermediate' ? 6 : 7;
  const patterns = plan.patterns.slice(0, cap);

  const exercises: Exercise[] = patterns
    .filter((p) => p !== 'conditioning')
    .map((p) => {
      const { name, compound } = pick(p, i.equipment, plan.variant);
      const s = schemeFor(i.goal, phase, compound, i.experience);
      return {
        name,
        sets: s.sets,
        reps: s.reps,
        restSec: s.restSec,
        notes: compound ? 'Leave 1–2 reps in reserve' : undefined,
      };
    });

  const hasConditioning = plan.patterns.includes('conditioning');
  const finisher = hasConditioning
    ? i.goal === 'lose_fat'
      ? '10 min intervals — 30s hard / 30s easy'
      : '8 min steady conditioning'
    : undefined;

  return { label: plan.label, focus: plan.focus, exercises, finisher };
}

// ───────────────────── Phases (mesocycles) ─────────────────────

const PHASE_META = [
  {
    name: 'Foundation',
    weeks: '1–4',
    focus: 'Groove the movements, build a base',
    intensity: 'RPE 7 — leave 3 reps in the tank',
    progression: 'Add a small load each week once you hit the top of the rep range. Week 4 is a lighter deload.',
  },
  {
    name: 'Build',
    weeks: '5–8',
    focus: 'Accumulate volume, push working weights up',
    intensity: 'RPE 8 — leave ~2 reps in the tank',
    progression: 'Add load or one rep per set weekly. Week 8 deloads ~40% volume to recover.',
  },
  {
    name: 'Peak',
    weeks: '9–12',
    focus: 'Intensify — heavier loads, sharper output',
    intensity: 'RPE 8–9 — near your limit on top sets',
    progression: 'Push intensity weekly. Week 12 is a deload + re-test your key lifts to measure progress.',
  },
];

// ───────────────────── Nutrition ─────────────────────

function nutrition(i: ProgramIntake, tdee: number, targetCalories: number) {
  // protein higher in a deficit to spare muscle; lower in a surplus
  const proteinPerKg = i.goal === 'lose_fat' ? 2.2 : i.goal === 'build_muscle' ? 2.0 : 1.8;
  const fatPerKg = 0.9;
  const proteinG = round(proteinPerKg * i.weightKg);
  const fatG = round(fatPerKg * i.weightKg);
  const remaining = targetCalories - (proteinG * 4 + fatG * 9);
  const carbsG = round(Math.max(remaining, 0) / 4);
  const waterMl = round(35 * i.weightKg, 50);

  const notes: string[] = [
    `Hit ~${proteinG}g protein every day — it's the single biggest lever.`,
    i.goal === 'lose_fat'
      ? 'Eat mostly whole foods, lots of volume (veg, lean protein) to stay full in a deficit.'
      : i.goal === 'build_muscle'
        ? 'Eat in a slight surplus; if the scale stalls 2+ weeks, add ~150 kcal of carbs.'
        : 'Eat around maintenance and let training drive the changes.',
    `Aim for ~${(waterMl / 1000).toFixed(1)}L water/day and 7–9h sleep — recovery is where you grow.`,
  ];
  void tdee;
  return { proteinG, carbsG, fatG, waterMl, notes };
}

// ───────────────────── Top-level generator ─────────────────────

export function generateProgram(i: ProgramIntake): GeneratedProgram {
  const heightM = i.heightCm / 100;
  const bmi = +(i.weightKg / (heightM * heightM)).toFixed(1);
  const bmr = Math.round(calcBMR(i));
  const tdee = Math.round(bmr * activityFactor(i));

  const calorieMultiplier =
    i.goal === 'lose_fat' ? 0.8 : i.goal === 'build_muscle' ? 1.1 : i.goal === 'gain_strength' ? 1.05 : 1.0;
  const targetCalories = round(tdee * calorieMultiplier, 10);
  const calorieStrategy =
    i.goal === 'lose_fat'
      ? '~20% deficit for steady fat loss (~0.5kg/week)'
      : i.goal === 'build_muscle'
        ? '~10% surplus for lean muscle gain'
        : i.goal === 'gain_strength'
          ? 'slight ~5% surplus to fuel heavy training'
          : 'maintenance calories';

  const split = splitFor(i.daysPerWeek, i.goal);

  const phases: Phase[] = PHASE_META.map((meta, phaseIdx) => ({
    ...meta,
    days: split.days.map((d) => buildDay(d, i, phaseIdx)),
  }));

  const sessionLengthMin =
    i.goal === 'gain_strength' ? 70 : i.experience === 'advanced' ? 65 : 55;

  const guidance: string[] = [
    'Warm up 5–8 min + 2 ramp-up sets on your first big lift each session.',
    'Track every session — weight, sets, reps. Beating last week is the whole game (progressive overload).',
    'On a 4/5/6-day plan, spread rest days out (e.g. train 2 on / 1 off) so each muscle recovers.',
    i.goal === 'lose_fat'
      ? 'Add 8–10k daily steps — easy cardio burns fat without eating into recovery.'
      : 'Keep optional easy cardio to 1–2 short sessions so it doesn’t blunt strength gains.',
    'Deload weeks (4, 8, 12) are not optional — they’re when your body actually adapts.',
    'Re-take this assessment at week 12 to generate your next block with heavier numbers.',
  ];

  return {
    profile: { bmi, bmiCategory: bmiCategory(bmi), bmr, tdee, targetCalories, calorieStrategy },
    nutrition: nutrition(i, tdee, targetCalories),
    overview: {
      goalLabel: GOAL_LABEL[i.goal],
      split: split.name,
      daysPerWeek: i.daysPerWeek,
      durationWeeks: 12,
      sessionLengthMin,
    },
    phases,
    guidance,
  };
}

export type Intensity = 'LOW' | 'MEDIUM' | 'HIGH' | 'ALL_LEVELS';

export interface ClassType {
  id: string;
  slug: string;
  name: string;
  description: string;
  intensity: Intensity;
  durationMin: number;
  color: string;
  image: string | null;
  order: number;
}

export interface Instructor {
  id: string;
  name: string;
  bio: string;
  image: string | null;
  specialties: string[];
}

export interface ScheduleSession {
  id: string;
  startsAt: string;
  durationMin: number;
  capacity: number;
  room: string | null;
  classType: Pick<ClassType, 'id' | 'slug' | 'name' | 'intensity' | 'color' | 'image'>;
  instructor: { id: string; name: string; image: string | null };
  booked: number;
  waitlist: number;
  spotsLeft: number;
  myStatus: 'BOOKED' | 'WAITLIST' | 'ATTENDED' | null;
}

export type MembershipPlanId = 'ESSENTIAL' | 'UNLIMITED' | 'ANNUAL';
export type MembershipStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'INACTIVE';

export interface Plan {
  id: MembershipPlanId;
  name: string;
  price: number;
  cadence: string;
  tagline: string;
  featured?: boolean;
  features: string[];
}

export interface Member {
  id: string;
  email: string;
  name: string;
  membership: {
    plan: MembershipPlanId;
    status: MembershipStatus;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export interface MyBooking {
  id: string;
  status: 'BOOKED' | 'WAITLIST' | 'ATTENDED';
  session: {
    id: string;
    startsAt: string;
    durationMin: number;
    room: string | null;
    classType: { name: string; color: string; intensity: Intensity };
    instructor: { name: string };
  };
}

/* ---------- program generator ---------- */

export interface ProgramIntake {
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  weightKg: number;
  goal: 'lose_fat' | 'build_muscle' | 'get_fit' | 'gain_strength';
  experience: 'beginner' | 'intermediate' | 'advanced';
  daysPerWeek: 3 | 4 | 5 | 6;
  equipment: 'full_gym' | 'home_minimal';
  targetWeightKg?: number;
}

export interface ProgramExercise {
  name: string;
  sets: number;
  reps: string;
  restSec: number;
  notes?: string;
}

export interface ProgramDay {
  label: string;
  focus: string;
  exercises: ProgramExercise[];
  finisher?: string;
}

export interface ProgramPhase {
  name: string;
  weeks: string;
  focus: string;
  intensity: string;
  progression: string;
  days: ProgramDay[];
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
  phases: ProgramPhase[];
  guidance: string[];
}

export interface CoachNotes {
  headline: string;
  summary: string;
  phaseTips: string[];
  watchOuts: string[];
}

export const INTENSITY_LABEL: Record<Intensity, string> = {
  LOW: 'Low intensity',
  MEDIUM: 'Medium intensity',
  HIGH: 'High intensity',
  ALL_LEVELS: 'All levels',
};

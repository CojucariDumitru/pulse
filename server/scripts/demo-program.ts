import { generateProgram, ProgramIntake } from '../src/services/program.service';

const sample: ProgramIntake = {
  gender: 'male',
  age: 28,
  heightCm: 180,
  weightKg: 84,
  goal: 'build_muscle',
  experience: 'intermediate',
  daysPerWeek: 4,
  equipment: 'full_gym',
};

const p = generateProgram(sample);

console.log('═══════════ SAMPLE: 28M, 180cm, 84kg, build muscle, 4 days, gym ═══════════\n');
console.log('PROFILE');
console.log(`  BMI ${p.profile.bmi} (${p.profile.bmiCategory}) · BMR ${p.profile.bmr} · TDEE ${p.profile.tdee}`);
console.log(`  Target: ${p.profile.targetCalories} kcal — ${p.profile.calorieStrategy}`);
console.log('\nNUTRITION');
console.log(`  ${p.nutrition.proteinG}g protein · ${p.nutrition.carbsG}g carbs · ${p.nutrition.fatG}g fat · ${p.nutrition.waterMl}ml water`);
console.log('\nOVERVIEW');
console.log(`  ${p.overview.goalLabel} · ${p.overview.split} · ${p.overview.daysPerWeek}d/wk · ${p.overview.durationWeeks} weeks · ~${p.overview.sessionLengthMin}min/session`);

p.phases.forEach((phase) => {
  console.log(`\n── PHASE: ${phase.name} (weeks ${phase.weeks}) — ${phase.intensity}`);
});

const d = p.phases[0].days[0];
console.log(`\nSAMPLE WORKOUT — Phase 1 · ${d.label} (${d.focus}):`);
d.exercises.forEach((e) => console.log(`  • ${e.name}  —  ${e.sets} × ${e.reps}, rest ${e.restSec}s`));
if (d.finisher) console.log(`  ⚡ Finisher: ${d.finisher}`);

console.log(`\nTotal workouts generated: ${p.phases.reduce((n, ph) => n + ph.days.length, 0)} day-templates across 3 phases`);
console.log('✅ generator OK');

import { Request, Response } from 'express';
import { z } from 'zod';
import { generateProgram, ProgramIntake, GeneratedProgram } from '../services/program.service';
import { generateCoachNotes } from '../services/ai.service';
import { sendProgramEmail } from '../services/email.service';

export const intakeSchema = z.object({
  gender: z.enum(['male', 'female', 'other']),
  age: z.coerce.number().int().min(14, 'Must be 14 or older').max(90),
  heightCm: z.coerce.number().min(120, 'Check your height').max(230),
  weightKg: z.coerce.number().min(35, 'Check your weight').max(250),
  goal: z.enum(['lose_fat', 'build_muscle', 'get_fit', 'gain_strength']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  daysPerWeek: z.coerce.number().int().refine((d) => [3, 4, 5, 6].includes(d), 'Pick 3–6 days'),
  equipment: z.enum(['full_gym', 'home_minimal']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  targetWeightKg: z.coerce.number().min(35).max(250).optional(),
});

/**
 * POST /api/program/generate
 * Public tool: deterministic 12-week plan + optional Gemini coach notes.
 */
export async function generate(req: Request, res: Response) {
  const intake = intakeSchema.parse(req.body) as ProgramIntake;
  const program = generateProgram(intake);
  const coachNotes = await generateCoachNotes(intake, program); // null if AI unavailable
  res.json({ program, coachNotes });
}

const emailSchema = z.object({
  email: z.string().email('Enter a valid email'),
  intake: intakeSchema,
});

/** Render the program into simple email-safe HTML. */
function programHtml(p: GeneratedProgram): string {
  const phase = (ph: GeneratedProgram['phases'][number]) => `
    <div style="margin-top:22px;padding:16px;border:1px solid #26262B;">
      <div style="color:#CCFF00;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Phase — Weeks ${ph.weeks}</div>
      <div style="color:#fff;font-size:18px;font-weight:700;margin:4px 0;">${ph.name} · ${ph.intensity}</div>
      <div style="color:#8A8A92;font-size:13px;">${ph.progression}</div>
      ${ph.days
        .map(
          (d) => `
        <div style="margin-top:12px;">
          <div style="color:#F4F4F0;font-weight:700;font-size:14px;">${d.label} — <span style="color:#8A8A92;font-weight:400;">${d.focus}</span></div>
          <table style="width:100%;border-collapse:collapse;margin-top:4px;">
            ${d.exercises
              .map(
                (e) => `<tr>
                  <td style="padding:5px 0;border-bottom:1px solid #1c1c20;color:#F4F4F0;font-size:13px;">${e.name}</td>
                  <td style="padding:5px 0;border-bottom:1px solid #1c1c20;color:#CCFF00;font-size:13px;text-align:right;white-space:nowrap;">${e.sets} × ${e.reps}</td>
                </tr>`,
              )
              .join('')}
          </table>
          ${d.finisher ? `<div style="color:#FF5C2B;font-size:12px;margin-top:4px;">Finisher: ${d.finisher}</div>` : ''}
        </div>`,
        )
        .join('')}
    </div>`;

  return p.phases.map(phase).join('');
}

/** POST /api/program/email — send the generated plan to an inbox (lead magnet). */
export async function emailProgram(req: Request, res: Response) {
  const { email, intake } = emailSchema.parse(req.body);
  const program = generateProgram(intake as ProgramIntake);

  const result = await sendProgramEmail({
    email,
    goalLabel: program.overview.goalLabel,
    split: program.overview.split,
    calories: program.profile.targetCalories,
    proteinG: program.nutrition.proteinG,
    html: programHtml(program),
  });

  res.json({ emailSent: result.sent });
}

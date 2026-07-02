// ──────────────────────────────────────────────────────────────
// Gemini-powered coach notes. The deterministic program engine is
// the source of truth; Gemini adds a short, personal coaching brief
// on top. Fully optional: if the key is missing, the call fails, or
// it times out, we return null and the program ships without it.
// ──────────────────────────────────────────────────────────────
import { env } from '../config/env';
import type { GeneratedProgram, ProgramIntake } from './program.service';

const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 9000;

export const aiConfigured = Boolean(env.geminiApiKey);

export interface CoachNotes {
  headline: string;
  summary: string;
  phaseTips: string[]; // one per phase (3)
  watchOuts: string[];
}

export async function generateCoachNotes(
  intake: ProgramIntake,
  program: GeneratedProgram,
): Promise<CoachNotes | null> {
  if (!aiConfigured) return null;

  const prompt = `You are the head coach at PULSE, a boutique fitness studio. A member just generated a 12-week program. Write a short personal coaching brief for them.

Member: ${intake.gender}, ${intake.age}yo, ${intake.heightCm}cm, ${intake.weightKg}kg${intake.targetWeightKg ? `, target ${intake.targetWeightKg}kg` : ''}.
Goal: ${program.overview.goalLabel}. Experience: ${intake.experience}. Training ${intake.daysPerWeek} days/week (${program.overview.split}), equipment: ${intake.equipment === 'full_gym' ? 'full gym' : 'minimal home equipment'}.
Computed: BMI ${program.profile.bmi} (${program.profile.bmiCategory}), TDEE ${program.profile.tdee} kcal, target ${program.profile.targetCalories} kcal (${program.profile.calorieStrategy}), ${program.nutrition.proteinG}g protein/day.

Respond with ONLY valid JSON (no markdown fences), exactly this shape:
{"headline": "<motivating 6-10 word headline addressing them directly>", "summary": "<2-3 sentences: what this plan will do for their specific body/goal and why it fits them>", "phaseTips": ["<1 sentence tip specific to Foundation weeks 1-4>", "<1 sentence tip for Build weeks 5-8>", "<1 sentence tip for Peak weeks 9-12>"], "watchOuts": ["<risk/mistake specific to their profile>", "<second risk>"]}

Tone: direct, expert, encouraging — a real coach, not a cheerleader. No emojis.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'x-goog-api-key': env.geminiApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048, responseMimeType: 'application/json' },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.warn(`[ai] Gemini responded ${res.status} — shipping program without coach notes`);
      return null;
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as CoachNotes;
    if (!parsed.headline || !parsed.summary || !Array.isArray(parsed.phaseTips)) return null;
    return parsed;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[ai] coach notes failed:', err instanceof Error ? err.message : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

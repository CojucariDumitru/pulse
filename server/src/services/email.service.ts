import { resend, emailConfigured } from '../config/resend';
import { env } from '../config/env';

const STUDIO = {
  name: 'PULSE',
  tagline: 'Find your rhythm.',
  address: '88 Mercer St, New York, NY 10012',
};

const VOLT = '#CCFF00';
const INK = '#0A0A0B';

/**
 * Demo email mode (no verified domain): send from Resend's shared sender to
 * the owner's verified inbox, intended recipient shown in the subject.
 */
const DEMO_MODE = true;
const DEMO_FROM = 'PULSE <onboarding@resend.dev>';

async function send(opts: { to: string; subject: string; html: string }) {
  if (!emailConfigured || !resend) {
    // eslint-disable-next-line no-console
    console.log(`[email:skipped] "${opts.subject}" -> ${opts.to}`);
    return { sent: false };
  }
  const from = DEMO_MODE ? DEMO_FROM : `${STUDIO.name} <${env.emailFrom}>`;
  const to = DEMO_MODE ? env.emailDemoTo : opts.to;
  const subject = DEMO_MODE ? `[Demo → ${opts.to}] ${opts.subject}` : opts.subject;

  try {
    const { data, error } = await resend.emails.send({ from, to, subject, html: opts.html });
    if (error) {
      // eslint-disable-next-line no-console
      console.error('[email:error]', error);
      return { sent: false };
    }
    return { sent: true, id: data?.id };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[email:exception]', err);
    return { sent: false };
  }
}

function shell(inner: string): string {
  return `
  <div style="margin:0;padding:0;background:${INK};font-family:'Helvetica Neue',Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:${INK};">
      <div style="padding:28px 32px;border-bottom:3px solid ${VOLT};">
        <span style="font-size:30px;font-weight:800;letter-spacing:6px;color:#fff;">PULSE<span style="color:${VOLT};">.</span></span>
        <div style="font-size:11px;letter-spacing:3px;color:#8A8A92;text-transform:uppercase;margin-top:4px;">${STUDIO.tagline}</div>
      </div>
      <div style="padding:32px;color:#F4F4F0;">${inner}</div>
      <div style="padding:22px 32px;border-top:1px solid #26262B;color:#8A8A92;font-size:12px;line-height:1.7;">
        ${STUDIO.address}
      </div>
    </div>
  </div>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid #26262B;color:#8A8A92;font-size:12px;letter-spacing:1px;text-transform:uppercase;width:40%;">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid #26262B;color:#F4F4F0;font-size:15px;font-weight:600;">${value}</td>
  </tr>`;
}

export async function sendWelcomeEmail(data: { name: string; email: string }) {
  const inner = `
    <div style="font-size:12px;letter-spacing:3px;color:${VOLT};text-transform:uppercase;">Welcome to the studio</div>
    <h1 style="font-size:28px;margin:10px 0 6px;color:#fff;">Let's move, ${data.name}.</h1>
    <p style="color:#b9b9c0;font-size:15px;line-height:1.7;">
      Your PULSE account is live. Browse the schedule, grab a membership, and book your first class —
      your first session sets the tone for the next twelve weeks.
    </p>`;
  return send({ to: data.email, subject: 'Welcome to PULSE', html: shell(inner) });
}

export async function sendBookingConfirmation(data: {
  name: string;
  email: string;
  className: string;
  instructor: string;
  when: string;
  room?: string | null;
  waitlisted: boolean;
}) {
  const inner = data.waitlisted
    ? `
    <div style="font-size:12px;letter-spacing:3px;color:#FF5C2B;text-transform:uppercase;">Waitlist</div>
    <h1 style="font-size:26px;margin:10px 0 6px;color:#fff;">You're on the list, ${data.name}.</h1>
    <p style="color:#b9b9c0;font-size:15px;line-height:1.7;">Class is full right now — if a spot opens you'll be moved in automatically and we'll email you.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:14px;">
      ${row('Class', data.className)}${row('Coach', data.instructor)}${row('When', data.when)}
    </table>`
    : `
    <div style="font-size:12px;letter-spacing:3px;color:${VOLT};text-transform:uppercase;">Booking confirmed</div>
    <h1 style="font-size:26px;margin:10px 0 6px;color:#fff;">You're in, ${data.name}.</h1>
    <table style="width:100%;border-collapse:collapse;margin-top:14px;">
      ${row('Class', data.className)}${row('Coach', data.instructor)}${row('When', data.when)}${data.room ? row('Room', data.room) : ''}
    </table>
    <p style="color:#b9b9c0;font-size:14px;line-height:1.7;margin-top:18px;">Arrive 10 minutes early. Bring water. Bring intent.</p>`;
  return send({
    to: data.email,
    subject: data.waitlisted ? `Waitlisted — ${data.className}` : `Booked — ${data.className}`,
    html: shell(inner),
  });
}

export async function sendWaitlistPromotion(data: {
  name: string;
  email: string;
  className: string;
  when: string;
}) {
  const inner = `
    <div style="font-size:12px;letter-spacing:3px;color:${VOLT};text-transform:uppercase;">Spot opened</div>
    <h1 style="font-size:26px;margin:10px 0 6px;color:#fff;">You're off the waitlist, ${data.name}.</h1>
    <p style="color:#b9b9c0;font-size:15px;line-height:1.7;">
      A spot opened in <strong style="color:#fff;">${data.className}</strong> (${data.when}) and it's yours. See you there.
    </p>`;
  return send({ to: data.email, subject: `You're in — ${data.className}`, html: shell(inner) });
}

export async function sendMembershipEmail(data: {
  name: string;
  email: string;
  plan: string;
  demo: boolean;
}) {
  const inner = `
    <div style="font-size:12px;letter-spacing:3px;color:${VOLT};text-transform:uppercase;">Membership active</div>
    <h1 style="font-size:26px;margin:10px 0 6px;color:#fff;">Welcome to ${data.plan}, ${data.name}.</h1>
    <p style="color:#b9b9c0;font-size:15px;line-height:1.7;">
      Your membership is live${data.demo ? ' (demo mode — no card charged)' : ''}. Book anything on the schedule — your spot is waiting.
    </p>`;
  return send({ to: data.email, subject: `Membership active — ${data.plan}`, html: shell(inner) });
}

export async function sendProgramEmail(data: {
  email: string;
  goalLabel: string;
  split: string;
  calories: number;
  proteinG: number;
  html: string;
}) {
  const inner = `
    <div style="font-size:12px;letter-spacing:3px;color:${VOLT};text-transform:uppercase;">Your 12-week program</div>
    <h1 style="font-size:26px;margin:10px 0 6px;color:#fff;">${data.goalLabel} — ${data.split}</h1>
    <p style="color:#b9b9c0;font-size:15px;line-height:1.7;">
      Daily target: <strong style="color:${VOLT};">${data.calories} kcal</strong> · <strong style="color:${VOLT};">${data.proteinG}g protein</strong>.
      Your full plan is below. Save this email — week 1 starts now.
    </p>
    ${data.html}`;
  return send({ to: data.email, subject: 'Your PULSE 12-week program', html: shell(inner) });
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const inner = `
    <div style="font-size:12px;letter-spacing:3px;color:${VOLT};text-transform:uppercase;">New message</div>
    <h1 style="font-size:24px;margin:10px 0 14px;color:#fff;">${data.subject}</h1>
    <table style="width:100%;border-collapse:collapse;">${row('From', data.name)}${row('Email', data.email)}</table>
    <p style="color:#F4F4F0;font-size:15px;line-height:1.7;margin-top:16px;white-space:pre-wrap;">${data.message}</p>`;
  return send({ to: env.studioEmail, subject: `Contact form: ${data.subject}`, html: shell(inner) });
}

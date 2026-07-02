import { Resend } from 'resend';
import { env } from './env';

/** Null when unconfigured — email service degrades to console logging. */
export const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;
export const emailConfigured = Boolean(env.resendApiKey);

export default resend;

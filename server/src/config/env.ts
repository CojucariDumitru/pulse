import dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback = ''): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : fallback;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProd: optional('NODE_ENV', 'development') === 'production',
  port: parseInt(optional('PORT', '5060'), 10),

  databaseUrl: required('DATABASE_URL'),

  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),

  stripe: {
    secretKey: optional('STRIPE_SECRET_KEY'),
    publishableKey: optional('STRIPE_PUBLISHABLE_KEY'),
    webhookSecret: optional('STRIPE_WEBHOOK_SECRET'),
    priceEssential: optional('STRIPE_PRICE_ESSENTIAL'),
    priceUnlimited: optional('STRIPE_PRICE_UNLIMITED'),
    priceAnnual: optional('STRIPE_PRICE_ANNUAL'),
  },

  resendApiKey: optional('RESEND_API_KEY'),
  emailFrom: optional('EMAIL_FROM', 'hello@pulsestudio.app'),
  studioEmail: optional('STUDIO_EMAIL', 'hello@pulsestudio.app'),
  emailDemoTo: optional('EMAIL_DEMO_TO', 'waxent@sasuke.ru'),

  cloudinary: {
    cloudName: optional('CLOUDINARY_CLOUD_NAME'),
    apiKey: optional('CLOUDINARY_API_KEY'),
    apiSecret: optional('CLOUDINARY_API_SECRET'),
  },

  geminiApiKey: optional('GEMINI_API_KEY'),

  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),

  adminEmail: optional('ADMIN_EMAIL', 'admin@pulsestudio.app'),
  adminPassword: optional('ADMIN_PASSWORD', 'Pulse2024!'),
};

export const allowedOrigins = env.clientUrl
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

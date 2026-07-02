import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import { env, allowedOrigins } from './config/env';
import { apiLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { asyncHandler } from './utils/asyncHandler';
import { webhook } from './controllers/membership.controller';
import routes from './routes';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  }),
);

// Stripe webhook needs the raw body for signature verification — mount
// BEFORE express.json().
app.post(
  '/api/memberships/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(webhook),
);

app.use(express.json({ limit: '2mb' }));

if (!env.isProd) {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'pulse-api', time: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({ name: 'PULSE API', tagline: 'Find your rhythm.', health: '/api/health' });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`⚡ PULSE API running on port ${env.port} [${env.nodeEnv}]`);
});

const shutdown = (signal: string) => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received — shutting down.`);
  server.close(() => process.exit(0));
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;

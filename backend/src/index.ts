import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env, assertEnv } from './env';
import { googleAuthHandler, authMiddleware } from './auth';
import { exercisesRouter } from './routes/exercises';
import { metricsRouter } from './routes/metrics';

async function start() {
  assertEnv();
  await mongoose.connect(env.MONGODB_URI);
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_, res) => res.json({ ok: true }));
  app.post('/auth/google', googleAuthHandler);
  app.use('/exercises', authMiddleware, exercisesRouter);
  app.use('/metrics', authMiddleware, metricsRouter);

  app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

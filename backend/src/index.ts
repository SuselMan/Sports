import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { env, assertEnv } from './env';
import { googleAuthHandler, authMiddleware } from './auth';
import { exercisesRouter } from './routes/exercises';
import { metricsRouter } from './routes/metrics';
import { backendBuildNumber } from './version';

async function start() {
  assertEnv();
  await mongoose.connect(env.MONGODB_URI);
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  const jsonVersion = (_: express.Request, res: express.Response) =>
    res.json({ backendBuild: backendBuildNumber });
  const jsonHealth = (_: express.Request, res: express.Response) =>
    res.json({ ok: true, backendBuild: backendBuildNumber });

  app.get('/health', jsonHealth);
  app.get('/version', jsonVersion);
  app.get('/api/health', jsonHealth);
  app.get('/api/version', jsonVersion);
  app.post('/auth/google', googleAuthHandler);
  app.post('/api/auth/google', googleAuthHandler);
  app.use('/exercises', authMiddleware, exercisesRouter);
  app.use('/api/exercises', authMiddleware, exercisesRouter);
  app.use('/metrics', authMiddleware, metricsRouter);
  app.use('/api/metrics', authMiddleware, metricsRouter);

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

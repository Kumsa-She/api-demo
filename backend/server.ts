import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import database, { healthCheck } from './config/db';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);

app.get('/', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Backend is running successfully', port });
});

app.get('/health', async (req: Request, res: Response) => {
  const healthy = await healthCheck();
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? 'ok' : 'unhealthy' });
});

let server: http.Server | null = null;
let isShuttingDown = false;
let shutdownPromise: Promise<void> | null = null;

const shutdown = (code: number): Promise<void> => {
  if (shutdownPromise) {
    return shutdownPromise;
  }

  isShuttingDown = true;
  shutdownPromise = new Promise<void>((resolve) => {
    const closeServer = (): void => {
      if (!server || !server.listening) {
        resolve();
        return;
      }

      server.close((error) => {
        if (error) {
          console.log('HTTP server close failed', error);
        }
        resolve();
      });
    };

    closeServer();
  }).then(async () => {
    try {
      await database.disconnect();
    } catch (error) {
      console.log('MongoDB disconnect failed', error);
      process.exitCode = 1;
    }

    process.exitCode = code;
  });

  setTimeout(() => {
    if (isShuttingDown) {
      console.log('Shutdown timeout reached');
      process.exit(1);
    }
  }, 10000).unref();

  return shutdownPromise;
};

async function startServer(): Promise<http.Server> {
  await database.connectToDatabase();
  server = http.createServer(app);

  await new Promise<void>((resolve, reject) => {
    server!.once('error', reject);
    server!.listen(port, resolve);
  });

  console.log(`Server running on http://localhost:${port}`);
  return server;
}

process.on('SIGINT', () => {
  void shutdown(0);
});
process.on('SIGTERM', () => {
  void shutdown(0);
});
process.on('uncaughtException', (error) => {
  console.log('Uncaught exception', error);
  void shutdown(1);
});
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled rejection', reason);
  void shutdown(1);
});

export { app, startServer, shutdown };

if (require.main === module) {
  void startServer().catch(async (error) => {
    console.log('Failed to start server', error);
    await database.disconnect().catch(() => undefined);
    process.exitCode = 1;
  });
}

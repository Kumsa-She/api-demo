import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './config/db';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Backend is running successfully', port });
});

let server: http.Server | null = null;

async function startServer(): Promise<http.Server> {
  await database.connectToDatabase();

  server = http.createServer(app);

  await new Promise<void>((resolve, reject) => {
    server!.listen(port);
    server!.once('listening', () => {
      console.log(`Server running on http://localhost:${port}`);
      resolve();
    });
    server!.once('error', (err) => reject(err));
  });

  const shutdown = async (code = 0): Promise<void> => {
    console.log('Shutting down server...');

    if (server) {
      await new Promise<void>((resolve) => {
        server!.close((err) => {
          if (err) console.error('Error closing server:', err);
          resolve();
        });
      });
    }

    try {
      await database.disconnect();
    } catch (err) {
      console.error('Error during DB disconnect:', err);
    }

    process.exit(code);
  };

  const handleFatalError = (err: any): void => {
    console.error('Fatal error, shutting down:', err);
    void shutdown(1);
  };

  process.on('SIGINT', () => void shutdown(0));
  process.on('SIGTERM', () => void shutdown(0));
  process.on('uncaughtException', handleFatalError);
  process.on('unhandledRejection', (reason) => handleFatalError(reason));

  return server;
}

export { app, startServer };

if (require.main === module) {
  void startServer().catch(async (err) => {
    console.error('Failed to start server:', err);
    await database.disconnect().catch(() => {});
    process.exit(1);
  });
}

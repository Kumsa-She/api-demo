import http from 'http';
import database from './config/db';
import { app, port } from './app';
import { shutdown } from './shutdown';

export let server: http.Server | null = null;

async function startServer(): Promise<http.Server> {
  // Require the database before accepting requests.
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
  // Signals represent normal termination.
  void shutdown(server, 0);
});
process.on('SIGTERM', () => {
  void shutdown(server, 0);
});
process.on('uncaughtException', (error) => {
  console.log('Uncaught exception', error);
  // Unexpected errors require a failure exit code.
  void shutdown(server, 1);
});
process.on('unhandledRejection', (reason) => {
  console.log('Unhandled rejection', reason);
  void shutdown(server, 1);
});

export { startServer };

if (require.main === module) {
  // Avoid starting when imported by tests.
  void startServer().catch(async (error) => {
    console.log('Failed to start server', error);
    await database.disconnect().catch(() => undefined);
    process.exitCode = 1;
  });
}

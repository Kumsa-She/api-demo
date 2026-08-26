import http from 'http';
import database from './config/db';

let isShuttingDown = false;
let shutdownPromise: Promise<void> | null = null;

const shutdown = (
  server: http.Server | null,
  code: number,
): Promise<void> => {
  // Prevent duplicate cleanup work.
  if (shutdownPromise) {
    return shutdownPromise;
  }

  isShuttingDown = true;
  shutdownPromise = new Promise<void>((resolve) => {
    const closeServer = (): void => {
      // Startup may have failed before listening.
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
      // Stop requests before closing the database.
      await database.disconnect();
    } catch (error) {
      console.log('MongoDB disconnect failed', error);
      process.exitCode = 1;
    }

    process.exitCode = code;
  });

  setTimeout(() => {
    if (isShuttingDown) {
      // Prevent shutdown from hanging forever.
      console.log('Shutdown timeout reached');
      process.exit(1);
    }
  }, 10000).unref();

  return shutdownPromise;
};

export { shutdown };
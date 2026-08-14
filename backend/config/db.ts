import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the .env file.');
}

let client: MongoClient | null = null;
let db: Db | null = null;
let connectionPromise: Promise<MongoClient> | null = null;

// Pool and timeout settings tuned for higher concurrency.
const mongoOptions: MongoClientOptions = {
  // Increase pool size to allow more concurrent operations per process.
  maxPoolSize: process.env.MONGO_MAX_POOL_SIZE
    ? Number(process.env.MONGO_MAX_POOL_SIZE)
    : 200,
  minPoolSize: process.env.MONGO_MIN_POOL_SIZE
    ? Number(process.env.MONGO_MIN_POOL_SIZE)
    : 10,
  // How long to wait for a connection to become available from the pool
  waitQueueTimeoutMS: 5000,
  // Keep sockets alive to reduce churn
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  maxIdleTimeMS: 300000,
  retryWrites: true,
  // use TLS by default for secure connections
  tls: true,
  appName: 'api-demo-backend',
};

const createMongoClient = (): MongoClient => {
  const client = new MongoClient(DATABASE_URL, mongoOptions);

  // Basic connection pool events for observability in production logs.

  try {
    client.on('connectionPoolCreated', (evt) => {
      console.info('MongoDB pool created', evt);
    });
    client.on('connectionCreated', (evt) => {});
    client.on('connectionClosed', (evt) => {
      console.info('MongoDB connection closed', evt);
    });
    client.on('connectionCheckOutStarted', () => {
      // fired when an operation starts to wait for a connection
    });
  } catch (e) {
    // If the driver doesn't support an event in a specific version, ignore.
  }

  return client;
};

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      let attempt = 0;

      while (attempt < 5) {
        try {
          const mongoClient = createMongoClient();
          await mongoClient.connect();

          client = mongoClient;
          db = mongoClient.db();

          console.log('MongoDB connected successfully');
          return mongoClient;
        } catch (error) {
          attempt += 1;
          const delayMs = Math.min(1000 * attempt * 2, 10000);

          console.error(
            `MongoDB connection attempt ${attempt}/5 failed:`,
            error,
          );

          if (attempt >= 5) {
            throw new Error('MongoDB connection failed after multiple retries');
          }

          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }

      throw new Error('MongoDB connection failed unexpectedly');
    })();
  }

  await connectionPromise;

  if (!db) {
    throw new Error('MongoDB database instance is not available');
  }

  return db;
}

export async function disconnect(): Promise<void> {
  if (!client) {
    return;
  }

  try {
    await client.close();
    console.log('MongoDB disconnected successfully');
  } finally {
    client = null;
    db = null;
    connectionPromise = null;
  }
}

const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`Received ${signal}. Shutting down MongoDB connection...`);

  await disconnect();
  process.exit(0);
};

process.on('SIGINT', () => {
  void gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void gracefulShutdown('SIGTERM');
});

const database = {
  connectToDatabase,
  disconnect,
  getClient: () => client,
  getDb: () => db,
};

export default database;

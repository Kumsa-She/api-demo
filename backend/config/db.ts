import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL ?? '';

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required.');
}

const parsePoolSize = (value: string | undefined, fallback: number): number => {
  const poolSize = value ? Number(value) : fallback;
  return Number.isInteger(poolSize) && poolSize > 0 ? poolSize : fallback;
};

const mongoOptions: MongoClientOptions = {
  maxPoolSize: 200,
  minPoolSize: parsePoolSize(process.env.MONGO_MIN_POOL_SIZE, 10),
  waitQueueTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxIdleTimeMS: 300000,
  retryWrites: true,
  tls: true,
  appName: 'api-demo-backend',
};

class Database {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connectionPromise: Promise<Db> | null = null;

  async connect(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    if (!this.connectionPromise) {
      this.connectionPromise = this.connectWithRetry().catch((error) => {
        this.connectionPromise = null;
        throw error;
      });
    }

    return this.connectionPromise;
  }

  connectToDatabase(): Promise<Db> {
    return this.connect();
  }

  private async connectWithRetry(): Promise<Db> {
    const maxAttempts = 5;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const client = new MongoClient(DATABASE_URL, mongoOptions);

      try {
        await client.connect();
        this.client = client;
        this.db = client.db();
        console.log('MongoDB connected successfully');
        return this.db;
      } catch (error) {
        await client.close().catch(() => undefined);
        console.log(
          `MongoDB connection attempt ${attempt}/${maxAttempts} failed`,
          error,
        );

        if (attempt === maxAttempts) {
          throw new Error('MongoDB connection failed after multiple retries');
        }

        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(attempt * 2000, 10000)),
        );
      }
    }

    throw new Error('MongoDB connection failed unexpectedly');
  }

  async healthCheck(): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    try {
      await this.db.command({ ping: 1 });
      return true;
    } catch (error) {
      console.log('MongoDB health check failed', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connectionPromise && !this.db) {
      await this.connectionPromise.catch(() => undefined);
    }

    const client = this.client;
    this.client = null;
    this.db = null;
    this.connectionPromise = null;

    if (client) {
      await client.close();
      console.log('MongoDB disconnected successfully');
    }
  }

  getClient(): MongoClient | null {
    return this.client;
  }

  getDb(): Db | null {
    return this.db;
  }
}

const database = new Database();

export const connectToDatabase = (): Promise<Db> => database.connect();
export const healthCheck = (): Promise<boolean> => database.healthCheck();
export const disconnect = (): Promise<void> => database.disconnect();
export const getClient = (): MongoClient | null => database.getClient();
export const getDb = (): Db | null => database.getDb();

export { Database };
export default database;

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { healthCheck } from './config/db';
import productRouter from './routes/product.routes';
import errorRouter from './routes/error.routes';

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
app.use('/api/products', productRouter);
app.use('/api/error', errorRouter);

app.get('/', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Backend is running successfully', port });
});

app.get('/health', async (req: Request, res: Response) => {
  const healthy = await healthCheck();
  // Signal dependency failures to monitors.
  res
    .status(healthy ? 200 : 503)
    .json({ status: healthy ? 'ok' : 'unhealthy' });
});

export { app, port };

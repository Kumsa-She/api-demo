import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Backend is running successfully',
    port,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

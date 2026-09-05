import { Request, Response } from 'express';

const simulateServerError = (req: Request, res: Response): void => {
  try {
    throw new Error('Simulated server error');
  } catch (error) {
    console.error('Simulated server error:', error);
    res.status(500).json({ success: false, error: 'server error' });
  }
};

const simulateNotFoundError = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, error: 'resource not found' });
};

const simulateBadRequestError = (req: Request, res: Response): void => {
  res.status(400).json({ success: false, error: 'bad request' });
};

const simulateUnauthorizedError = (req: Request, res: Response): void => {
  res.status(401).json({ success: false, error: 'unauthorized' });
};

const simulateForbiddenError = (req: Request, res: Response): void => {
  res.status(403).json({ success: false, error: 'forbidden' });
};

const simulateSlowResponse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  res.status(200).json({ success: true, message: 'slow response' });
};

export {
  simulateBadRequestError,
  simulateForbiddenError,
  simulateNotFoundError,
  simulateServerError,
  simulateSlowResponse,
  simulateUnauthorizedError,
};

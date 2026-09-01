import { Request, Response, NextFunction } from 'express';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const validateProduct = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { name, price, category, stock, description } = req.body ?? {};

  if (!isNonEmptyString(name)) {
    res.status(400).json({ success: false, error: 'name is required' });
    return;
  }

  const priceNum = Number(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    res.status(400).json({ success: false, error: 'price must be positive' });
    return;
  }
  req.body.price = priceNum;

  if (!isNonEmptyString(category)) {
    res.status(400).json({ success: false, error: 'category is required' });
    return;
  }

  const stockNum = Number(stock);
  if (!Number.isFinite(stockNum) || stockNum < 0) {
    res
      .status(400)
      .json({ success: false, error: 'stock must be non-negative' });
    return;
  }
  req.body.stock = stockNum;

  if (description !== undefined && typeof description !== 'string') {
    res
      .status(400)
      .json({ success: false, error: 'description must be a string' });
    return;
  }

  next();
};

export { validateProduct };

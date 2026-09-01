import { Request, Response } from 'express';
import database from '../config/db';
import { Product, getProductCollection } from '../models/Product';

const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await database.connectToDatabase();
    const product: Product = {
      name: req.body.name.trim(),
      price: req.body.price,
      category: req.body.category.trim(),
      stock: req.body.stock,
      description: req.body.description,
      imageUrl: (req.file as any)?.filename,
      createdAt: new Date(),
    };

    const result = await getProductCollection(db).insertOne(product);
    res.status(201).json({
      success: true,
      data: { ...product, _id: result.insertedId },
    });
  } catch (error) {
    console.log('Product creation failed', error);
    res.status(500).json({ success: false, error: 'server error' });
  }
};

export { createProduct };

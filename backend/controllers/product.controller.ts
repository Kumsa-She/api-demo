import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
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

const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await database.connectToDatabase();
    const products = await getProductCollection(db)
      .find(
        {},
        {
          projection: {
            _id: 1,
            name: 1,
            price: 1,
            category: 1,
            stock: 1,
            description: 1,
            imageUrl: 1,
            createdAt: 1,
          },
        },
      )
      .sort({ createdAt: -1 })
      .toArray();

    if (products.length === 0) {
      res.status(404).json({ success: false, error: 'no products found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    console.log('Fetching products failed', error);
    res.status(500).json({ success: false, error: 'server error' });
  }
};

const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (
    typeof id !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(id) ||
    !ObjectId.isValid(id)
  ) {
    res.status(400).json({ success: false, error: 'invalid product id' });
    return;
  }

  try {
    const db = await database.connectToDatabase();
    const product = await getProductCollection(db).findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          _id: 1,
          name: 1,
          price: 1,
          category: 1,
          stock: 1,
          description: 1,
          imageUrl: 1,
          createdAt: 1,
        },
      },
    );

    if (!product) {
      res.status(404).json({ success: false, error: 'product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log('Fetching product failed', error);
    res.status(500).json({ success: false, error: 'server error' });
  }
};

export { createProduct, getAllProducts, getProductById };

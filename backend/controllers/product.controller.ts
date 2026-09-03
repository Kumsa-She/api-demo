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

const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (
    typeof id !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(id) ||
    !ObjectId.isValid(id)
  ) {
    res.status(400).json({ success: false, error: 'invalid product id' });
    return;
  }

  const body = req.body ?? {};
  const update: Partial<
    Pick<Product, 'name' | 'price' | 'category' | 'stock' | 'description'>
  > = {};

  if ('name' in body) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      res
        .status(400)
        .json({ success: false, error: 'name must be a non-empty string' });
      return;
    }
    update.name = body.name.trim();
  }

  if ('price' in body) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      res.status(400).json({ success: false, error: 'price must be positive' });
      return;
    }
    update.price = price;
  }

  if ('category' in body) {
    if (
      typeof body.category !== 'string' ||
      body.category.trim().length === 0
    ) {
      res
        .status(400)
        .json({ success: false, error: 'category must be a non-empty string' });
      return;
    }
    update.category = body.category.trim();
  }

  if ('stock' in body) {
    const stock = Number(body.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      res
        .status(400)
        .json({ success: false, error: 'stock must be non-negative' });
      return;
    }
    update.stock = stock;
  }

  if ('description' in body) {
    if (typeof body.description !== 'string') {
      res
        .status(400)
        .json({ success: false, error: 'description must be a string' });
      return;
    }
    update.description = body.description;
  }

  if (Object.keys(update).length === 0) {
    res
      .status(400)
      .json({ success: false, error: 'no valid fields to update' });
    return;
  }

  try {
    const db = await database.connectToDatabase();
    const result = await getProductCollection(db).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      {
        returnDocument: 'after',
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

    if (!result) {
      res.status(404).json({ success: false, error: 'product not found' });
      return;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.log('Updating product failed', error);
    res.status(500).json({ success: false, error: 'server error' });
  }
};

export { createProduct, getAllProducts, getProductById, updateProduct };

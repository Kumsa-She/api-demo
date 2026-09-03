import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import database from '../config/db';
import { Product, getProductCollection } from '../models/Product';

const productProjection = {
  _id: 1,
  name: 1,
  price: 1,
  category: 1,
  stock: 1,
  description: 1,
  imageUrl: 1,
  createdAt: 1,
};

const getProducts = async () =>
  getProductCollection(await database.connectToDatabase());

const sendBadRequest = (res: Response, error: string): void => {
  res.status(400).json({ success: false, error });
};

const sendNotFound = (res: Response, error = 'product not found'): void => {
  res.status(404).json({ success: false, error });
};

const sendServerError = (
  res: Response,
  message: string,
  error: unknown,
): void => {
  console.log(message, error);
  res.status(500).json({ success: false, error: 'server error' });
};

const getProductId = (req: Request, res: Response): ObjectId | null => {
  const { id } = req.params;

  if (
    typeof id !== 'string' ||
    !/^[0-9a-fA-F]{24}$/.test(id) ||
    !ObjectId.isValid(id)
  ) {
    sendBadRequest(res, 'invalid product id');
    return null;
  }

  return new ObjectId(id);
};

const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product: Product = {
      name: req.body.name.trim(),
      price: req.body.price,
      category: req.body.category.trim(),
      stock: req.body.stock,
      description: req.body.description,
      imageUrl: (req.file as any)?.filename,
      createdAt: new Date(),
    };

    const result = await (await getProducts()).insertOne(product);
    res.status(201).json({
      success: true,
      data: { ...product, _id: result.insertedId },
    });
  } catch (error) {
    sendServerError(res, 'Product creation failed', error);
  }
};

const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await (
      await getProducts()
    )
      .find(
        {},
        {
          projection: productProjection,
        },
      )
      .sort({ createdAt: -1 })
      .toArray();

    if (products.length === 0) {
      sendNotFound(res, 'no products found');
      return;
    }

    res.status(200).json({
      success: true,
      data: products,
      count: products.length,
    });
  } catch (error) {
    sendServerError(res, 'Fetching products failed', error);
  }
};

const getProductById = async (req: Request, res: Response): Promise<void> => {
  const productId = getProductId(req, res);
  if (!productId) {
    return;
  }

  try {
    const product = await (
      await getProducts()
    ).findOne(
      { _id: productId },
      {
        projection: productProjection,
      },
    );

    if (!product) {
      sendNotFound(res);
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    sendServerError(res, 'Fetching product failed', error);
  }
};

const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const productId = getProductId(req, res);
  if (!productId) {
    return;
  }

  const body = req.body ?? {};
  const update: Partial<
    Pick<Product, 'name' | 'price' | 'category' | 'stock' | 'description'>
  > = {};

  if ('name' in body) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      sendBadRequest(res, 'name must be a non-empty string');
      return;
    }
    update.name = body.name.trim();
  }

  if ('price' in body) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      sendBadRequest(res, 'price must be positive');
      return;
    }
    update.price = price;
  }

  if ('category' in body) {
    if (
      typeof body.category !== 'string' ||
      body.category.trim().length === 0
    ) {
      sendBadRequest(res, 'category must be a non-empty string');
      return;
    }
    update.category = body.category.trim();
  }

  if ('stock' in body) {
    const stock = Number(body.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      sendBadRequest(res, 'stock must be non-negative');
      return;
    }
    update.stock = stock;
  }

  if ('description' in body) {
    if (typeof body.description !== 'string') {
      sendBadRequest(res, 'description must be a string');
      return;
    }
    update.description = body.description;
  }

  if (Object.keys(update).length === 0) {
    sendBadRequest(res, 'no valid fields to update');
    return;
  }

  try {
    const result = await (
      await getProducts()
    ).findOneAndUpdate(
      { _id: productId },
      { $set: update },
      {
        returnDocument: 'after',
        projection: productProjection,
      },
    );

    if (!result) {
      sendNotFound(res);
      return;
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    sendServerError(res, 'Updating product failed', error);
  }
};

const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const productId = getProductId(req, res);
  if (!productId) {
    return;
  }

  try {
    const product = await (
      await getProducts()
    ).findOneAndDelete({
      _id: productId,
    });

    if (!product) {
      sendNotFound(res);
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    sendServerError(res, 'Deleting product failed', error);
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

import { Collection, Db, ObjectId } from 'mongodb';

export interface Product {
  _id?: ObjectId;
  name: string;
  price: number;
  category: string;
  stock: number;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
}

export const ProductCollection = 'products';

export const getProductCollection = (db: Db): Collection<Product> =>
  db.collection<Product>(ProductCollection);
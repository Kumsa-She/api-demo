import { connectToDatabase, disconnect } from '../config/db';
import { getProductCollection, Product } from '../models/Product';

const seedProducts = async (): Promise<void> => {
  try {
    const db = await connectToDatabase();
    const products = getProductCollection(db);
    const productCount = await products.countDocuments();

    if (productCount > 0) {
      console.log('Products already exist. No products were inserted.');
      return;
    }

    const demoProducts: Product[] = [
      {
        name: 'Wireless Headphones',
        price: 79.99,
        category: 'electronics',
        stock: 25,
        description: 'Bluetooth over-ear headphones with noise cancellation.',
        createdAt: new Date(),
      },
      {
        name: 'USB-C Charging Hub',
        price: 34.99,
        category: 'electronics',
        stock: 40,
        description: 'Compact hub with USB-C, USB-A, and HDMI ports.',
        createdAt: new Date(),
      },
      {
        name: 'Ergonomic Desk Chair',
        price: 189.99,
        category: 'furniture',
        stock: 12,
        description: 'Adjustable office chair with lumbar support.',
        createdAt: new Date(),
      },
      {
        name: 'Bamboo Writing Desk',
        price: 249.99,
        category: 'furniture',
        stock: 8,
        description: 'Minimal writing desk made from sustainable bamboo.',
        createdAt: new Date(),
      },
      {
        name: 'Hardcover Notebook',
        price: 12.99,
        category: 'stationery',
        stock: 60,
        description: 'Ruled hardcover notebook for everyday notes.',
        createdAt: new Date(),
      },
    ];

    await products.insertMany(demoProducts);
    console.log('Inserted 5 demo products.');
  } finally {
    await disconnect();
  }
};

seedProducts().catch((error: unknown) => {
  console.error('Product seeding failed:', error);
  process.exitCode = 1;
});

import type { Endpoint } from './types';

export const endpoints: Endpoint[] = [
  {
    id: 'products-list',
    method: 'GET',
    path: '/api/products',
    description: 'Fetch all products from the catalog.',
    exampleHeaders: { Accept: 'application/json' },
  },
  {
    id: 'product-create',
    method: 'POST',
    path: '/api/products',
    description: 'Create a new product in the catalog.',
    exampleHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    exampleBody: JSON.stringify(
      {
        name: 'Wireless Keyboard',
        price: 79.99,
        category: 'Accessories',
        stock: 25,
        description: 'Compact wireless keyboard',
      },
      null,
      2,
    ),
  },
  {
    id: 'product-detail',
    method: 'GET',
    path: '/api/products/:id',
    description: 'Fetch a single product by its ID.',
    exampleHeaders: { Accept: 'application/json' },
  },
  {
    id: 'product-update',
    method: 'PUT',
    path: '/api/products/:id',
    description: 'Update an existing product by its ID.',
    exampleHeaders: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    exampleBody: JSON.stringify(
      {
        name: 'Wireless Keyboard Pro',
        price: 89.99,
        stock: 18,
      },
      null,
      2,
    ),
  },
  {
    id: 'product-delete',
    method: 'DELETE',
    path: '/api/products/:id',
    description: 'Delete a product from the catalog.',
    exampleHeaders: { Accept: 'application/json' },
  },
  {
    id: 'health-check',
    method: 'GET',
    path: '/health',
    description: 'Check whether the API service is available.',
    exampleHeaders: { Accept: 'application/json' },
  },
];

export const methodStyles: Record<Endpoint['method'], string> = {
  GET: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400',
  POST: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
  PUT: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400',
  DELETE:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400',
};

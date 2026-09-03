import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from '../controllers/product.controller';
import { validateProduct } from '../middleware/validateProduct';
import { upload, handleUploadError } from '../middleware/upload';

const productRouter = Router();

productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);
productRouter.put('/:id', updateProduct);

productRouter.post(
  '/',
  upload.single('image'),
  handleUploadError,
  validateProduct,
  createProduct,
);

export default productRouter;

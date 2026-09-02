import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
} from '../controllers/product.controller';
import { validateProduct } from '../middleware/validateProduct';
import { upload, handleUploadError } from '../middleware/upload';

const productRouter = Router();

productRouter.get('/', getAllProducts);
productRouter.get('/:id', getProductById);

productRouter.post(
  '/',
  upload.single('image'),
  handleUploadError,
  validateProduct,
  createProduct,
);

export default productRouter;

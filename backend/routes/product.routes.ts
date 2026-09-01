import { Router } from 'express';
import { createProduct } from '../controllers/product.controller';
import { validateProduct } from '../middleware/validateProduct';
import { upload, handleUploadError } from '../middleware/upload';

const productRouter = Router();

productRouter.post(
  '/',
  upload.single('image'),
  handleUploadError,
  validateProduct,
  createProduct,
);

export default productRouter;

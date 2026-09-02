import multer from 'multer';
import path from 'path';
import { NextFunction, Request, Response } from 'express';

// Store uploaded images with timestamp-based filenames.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only jpg, png, webp are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1.5 * 1024 * 1024,
  },
});

// Convert Multer failures into the API error response format.
const handleUploadError = (
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const err = error as any;
  if (err?.code === 'LIMIT_FILE_SIZE') {
    res
      .status(400)
      .json({ success: false, error: 'image must be less than 1.5MB' });
    return;
  }
  if (err?.message?.includes('Invalid file type')) {
    res.status(400).json({ success: false, error: err.message });
    return;
  }
  if (err?.code === 'LIMIT_UNEXPECTED_FILE') {
    res.status(400).json({
      success: false,
      error: 'Unexpected field. Use "image" field for file.',
    });
    return;
  }
  next(error);
};

export { upload, handleUploadError };

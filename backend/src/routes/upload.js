import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/uploadController.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Multer memory buffer configuration with a max file limit of 5MB
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.post('/', authMiddleware, upload.single('image'), uploadImage);

export default router;

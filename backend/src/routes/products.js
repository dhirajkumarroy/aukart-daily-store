import { Router } from 'express';
import multer from 'multer';
import { 
  getProducts, 
  getProductBySlug, 
  getCategories, 
  logClick, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  restoreProduct,
  hardDeleteProduct
} from '../controllers/productController.js';
import { 
  downloadTemplate, 
  importProductsBulk 
} from '../controllers/bulkImportController.js';
import authMiddleware from '../middleware/auth.js';
import { publicLimiter, clickLimiter } from '../middleware/rateLimiter.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

// Public routes (Rate limited to avoid abuse)
router.get('/', publicLimiter, getProducts);
router.get('/categories', publicLimiter, getCategories);
router.get('/import/template', downloadTemplate);
router.get('/:slug', publicLimiter, getProductBySlug);
router.post('/click/:slug', clickLimiter, logClick);

// Admin routes (Secured via JWT token authentication)
router.post('/', authMiddleware, createProduct);
router.post('/import', authMiddleware, upload.single('file'), importProductsBulk);
router.put('/:id', authMiddleware, updateProduct);
router.put('/:id/restore', authMiddleware, restoreProduct);
router.delete('/:id/hard', authMiddleware, hardDeleteProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;

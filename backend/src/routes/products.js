import { Router } from 'express';
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
import authMiddleware from '../middleware/auth.js';
import { publicLimiter, clickLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes (Rate limited to avoid abuse)
router.get('/', publicLimiter, getProducts);
router.get('/categories', publicLimiter, getCategories);
router.get('/:slug', publicLimiter, getProductBySlug);
router.post('/click/:slug', clickLimiter, logClick);

// Admin routes (Secured via JWT token authentication)
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.put('/:id/restore', authMiddleware, restoreProduct);
router.delete('/:id/hard', authMiddleware, hardDeleteProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;

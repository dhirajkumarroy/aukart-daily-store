import express from 'express';
import { 
  getCategories, 
  createCategory, 
  deleteCategory, 
  createSubcategory, 
  deleteSubcategory 
} from '../controllers/categoryController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getCategories);

// Admin-only routes (protected by authMiddleware)
router.post('/', authMiddleware, createCategory);
router.delete('/:id', authMiddleware, deleteCategory);
router.post('/subcategory', authMiddleware, createSubcategory);
router.delete('/subcategory/:id', authMiddleware, deleteSubcategory);

export default router;

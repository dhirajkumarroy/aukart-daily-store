import express from 'express';
import { 
  getPriceSegments, 
  createPriceSegment, 
  deletePriceSegment 
} from '../controllers/priceSegmentController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public route
router.get('/', getPriceSegments);

// Admin-only routes
router.post('/', authMiddleware, createPriceSegment);
router.delete('/:id', authMiddleware, deletePriceSegment);

export default router;

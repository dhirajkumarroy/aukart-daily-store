import prisma from '../utils/db.js';
import { z } from 'zod';

const priceSegmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  maxPrice: z.number().positive().optional().nullable(),
  type: z.enum(['price', 'top_deals', 'trending', 'top_rated', 'new_arrivals']).optional().default('price'),
  subtitle: z.string().optional().nullable(),
  badge: z.string().optional().nullable()
});

// Default seed fragments if empty (includes price, top deals, trending, top rated)
const DEFAULT_SEGMENTS = [
  { title: 'Under ₹99', maxPrice: 99, subtitle: 'Pocket Deals', badge: 'STEAL' },
  { title: 'Top Deals', maxPrice: null, subtitle: 'Special Discounts', badge: 'SAVE BIG' },
  { title: 'Trending Now', maxPrice: null, subtitle: 'Most Popular', badge: 'TRENDING' },
  { title: 'Top Rated', maxPrice: null, subtitle: '4+ Star Reviews', badge: 'BESTSELLER' }
];

// 1. GET /api/price-segments (Public)
export async function getPriceSegments(req, res, next) {
  try {
    if (!prisma.priceSegment) {
      return res.json(DEFAULT_SEGMENTS);
    }

    let segments = await prisma.priceSegment.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Seed defaults if empty
    if (segments.length === 0) {
      for (const seg of DEFAULT_SEGMENTS) {
        await prisma.priceSegment.create({
          data: {
            title: seg.title,
            maxPrice: seg.maxPrice || 0,
            subtitle: seg.subtitle,
            badge: seg.badge
          }
        }).catch(() => {});
      }
      segments = await prisma.priceSegment.findMany({
        orderBy: { createdAt: 'asc' }
      }).catch(() => DEFAULT_SEGMENTS);
    }

    res.json(segments);
  } catch (err) {
    console.error('Price segments query warning:', err.message);
    res.json(DEFAULT_SEGMENTS);
  }
}

// 2. POST /api/price-segments (Admin only)
export async function createPriceSegment(req, res, next) {
  try {
    const validated = priceSegmentSchema.parse(req.body);

    const created = await prisma.priceSegment.create({
      data: {
        title: validated.title,
        maxPrice: validated.maxPrice || 0,
        subtitle: validated.subtitle || null,
        badge: validated.badge || null
      }
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

// 3. DELETE /api/price-segments/:id (Admin only)
export async function deletePriceSegment(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.priceSegment.delete({
      where: { id }
    });
    res.json({ message: 'Price fragment deleted successfully' });
  } catch (err) {
    next(err);
  }
}

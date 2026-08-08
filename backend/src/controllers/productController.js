import prisma from '../utils/db.js';
import slugify from '../utils/slugify.js';
import { z } from 'zod';

// Product schema for validation
const productSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  price: z.string().min(1, 'Price is required'),
  originalPrice: z.string().optional().nullable(),
  discount: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional().nullable(),
  affiliateLink: z.string().url('Affiliate link must be a valid URL'),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewCount: z.number().int().nonnegative().optional().nullable(),
  featured: z.boolean().optional().default(false)
});

const updateProductSchema = productSchema.partial();

// 1. GET /api/products (Public)
export async function getProducts(req, res, next) {
  try {
    const { category, subcategory, search, featured } = req.query;

    const where = {};

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (subcategory) {
      where.subcategory = { equals: subcategory, mode: 'insensitive' };
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
}

// 2. GET /api/products/:slug (Public)
export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findUnique({
      where: { slug }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
}

// 3. GET /api/categories (Public)
export async function getCategories(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categories = products.map(p => p.category);
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

// 4. POST /api/click/:slug (Public)
export async function logClick(req, res, next) {
  try {
    const { slug } = req.params;
    const userAgent = req.headers['user-agent'] || null;
    const referrer = req.headers['referer'] || req.headers['referrer'] || null;

    // Find the product first
    const product = await prisma.product.findUnique({
      where: { slug }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Run transaction: increment count & log click
    await prisma.$transaction([
      prisma.product.update({
        where: { id: product.id },
        data: { clickCount: { increment: 1 } }
      }),
      prisma.click.create({
        data: {
          productId: product.id,
          userAgent,
          referrer
        }
      })
    ]);

    res.json({ affiliateLink: product.affiliateLink });
  } catch (error) {
    next(error);
  }
}

// 5. POST /api/products (Admin)
export async function createProduct(req, res, next) {
  try {
    const data = productSchema.parse(req.body);

    // Generate unique slug
    let baseSlug = data.slug ? slugify(data.slug) : slugify(data.title);
    if (!baseSlug) baseSlug = 'product';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.product.findUnique({
        where: { slug: uniqueSlug }
      });
      if (!existing) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProduct = await prisma.product.create({
      data: {
        ...data,
        slug: uniqueSlug
      }
    });

    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
}

// 6. PUT /api/products/:id (Admin)
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const data = updateProductSchema.parse(req.body);

    // If slug is modified, check constraints
    if (data.slug) {
      data.slug = slugify(data.slug);
      const existing = await prisma.product.findFirst({
        where: { slug: data.slug, NOT: { id } }
      });
      if (existing) {
        return res.status(409).json({ error: 'Slug already in use by another product' });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data
    });

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
}

// 7. DELETE /api/products/:id (Admin)
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id }
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
}

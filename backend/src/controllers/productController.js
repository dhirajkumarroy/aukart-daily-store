import prisma from '../utils/db.js';
import slugify from '../utils/slugify.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';
import { z } from 'zod';

// Product schema for validation
const productSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  imagePublicId: z.string().optional().nullable(),
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

// 1. GET /api/products (Public) - Only active (non-deleted) products
export async function getProducts(req, res, next) {
  try {
    const { category, subcategory, search, featured, maxPrice, minPrice, collection, includeDeleted } = req.query;

    const where = {};

    // By default, public queries only see non-deleted products
    if (includeDeleted !== 'true') {
      where.isDeleted = false;
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (subcategory) {
      where.subcategory = { equals: subcategory, mode: 'insensitive' };
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (featured === 'true' || collection === 'top_deals' || collection === 'featured') {
      where.featured = true;
    }

    if (collection === 'top_rated') {
      where.rating = { gte: 4.0 };
    }

    // Determine sorting
    let orderBy = { createdAt: 'desc' };
    if (collection === 'trending') {
      orderBy = { clickCount: 'desc' };
    } else if (collection === 'top_rated') {
      orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
    } else if (collection === 'new_arrivals') {
      orderBy = { createdAt: 'desc' };
    }

    let products = await prisma.product.findMany({
      where,
      orderBy
    });

    // Support price segment / budget store filtering (e.g. Under ₹99, Under ₹199)
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) {
        products = products.filter(p => {
          if (!p.price) return false;
          const num = parseFloat(String(p.price).replace(/[^0-9.]/g, ''));
          return !isNaN(num) && num <= max;
        });
      }
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) {
        products = products.filter(p => {
          if (!p.price) return false;
          const num = parseFloat(String(p.price).replace(/[^0-9.]/g, ''));
          return !isNaN(num) && num >= min;
        });
      }
    }

    res.json(products);
  } catch (error) {
    next(error);
  }
}

// 2. GET /api/products/:slug (Public)
export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const product = await prisma.product.findFirst({
      where: { 
        slug,
        isDeleted: false
      }
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
      where: { isDeleted: false },
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

    // Find active product
    const product = await prisma.product.findFirst({
      where: { 
        slug,
        isDeleted: false
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found or is no longer available' });
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
        slug: uniqueSlug,
        imagePublicId: data.imagePublicId || null,
        isDeleted: false,
        deletedAt: null
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

    // Fetch existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // If slug is modified, check constraints
    if (data.slug) {
      data.slug = slugify(data.slug);
      const duplicate = await prisma.product.findFirst({
        where: { slug: data.slug, NOT: { id } }
      });
      if (duplicate) {
        return res.status(409).json({ error: 'Slug already in use by another product' });
      }
    }

    // If image is being replaced with a different image, clean up old Cloudinary asset
    if (
      data.imagePublicId &&
      existingProduct.imagePublicId &&
      data.imagePublicId !== existingProduct.imagePublicId
    ) {
      console.log(`Product image changed. Deleting old Cloudinary image: ${existingProduct.imagePublicId}`);
      await deleteFromCloudinary(existingProduct.imagePublicId);
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

// 7. DELETE /api/products/:id (Admin - Soft Delete)
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const softDeleted = await prisma.product.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    res.json({ 
      message: 'Product moved to trash (soft deleted)', 
      product: softDeleted 
    });
  } catch (error) {
    next(error);
  }
}

// 8. PUT /api/products/:id/restore (Admin - Restore soft deleted product)
export async function restoreProduct(req, res, next) {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const restored = await prisma.product.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });

    res.json({ 
      message: 'Product restored successfully', 
      product: restored 
    });
  } catch (error) {
    next(error);
  }
}

// 9. DELETE /api/products/:id/hard (Admin - Permanent Delete from DB and Cloudinary)
export async function hardDeleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 1. Delete image asset from Cloudinary
    if (existingProduct.imagePublicId) {
      console.log(`Hard delete: Destroying Cloudinary asset [${existingProduct.imagePublicId}]`);
      await deleteFromCloudinary(existingProduct.imagePublicId);
    }

    // 2. Permanently delete from PostgreSQL database
    await prisma.product.delete({
      where: { id }
    });

    res.json({ 
      message: 'Product and associated Cloudinary assets permanently deleted' 
    });
  } catch (error) {
    next(error);
  }
}

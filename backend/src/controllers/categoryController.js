import prisma from '../utils/db.js';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').transform(val => val.toLowerCase().trim())
});

const subcategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name is required').transform(val => val.toLowerCase().trim()),
  categoryId: z.string().uuid('Invalid Category ID')
});

// 1. GET /api/categories (Public)
export async function getCategories(req, res, next) {
  try {
    const list = await prisma.categoryList.findMany({
      include: {
        subcategories: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

// 2. POST /api/categories (Admin only)
export async function createCategory(req, res, next) {
  try {
    const validated = categorySchema.parse(req.body);
    
    // Check if category name already exists
    const existing = await prisma.categoryList.findUnique({
      where: { name: validated.name }
    });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const created = await prisma.categoryList.create({
      data: { name: validated.name }
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

// 3. DELETE /api/categories/:id (Admin only)
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.categoryList.delete({
      where: { id }
    });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// 4. POST /api/subcategories (Admin only)
export async function createSubcategory(req, res, next) {
  try {
    const validated = subcategorySchema.parse(req.body);
    
    // Check if subcategory already exists under this category
    const existing = await prisma.subcategoryList.findUnique({
      where: {
        name_categoryId: {
          name: validated.name,
          categoryId: validated.categoryId
        }
      }
    });
    if (existing) {
      return res.status(400).json({ error: 'Subcategory already exists under this category' });
    }

    const created = await prisma.subcategoryList.create({
      data: {
        name: validated.name,
        categoryId: validated.categoryId
      }
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

// 5. DELETE /api/subcategories/:id (Admin only)
export async function deleteSubcategory(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.subcategoryList.delete({
      where: { id }
    });
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (err) {
    next(err);
  }
}

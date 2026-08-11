import XLSX from 'xlsx';
import prisma from '../utils/db.js';
import slugify from '../utils/slugify.js';

// Calculate discount percentage helper
function calculateDiscount(currPriceStr, origPriceStr) {
  if (!currPriceStr || !origPriceStr) return null;
  const current = parseFloat(String(currPriceStr).replace(/[^\d.]/g, ''));
  const original = parseFloat(String(origPriceStr).replace(/[^\d.]/g, ''));
  if (original > 0 && current >= 0 && original > current) {
    const pct = Math.round(((original - current) / original) * 100);
    return `${pct}% off`;
  }
  return null;
}

// 1. GET /api/products/import/template - Download pre-formatted sample CSV
export function downloadTemplate(req, res) {
  const sampleData = [
    {
      title: "Nilkamal Premium Foldable Study Table & Laptop Desk",
      price: "₹449",
      originalPrice: "₹899",
      discount: "50% off",
      category: "home & kitchen",
      subcategory: "furniture",
      affiliateLink: "https://www.amazon.in/dp/B08GP8H6Z7",
      imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800",
      description: "A premium, sturdy, and durable foldable desk perfect for study sessions.",
      rating: 4.1,
      reviewCount: 278,
      featured: "true"
    },
    {
      title: "Noise ColorFit Pulse Grand Smartwatch 1.69\" Display",
      price: "₹1,499",
      originalPrice: "₹3,999",
      discount: "63% off",
      category: "electronics",
      subcategory: "wearables",
      affiliateLink: "https://www.amazon.in/dp/B09NV9K2Z3",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      description: "Track your fitness metrics, read notifications on-the-go with 60 sports modes.",
      rating: 4.3,
      reviewCount: 1420,
      featured: "true"
    },
    {
      title: "Solimo Premium Latex Resistance Band Set for Workout",
      price: "₹599",
      originalPrice: "₹1,199",
      discount: "50% off",
      category: "sports & outdoors",
      subcategory: "fitness gear",
      affiliateLink: "https://www.amazon.in/dp/B08C75L2DF",
      imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
      description: "A versatile set of 5 color-coded resistance bands for all fitness levels.",
      rating: 4.2,
      reviewCount: 315,
      featured: "false"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="aukart_products_template.csv"');
  res.status(200).send(csvOutput);
}

// 2. POST /api/products/import - Process uploaded Excel / CSV spreadsheet
export async function importProductsBulk(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No spreadsheet file uploaded. Please upload a .xlsx or .csv file.' });
    }

    // Read the workbook from memory buffer
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ error: 'The uploaded file does not contain any sheets.' });
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'The uploaded file has no data rows.' });
    }

    const errors = [];
    const createdProducts = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 2; // Accounting for 1-based header row

      const title = String(row.title || row.Title || '').trim();
      const price = String(row.price || row.Price || '').trim();
      const originalPrice = String(row.originalPrice || row['Original Price'] || row.original_price || '').trim() || null;
      let discount = String(row.discount || row.Discount || '').trim() || null;
      const category = String(row.category || row.Category || '').trim().toLowerCase();
      const subcategory = String(row.subcategory || row.Subcategory || '').trim().toLowerCase() || null;
      const affiliateLink = String(row.affiliateLink || row['Affiliate Link'] || row.affiliate_link || '').trim();
      let imageUrl = String(row.imageUrl || row['Image URL'] || row.image_url || '').trim();
      const description = String(row.description || row.Description || '').trim() || null;
      const rating = parseFloat(row.rating || row.Rating) || 4.5;
      const reviewCount = parseInt(row.reviewCount || row['Review Count'] || row.review_count, 10) || 0;
      const featured = String(row.featured || row.Featured).toLowerCase() === 'true';

      // Validate required fields
      if (!title) {
        errors.push(`Row ${rowNum}: Missing product title`);
        continue;
      }
      if (!price) {
        errors.push(`Row ${rowNum}: Missing price for "${title}"`);
        continue;
      }
      if (!category) {
        errors.push(`Row ${rowNum}: Missing category for "${title}"`);
        continue;
      }
      if (!affiliateLink || !affiliateLink.startsWith('http')) {
        errors.push(`Row ${rowNum}: Missing or invalid affiliateLink URL for "${title}"`);
        continue;
      }

      // Default placeholder image if blank or invalid
      if (!imageUrl || !imageUrl.startsWith('http')) {
        imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800';
      }

      // Auto calculate discount if not explicitly provided
      if (!discount && originalPrice) {
        discount = calculateDiscount(price, originalPrice);
      }

      // Auto ensure category exists in CategoryList
      try {
        let catRecord = await prisma.categoryList.findUnique({
          where: { name: category }
        });

        if (!catRecord) {
          catRecord = await prisma.categoryList.create({
            data: { name: category }
          });
        }

        // Auto ensure subcategory exists if provided
        if (subcategory && catRecord) {
          const subRecord = await prisma.subcategoryList.findUnique({
            where: {
              name_categoryId: {
                name: subcategory,
                categoryId: catRecord.id
              }
            }
          });

          if (!subRecord) {
            await prisma.subcategoryList.create({
              data: {
                name: subcategory,
                categoryId: catRecord.id
              }
            });
          }
        }
      } catch (catErr) {
        console.warn(`Category setup warning for row ${rowNum}:`, catErr.message);
      }

      // Generate unique slug
      let baseSlug = slugify(title) || 'product';
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

      // Create product in database
      try {
        const created = await prisma.product.create({
          data: {
            title,
            slug: uniqueSlug,
            price,
            originalPrice,
            discount,
            category,
            subcategory,
            affiliateLink,
            imageUrl,
            description,
            rating,
            reviewCount,
            featured,
            isDeleted: false,
            deletedAt: null
          }
        });
        createdProducts.push(created);
      } catch (dbErr) {
        errors.push(`Row ${rowNum}: Database error creating "${title}": ${dbErr.message}`);
      }
    }

    res.status(200).json({
      success: true,
      totalRows: rows.length,
      importedCount: createdProducts.length,
      failedCount: errors.length,
      errors
    });
  } catch (error) {
    next(error);
  }
}

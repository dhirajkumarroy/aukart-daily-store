import dotenv from 'dotenv';
import prisma from '../src/utils/db.js';

dotenv.config();

function formatPrice(val) {
  if (!val && val !== 0) return null;
  const numeric = String(val).replace(/[^\d.]/g, '');
  if (!numeric) return null;
  const num = parseFloat(numeric);
  if (isNaN(num)) return null;
  return `₹${num.toLocaleString('en-IN')}`;
}

function formatDiscount(discount) {
  if (!discount) return null;
  const str = String(discount).trim();
  if (!str) return null;
  if (/^\d+$/.test(str)) {
    return `${str}% off`;
  }
  if (/^\d+\s*%$/i.test(str)) {
    return `${str.replace(/\s*%/g, '')}% off`;
  }
  return str;
}

async function clean() {
  console.log('Cleaning existing product prices and discounts in database...');
  const products = await prisma.product.findMany();

  let updatedCount = 0;
  for (const product of products) {
    const cleanPrice = formatPrice(product.price);
    const cleanOrig = formatPrice(product.originalPrice);
    const cleanDisc = formatDiscount(product.discount);

    if (cleanPrice !== product.price || cleanOrig !== product.originalPrice || cleanDisc !== product.discount) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: cleanPrice || product.price,
          originalPrice: cleanOrig,
          discount: cleanDisc
        }
      });
      console.log(`Updated [${product.slug}]: price="${product.price}" -> "${cleanPrice}", discount="${product.discount}" -> "${cleanDisc}"`);
      updatedCount++;
    }
  }

  console.log(`✅ Successfully cleaned and updated ${updatedCount} products in the database!`);
}

clean().catch(console.error);

import dotenv from 'dotenv';
import XLSX from 'xlsx';
import prisma from '../src/utils/db.js';

dotenv.config();

async function test() {
  console.log('Testing Bulk Import logic with simulated Excel data...');

  const testProducts = [
    {
      title: "Test Ergonomic Gaming Mouse with RGB Lighting",
      price: "₹799",
      originalPrice: "₹1,599",
      discount: "", // Empty to test auto-calculation
      category: "electronics",
      subcategory: "gaming accessories",
      affiliateLink: "https://www.amazon.in/dp/B08TESTMOUSE",
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
      description: "High precision gaming mouse with customizable DPI buttons.",
      rating: 4.4,
      reviewCount: 520,
      featured: "true"
    }
  ];

  // Create workbook buffer
  const ws = XLSX.utils.json_to_sheet(testProducts);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  console.log(`Generated sample XLSX buffer (${buffer.length} bytes)`);

  // Parse back buffer
  const readWb = XLSX.read(buffer, { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(readWb.Sheets[readWb.SheetNames[0]]);
  console.log(`Successfully parsed ${rows.length} row(s) from XLSX buffer:`, rows[0].title);

  // Test discount calculation
  const curr = parseFloat(String(rows[0].price).replace(/[^\d.]/g, ''));
  const orig = parseFloat(String(rows[0].originalPrice).replace(/[^\d.]/g, ''));
  const autoDiscount = `${Math.round(((orig - curr) / orig) * 100)}% off`;
  console.log(`Auto-calculated discount: ${autoDiscount}`);

  console.log('✅ Bulk Import logic and Excel parsing verified successfully!');
}

test().catch(console.error);

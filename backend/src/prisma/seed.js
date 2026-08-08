import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const masterCategories = [
  {
    name: 'electronics',
    subcategories: ['wearables', 'audio']
  },
  {
    name: 'home & kitchen',
    subcategories: ['furniture']
  },
  {
    name: 'sports & outdoors',
    subcategories: ['fitness gear']
  }
];

const sampleProducts = [
  {
    slug: "nilkar-study-table",
    title: "Nilkamal Premium Foldable Study Table & Laptop Desk",
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
    price: "₹449",
    originalPrice: "₹899",
    discount: "50% off",
    category: "home & kitchen",
    subcategory: "furniture",
    affiliateLink: "https://www.amazon.in/dp/B08GP8H6Z7",
    rating: 4.1,
    reviewCount: 278,
    description: "A premium, sturdy, and durable foldable desk perfect for study sessions, working on your laptop, or dining in bed. Features a lightweight design with sturdy metal legs and a wood finish.",
    featured: true
  },
  {
    slug: "noise-colorfit-smartwatch",
    title: "Noise ColorFit Pulse Grand Smartwatch with 1.69\" Display",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    price: "₹1,499",
    originalPrice: "₹3,999",
    discount: "63% off",
    category: "electronics",
    subcategory: "wearables",
    affiliateLink: "https://www.amazon.in/dp/B09NV9K2Z3",
    rating: 4.3,
    reviewCount: 1420,
    description: "Track your fitness metrics, read notifications on-the-go, and customize your watch face daily. Offers 60 sports modes, heart rate monitoring, sleep tracking, and up to 7 days of battery life.",
    featured: true
  },
  {
    slug: "ergo-office-chair",
    title: "Ergonomic High Back Mesh Office Chair with Lumbar Support",
    imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80",
    price: "₹4,999",
    originalPrice: "₹9,999",
    discount: "50% off",
    category: "home & kitchen",
    subcategory: "furniture",
    affiliateLink: "https://www.amazon.in/dp/B08V5FS5B5",
    rating: 4.5,
    reviewCount: 512,
    description: "Upgrade your remote work setup with this ergonomic office chair. Engineered with breathable double-mesh backing, an adjustable lumbar support system, synchro-tilt mechanism, and heavy-duty 3D armrests.",
    featured: true
  },
  {
    slug: "jbl-tune-headphones",
    title: "JBL Tune 760NC Wireless Over-Ear Active Noise Cancelling Headphones",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    price: "₹4,799",
    originalPrice: "₹7,999",
    discount: "40% off",
    category: "electronics",
    subcategory: "audio",
    affiliateLink: "https://www.amazon.in/dp/B095MS8S4D",
    rating: 4.4,
    reviewCount: 982,
    description: "Experience legendary JBL Pure Bass Sound with advanced Active Noise Cancellation to block out external distractions. Features lightweight, foldable design with up to 35 hours of wireless battery backup.",
    featured: false
  },
  {
    slug: "solimo-resistance-bands",
    title: "Solimo Premium Latex Resistance Band Set for Workout",
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    price: "₹599",
    originalPrice: "₹1,199",
    discount: "50% off",
    category: "sports & outdoors",
    subcategory: "fitness gear",
    affiliateLink: "https://www.amazon.in/dp/B08C75L2DF",
    rating: 4.2,
    reviewCount: 315,
    description: "A versatile set of 5 color-coded resistance bands ranging from extra light to extra heavy. Made from 100% natural, premium latex to ensure durability, flexibility, and safety.",
    featured: true
  }
];

async function main() {
  console.log('Seeding master categories list matching Amazon taxonomy...');
  
  // Clear lists first
  await prisma.subcategoryList.deleteMany({});
  await prisma.categoryList.deleteMany({});

  for (const cat of masterCategories) {
    const createdCat = await prisma.categoryList.create({
      data: { name: cat.name.toLowerCase() }
    });
    console.log(`Created Category: ${createdCat.name}`);

    for (const sub of cat.subcategories) {
      await prisma.subcategoryList.create({
        data: {
          name: sub.toLowerCase(),
          categoryId: createdCat.id
        }
      });
      console.log(`  Created Subcategory: ${sub} under ${createdCat.name}`);
    }
  }

  console.log('Seeding sample products mapped to Amazon taxonomy...');
  await prisma.product.deleteMany({});

  for (const product of sampleProducts) {
    const created = await prisma.product.create({
      data: product
    });
    console.log(`Created product: ${created.title} [slug: ${created.slug}, category: ${created.category}, subcategory: ${created.subcategory}]`);
  }

  console.log('Database seeding successfully finished.');
}

main()
  .catch((e) => {
    console.error('Seeding error encountered:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

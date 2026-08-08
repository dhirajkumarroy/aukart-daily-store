import prisma from '../utils/db.js';

export async function getAnalytics(req, res, next) {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Get all products and their general click fields
    const products = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        clickCount: true
      },
      orderBy: { clickCount: 'desc' }
    });

    // Group and aggregate 7-day clicks
    const sevenDaysClicks = await prisma.click.groupBy({
      by: ['productId'],
      where: {
        clickedAt: { gte: sevenDaysAgo }
      },
      _count: {
        id: true
      }
    });

    // Group and aggregate 30-day clicks
    const thirtyDaysClicks = await prisma.click.groupBy({
      by: ['productId'],
      where: {
        clickedAt: { gte: thirtyDaysAgo }
      },
      _count: {
        id: true
      }
    });

    // Convert aggregated groups to fast lookup maps
    const sevenDaysMap = {};
    sevenDaysClicks.forEach(item => {
      sevenDaysMap[item.productId] = item._count.id;
    });

    const thirtyDaysMap = {};
    thirtyDaysClicks.forEach(item => {
      thirtyDaysMap[item.productId] = item._count.id;
    });

    // Map aggregated metrics to each product listing
    const analyticsData = products.map(product => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      totalClicks: product.clickCount,
      clicksLast7Days: sevenDaysMap[product.id] || 0,
      clicksLast30Days: thirtyDaysMap[product.id] || 0
    }));

    res.json(analyticsData);
  } catch (error) {
    next(error);
  }
}

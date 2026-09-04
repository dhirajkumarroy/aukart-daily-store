import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import uploadRoutes from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import categoryRoutes from './routes/categories.js';
import priceSegmentRoutes from './routes/priceSegments.js';
import errorHandler from './middleware/errorHandler.js';
import prisma from './utils/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const allowedOrigins = (process.env.FRONTEND_URL || '*')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin, 'Allowed:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express JSON body parser
app.use(express.json());

// Base route for connectivity check
app.get('/', (req, res) => {
  res.json({ message: 'Affiliate Product Store API is running.' });
});

// Dedicated health check endpoint (queries DB to keep connection & Supabase active)
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      version: 'v1.1.2-auth-fix',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Bind API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/price-segments', priceSegmentRoutes);

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Express Server is booting...`);
  console.log(`API running on http://localhost:${PORT}`);
  try {
    await prisma.$connect();
    console.log('Database connected & warm.');
  } catch (error) {
    console.error('Initial database connection warning:', error.message);
  }
});

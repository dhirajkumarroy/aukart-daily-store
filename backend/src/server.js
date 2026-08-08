import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import uploadRoutes from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import categoryRoutes from './routes/categories.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const allowedOrigins = process.env.FRONTEND_URL || '*';
app.use(cors({
  origin: allowedOrigins === '*' ? '*' : allowedOrigins.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express JSON body parser
app.use(express.json());

// Bind API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoryRoutes);

// Base route for connectivity check
app.get('/', (req, res) => {
  res.json({ message: 'Affiliate Product Store API is running.' });
});

// Global Error Handler Middleware (must be registered last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Express Server is booting...`);
  console.log(`API running on http://localhost:${PORT}`);
});

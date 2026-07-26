import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import mealsRoutes from './routes/meals.routes';
import ordersRoutes from './routes/orders.routes';
import nutritionRoutes from './routes/nutrition.routes';
import healthProfileRoutes from './routes/health-profile.routes';
import groceryRoutes from './routes/grocery.routes';
import doctorsRoutes from './routes/doctors.routes';
import aiRoutes from './routes/ai.routes';
import mealPlansRoutes from './routes/meal-plans.routes';
import mealRecommendationRoutes from './routes/meals-recommendation.routes';
import paymentRoutes from './routes/payment.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/health-profile', healthProfileRoutes);
app.use('/api/grocery', groceryRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/meal-plans', mealPlansRoutes);
app.use('/api/meals', mealRecommendationRoutes);
app.use('/api/payments', paymentRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🥗 Wellora Backend is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🥗 Wellora Backend`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🚀 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check:      http://localhost:${PORT}/api/health`);
  console.log(`🌱 Environment:       ${process.env.NODE_ENV || 'development'}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

export default app;

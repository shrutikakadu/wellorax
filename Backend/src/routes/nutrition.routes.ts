import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();
router.use(authenticate);

const logSchema = z.object({
  mealId: z.string().optional(),
  mealName: z.string(),
  mealType: z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
  calories: z.number().int(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  fiber: z.number().default(0),
});

// GET /api/nutrition/daily?date=YYYY-MM-DD
router.get('/daily', async (req: AuthRequest, res: Response, next) => {
  try {
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId: req.user!.id,
        loggedAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { meal: { select: { imageUrl: true } } },
      orderBy: { loggedAt: 'asc' },
    });

    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
        fiber: acc.fiber + log.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    // Get user's calorie target
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.id },
      select: { dailyCalorieTarget: true },
    });

    res.json({
      success: true,
      data: {
        logs,
        totals,
        target: healthProfile?.dailyCalorieTarget || 1800,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/nutrition/log
router.post('/log', async (req: AuthRequest, res: Response, next) => {
  try {
    const body = logSchema.parse(req.body);

    const log = await prisma.nutritionLog.create({
      data: { userId: req.user!.id, ...body },
    });

    res.status(201).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/nutrition/log/:id
router.delete('/log/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const log = await prisma.nutritionLog.findFirst({
      where: { id: req.params.id as string, userId: req.user!.id },
    });
    if (!log) throw new AppError('Log not found', 404);

    await prisma.nutritionLog.delete({ where: { id: req.params.id as string } });
    res.json({ success: true, message: 'Log deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /api/nutrition/weekly — 7-day summary
router.get('/weekly', async (req: AuthRequest, res: Response, next) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await prisma.nutritionLog.findMany({
      where: { userId: req.user!.id, loggedAt: { gte: sevenDaysAgo } },
      orderBy: { loggedAt: 'asc' },
    });

    // Group by day
    const grouped: Record<string, typeof logs> = {};
    logs.forEach((log) => {
      const day = log.loggedAt.toISOString().split('T')[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(log);
    });

    const weekly = Object.entries(grouped).map(([date, dayLogs]) => ({
      date,
      calories: dayLogs.reduce((s, l) => s + l.calories, 0),
      protein: dayLogs.reduce((s, l) => s + l.protein, 0),
      carbs: dayLogs.reduce((s, l) => s + l.carbs, 0),
      fat: dayLogs.reduce((s, l) => s + l.fat, 0),
    }));

    res.json({ success: true, data: weekly });
  } catch (err) {
    next(err);
  }
});

export default router;

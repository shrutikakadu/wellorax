import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();
router.use(authenticate);

// GET /api/meal-plans/weekly
router.get('/weekly', async (req: AuthRequest, res: Response, next) => {
  try {
    // Find the most recent plan for this user
    const plan = await prisma.mealPlan.findFirst({
      where: { userId: req.user!.id },
      include: {
        slots: { include: { meal: { include: { restaurant: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      res.json({ success: true, data: null, message: 'No meal plan found. Generate one!' });
      return;
    }

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

// POST /api/meal-plans/generate — AI-generate a weekly plan
router.post('/generate', async (req: AuthRequest, res: Response, next) => {
  try {
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!healthProfile) throw new AppError('Please set up your health profile first', 400);

    // Fetch suitable meals based on health profile
    const diseases = JSON.parse(healthProfile.diseases || '[]') as string[];
    const isVeg = healthProfile.dietaryPreference === 'Vegetarian';

    // Get meals matching user needs
    const meals = await prisma.meal.findMany({
      where: { isAvailable: true, isVeg: isVeg ? true : undefined },
      take: 50,
      orderBy: { healthScore: 'desc' },
    });

    if (meals.length < 7) throw new AppError('Not enough meals available to generate a plan', 400);

    // Create weekly plan
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
    weekStart.setHours(0, 0, 0, 0);

    // Delete old plan
    const oldPlan = await prisma.mealPlan.findFirst({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });
    if (oldPlan) {
      await prisma.mealPlan.delete({ where: { id: oldPlan.id } });
    }

    // Assign meals intelligently: breakfast low-cal, lunch medium, dinner light
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

    const slots: { dayOfWeek: number; mealType: string; mealId: string }[] = [];

    for (let day = 0; day < 7; day++) {
      for (const mealType of mealTypes) {
        const categoryFiltered = meals.filter(
          (m) =>
            m.category === mealType ||
            (mealType === 'Breakfast' && m.calories < 500) ||
            (mealType === 'Snack' && m.calories < 300)
        );

        const pool = categoryFiltered.length > 0 ? categoryFiltered : meals;
        const randomMeal = pool[Math.floor(Math.random() * pool.length)];

        slots.push({ dayOfWeek: day, mealType, mealId: randomMeal.id });
      }
    }

    const plan = await prisma.mealPlan.create({
      data: {
        userId: req.user!.id,
        weekStart,
        isAiGenerated: true,
        slots: { create: slots },
      },
      include: {
        slots: { include: { meal: { include: { restaurant: { select: { name: true } } } } } },
      },
    });

    res.status(201).json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/meal-plans/slots/:slotId — Swap a meal in a slot
router.patch('/slots/:slotId', async (req: AuthRequest, res: Response, next) => {
  try {
    const { mealId } = z.object({ mealId: z.string() }).parse(req.body);

    const slot = await prisma.mealSlot.update({
      where: { id: req.params.slotId as string },
      data: { mealId },
      include: { meal: true },
    });

    res.json({ success: true, data: slot });
  } catch (err) {
    next(err);
  }
});

export default router;

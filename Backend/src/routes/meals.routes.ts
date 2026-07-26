import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/meals?category=&tag=&search=&restaurantId=
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { category, tag, search, restaurantId, isVeg } = req.query;

    const meals = await prisma.meal.findMany({
      where: {
        isAvailable: true,
        ...(category ? { category: String(category) } : {}),
        ...(restaurantId ? { restaurantId: String(restaurantId) } : {}),
        ...(isVeg !== undefined ? { isVeg: isVeg === 'true' } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: String(search) } },
                { description: { contains: String(search) } },
                { tags: { contains: String(search) } },
              ],
            }
          : {}),
        ...(tag ? { tags: { contains: String(tag) } } : {}),
      },
      include: {
        restaurant: {
          select: { id: true, name: true, rating: true, deliveryMin: true, deliveryMax: true },
        },
      },
      orderBy: { healthScore: 'desc' },
    });

    res.json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
});

// GET /api/meals/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const meal = await prisma.meal.findUnique({
      where: { id: req.params.id as string },
      include: {
        restaurant: true,
      },
    });
    if (!meal) throw new AppError('Meal not found', 404);

    res.json({ success: true, data: meal });
  } catch (err) {
    next(err);
  }
});

// GET /api/meals/restaurants/list
router.get('/restaurants/list', async (_req: Request, res: Response, next) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { meals: true, orders: true } },
      },
      orderBy: { rating: 'desc' },
    });

    res.json({ success: true, data: restaurants });
  } catch (err) {
    next(err);
  }
});

// GET /api/meals/restaurants/:id
router.get('/restaurants/:id', async (req: Request, res: Response, next) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id as string },
      include: {
        meals: { where: { isAvailable: true } },
      },
    });
    if (!restaurant) throw new AppError('Restaurant not found', 404);

    res.json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
});

export default router;

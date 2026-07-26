import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();
router.use(authenticate);

const placeOrderSchema = z.object({
  restaurantId: z.string(),
  items: z.array(z.object({ mealId: z.string(), quantity: z.number().int().min(1) })),
  instructions: z.string().optional(),
  addressId: z.string().optional(),
});

// POST /api/orders
router.post('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const body = placeOrderSchema.parse(req.body);

    // Fetch meal prices
    const mealIds = body.items.map((i) => i.mealId);
    const meals = await prisma.meal.findMany({ where: { id: { in: mealIds } } });

    if (meals.length !== mealIds.length) throw new AppError('One or more meals not found', 404);

    const restaurant = await prisma.restaurant.findUnique({ where: { id: body.restaurantId } });
    if (!restaurant) throw new AppError('Restaurant not found', 404);

    let subtotal = 0;
    const itemsData = body.items.map((item) => {
      const meal = meals.find((m) => m.id === item.mealId)!;
      subtotal += meal.price * item.quantity;
      return { mealId: item.mealId, quantity: item.quantity, price: meal.price };
    });

    const totalAmount = subtotal + restaurant.deliveryFee;

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        restaurantId: body.restaurantId,
        totalAmount,
        deliveryFee: restaurant.deliveryFee,
        instructions: body.instructions,
        addressId: body.addressId,
        items: { create: itemsData },
        tracking: {
          create: {
            status: 'PLACED',
            message: 'Your order has been placed successfully',
          },
        },
      },
      include: { items: { include: { meal: true } }, restaurant: true, tracking: true },
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — My orders
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: { include: { meal: { select: { name: true, imageUrl: true } } } },
        restaurant: { select: { name: true, imageUrl: true } },
        tracking: { orderBy: { timestamp: 'desc' } },
      },
      orderBy: { placedAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id
router.get('/:id', async (req: AuthRequest, res: Response, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id as string, userId: req.user!.id },
      include: {
        items: { include: { meal: true } },
        restaurant: true,
        tracking: { orderBy: { timestamp: 'asc' } },
      },
    });
    if (!order) throw new AppError('Order not found', 404);

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — Update order status (restaurant/admin)
router.patch('/:id/status', async (req: AuthRequest, res: Response, next) => {
  try {
    const { status, message } = req.body as { status: string; message: string };

    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: {
        status: status as any,
        tracking: {
          create: { status, message: message || `Order is now ${status}` },
        },
      },
    });

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

export default router;

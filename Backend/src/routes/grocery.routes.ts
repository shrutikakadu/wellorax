import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/grocery/products?category=&search=&healthTag=
router.get('/products', async (req: Request, res: Response, next) => {
  try {
    const { category, search, healthTag, isOrganic } = req.query;

    const products = await prisma.groceryProduct.findMany({
      where: {
        isAvailable: true,
        ...(category ? { category: String(category) } : {}),
        ...(isOrganic ? { isOrganic: isOrganic === 'true' } : {}),
        ...(healthTag ? { healthTag: { contains: String(healthTag) } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: String(search) } },
                { brand: { contains: String(search) } },
                { category: { contains: String(search) } },
              ],
            }
          : {}),
      },
      orderBy: { name: 'asc' },
    });

    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/grocery/products/:id
router.get('/products/:id', async (req: Request, res: Response, next) => {
  try {
    const product = await prisma.groceryProduct.findUnique({ where: { id: req.params.id as string } });
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// POST /api/grocery/orders — Place grocery order
router.post('/orders', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const schema = z.object({
      items: z.array(z.object({ productId: z.string(), quantity: z.number().positive() })),
    });
    const body = schema.parse(req.body);

    const productIds = body.items.map((i) => i.productId);
    const products = await prisma.groceryProduct.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      throw new AppError('One or more products not found', 404);
    }

    let totalAmount = 0;
    const itemsData = body.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      totalAmount += product.price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, price: product.price };
    });

    const order = await prisma.groceryOrder.create({
      data: {
        userId: req.user!.id,
        totalAmount,
        items: { create: itemsData },
      },
      include: { items: { include: { product: true } } },
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// GET /api/grocery/orders — My grocery orders
router.get('/orders', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const orders = await prisma.groceryOrder.findMany({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } },
      orderBy: { placedAt: 'desc' },
    });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

export default router;

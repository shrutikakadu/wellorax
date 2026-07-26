"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const placeOrderSchema = zod_1.z.object({
    restaurantId: zod_1.z.string(),
    items: zod_1.z.array(zod_1.z.object({ mealId: zod_1.z.string(), quantity: zod_1.z.number().int().min(1) })),
    instructions: zod_1.z.string().optional(),
    addressId: zod_1.z.string().optional(),
});
// POST /api/orders
router.post('/', async (req, res, next) => {
    try {
        const body = placeOrderSchema.parse(req.body);
        // Fetch meal prices
        const mealIds = body.items.map((i) => i.mealId);
        const meals = await prisma_1.prisma.meal.findMany({ where: { id: { in: mealIds } } });
        if (meals.length !== mealIds.length)
            throw new error_middleware_1.AppError('One or more meals not found', 404);
        const restaurant = await prisma_1.prisma.restaurant.findUnique({ where: { id: body.restaurantId } });
        if (!restaurant)
            throw new error_middleware_1.AppError('Restaurant not found', 404);
        let subtotal = 0;
        const itemsData = body.items.map((item) => {
            const meal = meals.find((m) => m.id === item.mealId);
            subtotal += meal.price * item.quantity;
            return { mealId: item.mealId, quantity: item.quantity, price: meal.price };
        });
        const totalAmount = subtotal + restaurant.deliveryFee;
        const order = await prisma_1.prisma.order.create({
            data: {
                userId: req.user.id,
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/orders — My orders
router.get('/', async (req, res, next) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: { include: { meal: { select: { name: true, imageUrl: true } } } },
                restaurant: { select: { name: true, imageUrl: true } },
                tracking: { orderBy: { timestamp: 'desc' } },
            },
            orderBy: { placedAt: 'desc' },
        });
        res.json({ success: true, data: orders });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
    try {
        const order = await prisma_1.prisma.order.findFirst({
            where: { id: req.params.id, userId: req.user.id },
            include: {
                items: { include: { meal: true } },
                restaurant: true,
                tracking: { orderBy: { timestamp: 'asc' } },
            },
        });
        if (!order)
            throw new error_middleware_1.AppError('Order not found', 404);
        res.json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/orders/:id/status — Update order status (restaurant/admin)
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { status, message } = req.body;
        const order = await prisma_1.prisma.order.update({
            where: { id: req.params.id },
            data: {
                status: status,
                tracking: {
                    create: { status, message: message || `Order is now ${status}` },
                },
            },
        });
        res.json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=orders.routes.js.map
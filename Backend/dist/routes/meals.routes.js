"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// GET /api/meals?category=&tag=&search=&restaurantId=
router.get('/', async (req, res, next) => {
    try {
        const { category, tag, search, restaurantId, isVeg } = req.query;
        const meals = await prisma_1.prisma.meal.findMany({
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/meals/:id
router.get('/:id', async (req, res, next) => {
    try {
        const meal = await prisma_1.prisma.meal.findUnique({
            where: { id: req.params.id },
            include: {
                restaurant: true,
            },
        });
        if (!meal)
            throw new error_middleware_1.AppError('Meal not found', 404);
        res.json({ success: true, data: meal });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/meals/restaurants/list
router.get('/restaurants/list', async (_req, res, next) => {
    try {
        const restaurants = await prisma_1.prisma.restaurant.findMany({
            where: { isActive: true },
            include: {
                _count: { select: { meals: true, orders: true } },
            },
            orderBy: { rating: 'desc' },
        });
        res.json({ success: true, data: restaurants });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/meals/restaurants/:id
router.get('/restaurants/:id', async (req, res, next) => {
    try {
        const restaurant = await prisma_1.prisma.restaurant.findUnique({
            where: { id: req.params.id },
            include: {
                meals: { where: { isAvailable: true } },
            },
        });
        if (!restaurant)
            throw new error_middleware_1.AppError('Restaurant not found', 404);
        res.json({ success: true, data: restaurant });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=meals.routes.js.map
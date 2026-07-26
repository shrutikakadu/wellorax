"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// GET /api/grocery/products?category=&search=&healthTag=
router.get('/products', async (req, res, next) => {
    try {
        const { category, search, healthTag, isOrganic } = req.query;
        const products = await prisma_1.prisma.groceryProduct.findMany({
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/grocery/products/:id
router.get('/products/:id', async (req, res, next) => {
    try {
        const product = await prisma_1.prisma.groceryProduct.findUnique({ where: { id: req.params.id } });
        if (!product)
            throw new error_middleware_1.AppError('Product not found', 404);
        res.json({ success: true, data: product });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/grocery/orders — Place grocery order
router.post('/orders', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            items: zod_1.z.array(zod_1.z.object({ productId: zod_1.z.string(), quantity: zod_1.z.number().positive() })),
        });
        const body = schema.parse(req.body);
        const productIds = body.items.map((i) => i.productId);
        const products = await prisma_1.prisma.groceryProduct.findMany({ where: { id: { in: productIds } } });
        if (products.length !== productIds.length) {
            throw new error_middleware_1.AppError('One or more products not found', 404);
        }
        let totalAmount = 0;
        const itemsData = body.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            totalAmount += product.price * item.quantity;
            return { productId: item.productId, quantity: item.quantity, price: product.price };
        });
        const order = await prisma_1.prisma.groceryOrder.create({
            data: {
                userId: req.user.id,
                totalAmount,
                items: { create: itemsData },
            },
            include: { items: { include: { product: true } } },
        });
        res.status(201).json({ success: true, data: order });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/grocery/orders — My grocery orders
router.get('/orders', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const orders = await prisma_1.prisma.groceryOrder.findMany({
            where: { userId: req.user.id },
            include: { items: { include: { product: true } } },
            orderBy: { placedAt: 'desc' },
        });
        res.json({ success: true, data: orders });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=grocery.routes.js.map
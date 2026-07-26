"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
const logSchema = zod_1.z.object({
    mealId: zod_1.z.string().optional(),
    mealName: zod_1.z.string(),
    mealType: zod_1.z.enum(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
    calories: zod_1.z.number().int(),
    protein: zod_1.z.number(),
    carbs: zod_1.z.number(),
    fat: zod_1.z.number(),
    fiber: zod_1.z.number().default(0),
});
// GET /api/nutrition/daily?date=YYYY-MM-DD
router.get('/daily', async (req, res, next) => {
    try {
        const dateStr = req.query.date;
        const date = dateStr ? new Date(dateStr) : new Date();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const logs = await prisma_1.prisma.nutritionLog.findMany({
            where: {
                userId: req.user.id,
                loggedAt: { gte: startOfDay, lte: endOfDay },
            },
            include: { meal: { select: { imageUrl: true } } },
            orderBy: { loggedAt: 'asc' },
        });
        const totals = logs.reduce((acc, log) => ({
            calories: acc.calories + log.calories,
            protein: acc.protein + log.protein,
            carbs: acc.carbs + log.carbs,
            fat: acc.fat + log.fat,
            fiber: acc.fiber + log.fiber,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });
        // Get user's calorie target
        const healthProfile = await prisma_1.prisma.healthProfile.findUnique({
            where: { userId: req.user.id },
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
    }
    catch (err) {
        next(err);
    }
});
// POST /api/nutrition/log
router.post('/log', async (req, res, next) => {
    try {
        const body = logSchema.parse(req.body);
        const log = await prisma_1.prisma.nutritionLog.create({
            data: { userId: req.user.id, ...body },
        });
        res.status(201).json({ success: true, data: log });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/nutrition/log/:id
router.delete('/log/:id', async (req, res, next) => {
    try {
        const log = await prisma_1.prisma.nutritionLog.findFirst({
            where: { id: req.params.id, userId: req.user.id },
        });
        if (!log)
            throw new error_middleware_1.AppError('Log not found', 404);
        await prisma_1.prisma.nutritionLog.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Log deleted' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/nutrition/weekly — 7-day summary
router.get('/weekly', async (req, res, next) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        const logs = await prisma_1.prisma.nutritionLog.findMany({
            where: { userId: req.user.id, loggedAt: { gte: sevenDaysAgo } },
            orderBy: { loggedAt: 'asc' },
        });
        // Group by day
        const grouped = {};
        logs.forEach((log) => {
            const day = log.loggedAt.toISOString().split('T')[0];
            if (!grouped[day])
                grouped[day] = [];
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
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=nutrition.routes.js.map
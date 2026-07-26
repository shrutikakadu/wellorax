"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/health-profile
router.get('/', async (req, res, next) => {
    try {
        const profile = await prisma_1.prisma.healthProfile.findUnique({
            where: { userId: req.user.id },
        });
        res.json({ success: true, data: profile });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/health-profile
router.put('/', async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            age: zod_1.z.number().int().min(1).max(120).optional(),
            heightCm: zod_1.z.number().positive().optional(),
            weightKg: zod_1.z.number().positive().optional(),
            targetWeightKg: zod_1.z.number().positive().optional(),
            fitnessGoal: zod_1.z.string().optional(),
            dailyCalorieTarget: zod_1.z.number().int().positive().optional(),
            diseases: zod_1.z.array(zod_1.z.string()).optional(),
            activityLevel: zod_1.z.string().optional(),
            dietaryPreference: zod_1.z.string().optional(),
        });
        const body = schema.parse(req.body);
        // Calculate BMI if height/weight given
        let bmi;
        if (body.heightCm && body.weightKg) {
            const h = body.heightCm / 100;
            bmi = Math.round((body.weightKg / (h * h)) * 10) / 10;
        }
        const profile = await prisma_1.prisma.healthProfile.upsert({
            where: { userId: req.user.id },
            update: {
                ...body,
                diseases: body.diseases ? JSON.stringify(body.diseases) : undefined,
                bmi,
            },
            create: {
                userId: req.user.id,
                age: body.age || 25,
                heightCm: body.heightCm || 165,
                weightKg: body.weightKg || 65,
                targetWeightKg: body.targetWeightKg || 60,
                fitnessGoal: body.fitnessGoal || 'General Wellness',
                dailyCalorieTarget: body.dailyCalorieTarget || 1800,
                diseases: JSON.stringify(body.diseases || []),
                bmi,
            },
        });
        res.json({ success: true, data: profile });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=health-profile.routes.js.map
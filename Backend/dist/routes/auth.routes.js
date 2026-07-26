"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    phone: zod_1.z.string().optional(),
    role: zod_1.z.enum(['CUSTOMER', 'RESTAURANT_OWNER', 'DOCTOR', 'DELIVERY_AGENT']).optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') });
};
// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const body = registerSchema.parse(req.body);
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: body.email } });
        if (existing)
            throw new error_middleware_1.AppError('Email already registered', 409);
        const hashedPassword = await bcryptjs_1.default.hash(body.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
                phone: body.phone,
                role: body.role || 'CUSTOMER',
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        // Create default health profile for customers
        if (user.role === 'CUSTOMER') {
            await prisma_1.prisma.healthProfile.create({
                data: {
                    userId: user.id,
                    age: 25,
                    heightCm: 165,
                    weightKg: 65,
                    targetWeightKg: 60,
                    fitnessGoal: 'General Wellness',
                    dailyCalorieTarget: 1800,
                    diseases: '[]',
                },
            });
        }
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: { user, token },
        });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const body = loginSchema.parse(req.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email: body.email } });
        if (!user)
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        const isMatch = await bcryptjs_1.default.compare(body.password, user.password);
        if (!isMatch)
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        const token = generateToken({ id: user.id, email: user.email, role: user.role });
        res.json({
            success: true,
            data: {
                user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
                token,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/auth/me
router.get('/me', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true, name: true, email: true, role: true, avatar: true, phone: true,
                healthProfile: true,
                addresses: true,
            },
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        res.json({ success: true, data: user });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map
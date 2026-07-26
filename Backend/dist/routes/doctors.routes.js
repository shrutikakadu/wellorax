"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// GET /api/doctors?specialty=
router.get('/', async (req, res, next) => {
    try {
        const { specialty } = req.query;
        const doctors = await prisma_1.prisma.doctor.findMany({
            where: {
                isAvailable: true,
                ...(specialty ? { specialty: { contains: String(specialty) } } : {}),
            },
            orderBy: { rating: 'desc' },
        });
        res.json({ success: true, data: doctors });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/doctors/:id
router.get('/:id', async (req, res, next) => {
    try {
        const doctor = await prisma_1.prisma.doctor.findUnique({ where: { id: req.params.id } });
        if (!doctor)
            throw new error_middleware_1.AppError('Doctor not found', 404);
        res.json({ success: true, data: doctor });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/doctors/appointments — Book appointment
router.post('/appointments', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            doctorId: zod_1.z.string(),
            type: zod_1.z.enum(['Video', 'Chat', 'In-Person']),
            scheduledAt: zod_1.z.string().datetime(),
            notes: zod_1.z.string().optional(),
        });
        const body = schema.parse(req.body);
        const doctor = await prisma_1.prisma.doctor.findUnique({ where: { id: body.doctorId } });
        if (!doctor)
            throw new error_middleware_1.AppError('Doctor not found', 404);
        if (!doctor.isAvailable)
            throw new error_middleware_1.AppError('Doctor is not available', 400);
        const appointment = await prisma_1.prisma.appointment.create({
            data: {
                userId: req.user.id,
                doctorId: body.doctorId,
                type: body.type,
                scheduledAt: new Date(body.scheduledAt),
                notes: body.notes,
            },
            include: { doctor: true },
        });
        res.status(201).json({ success: true, data: appointment });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/doctors/appointments/mine — My appointments
router.get('/appointments/mine', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const appointments = await prisma_1.prisma.appointment.findMany({
            where: { userId: req.user.id },
            include: { doctor: true },
            orderBy: { scheduledAt: 'desc' },
        });
        res.json({ success: true, data: appointments });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=doctors.routes.js.map
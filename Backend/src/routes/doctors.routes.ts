import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/doctors?specialty=
router.get('/', async (req: Request, res: Response, next) => {
  try {
    const { specialty } = req.query;

    const doctors = await prisma.doctor.findMany({
      where: {
        isAvailable: true,
        ...(specialty ? { specialty: { contains: String(specialty) } } : {}),
      },
      orderBy: { rating: 'desc' },
    });

    res.json({ success: true, data: doctors });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req: Request, res: Response, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { id: req.params.id as string } });
    if (!doctor) throw new AppError('Doctor not found', 404);
    res.json({ success: true, data: doctor });
  } catch (err) {
    next(err);
  }
});

// POST /api/doctors/appointments — Book appointment
router.post('/appointments', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const schema = z.object({
      doctorId: z.string(),
      type: z.enum(['Video', 'Chat', 'In-Person']),
      scheduledAt: z.string().datetime(),
      notes: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const doctor = await prisma.doctor.findUnique({ where: { id: body.doctorId } });
    if (!doctor) throw new AppError('Doctor not found', 404);
    if (!doctor.isAvailable) throw new AppError('Doctor is not available', 400);

    const appointment = await prisma.appointment.create({
      data: {
        userId: req.user!.id,
        doctorId: body.doctorId,
        type: body.type,
        scheduledAt: new Date(body.scheduledAt),
        notes: body.notes,
      },
      include: { doctor: true },
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/appointments/mine — My appointments
router.get('/appointments/mine', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.user!.id },
      include: { doctor: true },
      orderBy: { scheduledAt: 'desc' },
    });
    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
});

export default router;

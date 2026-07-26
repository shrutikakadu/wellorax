import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// GET /api/health-profile
router.get('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.id },
    });

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// PUT /api/health-profile
router.put('/', async (req: AuthRequest, res: Response, next) => {
  try {
    const schema = z.object({
      age: z.number().int().min(1).max(120).optional(),
      heightCm: z.number().positive().optional(),
      weightKg: z.number().positive().optional(),
      targetWeightKg: z.number().positive().optional(),
      fitnessGoal: z.string().optional(),
      dailyCalorieTarget: z.number().int().positive().optional(),
      diseases: z.array(z.string()).optional(),
      activityLevel: z.string().optional(),
      dietaryPreference: z.string().optional(),
      // Vitals
      bloodPressureSystolic: z.number().int().min(60).max(250).optional().nullable(),
      bloodPressureDiastolic: z.number().int().min(40).max(150).optional().nullable(),
      bloodSugarFasting: z.number().min(30).max(600).optional().nullable(),
      cholesterolTotal: z.number().min(50).max(600).optional().nullable(),
      heartRateBpm: z.number().int().min(30).max(220).optional().nullable(),
      oxygenSaturation: z.number().min(50).max(100).optional().nullable(),
      lastVitalScanAt: z.string().datetime().optional().nullable(),
    });

    const body = schema.parse(req.body);

    // Calculate BMI if height/weight given
    let bmi: number | undefined;
    if (body.heightCm && body.weightKg) {
      const h = body.heightCm / 100;
      bmi = Math.round((body.weightKg / (h * h)) * 10) / 10;
    }

    const profile = await prisma.healthProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        ...(body.age !== undefined && { age: body.age }),
        ...(body.heightCm !== undefined && { heightCm: body.heightCm }),
        ...(body.weightKg !== undefined && { weightKg: body.weightKg }),
        ...(body.targetWeightKg !== undefined && { targetWeightKg: body.targetWeightKg }),
        ...(body.fitnessGoal !== undefined && { fitnessGoal: body.fitnessGoal }),
        ...(body.dailyCalorieTarget !== undefined && { dailyCalorieTarget: body.dailyCalorieTarget }),
        ...(body.diseases !== undefined && { diseases: JSON.stringify(body.diseases) }),
        ...(body.activityLevel !== undefined && { activityLevel: body.activityLevel }),
        ...(body.dietaryPreference !== undefined && { dietaryPreference: body.dietaryPreference }),
        ...(bmi !== undefined && { bmi }),
        // Vitals
        ...(body.bloodPressureSystolic !== undefined && { bloodPressureSystolic: body.bloodPressureSystolic }),
        ...(body.bloodPressureDiastolic !== undefined && { bloodPressureDiastolic: body.bloodPressureDiastolic }),
        ...(body.bloodSugarFasting !== undefined && { bloodSugarFasting: body.bloodSugarFasting }),
        ...(body.cholesterolTotal !== undefined && { cholesterolTotal: body.cholesterolTotal }),
        ...(body.heartRateBpm !== undefined && { heartRateBpm: body.heartRateBpm }),
        ...(body.oxygenSaturation !== undefined && { oxygenSaturation: body.oxygenSaturation }),
        ...(body.lastVitalScanAt !== undefined && { lastVitalScanAt: body.lastVitalScanAt ? new Date(body.lastVitalScanAt) : null }),
      },
      create: {
        userId: req.user!.id,
        age: body.age || 25,
        heightCm: body.heightCm || 165,
        weightKg: body.weightKg || 65,
        targetWeightKg: body.targetWeightKg || 60,
        fitnessGoal: body.fitnessGoal || 'General Wellness',
        dailyCalorieTarget: body.dailyCalorieTarget || 1800,
        diseases: JSON.stringify(body.diseases || []),
        bmi,
        bloodPressureSystolic: body.bloodPressureSystolic || null,
        bloodPressureDiastolic: body.bloodPressureDiastolic || null,
        bloodSugarFasting: body.bloodSugarFasting || null,
        cholesterolTotal: body.cholesterolTotal || null,
        heartRateBpm: body.heartRateBpm || null,
        oxygenSaturation: body.oxygenSaturation || null,
        lastVitalScanAt: body.lastVitalScanAt ? new Date(body.lastVitalScanAt) : null,
      },
    });

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

interface ScoredMeal {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: number;
  category: string;
  tags: string;
  isVeg: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  glycemicIndex: number | null;
  healthScore: number;
  aiHealthTag: string | null;
  restaurantId: string;
  restaurantName: string;
  recommendationScore: number;
  recommendationReasons: string[];
}

function scoreMeal(
  meal: any,
  diseases: string[],
  fitnessGoal: string,
  dailyCalorieTarget: number,
  isVeg: boolean,
  bloodSugarFasting: number | null,
  bloodPressureSystolic: number | null,
): { score: number; reasons: string[] } {
  let score = meal.healthScore * 10;
  const reasons: string[] = [];
  const tags: string[] = JSON.parse(meal.tags || '[]');
  const tagName = (t: string) => tags.some(tag => tag.toLowerCase().includes(t.toLowerCase()));

  if (isVeg && meal.isVeg) {
    score += 5;
    reasons.push('Matches your vegetarian preference');
  }

  for (const disease of diseases) {
    const d = disease.toLowerCase();
    if ((d.includes('pcos') || d.includes('pcod')) && tagName('pcos')) {
      score += 20;
      reasons.push('Recommended for PCOS management');
    }
    if (d.includes('diabet') && (tagName('diabetic') || tagName('low-gi') || tagName('low gi'))) {
      score += 20;
      reasons.push('Safe for diabetic diet');
    }
    if (d.includes('hypertension') || d.includes('blood pressure')) {
      if (meal.sodium < 300) {
        score += 15;
        reasons.push('Low sodium — safe for high BP');
      }
      if (meal.sodium > 500) {
        score -= 20;
        reasons.push('High sodium — not recommended for hypertension');
      }
    }
    if ((d.includes('heart') || d.includes('cardio')) && tagName('heart')) {
      score += 15;
      reasons.push('Heart-healthy recipe');
    }
    if (d.includes('kidney') && tagName('kidney')) {
      score += 12;
      reasons.push('Kidney-friendly meal');
    }
    if (d.includes('thyroid') && tagName('thyroid')) {
      score += 10;
      reasons.push('Thyroid-friendly ingredients');
    }
  }

  if (bloodSugarFasting && bloodSugarFasting >= 126) {
    if (meal.glycemicIndex && meal.glycemicIndex < 35) {
      score += 12;
      reasons.push('Very low GI — ideal for elevated blood sugar');
    }
    if (meal.glycemicIndex && meal.glycemicIndex > 55) {
      score -= 15;
      reasons.push('High GI — may spike blood sugar');
    }
  }

  if (bloodPressureSystolic && bloodPressureSystolic >= 140) {
    if (meal.sodium < 250) {
      score += 10;
      reasons.push('Ultra-low sodium for your BP level');
    }
  }

  const goal = fitnessGoal.toLowerCase();
  if (goal.includes('weight loss') || goal.includes('fat loss')) {
    if (meal.calories < 400) {
      score += 8;
      reasons.push('Light calorie load for weight loss');
    }
    if (meal.fiber >= 8) {
      score += 5;
      reasons.push('High fiber promotes satiety');
    }
  }
  if (goal.includes('muscle') || goal.includes('gain') || goal.includes('gym')) {
    if (meal.protein >= 30) {
      score += 10;
      reasons.push('High protein for muscle building');
    }
  }
  if (goal.includes('diabetes')) {
    if (meal.glycemicIndex && meal.glycemicIndex < 35) {
      score += 15;
      reasons.push('Low GI for diabetes control');
    }
  }
  if (goal.includes('heart')) {
    if (meal.fat < 15 && meal.sodium < 350) {
      score += 10;
      reasons.push('Low-fat, low-sodium for heart health');
    }
  }
  if (goal.includes('pcos')) {
    if (tagName('pcos') || tagName('anti-inflammatory') || tagName('low-gi')) {
      score += 12;
      reasons.push('Anti-inflammatory and PCOS-friendly');
    }
  }

  if (dailyCalorieTarget > 0) {
    const ratio = meal.calories / dailyCalorieTarget;
    if (ratio >= 0.25 && ratio <= 0.40) {
      score += 5;
      reasons.push('Well-portioned for your calorie target');
    }
  }

  if (tagName('keto')) {
    if (goal.includes('keto') || goal.includes('low carb')) {
      score += 8;
      reasons.push('Keto-certified meal');
    }
  }
  if (tagName('vegan') && isVeg) {
    score += 3;
    reasons.push('Plant-based option');
  }

  if (reasons.length === 0) {
    reasons.push('High health score — great general choice');
  }

  return { score: Math.round(score), reasons };
}

// GET /api/meals/recommended — personalized meal recommendations
router.get('/recommended', async (req: AuthRequest, res: Response, next) => {
  try {
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const diseases = healthProfile ? (JSON.parse(healthProfile.diseases || '[]') as string[]) : [];
    const isVeg = healthProfile?.dietaryPreference === 'Vegetarian';
    const fitnessGoal = healthProfile?.fitnessGoal || 'General Wellness';
    const dailyCalorieTarget = healthProfile?.dailyCalorieTarget || 2000;
    const bloodSugarFasting = healthProfile?.bloodSugarFasting ?? null;
    const bloodPressureSystolic = healthProfile?.bloodPressureSystolic ?? null;

    const meals = await prisma.meal.findMany({
      where: {
        isAvailable: true,
        ...(isVeg ? { isVeg: true } : {}),
      },
      include: {
        restaurant: { select: { id: true, name: true } },
      },
      orderBy: { healthScore: 'desc' },
    });

    const scored: ScoredMeal[] = meals.map((meal) => {
      const { score, reasons } = scoreMeal(
        meal,
        diseases,
        fitnessGoal,
        dailyCalorieTarget,
        isVeg ?? true,
        bloodSugarFasting,
        bloodPressureSystolic,
      );
      return {
        id: meal.id,
        name: meal.name,
        description: meal.description,
        imageUrl: meal.imageUrl,
        price: meal.price,
        category: meal.category,
        tags: meal.tags,
        isVeg: meal.isVeg,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        sugar: meal.sugar,
        sodium: meal.sodium,
        glycemicIndex: meal.glycemicIndex,
        healthScore: meal.healthScore,
        aiHealthTag: meal.aiHealthTag,
        restaurantId: meal.restaurantId,
        restaurantName: meal.restaurant.name,
        recommendationScore: score,
        recommendationReasons: reasons,
      };
    });

    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);

    const limit = parseInt(req.query.limit as string) || 10;
    const top = scored.slice(0, limit);

    res.json({
      success: true,
      data: {
        recommendations: top,
        profileUsed: {
          diseases,
          fitnessGoal,
          dailyCalorieTarget,
          isVeg,
          bloodSugarFasting,
          bloodPressureSystolic,
        },
        totalMealsScored: meals.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/meals/recommended/quick — lightweight quick-suggestions (top 5)
router.get('/recommended/quick', async (req: AuthRequest, res: Response, next) => {
  try {
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const diseases = healthProfile ? (JSON.parse(healthProfile.diseases || '[]') as string[]) : [];
    const isVeg = healthProfile?.dietaryPreference === 'Vegetarian';
    const fitnessGoal = healthProfile?.fitnessGoal || 'General Wellness';
    const dailyCalorieTarget = healthProfile?.dailyCalorieTarget || 2000;

    const meals = await prisma.meal.findMany({
      where: { isAvailable: true, ...(isVeg ? { isVeg: true } : {}) },
      include: { restaurant: { select: { name: true } } },
      orderBy: { healthScore: 'desc' },
      take: 30,
    });

    const scored = meals
      .map((meal) => {
        const { score } = scoreMeal(meal, diseases, fitnessGoal, dailyCalorieTarget, isVeg ?? true, null, null);
        return {
          id: meal.id,
          name: meal.name,
          category: meal.category,
          calories: meal.calories,
          protein: meal.protein,
          healthScore: meal.healthScore,
          aiHealthTag: meal.aiHealthTag,
          imageUrl: meal.imageUrl,
          price: meal.price,
          restaurantName: meal.restaurant.name,
          recommendationScore: score,
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 5);

    res.json({ success: true, data: scored });
  } catch (err) {
    next(err);
  }
});

export default router;

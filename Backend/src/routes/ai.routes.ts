import { Router, Response } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// POST /api/ai/chat
router.post('/chat', async (req: AuthRequest, res: Response, next) => {
  try {
    const schema = z.object({ message: z.string().min(1) });
    const { message } = schema.parse(req.body);

    // Fetch user health context
    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.id },
    });

    // Save user message
    await prisma.chatMessage.create({
      data: { userId: req.user!.id, role: 'user', content: message },
    });

    // Get last 10 messages for context
    const history = await prisma.chatMessage.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    history.reverse();

    const apiKey = process.env.GEMINI_API_KEY;

    let assistantReply: string;

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      // Use Gemini AI
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

      const diseases = healthProfile?.diseases
        ? JSON.parse(healthProfile.diseases).join(', ') || 'None'
        : 'None';

      const systemContext = `You are Wellora Health Assistant — a compassionate, expert nutrition and health advisor.

User Health Profile:
- Age: ${healthProfile?.age || 'Unknown'}
- BMI: ${healthProfile?.bmi || 'Unknown'}
- Medical Conditions: ${diseases}
- Fitness Goal: ${healthProfile?.fitnessGoal || 'General Wellness'}
- Daily Calorie Target: ${healthProfile?.dailyCalorieTarget || 1800} kcal
- Dietary Preference: ${healthProfile?.dietaryPreference || 'Vegetarian'}

Guidelines:
- Give personalized, evidence-based nutrition advice
- Always account for the user's medical conditions
- Be warm, encouraging, and motivating
- Suggest specific Wellora meals when relevant
- Keep responses concise (2-4 sentences) unless a detailed explanation is needed
- If asked about medication or serious medical issues, recommend consulting a doctor`;

      const chat = model.startChat({
        history: history.slice(0, -1).map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        systemInstruction: systemContext,
      });

      const result = await chat.sendMessage(message);
      assistantReply = result.response.text();
    } else {
      // Fallback: rule-based responses
      assistantReply = getRuleBasedResponse(message, healthProfile);
    }

    // Save assistant reply
    const saved = await prisma.chatMessage.create({
      data: { userId: req.user!.id, role: 'assistant', content: assistantReply },
    });

    res.json({ success: true, data: { reply: assistantReply, messageId: saved.id } });
  } catch (err) {
    next(err);
  }
});

// GET /api/ai/history — Chat history
router.get('/history', async (req: AuthRequest, res: Response, next) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/ai/history — Clear chat
router.delete('/history', async (req: AuthRequest, res: Response, next) => {
  try {
    await prisma.chatMessage.deleteMany({ where: { userId: req.user!.id } });
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) {
    next(err);
  }
});

// POST /api/ai/analyze-order — LLM clinical analysis of order before placement
router.post('/analyze-order', async (req: AuthRequest, res: Response, next) => {
  try {
    const schema = z.object({
      cartItems: z.array(z.object({
        name: z.string(),
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number(),
        glycemicIndex: z.number().optional(),
      })),
    });

    const { cartItems } = schema.parse(req.body);

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    const diseases = healthProfile?.diseases ? JSON.parse(healthProfile.diseases).join(', ') : 'None';
    const bp = healthProfile?.bloodPressureSystolic ? `${healthProfile.bloodPressureSystolic}/${healthProfile.bloodPressureDiastolic} mmHg` : 'Not recorded';
    const sugar = healthProfile?.bloodSugarFasting ? `${healthProfile.bloodSugarFasting} mg/dL` : 'Not recorded';

    const prompt = `You are Wellora Clinical Nutrition & Physician LLM.
Analyze this meal order for the patient:

Patient Metrics:
- Vitals: BP ${bp}, Fasting Blood Sugar ${sugar}
- Conditions: ${diseases}
- Goal: ${healthProfile?.fitnessGoal || 'General Wellness'} (${healthProfile?.dailyCalorieTarget || 1800} kcal daily target)

Order Items:
${cartItems.map(i => `- ${i.name} (${i.calories} kcal, ${i.protein}g protein, ${i.carbs}g carbs, ${i.fat}g fat, GI ${i.glycemicIndex || '35'})`).join('\n')}

Analyze safety for patient's vitals & diseases.
Return JSON strictly in this format:
{
  "bioMatchScore": 95,
  "isSafe": true,
  "healthStatus": "Excellent Choice",
  "clinicalAnalysis": "This meal aligns well with your targets. High protein and low glycemic index ensure stable blood sugar and energy.",
  "warning": null,
  "recommendedSwap": null
}`;

    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({ success: true, data: parsed });
        }
      } catch (llmErr) {
        console.warn('⚠️ LLM Order Analysis error, using fallback analyzer:', llmErr);
      }
    }

    // Fallback clinical evaluation if key not present
    const totalKcal = cartItems.reduce((s, i) => s + i.calories, 0);
    const totalProtein = cartItems.reduce((s, i) => s + i.protein, 0);
    const maxGI = Math.max(...cartItems.map(i => i.glycemicIndex || 35));

    const isHighBP = healthProfile?.bloodPressureSystolic && healthProfile.bloodPressureSystolic >= 140;
    const isRiskyMeal = cartItems.some(i => i.name.toLowerCase().includes('pizza') || i.name.toLowerCase().includes('burger'));

    const isSafe = !(isHighBP && isRiskyMeal);
    const bioMatchScore = isSafe ? 94 : 62;
    const healthStatus = isSafe ? 'Excellent Choice' : 'Unhealthy Warning';
    const clinicalAnalysis = isSafe
      ? `This order supplies ${totalKcal} kcal & ${totalProtein}g protein with a low GI of ${maxGI}. Perfectly aligned with your ${healthProfile?.fitnessGoal || 'wellness'} plan!`
      : `This order contains high sodium & GI foods which conflict with your elevated BP of ${bp}.`;

    res.json({
      success: true,
      data: {
        bioMatchScore,
        isSafe,
        healthStatus,
        clinicalAnalysis,
        warning: isSafe ? null : `High sodium intake detected for BP ${bp}`,
        recommendedSwap: isSafe ? null : 'Avocado & Grilled Salmon Power Bowl',
      },
    });
  } catch (err) {
    next(err);
  }
});

// Rule-based fallback when no Gemini key set
function getRuleBasedResponse(
  message: string,
  profile: { fitnessGoal?: string; diseases?: string; dailyCalorieTarget?: number } | null
): string {
  const msg = message.toLowerCase();
  const goal = profile?.fitnessGoal || 'General Wellness';
  const calories = profile?.dailyCalorieTarget || 1800;

  if (msg.includes('calorie') || msg.includes('calories')) {
    return `Based on your ${goal} goal, your daily target is ${calories} kcal. I recommend spreading this across 3 main meals and 2 snacks for stable energy throughout the day. 🌿`;
  }
  if (msg.includes('breakfast')) {
    return `For ${goal}, a great breakfast would be overnight oats with chia seeds, berries, and a boiled egg — roughly 400 kcal with balanced protein and low glycemic carbs. This keeps blood sugar stable all morning! 🥣`;
  }
  if (msg.includes('protein')) {
    return `For your goal of ${goal}, aim for 1.2–1.6g of protein per kg of body weight daily. Great sources include dal, paneer, eggs, Greek yogurt, and legumes. 💪`;
  }
  if (msg.includes('pcos') || msg.includes('hormone')) {
    return `For PCOS management, focus on a low-GI diet — include plenty of leafy greens, whole grains, and anti-inflammatory foods like turmeric and flaxseeds. Avoid refined sugar and processed carbs as they spike insulin. 🌺`;
  }
  if (msg.includes('diabetes')) {
    return `For blood sugar management, stick to low-GI foods (below 55), eat smaller frequent meals, and always pair carbs with protein or fiber to slow glucose absorption. Our Diabetic Safe meals are designed exactly for this! 🩺`;
  }
  if (msg.includes('water') || msg.includes('hydrat')) {
    return `Aim for 8–10 glasses (2–2.5L) of water daily. Drinking a glass before each meal can also help with portion control and reduce bloating. 💧`;
  }

  return `That's a great question! Based on your ${goal} goal, I'd recommend focusing on whole, nutrient-dense foods and staying within your ${calories} kcal target. Would you like specific meal suggestions or a deeper analysis of any nutrient? 🌿`;
}

export default router;

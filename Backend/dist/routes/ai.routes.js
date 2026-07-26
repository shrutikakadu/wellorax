"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const generative_ai_1 = require("@google/generative-ai");
const prisma_1 = require("../lib/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// POST /api/ai/chat
router.post('/chat', async (req, res, next) => {
    try {
        const schema = zod_1.z.object({ message: zod_1.z.string().min(1) });
        const { message } = schema.parse(req.body);
        // Fetch user health context
        const healthProfile = await prisma_1.prisma.healthProfile.findUnique({
            where: { userId: req.user.id },
        });
        // Save user message
        await prisma_1.prisma.chatMessage.create({
            data: { userId: req.user.id, role: 'user', content: message },
        });
        // Get last 10 messages for context
        const history = await prisma_1.prisma.chatMessage.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        history.reverse();
        const apiKey = process.env.GEMINI_API_KEY;
        let assistantReply;
        if (apiKey && apiKey !== 'your_gemini_api_key_here') {
            // Use Gemini AI
            const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const diseases = healthProfile?.diseases
                ? JSON.parse(healthProfile.diseases).join(', ') || 'None'
                : 'None';
            const systemContext = `You are NutriFlow AI Health Assistant — a compassionate, expert nutrition and health advisor.

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
- Suggest specific NutriFlow meals when relevant
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
        }
        else {
            // Fallback: rule-based responses
            assistantReply = getRuleBasedResponse(message, healthProfile);
        }
        // Save assistant reply
        const saved = await prisma_1.prisma.chatMessage.create({
            data: { userId: req.user.id, role: 'assistant', content: assistantReply },
        });
        res.json({ success: true, data: { reply: assistantReply, messageId: saved.id } });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/ai/history — Chat history
router.get('/history', async (req, res, next) => {
    try {
        const messages = await prisma_1.prisma.chatMessage.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'asc' },
            take: 50,
        });
        res.json({ success: true, data: messages });
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/ai/history — Clear chat
router.delete('/history', async (req, res, next) => {
    try {
        await prisma_1.prisma.chatMessage.deleteMany({ where: { userId: req.user.id } });
        res.json({ success: true, message: 'Chat history cleared' });
    }
    catch (err) {
        next(err);
    }
});
// Rule-based fallback when no Gemini key set
function getRuleBasedResponse(message, profile) {
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
exports.default = router;
//# sourceMappingURL=ai.routes.js.map
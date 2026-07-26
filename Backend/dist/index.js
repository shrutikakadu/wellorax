"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const meals_routes_1 = __importDefault(require("./routes/meals.routes"));
const orders_routes_1 = __importDefault(require("./routes/orders.routes"));
const nutrition_routes_1 = __importDefault(require("./routes/nutrition.routes"));
const health_profile_routes_1 = __importDefault(require("./routes/health-profile.routes"));
const grocery_routes_1 = __importDefault(require("./routes/grocery.routes"));
const doctors_routes_1 = __importDefault(require("./routes/doctors.routes"));
const ai_routes_1 = __importDefault(require("./routes/ai.routes"));
const meal_plans_routes_1 = __importDefault(require("./routes/meal-plans.routes"));
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// ─── Security & Middleware ────────────────────────────────────────────────────
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use((0, morgan_1.default)('dev'));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);
// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/meals', meals_routes_1.default);
app.use('/api/orders', orders_routes_1.default);
app.use('/api/nutrition', nutrition_routes_1.default);
app.use('/api/health-profile', health_profile_routes_1.default);
app.use('/api/grocery', grocery_routes_1.default);
app.use('/api/doctors', doctors_routes_1.default);
app.use('/api/ai', ai_routes_1.default);
app.use('/api/meal-plans', meal_plans_routes_1.default);
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        success: true,
        message: '🥗 NutriFlow AI Backend is running',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(error_middleware_1.errorHandler);
// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🥗 NutriFlow AI Backend`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`📊 Health check:      http://localhost:${PORT}/api/health`);
    console.log(`🌱 Environment:       ${process.env.NODE_ENV || 'development'}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});
exports.default = app;
//# sourceMappingURL=index.js.map
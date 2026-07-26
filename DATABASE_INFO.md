# Wellora — Database Information

## Database Technology
- **Type**: SQLite (file-based, no server required)
- **ORM**: Prisma
- **File**: `Backend/prisma/dev.db`
- **Schema**: `Backend/prisma/schema.prisma`

---

## Demo Accounts (Pre-seeded)

| Name | Email | Password | Role |
|------|-------|----------|------|
| Priya Sharma | priya@wellora.ai | password123 | CUSTOMER |
| Admin | admin@wellora.ai | password123 | ADMIN |

> **Note**: You can create new accounts via the Sign Up form on the app. All accounts are stored in the database.

---

## How to Inspect the Database

### Option 1: Prisma Studio (GUI — Recommended)
```powershell
cd Backend
npx prisma studio
```
Opens a web browser GUI at http://localhost:5555 showing all tables.

### Option 2: SQLite CLI
```powershell
# Install sqlite3 if needed
cd Backend/prisma
sqlite3 dev.db
```
Then in the SQLite shell:
```sql
-- List all tables
.tables

-- View all users
SELECT id, name, email, role, createdAt FROM User;

-- View all orders
SELECT id, userId, restaurantId, totalAmount, status, placedAt FROM "Order";

-- View order items
SELECT oi.id, u.name, m.name as meal, oi.quantity, oi.price
FROM OrderItem oi
JOIN "Order" o ON o.id = oi.orderId
JOIN User u ON u.id = o.userId
JOIN Meal m ON m.id = oi.mealId;

-- Exit
.quit
```

---

## Database Tables & What They Store

| Table | Purpose |
|-------|---------|
| `User` | All registered users — name, email, hashed password, role |
| `HealthProfile` | User health data — age, weight, BMI, diseases, fitness goals |
| `Address` | User delivery addresses |
| `Restaurant` | Registered restaurants with cuisine, rating, hours |
| `Meal` | Menu items with full nutrition data (calories, protein, carbs, fat, GI) |
| `Order` | Every order placed — user, restaurant, total, status |
| `OrderItem` | Individual items within each order |
| `OrderTracking` | Status history for each order |
| `NutritionLog` | Daily nutrition logs per user |
| `MealPlan` | AI-generated weekly meal plans |
| `MealSlot` | Individual meal slots within a plan |
| `GroceryProduct` | Available grocery items with nutrition data |
| `GroceryOrder` | Grocery orders placed by users |
| `GroceryItem` | Items within grocery orders |
| `Doctor` | Registered doctors with specialty, fee, ratings |
| `Appointment` | Doctor consultations booked by users |
| `ChatMessage` | AI assistant conversation history per user |

---

## Re-seeding the Database

If you want to reset all data to the demo defaults:
```powershell
cd Backend
npm run seed
```

This will:
1. Delete all existing data
2. Re-create 2 demo users (Customer + Admin)
3. Create 4 restaurants
4. Create 10 meals with full nutrition data
5. Create 12 grocery products
6. Create 4 doctors

---

## How Orders Work

1. User logs in → adds meals to cart
2. Clicks "Place Order" → POST `/api/orders`
3. Order is created in `Order` table with status `PLACED`
4. Order tracking events logged in `OrderTracking`
5. All orders tied to the user's ID (no cross-user data leakage)
6. Admin can view ALL orders at `GET /api/orders` (with admin token)

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | ❌ | Create new account |
| POST | /api/auth/login | ❌ | Login, receive JWT token |
| GET | /api/auth/me | ✅ | Get current user profile |
| GET | /api/meals | ❌ | Browse all meals (public) |
| GET | /api/orders | ✅ | Get my orders |
| POST | /api/orders | ✅ | Place new order |
| GET | /api/health-profile | ✅ | Get my health profile |
| PUT | /api/health-profile | ✅ | Update my health profile |
| GET | /api/doctors | ❌ | Browse doctors (public) |
| GET | /api/grocery | ❌ | Browse grocery products |
| POST | /api/ai/chat | ✅ | Send message to AI assistant |

---

## Starting the Backend

```powershell
cd Backend
npm run dev
```

Backend runs on: **http://localhost:3001**
Health check: **http://localhost:3001/api/health**

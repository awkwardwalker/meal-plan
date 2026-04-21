# 🥦 Family Meal Planner

A personalised weekly meal planning app for managing meals tailored to specific health needs — T2 Diabetes (blood sugar management) and PCOS + Wegovy (hormone support, appetite control).

---

## Features

| Feature | Description |
|---|---|
| **This Week** | View your current week's meal plan day-by-day with full recipes |
| **Weekly Planner** | Auto-generate or manually build any week's meals |
| **Meal Bank** | Browse, search, add, edit and delete from 50 pre-loaded meals |
| **Shopping List** | Auto-generated from the week's plan, categorised and checkable |
| **Cheat Days** | Mark any day as a cheat day (shown with 🍕) |
| **Holiday Days** | Mark day ranges as holiday — skipped in shopping list generation |
| **Meal Swap** | Change any individual meal with one click from the full bank |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, React Router |
| Backend | Node.js + Express |
| Database | **SQLite** (via `better-sqlite3`) — file-based, zero config |
| Container | Docker + docker-compose |
| Web server | nginx (frontend), Node (API) |

### Database

The database is a single SQLite file stored at `./data/mealplan.db` (on the host) or `/data/mealplan.db` inside the Docker container. It is auto-created and seeded with 50 meals on first run. **No external database service needed.**

Tables:
- `meals` — the meal bank (50 seeded meals + any you add)
- `weekly_plan` — which meal is assigned to each day/meal-type per week
- `day_overrides` — cheat day / holiday day flags
- `shopping_list` — generated shopping list per week with checked state

---

## Quick Start (Docker — recommended)

```bash
# Clone your repo
git clone https://github.com/YOUR_USERNAME/meal-plan.git
cd meal-plan

# Build and start everything
docker-compose up --build

# App is now running at:
#   Frontend → http://localhost:8080
#   API      → http://localhost:3001
```

**First time:** The database is seeded automatically with 50 meals on startup.

To stop:
```bash
docker-compose down
```

To reset the database completely (warning: destroys all data):
```bash
docker-compose down -v  # removes the meal-db volume
docker-compose up --build
```

---

## Local Development (no Docker)

### Prerequisites
- Node.js 18+
- npm

### Backend
```bash
cd backend
npm install
node server.js
# API runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
# API is proxied automatically via vite.config.js
```

---

## Project Structure

```
meal-plan/
├── docker-compose.yml        ← Orchestrates frontend + backend
├── .gitignore
├── README.md
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js             ← Express entry point
│   ├── db/
│   │   └── database.js       ← SQLite setup + 50-meal seed
│   └── routes/
│       ├── meals.js          ← GET/POST/PUT/DELETE /api/meals
│       ├── plan.js           ← GET/PUT/DELETE/POST /api/plan
│       ├── shopping.js       ← GET/POST/PATCH /api/shopping
│       └── overrides.js      ← GET/PUT/DELETE /api/overrides
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf            ← Proxies /api/* to backend container
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx           ← Routes
        ├── api.js            ← All API calls
        ├── components/
        │   └── ui.jsx        ← Shared Nav, Card, Button, Badge etc.
        └── pages/
            ├── WeekPlanner.jsx   ← / (current week view)
            ├── Schedule.jsx      ← /schedule (build/generate a week)
            ├── MealBank.jsx      ← /meal-bank (browse + edit 50 meals)
            └── Shopping.jsx      ← /shopping (checklist)
```

---

## API Reference

### Meals
| Method | Path | Description |
|---|---|---|
| GET | `/api/meals` | List all meals (supports `?meal_type=`, `?search=`) |
| POST | `/api/meals` | Add a new meal |
| PUT | `/api/meals/:id` | Update a meal |
| DELETE | `/api/meals/:id` | Delete a meal |

### Plan
| Method | Path | Description |
|---|---|---|
| GET | `/api/plan/current/weekStart` | Get Monday date for this week |
| GET | `/api/plan/:weekStart` | Get full week plan + overrides |
| PUT | `/api/plan/:weekStart/:day/:mealType` | Set a meal on the plan |
| DELETE | `/api/plan/:weekStart/:day/:mealType` | Remove a meal |
| POST | `/api/plan/generate/:weekStart` | Auto-generate a week |

### Shopping
| Method | Path | Description |
|---|---|---|
| GET | `/api/shopping/:weekStart` | Get shopping list |
| POST | `/api/shopping/generate/:weekStart` | Generate from plan |
| PATCH | `/api/shopping/:weekStart/item/:id` | Toggle checked |
| DELETE | `/api/shopping/:weekStart/item/:id` | Remove item |
| POST | `/api/shopping/:weekStart/item` | Add manual item |
| PATCH | `/api/shopping/:weekStart/reset` | Uncheck all |

### Overrides
| Method | Path | Description |
|---|---|---|
| GET | `/api/overrides/:weekStart` | Get day overrides |
| PUT | `/api/overrides/:weekStart/:day` | Set cheat/holiday/normal |
| DELETE | `/api/overrides/:weekStart/:day` | Clear override |

---

## Dietary Rules Applied

**You (T2 Diabetes):**
- No tuna, no salmon, no avocado, no white/red fish
- Cauliflower rice instead of regular rice
- Low-GI focus throughout
- Notes on every meal for blood sugar management

**Kim (PCOS + Wegovy):**
- No pasta, no cucumber, no avocado
- Anti-inflammatory, hormone-supportive ingredients
- High protein to support Wegovy appetite control
- Notes on every meal for PCOS management

---

## Pushing to GitHub

```bash
git init          # if not already a git repo
git add .
git commit -m "feat: full meal planner with meal bank, shopping list and Docker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/meal-plan.git
git push -u origin main
```

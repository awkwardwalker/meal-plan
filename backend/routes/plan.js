const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TYPES = ['breakfast','lunch','dinner'];

function tryParse(val, fallback) {
  try { return JSON.parse(val); } catch { return fallback; }
}
function parseMeal(m) {
  if (!m) return null;
  return { ...m, tags: tryParse(m.tags,[]), suitable_for: tryParse(m.suitable_for,['both']), ingredients: tryParse(m.ingredients,[]), steps: tryParse(m.steps,[]) };
}

// GET plan for a week
router.get('/:weekStart', (req, res) => {
  const { weekStart } = req.params;
  const rows = db.prepare(`
    SELECT wp.*, m.name, m.desc, m.time_minutes, m.tags, m.suitable_for, m.ingredients, m.steps, m.notes_you, m.notes_wife, m.meal_type as m_meal_type
    FROM weekly_plan wp
    LEFT JOIN meals m ON wp.meal_id = m.id
    WHERE wp.week_start = ?
  `).all(weekStart);

  // Organise into { Monday: { breakfast: {...}, lunch: {...}, dinner: {...} }, ... }
  const plan = {};
  DAYS.forEach(day => {
    plan[day] = {};
    MEAL_TYPES.forEach(mt => {
      const row = rows.find(r => r.day_name === day && r.meal_type === mt);
      if (row) {
        plan[day][mt] = {
          plan_id: row.id,
          meal_id: row.meal_id,
          name: row.name,
          desc: row.desc,
          time_minutes: row.time_minutes,
          tags: tryParse(row.tags, []),
          suitable_for: tryParse(row.suitable_for, ['both']),
          ingredients: tryParse(row.ingredients, []),
          steps: tryParse(row.steps, []),
          notes_you: row.notes_you,
          notes_wife: row.notes_wife,
          custom_note: row.custom_note
        };
      } else {
        plan[day][mt] = null;
      }
    });
  });

  // Get overrides
  const overrides = db.prepare('SELECT * FROM day_overrides WHERE week_start = ?').all(weekStart);
  const overrideMap = {};
  overrides.forEach(o => { overrideMap[o.day_name] = { type: o.override_type, label: o.label }; });

  res.json({ weekStart, plan, overrides: overrideMap });
});

// PUT set a meal in the plan
router.put('/:weekStart/:day/:mealType', (req, res) => {
  const { weekStart, day, mealType } = req.params;
  const { meal_id, custom_note } = req.body;

  db.prepare(`
    INSERT INTO weekly_plan (week_start, day_name, meal_type, meal_id, custom_note)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(week_start, day_name, meal_type) DO UPDATE SET meal_id=excluded.meal_id, custom_note=excluded.custom_note
  `).run(weekStart, day, mealType, meal_id, custom_note || null);

  res.json({ ok: true });
});

// DELETE remove a meal from plan
router.delete('/:weekStart/:day/:mealType', (req, res) => {
  const { weekStart, day, mealType } = req.params;
  db.prepare('DELETE FROM weekly_plan WHERE week_start=? AND day_name=? AND meal_type=?').run(weekStart, day, mealType);
  res.json({ ok: true });
});

// POST auto-generate a week from the meal bank
router.post('/generate/:weekStart', (req, res) => {
  const { weekStart } = req.params;

  // Get all available meals
  const allMeals = db.prepare('SELECT * FROM meals').all().map(parseMeal);
  const byType = { breakfast: [], lunch: [], dinner: [] };
  allMeals.forEach(m => byType[m.meal_type] && byType[m.meal_type].push(m));

  // Shuffle each type
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const shuffled = {
    breakfast: shuffle(byType.breakfast),
    lunch: shuffle(byType.lunch),
    dinner: shuffle(byType.dinner)
  };

  const insertPlan = db.prepare(`
    INSERT INTO weekly_plan (week_start, day_name, meal_type, meal_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(week_start, day_name, meal_type) DO UPDATE SET meal_id=excluded.meal_id
  `);

  // Check overrides — skip holiday/cheat days
  const overrides = db.prepare('SELECT day_name, override_type FROM day_overrides WHERE week_start = ?').all(weekStart);
  const overrideMap = {};
  overrides.forEach(o => { overrideMap[o.day_name] = o.override_type; });

  const transaction = db.transaction(() => {
    let bIdx = 0, lIdx = 0, dIdx = 0;
    DAYS.forEach(day => {
      if (overrideMap[day] === 'holiday') return; // skip holiday days entirely
      const usedIds = new Set();

      // breakfast
      const b = shuffled.breakfast[bIdx % shuffled.breakfast.length]; bIdx++;
      insertPlan.run(weekStart, day, 'breakfast', b.id);
      usedIds.add(b.id);

      // lunch — avoid same meal as breakfast
      let l = shuffled.lunch[lIdx % shuffled.lunch.length]; lIdx++;
      insertPlan.run(weekStart, day, 'lunch', l.id);

      // dinner — avoid repeating today's lunch
      let d = shuffled.dinner[dIdx % shuffled.dinner.length]; dIdx++;
      insertPlan.run(weekStart, day, 'dinner', d.id);
    });
  });

  transaction();
  res.json({ ok: true, generated: weekStart });
});

// GET current week start (Monday)
router.get('/current/weekStart', (_, res) => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const weekStart = monday.toISOString().split('T')[0];
  res.json({ weekStart });
});

module.exports = router;

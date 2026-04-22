const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TYPES = ['breakfast','lunch','dinner'];

function tryParse(val, fallback) {
  if (Array.isArray(val) || (val && typeof val === 'object')) return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

function parseMeal(m) {
  if (!m) return null;
  return {
    ...m,
    tags: tryParse(m.tags, []),
    suitable_for: tryParse(m.suitable_for, ['both']),
    ingredients: tryParse(m.ingredients, []),
    steps: tryParse(m.steps, [])
  };
}

// GET current week start (Monday)
router.get('/current/weekStart', (_, res) => {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const weekStart = monday.toISOString().split('T')[0];
  res.json({ weekStart });
});

// GET plan for a week
router.get('/:weekStart', async (req, res) => {
  try {
    const db = getDb();
    const { weekStart } = req.params;

    const [rows] = await db.execute(`
      SELECT wp.*, m.name, m.\`desc\`, m.time_minutes, m.tags, m.suitable_for,
             m.ingredients, m.steps, m.notes_you, m.notes_wife, m.meal_type as m_meal_type
      FROM weekly_plan wp
      LEFT JOIN meals m ON wp.meal_id = m.id
      WHERE wp.week_start = ?
    `, [weekStart]);

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

    const [overrides] = await db.execute('SELECT * FROM day_overrides WHERE week_start = ?', [weekStart]);
    const overrideMap = {};
    overrides.forEach(o => { overrideMap[o.day_name] = { type: o.override_type, label: o.label }; });

    res.json({ weekStart, plan, overrides: overrideMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT set a meal in the plan
router.put('/:weekStart/:day/:mealType', async (req, res) => {
  try {
    const db = getDb();
    const { weekStart, day, mealType } = req.params;
    const { meal_id, custom_note } = req.body;

    await db.execute(`
      INSERT INTO weekly_plan (week_start, day_name, meal_type, meal_id, custom_note)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE meal_id=VALUES(meal_id), custom_note=VALUES(custom_note)
    `, [weekStart, day, mealType, meal_id, custom_note || null]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove a meal from plan
router.delete('/:weekStart/:day/:mealType', async (req, res) => {
  try {
    const db = getDb();
    const { weekStart, day, mealType } = req.params;
    await db.execute('DELETE FROM weekly_plan WHERE week_start=? AND day_name=? AND meal_type=?', [weekStart, day, mealType]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST auto-generate a week from the meal bank
router.post('/generate/:weekStart', async (req, res) => {
  try {
    const db = getDb();
    const { weekStart } = req.params;

    const [allMeals] = await db.execute('SELECT * FROM meals');
    const parsed = allMeals.map(parseMeal);
    const byType = { breakfast: [], lunch: [], dinner: [] };
    parsed.forEach(m => byType[m.meal_type] && byType[m.meal_type].push(m));

    const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
    const shuffled = {
      breakfast: shuffle(byType.breakfast),
      lunch: shuffle(byType.lunch),
      dinner: shuffle(byType.dinner)
    };

    const [overrides] = await db.execute('SELECT day_name, override_type FROM day_overrides WHERE week_start = ?', [weekStart]);
    const overrideMap = {};
    overrides.forEach(o => { overrideMap[o.day_name] = o.override_type; });

    let bIdx = 0, lIdx = 0, dIdx = 0;
    for (const day of DAYS) {
      if (overrideMap[day] === 'holiday') continue;

      const b = shuffled.breakfast[bIdx++ % shuffled.breakfast.length];
      const l = shuffled.lunch[lIdx++ % shuffled.lunch.length];
      const d = shuffled.dinner[dIdx++ % shuffled.dinner.length];

      await db.execute(`
        INSERT INTO weekly_plan (week_start, day_name, meal_type, meal_id)
        VALUES (?, ?, 'breakfast', ?), (?, ?, 'lunch', ?), (?, ?, 'dinner', ?)
        ON DUPLICATE KEY UPDATE meal_id=VALUES(meal_id)
      `, [weekStart, day, b.id, weekStart, day, l.id, weekStart, day, d.id]);
    }

    res.json({ ok: true, generated: weekStart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

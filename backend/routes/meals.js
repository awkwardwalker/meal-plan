const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

function parseMeal(m) {
  return {
    ...m,
    tags: tryParse(m.tags, []),
    suitable_for: tryParse(m.suitable_for, ['both']),
    ingredients: tryParse(m.ingredients, []),
    steps: tryParse(m.steps, [])
  };
}

function tryParse(val, fallback) {
  if (Array.isArray(val) || (val && typeof val === 'object')) return val;
  try { return JSON.parse(val); } catch { return fallback; }
}

// GET all meals
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { meal_type, suitable_for, search } = req.query;
    let query = 'SELECT * FROM meals WHERE 1=1';
    const params = [];

    if (meal_type) { query += ' AND meal_type = ?'; params.push(meal_type); }
    if (suitable_for && suitable_for !== 'both') {
      query += ' AND (JSON_CONTAINS(suitable_for, ?) OR JSON_CONTAINS(suitable_for, ?))';
      params.push(JSON.stringify(suitable_for), JSON.stringify('both'));
    }
    if (search) {
      query += ' AND (name LIKE ? OR `desc` LIKE ? OR tags LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY meal_type, name';

    const [rows] = await db.execute(query, params);
    res.json(rows.map(parseMeal));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single meal
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.execute('SELECT * FROM meals WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(parseMeal(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new meal
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, meal_type, desc, time_minutes, tags, suitable_for, ingredients, steps, notes_you, notes_wife } = req.body;
    const [result] = await db.execute(
      'INSERT INTO meals (name, meal_type, `desc`, time_minutes, tags, suitable_for, ingredients, steps, notes_you, notes_wife) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, meal_type, desc, time_minutes,
        JSON.stringify(tags || []),
        JSON.stringify(suitable_for || ['both']),
        JSON.stringify(ingredients || []),
        JSON.stringify(steps || []),
        notes_you || '', notes_wife || '']
    );
    const [rows] = await db.execute('SELECT * FROM meals WHERE id = ?', [result.insertId]);
    res.status(201).json(parseMeal(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update meal
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { name, meal_type, desc, time_minutes, tags, suitable_for, ingredients, steps, notes_you, notes_wife } = req.body;
    await db.execute(
      'UPDATE meals SET name=?, meal_type=?, `desc`=?, time_minutes=?, tags=?, suitable_for=?, ingredients=?, steps=?, notes_you=?, notes_wife=? WHERE id=?',
      [name, meal_type, desc, time_minutes,
        JSON.stringify(tags || []),
        JSON.stringify(suitable_for || ['both']),
        JSON.stringify(ingredients || []),
        JSON.stringify(steps || []),
        notes_you || '', notes_wife || '', req.params.id]
    );
    const [rows] = await db.execute('SELECT * FROM meals WHERE id = ?', [req.params.id]);
    res.json(parseMeal(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE meal
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.execute('DELETE FROM meals WHERE id = ?', [req.params.id]);
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

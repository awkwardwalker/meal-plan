const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET all meals (with optional filters)
router.get('/', (req, res) => {
  const { meal_type, suitable_for, search } = req.query;
  let query = 'SELECT * FROM meals WHERE 1=1';
  const params = [];

  if (meal_type) { query += ' AND meal_type = ?'; params.push(meal_type); }
  if (suitable_for && suitable_for !== 'both') {
    query += ' AND (suitable_for LIKE ? OR suitable_for LIKE ?)';
    params.push(`%"${suitable_for}"%`, '%"both"%');
  }
  if (search) {
    query += ' AND (name LIKE ? OR desc LIKE ? OR tags LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  query += ' ORDER BY meal_type, name';

  const meals = db.prepare(query).all(...params);
  res.json(meals.map(parseMeal));
});

// GET single meal
router.get('/:id', (req, res) => {
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
  if (!meal) return res.status(404).json({ error: 'Not found' });
  res.json(parseMeal(meal));
});

// POST new meal
router.post('/', (req, res) => {
  const { name, meal_type, desc, time_minutes, tags, suitable_for, ingredients, steps, notes_you, notes_wife } = req.body;
  const result = db.prepare(`
    INSERT INTO meals (name, meal_type, desc, time_minutes, tags, suitable_for, ingredients, steps, notes_you, notes_wife)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(name, meal_type, desc, time_minutes,
    JSON.stringify(tags || []),
    JSON.stringify(suitable_for || ['both']),
    JSON.stringify(ingredients || []),
    JSON.stringify(steps || []),
    notes_you || '', notes_wife || '');
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parseMeal(meal));
});

// PUT update meal
router.put('/:id', (req, res) => {
  const { name, meal_type, desc, time_minutes, tags, suitable_for, ingredients, steps, notes_you, notes_wife } = req.body;
  db.prepare(`
    UPDATE meals SET name=?, meal_type=?, desc=?, time_minutes=?, tags=?, suitable_for=?, ingredients=?, steps=?, notes_you=?, notes_wife=?
    WHERE id=?
  `).run(name, meal_type, desc, time_minutes,
    JSON.stringify(tags || []),
    JSON.stringify(suitable_for || ['both']),
    JSON.stringify(ingredients || []),
    JSON.stringify(steps || []),
    notes_you || '', notes_wife || '', req.params.id);
  const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(req.params.id);
  res.json(parseMeal(meal));
});

// DELETE meal
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
  res.json({ deleted: true });
});

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
  try { return JSON.parse(val); } catch { return fallback; }
}

module.exports = router;

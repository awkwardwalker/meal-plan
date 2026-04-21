const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// GET overrides for a week
router.get('/:weekStart', (req, res) => {
  const rows = db.prepare('SELECT * FROM day_overrides WHERE week_start = ?').all(req.params.weekStart);
  res.json(rows);
});

// PUT set override for a day
router.put('/:weekStart/:day', (req, res) => {
  const { weekStart, day } = req.params;
  const { override_type, label } = req.body;

  if (override_type === 'normal') {
    db.prepare('DELETE FROM day_overrides WHERE week_start=? AND day_name=?').run(weekStart, day);
  } else {
    db.prepare(`
      INSERT INTO day_overrides (week_start, day_name, override_type, label)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(week_start, day_name) DO UPDATE SET override_type=excluded.override_type, label=excluded.label
    `).run(weekStart, day, override_type, label || null);
  }
  res.json({ ok: true });
});

// DELETE override
router.delete('/:weekStart/:day', (req, res) => {
  db.prepare('DELETE FROM day_overrides WHERE week_start=? AND day_name=?').run(req.params.weekStart, req.params.day);
  res.json({ ok: true });
});

module.exports = router;

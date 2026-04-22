const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

// GET overrides for a week
router.get('/:weekStart', async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.execute('SELECT * FROM day_overrides WHERE week_start = ?', [req.params.weekStart]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT set override for a day
router.put('/:weekStart/:day', async (req, res) => {
  try {
    const db = getDb();
    const { weekStart, day } = req.params;
    const { override_type, label } = req.body;

    if (override_type === 'normal') {
      await db.execute('DELETE FROM day_overrides WHERE week_start=? AND day_name=?', [weekStart, day]);
    } else {
      await db.execute(`
        INSERT INTO day_overrides (week_start, day_name, override_type, label)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE override_type=VALUES(override_type), label=VALUES(label)
      `, [weekStart, day, override_type, label || null]);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE override
router.delete('/:weekStart/:day', async (req, res) => {
  try {
    const db = getDb();
    await db.execute('DELETE FROM day_overrides WHERE week_start=? AND day_name=?', [req.params.weekStart, req.params.day]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

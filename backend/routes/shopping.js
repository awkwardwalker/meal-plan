const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');

const CATEGORY_RULES = [
  { cat: 'Meat & Fish', kw: ['chicken','beef','turkey','pork','lamb','bacon','mince','prawn','cod','mackerel','haddock','kipper','sardine','tuna','fish','steak'] },
  { cat: 'Dairy & Eggs', kw: ['egg','eggs','yoghurt','yogurt','cheese','cheddar','feta','parmesan','ricotta','butter','cream','milk','crème fraîche','cottage cheese'] },
  { cat: 'Fruit & Veg', kw: ['carrot','broccoli','spinach','pepper','courgette','mushroom','onion','garlic','ginger','leek','celery','asparagus','bean','lemon','lime','berry','berries','blueberr','strawberr','banana','beetroot','parsnip','potato','spring onion','lettuce','cos','rocket','watercress','radish','cress'] },
  { cat: 'Tins & Jars', kw: ['tin','canned','can','coconut milk','baked beans','sardines','kidney beans','chickpeas','butter beans','lentils','hummus','olives','salsa','stock','pesto','tahini'] },
  { cat: 'Dry Goods & Grains', kw: ['oat','flour','quinoa','rice','rye','cornflour','bread','wrap','tortilla','crispbread','almond flour','protein powder'] },
  { cat: 'Herbs, Spices & Condiments', kw: ['salt','pepper','cumin','paprika','cinnamon','chilli','thyme','rosemary','oregano','dill','parsley','coriander','garam masala','turmeric','curry paste','mustard','worcestershire','soy sauce','sesame oil','honey','maple syrup','vinegar','oil','coconut oil','olive oil','vegetable oil','goose fat','duck fat'] },
  { cat: 'Nuts & Seeds', kw: ['nut','walnut','almond','cashew','pumpkin seed','sunflower seed','chia seed','flaxseed','mixed nuts'] },
];

function categorise(ingredient) {
  const lower = ingredient.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.kw.some(k => lower.includes(k))) return rule.cat;
  }
  return 'Other';
}

// GET shopping list for a week
router.get('/:weekStart', async (req, res) => {
  try {
    const db = getDb();
    const [rows] = await db.execute(
      'SELECT * FROM shopping_list WHERE week_start = ? ORDER BY category, ingredient',
      [req.params.weekStart]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate shopping list from the week's plan
router.post('/generate/:weekStart', async (req, res) => {
  try {
    const db = getDb();
    const { weekStart } = req.params;

    const [holidayRows] = await db.execute(
      "SELECT day_name FROM day_overrides WHERE week_start=? AND override_type='holiday'",
      [weekStart]
    );
    const holidayDays = holidayRows.map(r => r.day_name);

    let query = `
      SELECT m.ingredients FROM weekly_plan wp
      JOIN meals m ON wp.meal_id = m.id
      WHERE wp.week_start = ?
    `;
    const params = [weekStart];
    if (holidayDays.length) {
      query += ` AND wp.day_name NOT IN (${holidayDays.map(() => '?').join(',')})`;
      params.push(...holidayDays);
    }

    const [rows] = await db.execute(query, params);

    const ingredientMap = {};
    rows.forEach(row => {
      const ings = Array.isArray(row.ingredients) ? row.ingredients : JSON.parse(row.ingredients || '[]');
      ings.forEach(ing => {
        const normKey = ing.replace(/^\d[\d\s\/\.]*\w*\s+/, '').toLowerCase().trim();
        if (!ingredientMap[normKey]) {
          ingredientMap[normKey] = { ingredient: ing, category: categorise(ing) };
        }
      });
    });

    await db.execute('DELETE FROM shopping_list WHERE week_start = ?', [weekStart]);

    for (const { ingredient, category } of Object.values(ingredientMap)) {
      await db.execute(
        'INSERT INTO shopping_list (week_start, ingredient, category, checked) VALUES (?, ?, ?, 0) ON DUPLICATE KEY UPDATE category=VALUES(category)',
        [weekStart, ingredient, category]
      );
    }

    const [items] = await db.execute(
      'SELECT * FROM shopping_list WHERE week_start = ? ORDER BY category, ingredient',
      [weekStart]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle item checked status
router.patch('/:weekStart/item/:id', async (req, res) => {
  try {
    const db = getDb();
    const { checked } = req.body;
    await db.execute('UPDATE shopping_list SET checked = ? WHERE id = ?', [checked ? 1 : 0, req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE single item
router.delete('/:weekStart/item/:id', async (req, res) => {
  try {
    const db = getDb();
    await db.execute('DELETE FROM shopping_list WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add manual item
router.post('/:weekStart/item', async (req, res) => {
  try {
    const db = getDb();
    const { weekStart } = req.params;
    const { ingredient, category } = req.body;
    const cat = category || categorise(ingredient);
    const [result] = await db.execute(
      'INSERT INTO shopping_list (week_start, ingredient, category, checked) VALUES (?, ?, ?, 0)',
      [weekStart, ingredient, cat]
    );
    res.status(201).json({ id: result.insertId, ingredient, category: cat, checked: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH reset all items to unchecked
router.patch('/:weekStart/reset', async (req, res) => {
  try {
    const db = getDb();
    await db.execute('UPDATE shopping_list SET checked = 0 WHERE week_start = ?', [req.params.weekStart]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

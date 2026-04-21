const express = require('express');
const router = express.Router();
const { db } = require('../db/database');

// Ingredient category rules (keyword → category)
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
router.get('/:weekStart', (req, res) => {
  const { weekStart } = req.params;
  const items = db.prepare('SELECT * FROM shopping_list WHERE week_start = ? ORDER BY category, ingredient').all(weekStart);
  res.json(items);
});

// POST generate shopping list from the week's plan
router.post('/generate/:weekStart', (req, res) => {
  const { weekStart } = req.params;

  // Fetch all meals in this week's plan (skip holiday days)
  const holidayDays = db.prepare(`SELECT day_name FROM day_overrides WHERE week_start=? AND override_type='holiday'`).all(weekStart).map(r => r.day_name);

  const rows = db.prepare(`
    SELECT m.ingredients FROM weekly_plan wp
    JOIN meals m ON wp.meal_id = m.id
    WHERE wp.week_start = ?
    ${holidayDays.length ? `AND wp.day_name NOT IN (${holidayDays.map(() => '?').join(',')})` : ''}
  `).all(weekStart, ...holidayDays);

  // Collect and deduplicate ingredients
  const ingredientMap = {};
  rows.forEach(row => {
    const ings = JSON.parse(row.ingredients || '[]');
    ings.forEach(ing => {
      // Normalise: strip quantities for grouping key
      const normKey = ing.replace(/^\d[\d\s\/\.]*\w*\s+/, '').toLowerCase().trim();
      if (!ingredientMap[normKey]) {
        ingredientMap[normKey] = { ingredient: ing, category: categorise(ing) };
      }
    });
  });

  // Clear old list and insert new
  const clearStmt = db.prepare('DELETE FROM shopping_list WHERE week_start = ?');
  const insertStmt = db.prepare(`
    INSERT INTO shopping_list (week_start, ingredient, category, checked)
    VALUES (?, ?, ?, 0)
    ON CONFLICT(week_start, ingredient) DO UPDATE SET category=excluded.category
  `);

  const transaction = db.transaction(() => {
    clearStmt.run(weekStart);
    for (const { ingredient, category } of Object.values(ingredientMap)) {
      insertStmt.run(weekStart, ingredient, category);
    }
  });
  transaction();

  const items = db.prepare('SELECT * FROM shopping_list WHERE week_start = ? ORDER BY category, ingredient').all(weekStart);
  res.json(items);
});

// PATCH toggle item checked status
router.patch('/:weekStart/item/:id', (req, res) => {
  const { id } = req.params;
  const { checked } = req.body;
  db.prepare('UPDATE shopping_list SET checked = ? WHERE id = ?').run(checked ? 1 : 0, id);
  res.json({ ok: true });
});

// DELETE single item
router.delete('/:weekStart/item/:id', (req, res) => {
  db.prepare('DELETE FROM shopping_list WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// POST add manual item
router.post('/:weekStart/item', (req, res) => {
  const { weekStart } = req.params;
  const { ingredient, category } = req.body;
  const result = db.prepare('INSERT INTO shopping_list (week_start, ingredient, category) VALUES (?, ?, ?)').run(weekStart, ingredient, category || categorise(ingredient));
  res.status(201).json({ id: result.lastInsertRowid, ingredient, category, checked: 0 });
});

// PATCH reset all items to unchecked
router.patch('/:weekStart/reset', (req, res) => {
  db.prepare('UPDATE shopping_list SET checked = 0 WHERE week_start = ?').run(req.params.weekStart);
  res.json({ ok: true });
});

module.exports = router;

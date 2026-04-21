const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_DIR = process.env.DB_DIR || path.join(__dirname, '../data');
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(path.join(DB_DIR, 'mealplan.db'));
db.pragma('journal_mode = WAL');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner')),
      desc TEXT,
      time_minutes INTEGER,
      tags TEXT DEFAULT '[]',
      suitable_for TEXT DEFAULT '["both"]',
      ingredients TEXT DEFAULT '[]',
      steps TEXT DEFAULT '[]',
      notes_you TEXT,
      notes_wife TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS weekly_plan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start DATE NOT NULL,
      day_name TEXT NOT NULL CHECK(day_name IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
      meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast','lunch','dinner')),
      meal_id INTEGER REFERENCES meals(id),
      custom_note TEXT,
      UNIQUE(week_start, day_name, meal_type)
    );

    CREATE TABLE IF NOT EXISTS day_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start DATE NOT NULL,
      day_name TEXT NOT NULL,
      override_type TEXT NOT NULL CHECK(override_type IN ('cheat','holiday','normal')),
      label TEXT,
      UNIQUE(week_start, day_name)
    );

    CREATE TABLE IF NOT EXISTS shopping_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start DATE NOT NULL,
      ingredient TEXT NOT NULL,
      quantity TEXT,
      unit TEXT,
      category TEXT DEFAULT 'other',
      checked INTEGER DEFAULT 0,
      UNIQUE(week_start, ingredient)
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM meals').get();
  if (count.c === 0) {
    seedMeals();
  }
}

function seedMeals() {
  const insert = db.prepare(`
    INSERT INTO meals (name, meal_type, desc, time_minutes, tags, suitable_for, ingredients, steps, notes_you, notes_wife)
    VALUES (@name, @meal_type, @desc, @time_minutes, @tags, @suitable_for, @ingredients, @steps, @notes_you, @notes_wife)
  `);

  const meals = [
    // ── BREAKFASTS (17) ──
    {
      name: "Greek Yoghurt & Berry Bowl",
      meal_type: "breakfast", time_minutes: 5,
      desc: "Full-fat Greek yoghurt with mixed berries, chia seeds and a drizzle of honey",
      tags: '["high-protein","low-gi","quick"]', suitable_for: '["both"]',
      ingredients: '["200g full-fat Greek yoghurt (per person)","80g mixed berries","1 tbsp chia seeds","1 tsp honey","Pinch of cinnamon (optional)"]',
      steps: '["Spoon yoghurt into two bowls.","Scatter berries over the top.","Sprinkle chia seeds and cinnamon.","Drizzle honey and serve immediately."]',
      notes_you: "Low-GI berries; chia seeds slow sugar absorption", notes_wife: "Anti-inflammatory; high protein supports PCOS"
    },
    {
      name: "Scrambled Eggs with Spinach & Feta",
      meal_type: "breakfast", time_minutes: 8,
      desc: "3-egg scramble with wilted baby spinach and feta crumbles",
      tags: '["high-protein","keto-friendly","quick"]', suitable_for: '["both"]',
      ingredients: '["6 eggs","80g baby spinach","60g feta cheese","1 tbsp butter","Salt and black pepper"]',
      steps: '["Whisk eggs with salt and pepper.","Melt butter, wilt spinach for 1 min.","Add eggs, fold gently until just set.","Top with crumbled feta."]',
      notes_you: "High protein improves insulin response", notes_wife: "Iron-rich spinach; great for PCOS"
    },
    {
      name: "Overnight Oats with Blueberries",
      meal_type: "breakfast", time_minutes: 3,
      desc: "Rolled oats soaked overnight in almond milk with cinnamon and blueberries",
      tags: '["prep-ahead","high-fibre"]', suitable_for: '["both"]',
      ingredients: '["80g rolled oats","300ml unsweetened almond milk","2 tbsp ground flaxseed","1 tsp cinnamon","100g fresh blueberries","1 tsp honey (optional)"]',
      steps: '["Night before: combine oats, milk, flaxseed, cinnamon in jars.","Seal and refrigerate overnight.","Morning: stir, add splash of milk if too thick.","Top with blueberries and serve cold."]',
      notes_you: "Keep portion modest; fibre slows glucose release", notes_wife: "Cinnamon excellent for insulin sensitivity"
    },
    {
      name: "Boiled Eggs & Grilled Mushrooms on Rye",
      meal_type: "breakfast", time_minutes: 10,
      desc: "Two soft-boiled eggs with garlicky mushrooms on rye bread",
      tags: '["high-protein","low-gi"]', suitable_for: '["both"]',
      ingredients: '["4 eggs","200g chestnut mushrooms","2 garlic cloves, minced","2 slices rye bread","1 tbsp olive oil","Chilli flakes","Fresh parsley"]',
      steps: '["Boil eggs 6-7 min, transfer to cold water.","Fry mushrooms in oil until golden, add garlic.","Toast rye bread.","Assemble and garnish with chilli flakes."]',
      notes_you: "Rye is lower GI than white bread; one slice only", notes_wife: "Mushrooms support hormone health"
    },
    {
      name: "High-Protein Breakfast Smoothie",
      meal_type: "breakfast", time_minutes: 5,
      desc: "Greek yoghurt, vanilla protein powder, frozen berries, spinach and chia seeds blended thick",
      tags: '["high-protein","quick","low-gi"]', suitable_for: '["both"]',
      ingredients: '["200g Greek yoghurt","2 scoops vanilla protein powder","150g frozen mixed berries","60g baby spinach","400ml unsweetened almond milk","2 tbsp chia seeds"]',
      steps: '["Add all ingredients to blender.","Blend 45-60 seconds until smooth.","Adjust consistency with milk or ice.","Pour into two glasses and serve."]',
      notes_you: "Low-GI; chia seeds slow absorption", notes_wife: "High protein supports Wegovy appetite control"
    },
    {
      name: "Poached Eggs & Bacon on Wholegrain Toast",
      meal_type: "breakfast", time_minutes: 10,
      desc: "Two poached eggs with grilled back bacon on wholegrain toast",
      tags: '["high-protein","classic"]', suitable_for: '["both"]',
      ingredients: '["4 eggs","4 rashers lean back bacon","2 slices wholegrain bread","White wine vinegar (splash)","Black pepper"]',
      steps: '["Grill bacon 3-4 min each side.","Poach eggs in simmering vinegar water for 3 min.","Toast bread.","Plate bacon, top with eggs and season."]',
      notes_you: "Protein-first breakfast stabilises blood sugar", notes_wife: "Light and filling"
    },
    {
      name: "Full Cooked Breakfast (Lighter)",
      meal_type: "breakfast", time_minutes: 15,
      desc: "Grilled back bacon, poached eggs, grilled mushrooms and baked beans — grilled not fried",
      tags: '["weekend","filling"]', suitable_for: '["both"]',
      ingredients: '["4 rashers lean back bacon","4 eggs","200g chestnut mushrooms","400g tin reduced-sugar baked beans","Salt and pepper"]',
      steps: '["Grill bacon and mushrooms on high 4-5 min.","Warm beans in a pan.","Poach eggs 3 min in simmering water.","Plate everything and season."]',
      notes_you: "Grilling vs frying cuts calories significantly", notes_wife: "Protein-packed treat"
    },
    {
      name: "Avocado-Free Veggie Omelette",
      meal_type: "breakfast", time_minutes: 10,
      desc: "3-egg omelette filled with peppers, onion and cheddar",
      tags: '["high-protein","keto-friendly","vegetarian"]', suitable_for: '["both"]',
      ingredients: '["6 eggs","1 red pepper, diced","½ onion, diced","60g mature cheddar, grated","1 tbsp olive oil","Salt and pepper"]',
      steps: '["Whisk eggs, season well.","Soften pepper and onion in oil 3 min.","Pour eggs over, cook on medium until edges set.","Add cheese, fold and serve."]',
      notes_you: "Zero carb base; good blood sugar control", notes_wife: "High protein, low carb"
    },
    {
      name: "Smoked Mackerel Pâté on Rye",
      meal_type: "breakfast", time_minutes: 5,
      desc: "Blended smoked mackerel with cream cheese and lemon on rye crackers",
      tags: '["omega-3","quick","high-protein"]', suitable_for: '["both"]',
      ingredients: '["150g smoked mackerel fillets","80g low-fat cream cheese","1 lemon, juiced","Black pepper","4 rye crispbreads","Fresh dill (optional)"]',
      steps: '["Flake mackerel into a bowl, removing skin.","Mix with cream cheese and lemon juice.","Season with black pepper.","Spread thickly on rye crispbreads."]',
      notes_you: "Omega-3 supports insulin sensitivity", notes_wife: "Excellent for PCOS hormone balance"
    },
    {
      name: "Cottage Cheese & Seed Bowl",
      meal_type: "breakfast", time_minutes: 3,
      desc: "High-protein cottage cheese with sunflower seeds, pumpkin seeds and a drizzle of honey",
      tags: '["high-protein","quick","low-gi"]', suitable_for: '["both"]',
      ingredients: '["300g low-fat cottage cheese","2 tbsp sunflower seeds","2 tbsp pumpkin seeds","1 tsp honey","Pinch of cinnamon"]',
      steps: '["Divide cottage cheese into two bowls.","Scatter seeds over the top.","Drizzle honey and add cinnamon.","Serve immediately."]',
      notes_you: "Very low GI, high satiety protein", notes_wife: "Seed blend supports hormone health for PCOS"
    },
    {
      name: "Banana Protein Pancakes",
      meal_type: "breakfast", time_minutes: 15,
      desc: "2-ingredient pancakes from banana and eggs, topped with berries",
      tags: '["high-protein","gluten-free","weekend"]', suitable_for: '["both"]',
      ingredients: '["2 ripe bananas","4 eggs","100g mixed berries","1 tsp coconut oil","Pinch of cinnamon"]',
      steps: '["Mash bananas, whisk with eggs and cinnamon.","Heat coconut oil in non-stick pan on medium.","Cook small pancakes 2 min each side.","Serve with fresh berries."]',
      notes_you: "Ripe bananas are higher GI — keep portions modest", notes_wife: "Naturally sweet, no added sugar"
    },
    {
      name: "Smoked Haddock & Poached Egg",
      meal_type: "breakfast", time_minutes: 12,
      desc: "Poached smoked haddock fillet topped with a poached egg and fresh parsley",
      tags: '["high-protein","omega-3"]', suitable_for: '["both"]',
      ingredients: '["2 smoked haddock fillets (150g each)","2 eggs","300ml milk (for poaching fish)","Fresh parsley","Black pepper","Splash of vinegar"]',
      steps: '["Poach haddock in milk 8 min on low heat.","Poach eggs in vinegar water 3 min.","Plate haddock, top with egg.","Garnish with parsley and pepper."]',
      notes_you: "Lean protein, no carb load", notes_wife: "Excellent PCOS-supportive protein"
    },
    {
      name: "Walnut & Cinnamon Porridge",
      meal_type: "breakfast", time_minutes: 8,
      desc: "Porridge oats with cinnamon, crushed walnuts and a drizzle of maple syrup",
      tags: '["high-fibre","warming","vegetarian"]', suitable_for: '["both"]',
      ingredients: '["80g rolled oats","400ml unsweetened almond milk","1 tsp cinnamon","40g walnuts, roughly crushed","1 tsp maple syrup","Pinch of salt"]',
      steps: '["Simmer oats in almond milk 5 min, stirring.","Add cinnamon and salt.","Transfer to bowls.","Top with walnuts and maple syrup."]',
      notes_you: "Walnuts add healthy fats that slow glucose; use a small portion of oats", notes_wife: "Walnuts great for PCOS hormonal balance"
    },
    {
      name: "Baked Beans & Eggs",
      meal_type: "breakfast", time_minutes: 10,
      desc: "Reduced-sugar baked beans with two baked or poached eggs",
      tags: '["high-protein","budget","quick"]', suitable_for: '["both"]',
      ingredients: '["400g tin reduced-sugar baked beans","4 eggs","Salt and pepper","Fresh parsley (optional)"]',
      steps: '["Warm beans in a saucepan on low.","Poach eggs in simmering water 3 min.","Pour beans into bowls, top with eggs.","Season and serve."]',
      notes_you: "Watch bean portion — moderate carb but fibre slows absorption", notes_wife: "Good protein-fibre balance"
    },
    {
      name: "Smashed Berries & Ricotta Toast",
      meal_type: "breakfast", time_minutes: 5,
      desc: "Wholegrain toast with creamy ricotta and smashed fresh strawberries",
      tags: '["quick","vegetarian","light"]', suitable_for: '["both"]',
      ingredients: '["2 slices wholegrain bread","150g ricotta","100g strawberries","1 tsp honey","Fresh mint (optional)"]',
      steps: '["Toast the bread.","Spread ricotta generously over each slice.","Smash strawberries with a fork, spoon over top.","Drizzle with honey and mint."]',
      notes_you: "One slice; ricotta adds protein to slow carb release", notes_wife: "Berries are anti-inflammatory for PCOS"
    },
    {
      name: "Turkey Bacon & Egg Muffin Cups",
      meal_type: "breakfast", time_minutes: 20,
      desc: "Baked egg cups with turkey bacon and cheddar in a muffin tin",
      tags: '["high-protein","prep-ahead","keto-friendly"]', suitable_for: '["both"]',
      ingredients: '["4 slices turkey bacon","4 eggs","40g mature cheddar, grated","Salt, pepper, chilli flakes","Olive oil (for greasing)"]',
      steps: '["Preheat oven 180°C. Grease 4 muffin holes.","Line each with a turkey bacon slice.","Crack one egg into each cup.","Top with cheddar. Bake 12-15 min until set."]',
      notes_you: "Zero carb; excellent blood sugar-friendly breakfast", notes_wife: "High protein supports Wegovy"
    },
    {
      name: "Kippers on Rye",
      meal_type: "breakfast", time_minutes: 8,
      desc: "Grilled kipper fillets with lemon butter on rye toast",
      tags: '["omega-3","quick","classic"]', suitable_for: '["both"]',
      ingredients: '["2 kipper fillets","2 slices rye bread","1 lemon, halved","10g butter","Black pepper","Fresh parsley"]',
      steps: '["Grill kippers under high heat 4-5 min.","Toast rye bread.","Plate kippers on toast, top with a knob of butter.","Squeeze lemon and finish with parsley."]',
      notes_you: "Omega-3 reduces inflammation; rye is lower GI", notes_wife: "Great omega-3 source for PCOS"
    },

    // ── LUNCHES (17) ──
    {
      name: "Chicken & Hummus Lettuce Wraps",
      meal_type: "lunch", time_minutes: 8,
      desc: "Shredded chicken, hummus and grated carrot in crisp lettuce cups",
      tags: '["low-carb","high-protein","quick"]', suitable_for: '["both"]',
      ingredients: '["200g leftover roast chicken, shredded","4 large iceberg lettuce leaves","4 tbsp hummus","1 carrot, grated","1 lemon","Salt and pepper"]',
      steps: '["Shred chicken.","Spread hummus in lettuce cups.","Fill with chicken and carrot.","Squeeze lemon, season and serve."]',
      notes_you: "No bread = lower carbs; hummus adds healthy fats", notes_wife: "High protein; quick and easy"
    },
    {
      name: "Tuna Niçoise Salad (Wife) / Chicken Niçoise (You)",
      meal_type: "lunch", time_minutes: 10,
      desc: "Niçoise salad with green beans, boiled eggs, olives and Dijon vinaigrette",
      tags: '["high-protein","omega-3","fresh"]', suitable_for: '["both"]',
      ingredients: '["2 x 145g cans tuna (wife) / 150g cooked chicken (you)","100g green beans","4 eggs","80g mixed salad leaves","50g black olives","2 tbsp olive oil, 1 tsp Dijon, 1 tbsp white wine vinegar"]',
      steps: '["Boil eggs 7 min, cool and halve.","Blanch green beans 3 min, cool.","Whisk dressing.","Assemble salad and drizzle dressing."]',
      notes_you: "Swap tuna for chicken — same prep, great blood sugar", notes_wife: "Omega-3 rich and filling"
    },
    {
      name: "Chicken Caesar Salad (No Croutons)",
      meal_type: "lunch", time_minutes: 10,
      desc: "Grilled chicken, cos lettuce, parmesan and light Caesar dressing",
      tags: '["high-protein","low-carb","classic"]', suitable_for: '["both"]',
      ingredients: '["2 chicken breasts","1 cos lettuce","40g parmesan","3 tbsp low-fat crème fraîche","1 tsp Dijon, 1 tsp Worcestershire, 1 tbsp lemon juice","1 garlic clove"]',
      steps: '["Season and griddle chicken 5-6 min each side. Slice.","Whisk dressing ingredients.","Arrange lettuce, top with chicken.","Drizzle dressing and shave parmesan."]',
      notes_you: "Skip croutons; high protein keeps you full", notes_wife: "High protein for Wegovy support"
    },
    {
      name: "Beef & Vegetable Soup",
      meal_type: "lunch", time_minutes: 10,
      desc: "Beef broth with carrot, leek, celery and shredded beef",
      tags: '["low-carb","warming","high-protein"]', suitable_for: '["both"]',
      ingredients: '["150g cooked beef, shredded","1 litre beef stock","2 carrots, diced","1 leek, sliced","2 celery sticks, diced","1 garlic clove","Fresh parsley"]',
      steps: '["Bring stock to simmer.","Add veg, simmer 6-7 min.","Add beef, heat through.","Season and garnish with parsley."]',
      notes_you: "Filling, low-carb and warming", notes_wife: "Gentle and satisfying"
    },
    {
      name: "Chicken & Vegetable Soup",
      meal_type: "lunch", time_minutes: 10,
      desc: "Light chicken broth with carrot, celery, leek and shredded chicken",
      tags: '["low-carb","warming","light"]', suitable_for: '["both"]',
      ingredients: '["2 cooked chicken breasts, shredded","1 litre chicken stock","2 carrots","2 celery sticks","1 leek","1 garlic clove","1 tsp dried thyme"]',
      steps: '["Simmer stock with veg and thyme 7 min.","Add chicken, warm through.","Season and garnish with parsley."]',
      notes_you: "Very low calorie and filling", notes_wife: "Gentle before a busy evening"
    },
    {
      name: "Egg & Cheese Quesadilla",
      meal_type: "lunch", time_minutes: 8,
      desc: "Wholegrain tortilla with scrambled egg, cheddar, spring onion and salsa",
      tags: '["high-protein","quick"]', suitable_for: '["both"]',
      ingredients: '["2 large wholegrain tortillas","4 eggs","60g mature cheddar, grated","3 spring onions","2 tbsp jarred salsa","1 tbsp butter"]',
      steps: '["Scramble eggs in butter until just set.","Fill one half of each tortilla with egg, cheese, onion and salsa.","Fold and griddle 2 min each side until golden.","Slice and serve."]',
      notes_you: "One tortilla manageable — monitor blood sugar", notes_wife: "Quick, filling and pasta-free"
    },
    {
      name: "Light Grazing Plate",
      meal_type: "lunch", time_minutes: 2,
      desc: "Sliced cheese, celery, olives, hummus and mixed nuts",
      tags: '["low-carb","no-cook","quick"]', suitable_for: '["both"]',
      ingredients: '["60g mature cheddar, sliced","4 celery sticks","50g mixed olives","4 tbsp hummus","30g mixed nuts"]',
      steps: '["Arrange everything on a board.","No cooking required. Graze as needed."]',
      notes_you: "Keeps hunger at bay without spiking blood sugar", notes_wife: "Light grazing works well with Wegovy"
    },
    {
      name: "Turkey & Avocado-Free Salad Wrap",
      meal_type: "lunch", time_minutes: 8,
      desc: "Sliced turkey, mixed leaves, cucumber (you only), grated carrot in a wholegrain wrap",
      tags: '["high-protein","quick"]', suitable_for: '["both"]',
      ingredients: '["200g cooked turkey slices","2 wholegrain wraps","80g mixed leaves","1 carrot, grated","2 tbsp low-fat Greek yoghurt (as dressing)","Salt and pepper"]',
      steps: '["Spread yoghurt over wraps.","Layer turkey, leaves and carrot.","Add cucumber slices if you like (you only).","Roll tightly and serve."]',
      notes_you: "Add cucumber for crunch and hydration", notes_wife: "Skip cucumber; still delicious"
    },
    {
      name: "Lentil & Spinach Soup",
      meal_type: "lunch", time_minutes: 20,
      desc: "Red lentil and spinach soup with cumin and coriander",
      tags: '["high-fibre","vegetarian","warming"]', suitable_for: '["both"]',
      ingredients: '["150g red lentils","1 litre vegetable stock","1 onion, diced","2 garlic cloves","1 tsp cumin","100g baby spinach","Juice of half a lemon"]',
      steps: '["Fry onion and garlic in oil 3 min.","Add lentils, cumin and stock. Simmer 15 min.","Stir in spinach until wilted.","Add lemon juice and season."]',
      notes_you: "Lentils are low-GI with lots of fibre", notes_wife: "High in iron and folate for PCOS"
    },
    {
      name: "Prawn & Cucumber Salad",
      meal_type: "lunch", time_minutes: 8,
      desc: "Cooked king prawns with mixed leaves, radishes and a lime-ginger dressing. Cucumber for you only.",
      tags: '["high-protein","low-calorie","quick"]', suitable_for: '["both"]',
      ingredients: '["200g cooked king prawns","100g mixed leaves","4 radishes, sliced","1 lime","1cm ginger, grated","1 tbsp sesame oil","1 tbsp soy sauce"]',
      steps: '["Whisk lime juice, ginger, sesame oil and soy for dressing.","Arrange leaves, radishes and prawns.","Add cucumber if you like (you only).","Drizzle dressing and serve."]',
      notes_you: "Prawns are very high protein, very low calorie", notes_wife: "Light but filling on Wegovy"
    },
    {
      name: "Sardines on Rye Toast",
      meal_type: "lunch", time_minutes: 5,
      desc: "Tinned sardines in olive oil on rye toast with wholegrain mustard and cress",
      tags: '["omega-3","budget","quick"]', suitable_for: '["both"]',
      ingredients: '["2 tins sardines in olive oil","2 slices rye bread","1 tbsp wholegrain mustard","Garden cress or watercress","1 lemon","Black pepper"]',
      steps: '["Toast rye bread.","Spread mustard on each slice.","Top with drained sardines.","Squeeze lemon, add cress and pepper."]',
      notes_you: "Omega-3 supports insulin sensitivity", notes_wife: "Excellent anti-inflammatory for PCOS"
    },
    {
      name: "Cottage Cheese & Veggie Bowl",
      meal_type: "lunch", time_minutes: 5,
      desc: "Low-fat cottage cheese with cherry peppers, spring onion and seeds",
      tags: '["high-protein","low-carb","no-cook"]', suitable_for: '["both"]',
      ingredients: '["300g low-fat cottage cheese","4 spring onions, sliced","2 tbsp pumpkin seeds","1 tbsp fresh chives","Black pepper","Rye crispbreads (optional)"]',
      steps: '["Stir spring onion and chives through cottage cheese.","Season with pepper.","Top with pumpkin seeds.","Serve with rye crispbreads if desired."]',
      notes_you: "High protein, very low GI", notes_wife: "Good protein hit with Wegovy"
    },
    {
      name: "Chicken & Butter Bean Salad",
      meal_type: "lunch", time_minutes: 10,
      desc: "Grilled chicken with butter beans, roasted peppers and pesto",
      tags: '["high-protein","high-fibre"]', suitable_for: '["both"]',
      ingredients: '["2 chicken breasts, grilled and sliced","400g tin butter beans, drained","2 roasted red peppers (jarred)","2 tbsp green pesto","Handful of rocket","Lemon wedge"]',
      steps: '["Slice grilled chicken.","Toss butter beans with pesto.","Arrange rocket, beans and peppers.","Top with chicken and a squeeze of lemon."]',
      notes_you: "Butter beans are low-GI and filling", notes_wife: "High protein and fibre; great for PCOS"
    },
    {
      name: "Smoked Mackerel & Beetroot Salad",
      meal_type: "lunch", time_minutes: 8,
      desc: "Smoked mackerel flakes over spinach with cooked beetroot and horseradish dressing",
      tags: '["omega-3","high-protein"]', suitable_for: '["both"]',
      ingredients: '["2 smoked mackerel fillets","100g baby spinach","2 cooked beetroot, sliced","1 tbsp horseradish sauce","2 tbsp low-fat crème fraîche","Lemon juice"]',
      steps: '["Flake mackerel over spinach.","Arrange beetroot alongside.","Mix horseradish, crème fraîche and lemon for dressing.","Drizzle and serve."]',
      notes_you: "Omega-3 and fibre-rich; no high-GI carbs", notes_wife: "Beetroot supports blood pressure and PCOS"
    },
    {
      name: "Spiced Chickpea Salad",
      meal_type: "lunch", time_minutes: 10,
      desc: "Roasted spiced chickpeas over mixed leaves with tahini dressing",
      tags: '["vegetarian","high-fibre","high-protein"]', suitable_for: '["both"]',
      ingredients: '["400g tin chickpeas, drained","1 tsp cumin, 1 tsp paprika","2 tbsp olive oil","80g mixed leaves","2 tbsp tahini","1 lemon","1 garlic clove"]',
      steps: '["Toss chickpeas in oil and spices. Air-fry or oven-roast 15 min at 200°C.","Whisk tahini, lemon and garlic with water for dressing.","Arrange leaves, top with chickpeas.","Drizzle dressing and serve."]',
      notes_you: "Chickpeas are moderate GI but very high fibre", notes_wife: "Plant protein and fibre for PCOS"
    },
    {
      name: "Ham & Egg Salad",
      meal_type: "lunch", time_minutes: 8,
      desc: "Thick-cut ham slices with boiled eggs, wholegrain mustard and watercress",
      tags: '["high-protein","low-carb","quick"]', suitable_for: '["both"]',
      ingredients: '["150g quality ham, thick-sliced","4 eggs, boiled","80g watercress or rocket","1 tbsp wholegrain mustard","1 tbsp olive oil","Salt and pepper"]',
      steps: '["Boil eggs 7 min, cool and halve.","Arrange watercress on plates.","Place ham and eggs over the top.","Whisk mustard and oil for dressing, drizzle and serve."]',
      notes_you: "High protein, zero complex carbs", notes_wife: "Quick protein hit"
    },
    {
      name: "Greek Salad with Grilled Chicken",
      meal_type: "lunch", time_minutes: 10,
      desc: "Classic Greek salad (no tomatoes) with cucumber (you only), olives, feta and grilled chicken",
      tags: '["high-protein","mediterranean"]', suitable_for: '["both"]',
      ingredients: '["2 chicken breasts, grilled","100g feta, cubed","50g black olives","½ red onion, sliced","Mixed peppers, sliced","2 tbsp olive oil","1 tbsp red wine vinegar","Dried oregano"]',
      steps: '["Grill chicken 5-6 min each side, slice.","Combine feta, olives, peppers and onion.","Add cucumber if you like (you only).","Dress with oil, vinegar and oregano. Top with chicken."]',
      notes_you: "Add cucumber for extra volume and hydration", notes_wife: "No cucumber but feta and olives are satisfying"
    },

    // ── DINNERS (16) ──
    {
      name: "Beef Stir-Fry with Broccoli & Peppers",
      meal_type: "dinner", time_minutes: 20,
      desc: "Lean beef strips wok-fried with broccoli, peppers, garlic, ginger, soy & sesame",
      tags: '["high-protein","low-carb","quick"]', suitable_for: '["both"]',
      ingredients: '["300g lean beef sirloin, sliced thin","200g broccoli florets","1 red and 1 yellow pepper, sliced","3 garlic cloves","2cm ginger, grated","3 tbsp low-sodium soy sauce","1 tsp sesame oil","1 tbsp vegetable oil","1 tsp cornflour","Cauliflower rice (you) / basmati rice (wife)"]',
      steps: '["Coat beef in cornflour, fry in hot wok 2-3 min. Set aside.","Fry garlic and ginger 30 sec.","Add broccoli and peppers, stir-fry 4-5 min.","Return beef, add soy and sesame. Toss 1-2 min.","Serve with appropriate rice."]',
      notes_you: "Cauliflower rice keeps blood sugar stable", notes_wife: "Nutrients support hormone balance"
    },
    {
      name: "Turkey Meatballs with Courgette Noodles",
      meal_type: "dinner", time_minutes: 25,
      desc: "Herby turkey meatballs in garlic & olive oil sauce with spiralised courgette",
      tags: '["high-protein","low-carb"]', suitable_for: '["both"]',
      ingredients: '["400g turkey mince","2 garlic cloves (meatballs)","1 tsp dried herbs","1 egg","3 large courgettes, spiralised","3 garlic cloves (sauce), sliced","3 tbsp olive oil","Juice of half a lemon","40g parmesan"]',
      steps: '["Mix turkey, garlic, herbs, egg. Form into 16 meatballs.","Fry meatballs 10-12 min until cooked.","Fry sliced garlic in oil, add courgette noodles, toss 2-3 min.","Squeeze lemon, plate noodles and top with meatballs and parmesan."]',
      notes_you: "Courgette instead of pasta = excellent blood sugar control", notes_wife: "No pasta needed; courgette is perfect"
    },
    {
      name: "Chicken & Asparagus Sheet Pan",
      meal_type: "dinner", time_minutes: 30,
      desc: "Chicken thighs with asparagus, garlic and lemon roasted on one tray",
      tags: '["one-tray","high-protein","low-carb"]', suitable_for: '["both"]',
      ingredients: '["4 bone-in chicken thighs","250g asparagus","4 garlic cloves","1 lemon, sliced","2 tbsp olive oil","1 tsp dried thyme","Salt and pepper"]',
      steps: '["Preheat oven 200°C.","Place chicken, asparagus and garlic on tray.","Lay lemon slices over chicken.","Drizzle oil, season, roast 25-28 min."]',
      notes_you: "Lean protein with low-carb veg", notes_wife: "One-tray simplicity; high protein"
    },
    {
      name: "Chicken Fajita Bowls",
      meal_type: "dinner", time_minutes: 20,
      desc: "Spiced chicken strips with sautéed peppers and onions, topped with sour cream and cheese",
      tags: '["high-protein","low-carb","quick"]', suitable_for: '["both"]',
      ingredients: '["2 chicken breasts, sliced","1 tsp smoked paprika, 1 tsp cumin, ½ tsp garlic powder, ½ tsp chilli powder","1 red and 1 green pepper, sliced","1 large onion, sliced","4 tbsp sour cream","50g cheddar, grated","1 lime"]',
      steps: '["Coat chicken in spices.","Fry chicken on high 5-6 min. Set aside.","Fry peppers and onion 5 min.","Combine, serve in bowls with sour cream, cheese and lime."]',
      notes_you: "No tortilla needed — big carb saving", notes_wife: "Naturally high protein, no pasta"
    },
    {
      name: "Prawn & Coconut Curry",
      meal_type: "dinner", time_minutes: 20,
      desc: "King prawns in light coconut milk curry with spinach",
      tags: '["high-protein","anti-inflammatory"]', suitable_for: '["both"]',
      ingredients: '["300g raw king prawns","400ml tin light coconut milk","2 tbsp Thai red curry paste","100g baby spinach","1 onion","2 garlic cloves","1cm ginger","Cauliflower rice (you) / basmati (wife)"]',
      steps: '["Fry onion 3 min, add garlic and ginger.","Add curry paste, stir 1 min.","Add coconut milk, simmer 5 min.","Add prawns 3-4 min until pink.","Stir in spinach, add lime juice. Serve with rice."]',
      notes_you: "Cauliflower rice; prawns very low calorie", notes_wife: "Anti-inflammatory coconut and spices"
    },
    {
      name: "Beef Burgers (Lettuce Bun)",
      meal_type: "dinner", time_minutes: 20,
      desc: "Homemade lean beef patties with cheese, pickles and mustard in lettuce leaves",
      tags: '["high-protein","low-carb","weekend"]', suitable_for: '["both"]',
      ingredients: '["400g lean beef mince (5% fat)","1 tsp garlic powder","1 tsp Worcestershire sauce","4 large iceberg lettuce leaves","2 slices mature cheddar","Pickled gherkins","½ red onion","1 tbsp Dijon mustard"]',
      steps: '["Mix mince with garlic powder, Worcestershire, season.","Shape into 2 patties, griddle 3-4 min per side.","Melt cheese slice on top last minute.","Assemble in lettuce leaves with pickles, onion and mustard."]',
      notes_you: "Lettuce bun = virtually zero carbs from bread", notes_wife: "High protein, very satisfying"
    },
    {
      name: "Full English Roast Dinner",
      meal_type: "dinner", time_minutes: 90,
      desc: "Roast chicken, roast potatoes, honey-glazed carrots and parsnips, Yorkshire puddings, stuffing and gravy",
      tags: '["weekend","roast","special"]', suitable_for: '["both"]',
      ingredients: '["1 whole chicken (1.5kg)","800g Maris Piper potatoes","3 tbsp goose fat","4 large carrots","4 parsnips","1 tbsp honey","Yorkshire pudding batter: 100g flour, 3 eggs, 150ml milk","Chicken stock for gravy"]',
      steps: '["Roast chicken 200°C for 1hr 20min with lemon, garlic and herbs.","Parboil potatoes 10 min, shake and roast in goose fat 45-50 min.","Roast carrots and parsnips 30 min, glaze with honey last 10 min.","Make Yorkshires at 220°C for 20-22 min, no peeking.","Rest chicken 15 min, make gravy from drippings. Carve and serve."]',
      notes_you: "Eat chicken and veg first; go lighter on potatoes and Yorkshires", notes_wife: "Smaller portions feel satisfying on Wegovy — enjoy all components"
    },
    {
      name: "Baked Salmon & Green Beans (Wife Only)",
      meal_type: "dinner", time_minutes: 20,
      desc: "Herb-crusted baked salmon fillet with steamed green beans and lemon butter",
      tags: '["omega-3","high-protein","wife-only"]', suitable_for: '["wife"]',
      ingredients: '["2 salmon fillets (150g each)","200g green beans","1 lemon","2 tbsp fresh dill","1 tbsp butter","Salt and pepper"]',
      steps: '["Preheat oven 200°C.","Place salmon on lined tray. Top with dill, lemon slices, season.","Bake 15-18 min.","Steam green beans 4 min.","Serve salmon over beans with lemon butter."]',
      notes_you: "You skip this meal — have the chicken thigh alternative", notes_wife: "Omega-3 rich; excellent for PCOS hormone support"
    },
    {
      name: "Chicken Thigh Tray Bake with Roasted Veg",
      meal_type: "dinner", time_minutes: 35,
      desc: "Paprika chicken thighs with courgette, peppers and onion roasted until caramelised",
      tags: '["one-tray","high-protein","low-carb"]', suitable_for: '["both"]',
      ingredients: '["4 chicken thighs","2 courgettes, chunked","1 red pepper, 1 yellow pepper","1 red onion, wedged","2 tbsp olive oil","1 tsp smoked paprika","1 tsp garlic powder","Salt and pepper"]',
      steps: '["Preheat oven 200°C.","Toss veg in oil and season.","Coat chicken in paprika, garlic powder and oil.","Arrange chicken over veg on one tray.","Roast 30-35 min until chicken golden."]',
      notes_you: "Low-carb; paprika supports circulation", notes_wife: "High protein, anti-inflammatory veg"
    },
    {
      name: "Lamb Kofta with Cauliflower Rice",
      meal_type: "dinner", time_minutes: 25,
      desc: "Spiced minced lamb kofta skewers with tzatziki and cauliflower rice",
      tags: '["high-protein","low-carb","mediterranean"]', suitable_for: '["both"]',
      ingredients: '["400g lamb mince","1 tsp cumin, 1 tsp coriander, ½ tsp cinnamon","2 garlic cloves, minced","1 egg","400g cauliflower rice","150g Greek yoghurt","½ cucumber (you only)","Fresh mint","Lemon"]',
      steps: '["Mix lamb with spices, garlic and egg. Form into kofta shapes.","Grill or pan-fry 10-12 min turning, until cooked through.","Make tzatziki: mix yoghurt, cucumber (you only), mint and lemon.","Serve kofta over cauliflower rice with tzatziki."]',
      notes_you: "Cauliflower rice; tzatziki fine with cucumber", notes_wife: "Tzatziki without cucumber; high protein"
    },
    {
      name: "Chilli Con Carne (Cauliflower Rice)",
      meal_type: "dinner", time_minutes: 35,
      desc: "Lean beef chilli with kidney beans, peppers and spices — cauliflower rice for you, basmati for wife",
      tags: '["high-protein","warming","batch-cook"]', suitable_for: '["both"]',
      ingredients: '["400g lean beef mince","400g tin kidney beans","1 red and 1 green pepper, diced","1 onion, diced","2 garlic cloves","1 tsp cumin, 1 tsp chilli powder, 1 tsp smoked paprika","400ml beef stock","Cauliflower rice (you) / basmati (wife)"]',
      steps: '["Fry onion and garlic 3 min.","Add mince, brown 5 min.","Add spices, peppers and stock. Simmer 20 min.","Stir in beans, cook 5 more min.","Serve over respective rice."]',
      notes_you: "Cauliflower rice; kidney beans moderate GI but high fibre", notes_wife: "Hearty and filling on Wegovy"
    },
    {
      name: "Grilled Chicken with Roasted Broccoli",
      meal_type: "dinner", time_minutes: 25,
      desc: "Simply grilled chicken breast with roasted tenderstem broccoli and garlic aioli",
      tags: '["high-protein","low-carb","simple"]', suitable_for: '["both"]',
      ingredients: '["2 chicken breasts","200g tenderstem broccoli","3 garlic cloves","3 tbsp olive oil","2 tbsp low-fat Greek yoghurt","1 tsp Dijon mustard","Lemon juice"]',
      steps: '["Preheat oven 200°C. Toss broccoli with oil, garlic and season. Roast 20 min.","Season chicken, griddle 5-6 min each side.","Mix yoghurt, mustard and lemon for aioli.","Plate chicken with broccoli and drizzle aioli."]',
      notes_you: "Extremely clean meal; minimal carbs", notes_wife: "Simple and satisfying"
    },
    {
      name: "Spiced Chickpea & Spinach Curry",
      meal_type: "dinner", time_minutes: 25,
      desc: "Warming chickpea and spinach curry with garam masala and coconut milk",
      tags: '["vegetarian","high-fibre","warming"]', suitable_for: '["both"]',
      ingredients: '["2 x 400g tins chickpeas, drained","400ml tin light coconut milk","100g baby spinach","1 onion","2 garlic cloves","1cm ginger","1 tsp garam masala, 1 tsp cumin, 1 tsp turmeric","Cauliflower rice (you) / basmati (wife)"]',
      steps: '["Fry onion, garlic and ginger 3 min.","Add spices, stir 1 min.","Add chickpeas and coconut milk. Simmer 15 min.","Stir in spinach, wilt.","Serve with respective rice."]',
      notes_you: "Chickpeas are lower GI with high fibre — cauliflower rice alongside", notes_wife: "Turmeric is anti-inflammatory for PCOS"
    },
    {
      name: "Pork Tenderloin with Green Veg",
      meal_type: "dinner", time_minutes: 25,
      desc: "Lean pork tenderloin with roasted asparagus and green beans in a mustard glaze",
      tags: '["high-protein","low-carb","lean"]', suitable_for: '["both"]',
      ingredients: '["400g pork tenderloin","200g asparagus","150g green beans","2 tbsp Dijon mustard","1 tbsp honey","2 tbsp olive oil","Garlic powder","Salt and pepper"]',
      steps: '["Preheat oven 200°C.","Rub pork with mustard, honey, garlic powder and season.","Roast pork 20-22 min until cooked through. Rest 5 min.","Roast asparagus and beans with oil 15 min alongside.","Slice pork and serve over veg."]',
      notes_you: "Pork tenderloin is very lean; excellent blood sugar meal", notes_wife: "Clean protein with hormone-supportive green veg"
    },
    {
      name: "Stuffed Peppers with Turkey & Quinoa",
      meal_type: "dinner", time_minutes: 35,
      desc: "Bell peppers stuffed with spiced turkey mince and quinoa, baked until tender",
      tags: '["high-protein","gluten-free"]', suitable_for: '["both"]',
      ingredients: '["4 large bell peppers, halved and deseeded","300g turkey mince","100g quinoa, cooked","1 onion, diced","2 garlic cloves","1 tsp cumin, 1 tsp smoked paprika","40g cheddar, grated"]',
      steps: '["Preheat oven 190°C.","Fry onion and garlic 3 min. Add turkey, brown 5 min. Add spices and quinoa.","Fill pepper halves with mixture. Top with cheddar.","Bake 25-30 min until peppers are tender and cheese golden."]',
      notes_you: "Quinoa is lower GI than rice; pepper is virtually carb-free", notes_wife: "High protein and anti-inflammatory"
    },
    {
      name: "Baked Cod with Lemon & Herb Crust",
      meal_type: "dinner", time_minutes: 20,
      desc: "Cod fillet baked with a parsley and almond crust, served with roasted courgette",
      tags: '["high-protein","low-calorie","omega-3"]', suitable_for: '["both"]',
      ingredients: '["2 cod fillets (150g each)","30g ground almonds","2 tbsp fresh parsley, chopped","1 lemon, zest and juice","2 courgettes, sliced","2 tbsp olive oil","Salt and pepper"]',
      steps: '["Preheat oven 200°C.","Mix almonds, parsley, lemon zest and season.","Press crust mixture onto cod fillets.","Toss courgette slices with oil, season. Arrange on tray.","Place fish on same tray. Bake 15-18 min."]',
      notes_you: "Very lean, low-carb and light on GI", notes_wife: "Cod is excellent lean protein for PCOS"
    }
  ];

  const insertMany = db.transaction((meals) => {
    for (const meal of meals) insert.run(meal);
  });
  insertMany(meals);
  console.log(`Seeded ${meals.length} meals`);
}

module.exports = { db, init };

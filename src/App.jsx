import { useState } from "react";

const mealPlan = {
  Monday: {
    breakfast: {
      name: "Greek Yoghurt & Berry Bowl",
      desc: "Full-fat Greek yoghurt with mixed berries, chia seeds and a drizzle of honey",
      time: "5 min",
      notes: { you: "Use low-sugar yoghurt; berries are low-GI", wife: "Great for PCOS — high protein, anti-inflammatory berries" },
      recipe: {
        serves: "2",
        ingredients: ["200g full-fat Greek yoghurt (per person)", "80g mixed berries (strawberries, blueberries, raspberries)", "1 tbsp chia seeds (per person)", "1 tsp honey (drizzle)", "Optional: pinch of cinnamon"],
        steps: ["Spoon Greek yoghurt into two bowls.", "Scatter the mixed berries over the top.", "Sprinkle chia seeds over each bowl.", "Drizzle with a small amount of honey.", "Add a pinch of cinnamon if using. Serve immediately."]
      }
    },
    lunch: {
      name: "Chicken & Hummus Lettuce Wraps",
      desc: "Leftover roast chicken (from Sunday), hummus, grated carrot and a squeeze of lemon in crisp lettuce cups. Add sliced cucumber if you like.",
      time: "8 min",
      notes: { you: "No bread = lower carbs; hummus adds protein and healthy fats. Add cucumber if you'd like.", wife: "Same meal — just skip the cucumber" },
      recipe: {
        serves: "2",
        ingredients: ["200g leftover roast chicken, shredded", "4 large iceberg or cos lettuce leaves (per person)", "4 tbsp hummus", "1 large carrot, peeled and grated", "1 lemon, halved", "Salt and pepper to taste", "Cucumber slices (optional, for you only)"],
        steps: ["Shred the leftover chicken into bite-sized pieces.", "Lay out the lettuce leaves on a board or plate.", "Spread a tablespoon of hummus into each lettuce cup.", "Divide the shredded chicken evenly between the cups.", "Top with grated carrot and a squeeze of fresh lemon.", "Season with salt and pepper. Add cucumber slices if desired (you only)."]
      }
    },
    dinner: {
      name: "Beef Stir-Fry with Broccoli & Peppers",
      desc: "Lean beef strips wok-fried with broccoli, bell peppers, garlic, ginger, soy & sesame. Served with cauliflower rice for you, egg-fried rice for wife.",
      time: "20 min",
      notes: { you: "Cauliflower rice keeps blood sugar stable", wife: "Full of nutrients that support hormone balance" },
      recipe: {
        serves: "2",
        ingredients: ["300g lean beef sirloin or rump, sliced into thin strips", "200g broccoli, cut into small florets", "1 red bell pepper, sliced", "1 yellow bell pepper, sliced", "3 garlic cloves, minced", "2cm piece of fresh ginger, grated", "3 tbsp low-sodium soy sauce", "1 tsp sesame oil", "1 tbsp vegetable oil", "1 tsp cornflour (to coat beef)", "400g cauliflower rice (for you)", "250g microwave basmati rice (for wife)", "2 spring onions, sliced (to garnish)"],
        steps: ["Toss beef strips in cornflour and a pinch of salt. Set aside.", "Heat vegetable oil in a wok or large frying pan on high heat.", "Add beef and stir-fry for 2–3 minutes until browned. Remove and set aside.", "In the same pan, add garlic and ginger and fry for 30 seconds.", "Add broccoli and peppers. Stir-fry for 4–5 minutes until just tender.", "Return the beef to the pan. Add soy sauce and sesame oil. Toss everything together for 1–2 minutes.", "Meanwhile, microwave the cauliflower rice (or basmati for wife) per packet instructions.", "Serve the stir-fry over the respective rice. Garnish with spring onions."]
      }
    }
  },
  Tuesday: {
    breakfast: {
      name: "Scrambled Eggs with Spinach",
      desc: "3-egg scramble with wilted baby spinach, feta crumbles and a grind of black pepper",
      time: "8 min",
      notes: { you: "High protein helps insulin response", wife: "Iron-rich spinach supports PCOS management" },
      recipe: {
        serves: "2",
        ingredients: ["6 eggs (3 per person)", "80g baby spinach", "60g feta cheese, crumbled", "1 tbsp butter or olive oil", "Salt and black pepper to taste", "Optional: pinch of chilli flakes"],
        steps: ["Crack the eggs into a bowl, season with salt and pepper, and whisk well.", "Heat butter or olive oil in a non-stick pan over medium-low heat.", "Add the baby spinach and stir until just wilted, about 1 minute.", "Pour in the beaten eggs. Leave for a few seconds then gently fold with a spatula, pulling from the edges.", "Remove from heat just before fully set — residual heat will finish them.", "Plate up and crumble feta over the top. Add chilli flakes if using."]
      }
    },
    lunch: {
      name: "Tuna Nicoise Salad",
      desc: "Canned tuna on a bed of mixed leaves, green beans, boiled eggs, olives and a Dijon vinaigrette",
      time: "10 min",
      notes: { you: "⚠️ Swap tuna for chicken — see your version below", wife: "Omega-3 rich, filling and satisfying" },
      youVersion: "Chicken Nicoise — swap tuna for sliced grilled chicken breast",
      recipe: {
        serves: "2",
        ingredients: ["2 x 145g cans tuna in spring water, drained (wife) / 150g cooked chicken breast, sliced (you)", "100g green beans, trimmed", "4 eggs", "80g mixed salad leaves", "50g black olives", "For dressing: 2 tbsp olive oil, 1 tsp Dijon mustard, 1 tbsp white wine vinegar, salt and pepper"],
        steps: ["Boil eggs for 7 minutes, then transfer to cold water. Peel and halve.", "Blanch green beans in boiling salted water for 3 minutes. Drain and cool under cold water.", "Whisk together the dressing ingredients in a small bowl.", "Arrange salad leaves in two bowls. Top with green beans, eggs, olives and tuna (or chicken for you).", "Drizzle the dressing over both bowls and serve immediately."]
      }
    },
    dinner: {
      name: "Turkey Meatballs with Courgette Noodles",
      desc: "Herby turkey meatballs in a light garlic & olive oil sauce with spiralised courgette and grated parmesan",
      time: "25 min",
      notes: { you: "Courgette noodles instead of pasta = great blood sugar control", wife: "No pasta — courgette noodles are perfect here" },
      recipe: {
        serves: "2",
        ingredients: ["400g turkey mince", "2 garlic cloves, minced (for meatballs)", "1 tsp dried mixed herbs", "1 egg", "Salt and pepper", "3 large courgettes, spiralised (or use pre-spiralised)", "3 garlic cloves, sliced (for sauce)", "3 tbsp olive oil", "Juice of half a lemon", "40g parmesan, grated", "Fresh parsley to garnish"],
        steps: ["Mix turkey mince with minced garlic, herbs, egg, salt and pepper. Roll into 16 small meatballs.", "Heat 1 tbsp olive oil in a frying pan over medium heat. Fry meatballs for 10–12 minutes, turning, until cooked through.", "In a separate large pan, heat remaining olive oil over medium heat. Add sliced garlic and fry for 1 minute.", "Add courgette noodles and toss for 2–3 minutes until just softened. Season well.", "Add a squeeze of lemon juice to the courgette noodles.", "Serve courgette noodles in bowls, top with meatballs, grated parmesan and fresh parsley."]
      }
    }
  },
  Wednesday: {
    breakfast: {
      name: "Overnight Oats",
      desc: "Rolled oats soaked overnight in almond milk with cinnamon, flaxseed and blueberries",
      time: "3 min (prep night before)",
      notes: { you: "Use a small portion — oats are moderate GI but fibre helps slow release", wife: "Cinnamon is excellent for insulin sensitivity with PCOS" },
      recipe: {
        serves: "2",
        ingredients: ["80g rolled oats (40g per person)", "300ml unsweetened almond milk", "2 tbsp ground flaxseed", "1 tsp cinnamon", "1 tsp honey or maple syrup (optional)", "100g fresh blueberries"],
        steps: ["The night before: divide oats between two jars or containers.", "Pour 150ml almond milk into each jar.", "Add 1 tbsp flaxseed and ½ tsp cinnamon to each. Stir well.", "Add a small drizzle of honey if using. Stir again, then seal and refrigerate overnight.", "In the morning: give it a stir. Add a splash more almond milk if too thick.", "Top with fresh blueberries and serve cold."]
      }
    },
    lunch: {
      name: "Chicken Caesar Salad (No Croutons)",
      desc: "Grilled chicken breast, cos lettuce, parmesan, and a light Caesar dressing",
      time: "10 min",
      notes: { you: "Skip croutons to reduce carb load", wife: "High protein keeps you full longer on Wegovy" },
      recipe: {
        serves: "2",
        ingredients: ["2 chicken breasts (approx 150g each)", "1 large cos (romaine) lettuce, roughly torn", "40g parmesan, shaved", "Salt and pepper", "For dressing: 3 tbsp low-fat crème fraîche, 1 tsp Dijon mustard, 1 tsp Worcestershire sauce, 1 tbsp lemon juice, 1 small garlic clove minced"],
        steps: ["Season chicken breasts with salt, pepper and a little olive oil.", "Cook in a hot griddle pan or frying pan for 5–6 minutes each side until cooked through. Rest for 2 minutes, then slice.", "Whisk all dressing ingredients together in a bowl. Season to taste.", "Arrange torn lettuce in two large bowls.", "Add sliced chicken on top.", "Drizzle dressing over each bowl and finish with shaved parmesan."]
      }
    },
    dinner: {
      name: "Chicken & Asparagus Sheet Pan",
      desc: "Chicken thighs with asparagus, garlic, lemon and herbs, all roasted on one tray with a drizzle of olive oil",
      time: "25 min",
      notes: { you: "Lean protein with low-carb veg — great blood sugar combo", wife: "One-tray simplicity, high protein for PCOS support" },
      recipe: {
        serves: "2",
        ingredients: ["4 bone-in chicken thighs (skin-on for flavour)", "250g asparagus, woody ends snapped off", "4 garlic cloves, skin on and lightly crushed", "1 lemon, sliced into rounds", "2 tbsp olive oil", "1 tsp dried thyme or mixed herbs", "Salt and black pepper"],
        steps: ["Preheat oven to 200°C (180°C fan).", "Place chicken thighs on a large baking tray. Scatter asparagus and garlic around them.", "Lay lemon slices over and around the chicken.", "Drizzle everything with olive oil. Sprinkle with herbs, salt and pepper.", "Roast for 25–28 minutes until chicken skin is golden and juices run clear.", "Serve straight from the tray."]
      }
    }
  },
  Thursday: {
    breakfast: {
      name: "Boiled Eggs & Grilled Mushrooms on Rye",
      desc: "Two soft-boiled eggs alongside garlicky grilled mushrooms on a slice of rye bread, sprinkled with chilli flakes",
      time: "8 min",
      notes: { you: "Rye has a lower GI than white bread — just one slice; mushrooms are very low calorie", wife: "Mushrooms support hormone health and are great for PCOS" },
      recipe: {
        serves: "2",
        ingredients: ["4 eggs (2 per person)", "200g chestnut or portobello mushrooms, sliced", "2 garlic cloves, minced", "1 tbsp olive oil or butter", "2 slices rye bread", "Pinch of chilli flakes", "Fresh parsley (optional)", "Salt and pepper"],
        steps: ["Bring a small pan of water to the boil. Gently lower in eggs and cook for 6–7 minutes for soft-boiled. Transfer to cold water then peel.", "Meanwhile, heat oil or butter in a frying pan over medium-high heat.", "Add mushrooms and cook for 3–4 minutes until golden. Add garlic, season, and cook for 1 more minute.", "Toast the rye bread.", "Halve the boiled eggs and arrange over the toast alongside the mushrooms.", "Scatter chilli flakes and fresh parsley over the top."]
      }
    },
    lunch: {
      name: "Beef & Vegetable Soup",
      desc: "Quick beef broth with diced carrot, leek, celery and shredded beef — use a good stock cube to save time",
      time: "10 min (if using pre-cooked beef)",
      notes: { you: "Filling, warming, low-carb", wife: "Easy on the stomach and very satisfying" },
      recipe: {
        serves: "2",
        ingredients: ["150g cooked beef (leftover or pre-cooked), shredded", "1 litre good beef stock (2 stock cubes dissolved in boiling water)", "2 medium carrots, peeled and diced small", "1 leek, sliced into rounds", "2 celery sticks, diced", "1 garlic clove, minced", "Salt, pepper and fresh parsley to finish"],
        steps: ["Bring the beef stock to a simmer in a medium saucepan.", "Add the carrot, leek, celery and garlic. Simmer for 6–7 minutes until the veg is just tender.", "Add the shredded beef and stir through. Heat for 1–2 minutes.", "Taste and season with salt and pepper.", "Ladle into bowls and scatter fresh parsley on top."]
      }
    },
    dinner: {
      name: "Chicken Fajita Bowls",
      desc: "Spiced chicken strips with sautéed peppers and onions in a bowl, topped with sour cream, grated cheese and a squeeze of lime. No wraps.",
      time: "20 min",
      notes: { you: "Bowl format skips the tortilla — big carb saving", wife: "Naturally no pasta, high protein" },
      recipe: {
        serves: "2",
        ingredients: ["2 chicken breasts (approx 150g each), sliced into strips", "1 tsp smoked paprika", "1 tsp cumin", "½ tsp garlic powder", "½ tsp chilli powder (adjust to taste)", "1 tbsp olive oil", "1 red pepper, sliced", "1 green pepper, sliced", "1 large onion, sliced", "4 tbsp sour cream", "50g cheddar, grated", "1 lime, halved", "Salt and pepper"],
        steps: ["Mix the paprika, cumin, garlic powder, chilli, salt and pepper in a bowl. Toss chicken strips in the spice mix.", "Heat oil in a large frying pan over high heat. Cook chicken strips for 5–6 minutes until cooked through and lightly charred. Remove and set aside.", "In the same pan, fry peppers and onion for 5 minutes until softened and slightly caramelised.", "Return the chicken to the pan with the veg. Toss together for 1 minute.", "Divide into two bowls. Top each with sour cream and grated cheese.", "Finish with a squeeze of fresh lime juice."]
      }
    }
  },
  Friday: {
    breakfast: {
      name: "High-Protein Breakfast Smoothie",
      desc: "Blend together Greek yoghurt, a scoop of vanilla protein powder, frozen mixed berries, a handful of spinach, almond milk and a tablespoon of chia seeds. Thick, creamy and filling.",
      time: "5 min",
      notes: { you: "Berries are low-GI; chia seeds slow sugar absorption — great blood sugar-friendly start", wife: "High protein supports Wegovy's appetite control; spinach and berries are excellent for PCOS" },
      recipe: {
        serves: "2",
        ingredients: ["2 x 100g full-fat Greek yoghurt", "2 scoops vanilla protein powder (approx 50g total)", "150g frozen mixed berries", "2 large handfuls baby spinach (approx 60g)", "400ml unsweetened almond milk", "2 tbsp chia seeds", "Ice cubes (optional, for extra thickness)"],
        steps: ["Add all ingredients to a blender.", "Blend on high for 45–60 seconds until completely smooth.", "Check consistency — add more almond milk if too thick, more ice if too thin.", "Pour into two large glasses and serve immediately.", "Tip: for even thicker smoothies, freeze the yoghurt in portions the night before."]
      }
    },
    lunch: {
      name: "Egg & Cheese Quesadilla",
      desc: "Wholegrain tortilla filled with scrambled egg, cheddar, spring onion and a dollop of salsa",
      time: "8 min",
      notes: { you: "One tortilla is manageable — monitor blood sugar", wife: "Quick and filling without pasta" },
      recipe: {
        serves: "2",
        ingredients: ["2 large wholegrain tortilla wraps", "4 eggs", "60g mature cheddar, grated", "3 spring onions, finely sliced", "2 tbsp jarred salsa", "1 tbsp butter", "Salt and pepper"],
        steps: ["Crack eggs into a bowl, season and whisk.", "Melt butter in a non-stick pan over medium heat. Scramble the eggs until just set. Remove from heat.", "Lay the tortillas flat. Spread scrambled egg over one half of each tortilla.", "Top with grated cheese, spring onions and a small spoonful of salsa.", "Fold the tortilla in half over the filling.", "Heat a dry frying pan over medium heat. Cook each quesadilla for 2 minutes per side until golden and the cheese has melted.", "Slice in half and serve."]
      }
    },
    dinner: {
      name: "Prawn & Coconut Curry",
      desc: "King prawns in a light coconut milk curry with spinach, served on cauliflower rice for you or basmati for wife",
      time: "20 min",
      notes: { you: "Cauliflower rice version — prawns are very low calorie and high protein", wife: "Coconut milk and spices great for inflammation" },
      recipe: {
        serves: "2",
        ingredients: ["300g raw king prawns, peeled", "1 x 400ml tin light coconut milk", "2 tbsp Thai red or yellow curry paste", "100g baby spinach", "1 onion, finely diced", "2 garlic cloves, minced", "1cm fresh ginger, grated", "1 tbsp vegetable oil", "Juice of half a lime", "400g cauliflower rice (for you)", "250g microwave basmati (for wife)", "Fresh coriander to garnish"],
        steps: ["Heat oil in a deep frying pan or wok over medium heat.", "Fry onion for 3 minutes until softened. Add garlic and ginger and cook for 1 minute.", "Add curry paste and stir for 1 minute until fragrant.", "Pour in coconut milk and bring to a gentle simmer. Cook for 5 minutes.", "Add prawns and cook for 3–4 minutes until pink and cooked through.", "Stir in spinach and let it wilt, about 1 minute.", "Add lime juice, taste and adjust seasoning.", "Microwave respective rice per packet instructions. Serve curry over the top with fresh coriander."]
      }
    }
  },
  Saturday: {
    breakfast: {
      name: "Full Cooked Breakfast (Lighter)",
      desc: "Grilled back bacon, poached or scrambled eggs, grilled mushrooms and baked beans — grilled, not fried",
      time: "15 min",
      notes: { you: "Grilling vs frying cuts calories significantly. Watch the beans portion (moderate carb)", wife: "Protein-packed Saturday treat that supports weight goals" },
      recipe: {
        serves: "2",
        ingredients: ["4 rashers lean back bacon", "4 eggs", "200g chestnut mushrooms, halved", "1 x 400g tin reduced-sugar baked beans", "1 tsp olive oil (for mushrooms)", "Salt and pepper", "Optional: 2 slices wholegrain toast"],
        steps: ["Preheat grill to high. Lay bacon rashers and mushrooms on a grill tray. Drizzle mushrooms with a little oil.", "Grill for 4–5 minutes, turning bacon once, until cooked to your liking.", "Meanwhile, heat baked beans in a small saucepan over low heat.", "Poach eggs: bring a pan of water to a gentle simmer. Add a splash of vinegar. Swirl the water, crack in eggs and cook for 3 minutes.", "Plate everything up. Add toast if having it. Season eggs with black pepper."]
      }
    },
    lunch: {
      name: "Chicken & Vegetable Soup",
      desc: "Light chicken broth with carrot, celery, leek and shredded chicken breast",
      time: "10 min",
      notes: { you: "Very low calorie, keeps you full ahead of Sunday prep", wife: "Gentle on the stomach, great before a busy Sunday" },
      recipe: {
        serves: "2",
        ingredients: ["2 cooked chicken breasts (leftover or rotisserie), shredded", "1 litre good chicken stock", "2 carrots, peeled and sliced into rounds", "2 celery sticks, diced", "1 leek, sliced", "1 garlic clove, minced", "1 tsp dried thyme", "Salt and pepper", "Fresh parsley to finish"],
        steps: ["Bring chicken stock to a simmer in a medium saucepan.", "Add carrot, celery, leek, garlic and thyme. Simmer for 7 minutes until veg is tender.", "Add shredded chicken and stir through. Warm for 2 minutes.", "Season to taste with salt and pepper.", "Ladle into bowls and finish with fresh parsley."]
      }
    },
    dinner: {
      name: "Beef Burgers (Lettuce Bun)",
      desc: "Homemade lean beef patties with cheese, pickles, onion and mustard in crispy lettuce leaves instead of buns",
      time: "20 min",
      notes: { you: "Lettuce bun = virtually zero carbs from the bread", wife: "High protein, very satisfying" },
      recipe: {
        serves: "2",
        ingredients: ["400g lean beef mince (5% fat)", "1 tsp garlic powder", "1 tsp Worcestershire sauce", "Salt and pepper", "4 large iceberg lettuce leaves (as buns)", "2 slices mature cheddar", "Pickled gherkins, sliced", "½ red onion, thinly sliced", "1 tbsp Dijon or American mustard"],
        steps: ["Combine beef mince with garlic powder, Worcestershire sauce, salt and pepper. Mix well.", "Divide into 2 equal portions and shape into patties roughly 2cm thick.", "Heat a griddle or frying pan over high heat. Cook patties for 3–4 minutes per side for medium, or until cooked to your liking.", "In the last minute of cooking, lay a cheese slice on each patty and cover briefly to melt.", "Lay out two large lettuce leaves per person as the top and bottom bun.", "Layer up with patty, pickles, red onion and mustard. Wrap and serve."]
      }
    }
  },
  Sunday: {
    isSpecial: true,
    breakfast: {
      name: "Poached Eggs & Grilled Bacon on Toast",
      desc: "Two poached eggs and grilled back bacon on wholegrain toast — a lighter cooked breakfast to save appetite for the big roast",
      time: "8 min",
      notes: { you: "Protein-first breakfast keeps blood sugar stable before the roast", wife: "Light and filling before the roast dinner" },
      recipe: {
        serves: "2",
        ingredients: ["4 eggs (2 per person)", "4 rashers lean back bacon", "2 slices wholegrain bread", "Splash of white wine vinegar (for poaching)", "Black pepper to finish"],
        steps: ["Preheat grill to high. Grill bacon for 3–4 minutes each side until cooked through.", "Meanwhile, bring a pan of water to a gentle simmer. Add a splash of vinegar.", "Crack each egg into a small cup first, then gently lower into the simmering water. Poach for 3 minutes for a runny yolk.", "Toast the bread while eggs cook.", "Place bacon on toast, top with poached eggs and finish with freshly ground black pepper."]
      }
    },
    lunch: {
      name: "Light Grazing Plate",
      desc: "Sliced cheese, celery sticks, olives, hummus and a handful of mixed nuts — graze while the roast cooks. Add cucumber if you'd like.",
      time: "2 min",
      notes: { you: "Keeps hunger at bay without spiking blood sugar. Cucumber fine for you.", wife: "Same plate — just skip the cucumber if included" },
      recipe: {
        serves: "2",
        ingredients: ["60g mature cheddar or similar, sliced", "4 celery sticks, halved", "50g mixed olives", "4 tbsp hummus", "30g mixed nuts (almonds, walnuts, cashews)", "Cucumber slices (optional — for you only)"],
        steps: ["Arrange everything on a large board or plate.", "No cooking required — just assemble and graze!", "Keep the portions light to save appetite for the roast dinner."]
      }
    },
    dinner: {
      name: "🍗 Full English Roast Dinner",
      desc: "Roast chicken, roast potatoes (goose fat for crunch!), honey-glazed carrots and parsnips, Yorkshire puddings, stuffing, roast gravy",
      time: "~90 min (oven does the work)",
      isRoast: true,
      tips: [
        "You: Eat plenty of chicken and veg first — go lighter on the potatoes and Yorkshires to manage blood sugar",
        "Wife: Wegovy means smaller portions feel satisfying — enjoy all components, just listen to your body",
        "Yorkshire puddings: use a wholemeal flour blend to slightly lower GI for you",
        "Roast potatoes: parboil, shake, then roast in a very hot oven (220°C) for maximum crunch with less oil",
        "Gravy: make from the chicken pan drippings — no need for thick shop-bought granules",
        "Parsnips & carrots: a little honey and thyme in the last 10 mins is magic"
      ],
      recipe: {
        serves: "2 (with leftovers for Monday lunch)",
        ingredients: [
          "1 whole chicken (approx 1.5kg)",
          "1 lemon, halved", "4 garlic cloves", "Fresh thyme and rosemary", "2 tbsp olive oil",
          "800g Maris Piper potatoes, peeled and quartered",
          "3 tbsp goose fat or duck fat",
          "4 large carrots, peeled and cut into batons",
          "4 parsnips, peeled and halved lengthways",
          "1 tbsp honey", "1 tsp fresh thyme leaves",
          "For Yorkshire puddings: 100g plain flour, 3 eggs, 150ml milk, pinch of salt, vegetable oil for the tin",
          "For gravy: chicken pan drippings, 300ml chicken stock, 1 tbsp plain flour"
        ],
        steps: [
          "Preheat oven to 200°C (180°C fan). Stuff the chicken cavity with lemon halves, garlic and herbs. Rub skin with olive oil, salt and pepper. Roast for 1hr 20min (or until juices run clear when the thigh is pierced).",
          "Parboil potatoes in salted water for 10 minutes. Drain, return to pan and shake to roughen edges. Heat goose fat in a roasting tin in the oven for 5 minutes, then carefully add potatoes. Roast for 45–50 minutes, turning once, until deeply golden.",
          "Toss carrots and parsnips in olive oil on a separate tray. Season well. Roast for 30 minutes, then drizzle with honey and scatter thyme. Return to oven for 10 more minutes.",
          "Yorkshire puddings: whisk flour, eggs, milk and salt until smooth. Rest 30 minutes if possible. Heat a muffin tin with a little oil in the oven until smoking hot. Quickly pour in batter and bake at 220°C for 20–22 minutes — do not open the oven!",
          "Rest the chicken for 15 minutes before carving.",
          "Gravy: pour off most fat from the chicken tin, leaving the drippings. Place on hob over medium heat. Stir in flour and cook 1 minute. Gradually add stock, stirring continuously until smooth and thickened. Season to taste.",
          "Carve the chicken and serve everything together on warm plates."
        ]
      }
    }
  }
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const meals = ["breakfast", "lunch", "dinner"];
const mealLabels = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner" };
const mealIcons = { breakfast: "☀️", lunch: "🌤️", dinner: "🌙" };

export default function MealPlan() {
  const [activeDay, setActiveDay] = useState("Monday");
  const [activeMeal, setActiveMeal] = useState(null);
  const [showRecipe, setShowRecipe] = useState({});

  const dayData = mealPlan[activeDay];

  const toggleRecipe = (e, meal) => {
    e.stopPropagation();
    setShowRecipe(prev => ({ ...prev, [meal]: !prev[meal] }));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1923 0%, #1a2a3a 50%, #0f2318 100%)",
      fontFamily: "'Georgia', serif",
      color: "#f0ede6",
      padding: "0 0 60px 0"
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "40px 24px 32px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "4px", color: "#8fbc8f", textTransform: "uppercase", marginBottom: "12px", fontFamily: "sans-serif" }}>
          Personalised Weekly Plan
        </div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: "normal", margin: "0 0 8px", color: "#f5f0e8", letterSpacing: "-0.5px" }}>
          Family Meal Planner
        </h1>
        <p style={{ fontSize: "15px", color: "#9aab9a", margin: "0", fontFamily: "sans-serif", fontStyle: "italic" }}>
          Tailored for you (T2 Diabetes · Weight Loss) & your wife (PCOS · Wegovy)
        </p>
      </div>

      {/* Day Selector */}
      <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "28px 16px 0", flexWrap: "wrap" }}>
        {days.map(day => {
          const isActive = activeDay === day;
          const isSunday = day === "Sunday";
          return (
            <button key={day} onClick={() => { setActiveDay(day); setActiveMeal(null); setShowRecipe({}); }}
              style={{
                padding: "10px 18px", borderRadius: "40px",
                border: isActive ? (isSunday ? "2px solid #f5a623" : "2px solid #8fbc8f") : "2px solid rgba(255,255,255,0.12)",
                background: isActive ? (isSunday ? "rgba(245,166,35,0.2)" : "rgba(143,188,143,0.2)") : "rgba(255,255,255,0.04)",
                color: isActive ? (isSunday ? "#f5a623" : "#8fbc8f") : "#9aab9a",
                cursor: "pointer", fontSize: "14px", fontFamily: "sans-serif",
                fontWeight: isActive ? "700" : "400", transition: "all 0.2s"
              }}>
              {day}{isSunday && " 🍗"}
            </button>
          );
        })}
      </div>

      {/* Sunday Banner */}
      {activeDay === "Sunday" && (
        <div style={{
          margin: "24px 16px 0", maxWidth: "780px", marginLeft: "auto", marginRight: "auto",
          background: "linear-gradient(135deg, rgba(245,166,35,0.15), rgba(245,100,35,0.1))",
          border: "1px solid rgba(245,166,35,0.4)", borderRadius: "16px", padding: "20px 24px", textAlign: "center"
        }}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>🍗</div>
          <div style={{ fontSize: "18px", color: "#f5a623", fontWeight: "bold", marginBottom: "4px" }}>Sunday Roast Day</div>
          <div style={{ fontSize: "14px", color: "#d4b896", fontFamily: "sans-serif" }}>
            Full English Roast Dinner — Roast Chicken, Roast Potatoes, Carrots, Parsnips & Yorkshire Puddings
          </div>
        </div>
      )}

      {/* Meal Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "780px", margin: "24px auto 0", padding: "0 16px" }}>
        {meals.map(meal => {
          const data = dayData[meal];
          const isOpen = activeMeal === meal;
          const isRoast = data.isRoast;
          const recipeOpen = showRecipe[meal];

          return (
            <div key={meal}
              onClick={() => { setActiveMeal(isOpen ? null : meal); if (isOpen) setShowRecipe(prev => ({ ...prev, [meal]: false })); }}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: isOpen ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "16px", overflow: "hidden", cursor: "pointer", transition: "all 0.25s"
              }}>

              {/* Card Header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 20px", background: isOpen ? "rgba(255,255,255,0.05)" : "transparent"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0,
                    background: meal === "breakfast" ? "rgba(245,166,35,0.2)" : meal === "lunch" ? "rgba(52,168,83,0.2)" : "rgba(74,108,247,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px"
                  }}>
                    {mealIcons[meal]}
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "sans-serif", color: "#9aab9a", marginBottom: "3px" }}>
                      {mealLabels[meal]} · {data.time}
                    </div>
                    <div style={{ fontSize: "17px", color: "#f0ede6", letterSpacing: "-0.2px" }}>{data.name}</div>
                  </div>
                </div>
                <div style={{ color: "#9aab9a", fontSize: "20px", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s", marginLeft: "8px", flexShrink: 0 }}>⌄</div>
              </div>

              {/* Expanded Content */}
              {isOpen && (
                <div style={{ padding: "0 20px 20px" }}>
                  <div style={{ fontSize: "15px", color: "#c8d8c8", fontFamily: "sans-serif", lineHeight: "1.6", marginBottom: "16px", fontStyle: "italic" }}>
                    {data.desc}
                  </div>

                  {isRoast && data.tips && (
                    <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                      <div style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#f5a623", fontFamily: "sans-serif", marginBottom: "10px" }}>🍽️ Roast Tips</div>
                      {data.tips.map((tip, i) => (
                        <div key={i} style={{ fontSize: "13px", color: "#d4b896", fontFamily: "sans-serif", lineHeight: "1.6", marginBottom: "6px", paddingLeft: "12px", borderLeft: "2px solid rgba(245,166,35,0.3)" }}>{tip}</div>
                      ))}
                    </div>
                  )}

                  {data.youVersion && (
                    <div style={{ background: "rgba(74,108,247,0.1)", border: "1px solid rgba(74,108,247,0.3)", borderRadius: "10px", padding: "12px 14px", marginBottom: "14px", fontSize: "13px", color: "#a0b4ff", fontFamily: "sans-serif" }}>
                      <strong>👨 Your version:</strong> {data.youVersion}
                    </div>
                  )}

                  {data.notes && (
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
                      <div style={{ flex: "1", minWidth: "200px", background: "rgba(74,108,247,0.08)", border: "1px solid rgba(74,108,247,0.2)", borderRadius: "10px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#7090f7", fontFamily: "sans-serif", marginBottom: "6px" }}>👨 For You</div>
                        <div style={{ fontSize: "13px", color: "#c0ccf5", fontFamily: "sans-serif", lineHeight: "1.5" }}>{data.notes.you}</div>
                      </div>
                      <div style={{ flex: "1", minWidth: "200px", background: "rgba(220,80,180,0.08)", border: "1px solid rgba(220,80,180,0.2)", borderRadius: "10px", padding: "12px 14px" }}>
                        <div style={{ fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#e080cc", fontFamily: "sans-serif", marginBottom: "6px" }}>👩 For Your Wife</div>
                        <div style={{ fontSize: "13px", color: "#f0c0e8", fontFamily: "sans-serif", lineHeight: "1.5" }}>{data.notes.wife}</div>
                      </div>
                    </div>
                  )}

                  {/* Recipe Toggle */}
                  {data.recipe && (
                    <div>
                      <button onClick={(e) => toggleRecipe(e, meal)} style={{
                        display: "flex", alignItems: "center", gap: "8px", width: "100%", justifyContent: "center",
                        background: recipeOpen ? "rgba(143,188,143,0.15)" : "rgba(255,255,255,0.06)",
                        border: recipeOpen ? "1px solid rgba(143,188,143,0.4)" : "1px solid rgba(255,255,255,0.12)",
                        borderRadius: "10px", padding: "10px 16px", cursor: "pointer",
                        color: recipeOpen ? "#8fbc8f" : "#c0c8c0", fontSize: "13px",
                        fontFamily: "sans-serif", fontWeight: "600", transition: "all 0.2s"
                      }}>
                        <span>📋</span>
                        <span>{recipeOpen ? "Hide Recipe" : "Show Recipe & Quantities"}</span>
                        <span style={{ marginLeft: "auto", transform: recipeOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>⌄</span>
                      </button>

                      {recipeOpen && (
                        <div style={{ marginTop: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "16px", border: "1px solid rgba(255,255,255,0.07)" }}
                          onClick={e => e.stopPropagation()}>

                          <div style={{ fontSize: "12px", color: "#8fbc8f", fontFamily: "sans-serif", letterSpacing: "1px", marginBottom: "14px", textTransform: "uppercase" }}>
                            Serves: {data.recipe.serves}
                          </div>

                          <div style={{ marginBottom: "16px" }}>
                            <div style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#f5a623", fontFamily: "sans-serif", marginBottom: "10px" }}>🛒 Ingredients</div>
                            {data.recipe.ingredients.map((ing, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "13px", color: "#d0dcd0", fontFamily: "sans-serif", lineHeight: "1.5", marginBottom: "5px" }}>
                                <span style={{ color: "#8fbc8f", flexShrink: 0, marginTop: "2px" }}>•</span>
                                <span>{ing}</span>
                              </div>
                            ))}
                          </div>

                          <div>
                            <div style={{ fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#f5a623", fontFamily: "sans-serif", marginBottom: "10px" }}>👨‍🍳 Method</div>
                            {data.recipe.steps.map((step, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "10px" }}>
                                <div style={{
                                  flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%",
                                  background: "rgba(143,188,143,0.2)", border: "1px solid rgba(143,188,143,0.4)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontSize: "11px", color: "#8fbc8f", fontFamily: "sans-serif", fontWeight: "700"
                                }}>
                                  {i + 1}
                                </div>
                                <div style={{ fontSize: "13px", color: "#c8d8c8", fontFamily: "sans-serif", lineHeight: "1.6", paddingTop: "2px" }}>
                                  {step}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dietary Key */}
      <div style={{ maxWidth: "780px", margin: "32px auto 0", padding: "0 16px" }}>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#8fbc8f", fontFamily: "sans-serif", marginBottom: "14px" }}>
            Dietary Guidelines Applied
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {[
              { label: "No white/red fish (except wife can have tuna)", icon: "🐟" },
              { label: "No tomatoes for either", icon: "🍅" },
              { label: "No tuna or peanut butter for you", icon: "🥜" },
              { label: "No pasta for your wife", icon: "🍝" },
              { label: "No avocado or salmon for either", icon: "🥑" },
              { label: "No cucumber for your wife", icon: "🥒" },
              { label: "Low-GI focus for your T2 diabetes", icon: "📊" },
              { label: "PCOS-supportive foods for your wife", icon: "💊" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px 12px",
                fontSize: "12px", fontFamily: "sans-serif", color: "#b0c0b0"
              }}>
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "32px", fontSize: "12px", color: "#5a6a5a", fontFamily: "sans-serif" }}>
        Always consult your GP or dietitian for medical dietary advice · Tap a meal to expand · Tap "Show Recipe" for ingredients & method
      </div>
    </div>
  );
}
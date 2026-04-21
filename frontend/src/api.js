const BASE = '/api';

async function req(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const api = {
  // Meals
  getMeals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req('GET', `/meals${qs ? '?' + qs : ''}`);
  },
  createMeal: (data) => req('POST', '/meals', data),
  updateMeal: (id, data) => req('PUT', `/meals/${id}`, data),
  deleteMeal: (id) => req('DELETE', `/meals/${id}`),

  // Plan
  getWeekStart: () => req('GET', '/plan/current/weekStart'),
  getPlan: (weekStart) => req('GET', `/plan/${weekStart}`),
  setPlanMeal: (weekStart, day, mealType, mealId, note) =>
    req('PUT', `/plan/${weekStart}/${day}/${mealType}`, { meal_id: mealId, custom_note: note }),
  removePlanMeal: (weekStart, day, mealType) =>
    req('DELETE', `/plan/${weekStart}/${day}/${mealType}`),
  generatePlan: (weekStart) => req('POST', `/plan/generate/${weekStart}`),

  // Shopping
  getShoppingList: (weekStart) => req('GET', `/shopping/${weekStart}`),
  generateShoppingList: (weekStart) => req('POST', `/shopping/generate/${weekStart}`),
  toggleItem: (weekStart, id, checked) => req('PATCH', `/shopping/${weekStart}/item/${id}`, { checked }),
  deleteItem: (weekStart, id) => req('DELETE', `/shopping/${weekStart}/item/${id}`),
  addItem: (weekStart, ingredient, category) => req('POST', `/shopping/${weekStart}/item`, { ingredient, category }),
  resetList: (weekStart) => req('PATCH', `/shopping/${weekStart}/reset`),

  // Overrides
  setOverride: (weekStart, day, override_type, label) =>
    req('PUT', `/overrides/${weekStart}/${day}`, { override_type, label }),
  deleteOverride: (weekStart, day) => req('DELETE', `/overrides/${weekStart}/${day}`),
};

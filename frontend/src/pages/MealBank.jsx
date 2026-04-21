import { useState, useEffect } from 'react';
import { api } from '../api';
import { tokens, Card, Button, Badge, Spinner, PageHeader } from '../components/ui';

const MEAL_TYPES = ['breakfast','lunch','dinner'];
const MEAL_ICONS = { breakfast: '☀️', lunch: '🌤️', dinner: '🌙' };

function MealForm({ initial = {}, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    meal_type: initial.meal_type || 'dinner',
    desc: initial.desc || '',
    time_minutes: initial.time_minutes || '',
    notes_you: initial.notes_you || '',
    notes_wife: initial.notes_wife || '',
    ingredients: (initial.ingredients || []).join('\n'),
    steps: (initial.steps || []).join('\n'),
    suitable_for: (initial.suitable_for || ['both']).join(','),
    tags: (initial.tags || []).join(','),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    const data = {
      ...form,
      time_minutes: parseInt(form.time_minutes) || null,
      ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
      steps: form.steps.split('\n').map(s => s.trim()).filter(Boolean),
      suitable_for: form.suitable_for.split(',').map(s => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map(s => s.trim()).filter(Boolean),
    };
    onSave(data);
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', color: tokens.textMuted, letterSpacing: '0.5px' }}>{label}</label>
      <input
        type={type} value={form[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{ padding: '9px 12px', borderRadius: tokens.radiusSm, background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.text, fontSize: '14px', outline: 'none', width: '100%' }}
      />
    </div>
  );

  const textarea = (label, key, placeholder = '', rows = 4) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '12px', color: tokens.textMuted }}>{label}</label>
      <textarea
        rows={rows} value={form[key]} placeholder={placeholder}
        onChange={e => set(key, e.target.value)}
        style={{ padding: '9px 12px', borderRadius: tokens.radiusSm, background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.text, fontSize: '13px', outline: 'none', width: '100%', resize: 'vertical', lineHeight: '1.5' }}
      />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {field('Meal Name *', 'name', 'text', 'e.g. Beef Stir-Fry with Broccoli')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', color: tokens.textMuted }}>Meal Type *</label>
          <select value={form.meal_type} onChange={e => set('meal_type', e.target.value)} style={{ padding: '9px 12px', borderRadius: tokens.radiusSm, background: '#1a2a1e', border: `1px solid ${tokens.border}`, color: tokens.text, fontSize: '14px', outline: 'none' }}>
            <option value="breakfast">☀️ Breakfast</option>
            <option value="lunch">🌤️ Lunch</option>
            <option value="dinner">🌙 Dinner</option>
          </select>
        </div>
      </div>
      {textarea('Description', 'desc', 'Short description of the meal…', 2)}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {field('Prep Time (minutes)', 'time_minutes', 'number', '20')}
        {field('Tags (comma-separated)', 'tags', 'text', 'high-protein, low-carb, quick')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {field('Notes — You (diabetes)', 'notes_you', 'text', 'Blood sugar info…')}
        {field("Notes — Kim (PCOS/Wegovy)", 'notes_wife', 'text', 'PCOS info…')}
      </div>
      {textarea('Ingredients (one per line)', 'ingredients', '200g chicken breast\n1 lemon, halved\n...', 5)}
      {textarea('Method Steps (one per line)', 'steps', 'Preheat oven to 200°C\nSeason chicken…\n...', 5)}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px' }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>
          {initial.id ? '💾 Save Changes' : '+ Add Meal'}
        </Button>
      </div>
    </div>
  );
}

export default function MealBank() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [editId, setEditId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setMeals(await api.getMeals()); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = meals.filter(m => {
    const typeOk = filter === 'all' || m.meal_type === filter;
    const searchOk = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.desc?.toLowerCase().includes(search.toLowerCase()) || m.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return typeOk && searchOk;
  });

  const handleAdd = async (data) => {
    await api.createMeal(data);
    setAdding(false);
    load();
  };

  const handleEdit = async (data) => {
    await api.updateMeal(editId, data);
    setEditId(null);
    load();
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    await api.deleteMeal(id);
    setDeleting(null);
    load();
  };

  const counts = { all: meals.length, ...Object.fromEntries(MEAL_TYPES.map(t => [t, meals.filter(m => m.meal_type === t).length])) };

  return (
    <div>
      <PageHeader
        title="Meal Bank"
        subtitle={`${meals.length} meals — tap any to expand, edit, or delete`}
        action={
          <Button variant="primary" onClick={() => setAdding(true)}>+ Add Meal</Button>
        }
      />

      {/* Add form */}
      {adding && (
        <div style={{ maxWidth: '860px', margin: '24px auto 0', padding: '0 16px' }}>
          <Card>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.border}`, fontFamily: 'Playfair Display, serif', fontSize: '18px' }}>New Meal</div>
            <MealForm onSave={handleAdd} onCancel={() => setAdding(false)} />
          </Card>
        </div>
      )}

      <div style={{ maxWidth: '860px', margin: '24px auto 0', padding: '0 16px 48px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['all', ...MEAL_TYPES].map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding: '7px 14px', borderRadius: '40px', cursor: 'pointer',
                border: `2px solid ${filter === t ? tokens.green : tokens.border}`,
                background: filter === t ? tokens.greenDim : 'transparent',
                color: filter === t ? tokens.green : tokens.textMuted,
                fontSize: '13px', fontWeight: filter === t ? '600' : '400', transition: 'all 0.15s'
              }}>
                {t === 'all' ? `All (${counts.all})` : `${MEAL_ICONS[t]} ${t.charAt(0).toUpperCase() + t.slice(1)} (${counts[t] || 0})`}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meals…"
            style={{ marginLeft: 'auto', padding: '7px 14px', borderRadius: '40px', background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.text, fontSize: '13px', outline: 'none', minWidth: '200px' }}
          />
        </div>

        {loading ? <Spinner /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px', color: tokens.textMuted }}>No meals found.</div>
            )}
            {filtered.map(meal => {
              const isOpen = expanded === meal.id;
              const isEditing = editId === meal.id;

              return (
                <Card key={meal.id} style={{ border: `1px solid ${isOpen ? tokens.borderActive : tokens.border}` }}>
                  {isEditing ? (
                    <>
                      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${tokens.border}`, fontFamily: 'Playfair Display, serif', fontSize: '16px', color: tokens.gold }}>
                        Editing: {meal.name}
                      </div>
                      <MealForm initial={meal} onSave={handleEdit} onCancel={() => setEditId(null)} />
                    </>
                  ) : (
                    <>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', cursor: 'pointer' }}
                        onClick={() => setExpanded(isOpen ? null : meal.id)}>
                        <div style={{ fontSize: '20px', flexShrink: 0 }}>{MEAL_ICONS[meal.meal_type]}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '15px', color: tokens.text }}>{meal.name}</div>
                          <div style={{ fontSize: '12px', color: tokens.textMuted, marginTop: '2px' }}>
                            {meal.time_minutes && `⏱ ${meal.time_minutes} min · `}
                            {meal.tags?.slice(0, 3).join(', ')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <Button small onClick={e => { e.stopPropagation(); setEditId(meal.id); setExpanded(null); }}>✏️</Button>
                          <Button small variant="danger" disabled={deleting === meal.id} onClick={e => { e.stopPropagation(); handleDelete(meal.id); }}>
                            {deleting === meal.id ? '…' : '🗑'}
                          </Button>
                        </div>
                        <span style={{ color: tokens.textMuted, fontSize: '18px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: '4px' }}>⌄</span>
                      </div>

                      {/* Expanded */}
                      {isOpen && (
                        <div style={{ padding: '0 18px 18px', borderTop: `1px solid ${tokens.border}` }}>
                          <p style={{ fontSize: '14px', color: '#b8c8b8', fontStyle: 'italic', lineHeight: '1.6', margin: '14px 0' }}>{meal.desc}</p>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                            {meal.tags?.map(t => <Badge key={t}>{t}</Badge>)}
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {meal.notes_you && (
                              <div style={{ flex: '1', minWidth: '180px', background: tokens.blueDim, border: `1px solid ${tokens.blue}30`, borderRadius: tokens.radiusSm, padding: '10px 14px' }}>
                                <div style={{ fontSize: '11px', color: tokens.blue, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>👨 You</div>
                                <div style={{ fontSize: '13px', color: '#b0c4e0' }}>{meal.notes_you}</div>
                              </div>
                            )}
                            {meal.notes_wife && (
                              <div style={{ flex: '1', minWidth: '180px', background: tokens.pinkDim, border: `1px solid ${tokens.pink}30`, borderRadius: tokens.radiusSm, padding: '10px 14px' }}>
                                <div style={{ fontSize: '11px', color: tokens.pink, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>👩 Kim</div>
                                <div style={{ fontSize: '13px', color: '#e0b0d4' }}>{meal.notes_wife}</div>
                              </div>
                            )}
                          </div>
                          {meal.ingredients?.length > 0 && (
                            <details style={{ marginBottom: '10px' }}>
                              <summary style={{ fontSize: '13px', color: tokens.gold, cursor: 'pointer', fontWeight: '500', marginBottom: '8px' }}>🛒 Ingredients ({meal.ingredients.length})</summary>
                              {meal.ingredients.map((ing, i) => <div key={i} style={{ fontSize: '13px', color: '#c8d8c8', lineHeight: '1.7', paddingLeft: '8px' }}>• {ing}</div>)}
                            </details>
                          )}
                          {meal.steps?.length > 0 && (
                            <details>
                              <summary style={{ fontSize: '13px', color: tokens.gold, cursor: 'pointer', fontWeight: '500', marginBottom: '8px' }}>👨‍🍳 Method ({meal.steps.length} steps)</summary>
                              {meal.steps.map((step, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '7px' }}>
                                  <div style={{ flexShrink: 0, width: '20px', height: '20px', borderRadius: '50%', background: tokens.greenDim, border: `1px solid ${tokens.green}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: tokens.green, fontWeight: '700' }}>{i + 1}</div>
                                  <div style={{ fontSize: '13px', color: '#c8d8c8', lineHeight: '1.6', paddingTop: '1px' }}>{step}</div>
                                </div>
                              ))}
                            </details>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

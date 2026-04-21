import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { tokens, Card, Button, Badge, Spinner, PageHeader } from '../components/ui';

const CATEGORY_ICONS = {
  'Meat & Fish': '🥩',
  'Dairy & Eggs': '🥛',
  'Fruit & Veg': '🥦',
  'Tins & Jars': '🥫',
  'Dry Goods & Grains': '🌾',
  'Herbs, Spices & Condiments': '🧂',
  'Nuts & Seeds': '🥜',
  'Other': '🛒',
};

const CATEGORY_ORDER = ['Meat & Fish', 'Dairy & Eggs', 'Fruit & Veg', 'Tins & Jars', 'Dry Goods & Grains', 'Herbs, Spices & Condiments', 'Nuts & Seeds', 'Other'];

function getCurrentMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function formatWeek(ws) {
  const s = new Date(ws);
  const e = new Date(ws);
  e.setDate(e.getDate() + 6);
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `w/c ${fmt(s)}`;
}

export default function Shopping() {
  const [weekStart, setWeekStart] = useState(getCurrentMonday());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [hideChecked, setHideChecked] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.getShoppingList(weekStart)); }
    finally { setLoading(false); }
  }, [weekStart]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const newItems = await api.generateShoppingList(weekStart);
      setItems(newItems);
    } finally { setGenerating(false); }
  };

  const handleToggle = async (item) => {
    const newChecked = !item.checked;
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: newChecked } : i));
    await api.toggleItem(weekStart, item.id, newChecked);
  };

  const handleDelete = async (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    await api.deleteItem(weekStart, id);
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    const created = await api.addItem(weekStart, newItem.trim());
    setItems(prev => [...prev, created]);
    setNewItem('');
    setAddingItem(false);
  };

  const handleResetAll = async () => {
    await api.resetList(weekStart);
    setItems(prev => prev.map(i => ({ ...i, checked: false })));
  };

  // Group by category
  const grouped = {};
  items.forEach(item => {
    const cat = item.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const checkedCount = items.filter(i => i.checked).length;
  const progress = items.length ? Math.round((checkedCount / items.length) * 100) : 0;

  const weekOptions = [
    { label: 'This Week', value: getCurrentMonday() },
    { label: 'Next Week', value: (() => { const d = new Date(); const day = d.getDay(); d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day)); return d.toISOString().split('T')[0]; })() },
  ];

  return (
    <div>
      <PageHeader
        title="Shopping List"
        subtitle="Auto-generated from your week's meal plan"
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            {items.length > 0 && checkedCount > 0 && (
              <Button small onClick={handleResetAll}>↺ Reset</Button>
            )}
            <Button variant="gold" onClick={handleGenerate} disabled={generating}>
              {generating ? '⏳ Generating…' : '🔄 Regenerate from Plan'}
            </Button>
          </div>
        }
      />

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px 48px' }}>
        {/* Week selector */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          {weekOptions.map(({ label, value }) => (
            <button key={value} onClick={() => setWeekStart(value)} style={{
              padding: '7px 14px', borderRadius: '40px', cursor: 'pointer',
              border: `2px solid ${weekStart === value ? tokens.green : tokens.border}`,
              background: weekStart === value ? tokens.greenDim : 'transparent',
              color: weekStart === value ? tokens.green : tokens.textMuted,
              fontSize: '13px', fontWeight: weekStart === value ? '600' : '400',
              transition: 'all 0.15s'
            }}>{label} <span style={{ opacity: 0.6 }}>({formatWeek(value)})</span></button>
          ))}
        </div>

        {/* Progress bar */}
        {items.length > 0 && (
          <Card style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: tokens.textMuted }}>
                {checkedCount} of {items.length} items collected
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => setHideChecked(h => !h)} style={{
                  fontSize: '12px', color: tokens.textMuted, background: hideChecked ? tokens.greenDim : 'transparent',
                  border: `1px solid ${hideChecked ? tokens.green : tokens.border}`, borderRadius: '20px', padding: '4px 10px',
                  cursor: 'pointer', transition: 'all 0.15s', color: hideChecked ? tokens.green : tokens.textMuted
                }}>
                  {hideChecked ? '👁 Show all' : '✓ Hide done'}
                </button>
                <Badge color={progress === 100 ? 'green' : 'gold'}>{progress}%</Badge>
              </div>
            </div>
            <div style={{ height: '6px', background: tokens.border, borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${tokens.green}, #a0d4a0)`, borderRadius: '3px', transition: 'width 0.3s' }} />
            </div>
            {progress === 100 && (
              <div style={{ fontSize: '13px', color: tokens.green, marginTop: '10px', textAlign: 'center' }}>
                🎉 All items collected! Happy shopping!
              </div>
            )}
          </Card>
        )}

        {/* Add item */}
        {addingItem ? (
          <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <input value={newItem} onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddItem()}
              placeholder="e.g. 2 chicken breasts…" autoFocus
              style={{ flex: 1, padding: '8px 12px', borderRadius: tokens.radiusSm, background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.text, fontSize: '14px', outline: 'none' }}
            />
            <Button small variant="primary" onClick={handleAddItem}>Add</Button>
            <Button small variant="ghost" onClick={() => setAddingItem(false)}>Cancel</Button>
          </Card>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <Button variant="default" small onClick={() => setAddingItem(true)}>+ Add item manually</Button>
          </div>
        )}

        {loading ? <Spinner /> : items.length === 0 ? (
          <Card style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🛒</div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', marginBottom: '8px' }}>No list yet</div>
            <div style={{ fontSize: '14px', color: tokens.textMuted, marginBottom: '20px' }}>Generate your shopping list from the week's plan</div>
            <Button variant="gold" onClick={handleGenerate} disabled={generating}>
              {generating ? '⏳ Generating…' : '🔄 Generate from Plan'}
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {CATEGORY_ORDER.filter(cat => grouped[cat]?.length).map(cat => {
              const catItems = (grouped[cat] || []).filter(i => !hideChecked || !i.checked);
              if (!catItems.length) return null;
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '16px' }}>{CATEGORY_ICONS[cat] || '📦'}</span>
                    <span style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: tokens.textMuted, fontWeight: '600' }}>{cat}</span>
                    <span style={{ fontSize: '11px', color: tokens.textDim }}>
                      ({grouped[cat].filter(i => i.checked).length}/{grouped[cat].length})
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {catItems.map(item => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '11px 14px', borderRadius: tokens.radiusSm,
                        background: item.checked ? 'rgba(126,184,126,0.05)' : tokens.surface,
                        border: `1px solid ${item.checked ? tokens.green + '30' : tokens.border}`,
                        transition: 'all 0.15s'
                      }}>
                        {/* Checkbox */}
                        <button onClick={() => handleToggle(item)} style={{
                          width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                          border: `2px solid ${item.checked ? tokens.green : tokens.border}`,
                          background: item.checked ? tokens.green : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#0d1a14', fontSize: '12px', fontWeight: '700',
                          transition: 'all 0.15s', cursor: 'pointer'
                        }}>
                          {item.checked && '✓'}
                        </button>
                        <span style={{
                          flex: 1, fontSize: '14px',
                          color: item.checked ? tokens.textDim : tokens.text,
                          textDecoration: item.checked ? 'line-through' : 'none',
                          transition: 'all 0.15s'
                        }}>
                          {item.ingredient}
                        </span>
                        <button onClick={() => handleDelete(item.id)} style={{
                          color: tokens.textDim, fontSize: '16px', opacity: 0.4,
                          transition: 'opacity 0.15s', cursor: 'pointer', background: 'none', border: 'none',
                          lineHeight: 1, padding: '0 4px'
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                        >×</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

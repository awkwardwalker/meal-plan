import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { tokens, Card, Button, Badge, Spinner, PageHeader } from '../components/ui';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TYPES = ['breakfast','lunch','dinner'];
const MEAL_ICONS = { breakfast: '☀️', lunch: '🌤️', dinner: '🌙' };

function getNextMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function getCurrentMonday() {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function formatWeek(ws) {
  const start = new Date(ws);
  const end = new Date(ws);
  end.setDate(end.getDate() + 6);
  const fmt = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function Schedule() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(getCurrentMonday());
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [overrides, setOverrides] = useState({});
  const [overrideModal, setOverrideModal] = useState(null);
  const [overrideType, setOverrideType] = useState('cheat');
  const [overrideLabel, setOverrideLabel] = useState('');
  const [mealBank, setMealBank] = useState([]);
  const [swapOpen, setSwapOpen] = useState(null);
  const [swapFilter, setSwapFilter] = useState('');

  const load = async (ws) => {
    setLoading(true);
    try {
      const data = await api.getPlan(ws);
      setPlanData(data);
      setOverrides(data.overrides || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(weekStart); }, [weekStart]);
  useEffect(() => { api.getMeals().then(setMealBank); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.generatePlan(weekStart);
      await load(weekStart);
    } finally {
      setGenerating(false);
    }
  };

  const handleSetOverride = async () => {
    if (overrideType === 'normal') {
      await api.deleteOverride(weekStart, overrideModal);
    } else {
      await api.setOverride(weekStart, overrideModal, overrideType, overrideLabel);
    }
    setOverrideModal(null);
    setOverrideLabel('');
    load(weekStart);
  };

  const handleSwap = async (meal) => {
    await api.setPlanMeal(weekStart, swapOpen.day, swapOpen.mealType, meal.id);
    setSwapOpen(null);
    load(weekStart);
  };

  const plan = planData?.plan || {};
  const allFilled = DAYS.every(day =>
    overrides[day]?.type === 'holiday' ||
    MEAL_TYPES.every(mt => plan[day]?.[mt]?.name)
  );

  const weekOptions = [
    { label: 'This Week', value: getCurrentMonday() },
    { label: 'Next Week', value: getNextMonday() },
  ];

  return (
    <div>
      <PageHeader
        title="Weekly Planner"
        subtitle="Auto-generate or manually build your week's meals"
      />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {weekOptions.map(({ label, value }) => (
              <button key={value} onClick={() => setWeekStart(value)} style={{
                padding: '8px 16px', borderRadius: '40px', cursor: 'pointer',
                border: `2px solid ${weekStart === value ? tokens.green : tokens.border}`,
                background: weekStart === value ? tokens.greenDim : 'transparent',
                color: weekStart === value ? tokens.green : tokens.textMuted,
                fontSize: '13px', fontWeight: weekStart === value ? '600' : '400',
                transition: 'all 0.15s'
              }}>{label}</button>
            ))}
          </div>
          <span style={{ fontSize: '13px', color: tokens.textMuted }}>{formatWeek(weekStart)}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button variant="gold" onClick={handleGenerate} disabled={generating}>
              {generating ? '⏳ Generating…' : '✨ Auto-Generate Week'}
            </Button>
            {allFilled && (
              <Button variant="primary" onClick={() => navigate('/')}>
                → View Week
              </Button>
            )}
          </div>
        </div>

        {/* Info box */}
        <Card style={{ padding: '16px 20px', marginBottom: '24px', background: tokens.goldDim, border: `1px solid ${tokens.gold}40` }}>
          <div style={{ fontSize: '13px', color: '#d4b870', lineHeight: '1.6' }}>
            <strong>✨ Auto-Generate</strong> randomly picks from your 50-meal bank — respecting your dietary rules (no salmon/avocado/tuna for you, no pasta for Kim, etc.). You can then swap any individual meal. Mark days as Cheat or Holiday before generating.
          </div>
        </Card>

        {loading ? <Spinner /> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {DAYS.map(day => {
              const override = overrides[day];
              const isHoliday = override?.type === 'holiday';
              const isCheat = override?.type === 'cheat';
              const isSunday = day === 'Sunday';

              return (
                <Card key={day}>
                  {/* Day header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                    borderBottom: `1px solid ${tokens.border}`,
                    background: isHoliday ? tokens.blueDim : isCheat ? tokens.redDim : isSunday ? tokens.goldDim : tokens.surface
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontFamily: 'Playfair Display, serif', fontSize: '18px',
                        color: isHoliday ? tokens.blue : isCheat ? tokens.red : isSunday ? tokens.gold : tokens.text
                      }}>{day}</span>
                      {isCheat && <Badge color="red">🍕 Cheat Day{override.label ? ` — ${override.label}` : ''}</Badge>}
                      {isHoliday && <Badge color="blue">✈️ Holiday{override.label ? ` — ${override.label}` : ''}</Badge>}
                      {isSunday && !isCheat && !isHoliday && <Badge color="gold">🍗 Roast Day</Badge>}
                    </div>
                    <Button small onClick={() => { setOverrideModal(day); setOverrideType(override?.type || 'cheat'); setOverrideLabel(override?.label || ''); }}>
                      📌 Mark
                    </Button>
                  </div>

                  {isHoliday ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: tokens.textMuted, fontSize: '14px' }}>
                      ✈️ No meals — enjoying {override.label || 'a holiday'}!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
                      {MEAL_TYPES.map((mt, idx) => {
                        const meal = plan[day]?.[mt];
                        return (
                          <div key={mt} style={{
                            padding: '14px 16px',
                            borderRight: idx < 2 ? `1px solid ${tokens.border}` : 'none'
                          }}>
                            <div style={{ fontSize: '11px', color: tokens.textMuted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
                              {MEAL_ICONS[mt]} {mt}
                            </div>
                            {meal ? (
                              <>
                                <div style={{ fontSize: '13px', color: tokens.text, lineHeight: '1.4', marginBottom: '8px' }}>{meal.name}</div>
                                <Button small onClick={() => setSwapOpen({ day, mealType: mt })}>🔄 Swap</Button>
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: '13px', color: tokens.textDim, fontStyle: 'italic', marginBottom: '8px' }}>Not set</div>
                                <Button small variant="primary" onClick={() => setSwapOpen({ day, mealType: mt })}>+ Add</Button>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Swap modal */}
      {swapOpen && (
        <Modal title={`Choose ${swapOpen.mealType}`} onClose={() => setSwapOpen(null)}>
          <div style={{ padding: '16px 20px 20px' }}>
            <input
              value={swapFilter}
              onChange={e => setSwapFilter(e.target.value)}
              placeholder="Search meals…"
              style={{
                width: '100%', padding: '9px 14px', borderRadius: tokens.radiusSm,
                background: tokens.surface, border: `1px solid ${tokens.border}`,
                color: tokens.text, fontSize: '14px', outline: 'none', marginBottom: '12px'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '55vh', overflowY: 'auto' }}>
              {mealBank.filter(m => m.meal_type === swapOpen.mealType && (!swapFilter || m.name.toLowerCase().includes(swapFilter.toLowerCase()))).map(m => (
                <button key={m.id} onClick={() => handleSwap(m)} style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: tokens.radiusSm,
                  background: tokens.surface, border: `1px solid ${tokens.border}`,
                  color: tokens.text, cursor: 'pointer', transition: 'all 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = tokens.green}
                  onMouseLeave={e => e.currentTarget.style.borderColor = tokens.border}
                >
                  <div style={{ fontWeight: '500', marginBottom: '3px' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: tokens.textMuted }}>{m.desc?.slice(0, 80)}…</div>
                  {m.time_minutes && <span style={{ fontSize: '11px', color: tokens.textDim }}>⏱ {m.time_minutes} min</span>}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Override modal */}
      {overrideModal && (
        <Modal title={`Mark ${overrideModal}`} onClose={() => setOverrideModal(null)}>
          <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['cheat','holiday','normal'].map(t => (
                <button key={t} onClick={() => setOverrideType(t)} style={{
                  flex: 1, padding: '10px', borderRadius: tokens.radiusSm,
                  border: `2px solid ${overrideType === t ? (t === 'normal' ? tokens.green : t === 'cheat' ? tokens.red : tokens.blue) : tokens.border}`,
                  background: overrideType === t ? (t === 'normal' ? tokens.greenDim : t === 'cheat' ? tokens.redDim : tokens.blueDim) : 'transparent',
                  color: overrideType === t ? (t === 'normal' ? tokens.green : t === 'cheat' ? tokens.red : tokens.blue) : tokens.textMuted,
                  fontSize: '13px', fontWeight: overrideType === t ? '600' : '400',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  {t === 'cheat' ? '🍕 Cheat' : t === 'holiday' ? '✈️ Holiday' : '✅ Normal'}
                </button>
              ))}
            </div>
            {overrideType !== 'normal' && (
              <input value={overrideLabel} onChange={e => setOverrideLabel(e.target.value)}
                placeholder={overrideType === 'cheat' ? 'e.g. Pizza night…' : 'e.g. Paris…'}
                style={{ width: '100%', padding: '10px 14px', borderRadius: tokens.radiusSm, background: tokens.surface, border: `1px solid ${tokens.border}`, color: tokens.text, fontSize: '14px', outline: 'none' }}
              />
            )}
            <Button variant="primary" onClick={handleSetOverride}>
              {overrideType === 'normal' ? '✅ Clear' : 'Save'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}
      onClick={onClose}>
      <div style={{ background: '#1a2a1e', border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${tokens.border}` }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '400' }}>{title}</h3>
          <button onClick={onClose} style={{ fontSize: '20px', color: tokens.textMuted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

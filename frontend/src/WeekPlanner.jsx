import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { tokens, Card, Badge, Button, Spinner, PageHeader } from '../components/ui';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TYPES = ['breakfast','lunch','dinner'];
const MEAL_ICONS = { breakfast: '☀️', lunch: '🌤️', dinner: '🌙' };
const MEAL_COLORS = { breakfast: tokens.gold, lunch: tokens.green, dinner: tokens.blue };

function getMonday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function formatWeekRange(weekStart) {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function navigateWeek(weekStart, dir) {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dir * 7);
  return d.toISOString().split('T')[0];
}

export default function WeekPlanner() {
  const [weekStart, setWeekStart] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);
  const [activeMeal, setActiveMeal] = useState(null);
  const [mealBank, setMealBank] = useState([]);
  const [swapOpen, setSwapOpen] = useState(null); // { day, mealType }
  const [overrideModal, setOverrideModal] = useState(null); // day
  const [overrideLabel, setOverrideLabel] = useState('');
  const [overrideType, setOverrideType] = useState('cheat');

  const loadPlan = useCallback(async (ws) => {
    setLoading(true);
    try {
      const data = await api.getPlan(ws);
      setPlanData(data);
      // Set active day to today if in current week, else Monday
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const todayDay = new Date().toLocaleDateString('en-GB', { weekday: 'long' });
      if (ws === getMonday(today) && DAYS.includes(todayDay)) {
        setActiveDay(todayDay);
      } else {
        setActiveDay('Monday');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getWeekStart().then(({ weekStart: ws }) => {
      setWeekStart(ws);
      loadPlan(ws);
    });
  }, [loadPlan]);

  useEffect(() => {
    api.getMeals().then(setMealBank);
  }, []);

  const goWeek = (dir) => {
    const newWs = navigateWeek(weekStart, dir);
    setWeekStart(newWs);
    loadPlan(newWs);
  };

  const handleSwapMeal = async (meal) => {
    if (!swapOpen) return;
    await api.setPlanMeal(weekStart, swapOpen.day, swapOpen.mealType, meal.id);
    setSwapOpen(null);
    loadPlan(weekStart);
  };

  const handleRemoveMeal = async (day, mealType) => {
    await api.removePlanMeal(weekStart, day, mealType);
    loadPlan(weekStart);
  };

  const handleSetOverride = async () => {
    if (overrideType === 'normal') {
      await api.deleteOverride(weekStart, overrideModal);
    } else {
      await api.setOverride(weekStart, overrideModal, overrideType, overrideLabel);
    }
    setOverrideModal(null);
    setOverrideLabel('');
    loadPlan(weekStart);
  };

  if (!weekStart || loading) return <><PageHeader title="This Week" /><Spinner /></>;

  const { plan, overrides } = planData || { plan: {}, overrides: {} };

  return (
    <div>
      <PageHeader
        title="This Week"
        subtitle={`Week of ${formatWeekRange(weekStart)}`}
        action={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button onClick={() => goWeek(-1)} small>← Prev</Button>
            <span style={{ fontSize: '13px', color: tokens.textMuted, whiteSpace: 'nowrap' }}>{formatWeekRange(weekStart)}</span>
            <Button onClick={() => goWeek(1)} small>Next →</Button>
          </div>
        }
      />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Day tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {DAYS.map(day => {
            const override = overrides[day];
            const isActive = activeDay === day;
            const isCheat = override?.type === 'cheat';
            const isHoliday = override?.type === 'holiday';
            const isSunday = day === 'Sunday';
            return (
              <button key={day} onClick={() => setActiveDay(day)} style={{
                padding: '9px 16px', borderRadius: '40px',
                border: `2px solid ${isActive ? (isCheat ? tokens.red : isHoliday ? tokens.blue : isSunday ? tokens.gold : tokens.green) : tokens.border}`,
                background: isActive ? (isCheat ? tokens.redDim : isHoliday ? tokens.blueDim : isSunday ? tokens.goldDim : tokens.greenDim) : 'transparent',
                color: isActive ? (isCheat ? tokens.red : isHoliday ? tokens.blue : isSunday ? tokens.gold : tokens.green) : tokens.textMuted,
                fontSize: '13px', fontWeight: isActive ? '600' : '400',
                transition: 'all 0.15s', cursor: 'pointer'
              }}>
                {day.slice(0, 3)}
                {isCheat && ' 🍕'}
                {isHoliday && ' ✈️'}
                {isSunday && !isCheat && !isHoliday && ' 🍗'}
              </button>
            );
          })}
        </div>

        {/* Active day */}
        {activeDay && (
          <div>
            {/* Day header + override controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '28px', fontWeight: '400' }}>{activeDay}</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                {overrides[activeDay] && (
                  <Badge color={overrides[activeDay].type === 'cheat' ? 'red' : 'blue'}>
                    {overrides[activeDay].type === 'cheat' ? '🍕 Cheat Day' : '✈️ Holiday'}
                    {overrides[activeDay].label ? ` — ${overrides[activeDay].label}` : ''}
                  </Badge>
                )}
                <Button small onClick={() => { setOverrideModal(activeDay); setOverrideType(overrides[activeDay]?.type || 'cheat'); setOverrideLabel(overrides[activeDay]?.label || ''); }}>
                  📌 Mark Day
                </Button>
              </div>
            </div>

            {/* Holiday overlay */}
            {overrides[activeDay]?.type === 'holiday' ? (
              <Card style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>✈️</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', color: tokens.blue, marginBottom: '8px' }}>
                  {overrides[activeDay].label || 'Holiday Day'}
                </div>
                <div style={{ fontSize: '14px', color: tokens.textMuted }}>No meals planned — enjoy your time away!</div>
                <Button small style={{ marginTop: '16px' }} onClick={() => handleSetOverride()}>Clear Override</Button>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MEAL_TYPES.map(mt => {
                  const meal = plan[activeDay]?.[mt];
                  const isCheat = overrides[activeDay]?.type === 'cheat';
                  const mealOpen = activeMeal === `${activeDay}-${mt}`;
                  const color = MEAL_COLORS[mt];

                  return (
                    <Card key={mt} style={{ border: `1px solid ${mealOpen ? tokens.borderActive : tokens.border}` }}>
                      {/* Meal header */}
                      <div
                        onClick={() => setActiveMeal(mealOpen ? null : `${activeDay}-${mt}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}
                      >
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                          background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                        }}>
                          {MEAL_ICONS[mt]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '11px', color: tokens.textMuted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '3px' }}>
                            {mt.charAt(0).toUpperCase() + mt.slice(1)}
                            {isCheat && <span style={{ color: tokens.red, marginLeft: '8px' }}>🍕 Cheat Day</span>}
                          </div>
                          <div style={{ fontSize: '16px', color: meal ? tokens.text : tokens.textDim }}>
                            {meal ? meal.name : <em>No meal planned</em>}
                          </div>
                          {meal?.time_minutes && (
                            <div style={{ fontSize: '12px', color: tokens.textMuted, marginTop: '2px' }}>⏱ {meal.time_minutes} min</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          <Button small variant="default" onClick={e => { e.stopPropagation(); setSwapOpen({ day: activeDay, mealType: mt }); }}>
                            🔄 Change
                          </Button>
                          {meal && (
                            <Button small variant="danger" onClick={e => { e.stopPropagation(); handleRemoveMeal(activeDay, mt); }}>
                              ✕
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded */}
                      {mealOpen && meal && (
                        <div style={{ padding: '0 20px 20px', borderTop: `1px solid ${tokens.border}` }}>
                          <p style={{ fontSize: '14px', color: '#b8c8b8', fontStyle: 'italic', lineHeight: '1.6', margin: '14px 0' }}>
                            {meal.desc}
                          </p>

                          {/* Notes */}
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {meal.notes_you && (
                              <div style={{ flex: '1', minWidth: '200px', background: tokens.blueDim, border: `1px solid ${tokens.blue}30`, borderRadius: tokens.radiusSm, padding: '10px 14px' }}>
                                <div style={{ fontSize: '11px', color: tokens.blue, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>👨 For You</div>
                                <div style={{ fontSize: '13px', color: '#b0c4e0', lineHeight: '1.5' }}>{meal.notes_you}</div>
                              </div>
                            )}
                            {meal.notes_wife && (
                              <div style={{ flex: '1', minWidth: '200px', background: tokens.pinkDim, border: `1px solid ${tokens.pink}30`, borderRadius: tokens.radiusSm, padding: '10px 14px' }}>
                                <div style={{ fontSize: '11px', color: tokens.pink, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>👩 Kim</div>
                                <div style={{ fontSize: '13px', color: '#e0b0d4', lineHeight: '1.5' }}>{meal.notes_wife}</div>
                              </div>
                            )}
                          </div>

                          {/* Ingredients */}
                          {meal.ingredients?.length > 0 && (
                            <details style={{ marginBottom: '12px' }}>
                              <summary style={{ fontSize: '13px', color: tokens.gold, cursor: 'pointer', marginBottom: '10px', fontWeight: '500' }}>
                                🛒 Ingredients
                              </summary>
                              <div style={{ paddingLeft: '4px' }}>
                                {meal.ingredients.map((ing, i) => (
                                  <div key={i} style={{ fontSize: '13px', color: '#c8d8c8', lineHeight: '1.7', display: 'flex', gap: '8px' }}>
                                    <span style={{ color: tokens.green }}>•</span> {ing}
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}

                          {/* Steps */}
                          {meal.steps?.length > 0 && (
                            <details>
                              <summary style={{ fontSize: '13px', color: tokens.gold, cursor: 'pointer', marginBottom: '10px', fontWeight: '500' }}>
                                👨‍🍳 Method
                              </summary>
                              <div style={{ paddingLeft: '4px' }}>
                                {meal.steps.map((step, i) => (
                                  <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                    <div style={{
                                      flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
                                      background: tokens.greenDim, border: `1px solid ${tokens.green}50`,
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      fontSize: '11px', color: tokens.green, fontWeight: '700'
                                    }}>{i + 1}</div>
                                    <div style={{ fontSize: '13px', color: '#c8d8c8', lineHeight: '1.6', paddingTop: '2px' }}>{step}</div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Swap modal */}
      {swapOpen && (
        <Modal title={`Choose ${swapOpen.mealType}`} onClose={() => setSwapOpen(null)}>
          <div style={{ padding: '0 20px 20px' }}>
            <div style={{ marginBottom: '12px', fontSize: '13px', color: tokens.textMuted }}>
              Replacing <strong style={{ color: tokens.text }}>{swapOpen.mealType}</strong> on <strong style={{ color: tokens.text }}>{swapOpen.day}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '60vh', overflowY: 'auto' }}>
              {mealBank.filter(m => m.meal_type === swapOpen.mealType).map(m => (
                <button key={m.id} onClick={() => handleSwapMeal(m)} style={{
                  textAlign: 'left', padding: '12px 14px', borderRadius: tokens.radiusSm,
                  background: tokens.surface, border: `1px solid ${tokens.border}`,
                  color: tokens.text, transition: 'all 0.15s', cursor: 'pointer'
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = tokens.green}
                  onMouseLeave={e => e.currentTarget.style.borderColor = tokens.border}
                >
                  <div style={{ fontWeight: '500', marginBottom: '3px' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: tokens.textMuted }}>{m.desc?.slice(0, 80)}…</div>
                  {m.time_minutes && <div style={{ fontSize: '11px', color: tokens.textDim, marginTop: '4px' }}>⏱ {m.time_minutes} min</div>}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Override modal */}
      {overrideModal && (
        <Modal title={`Mark ${overrideModal}`} onClose={() => setOverrideModal(null)}>
          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                  {t === 'cheat' ? '🍕 Cheat Day' : t === 'holiday' ? '✈️ Holiday' : '✅ Normal'}
                </button>
              ))}
            </div>
            {overrideType !== 'normal' && (
              <input
                value={overrideLabel}
                onChange={e => setOverrideLabel(e.target.value)}
                placeholder={overrideType === 'cheat' ? 'e.g. Pizza night, Birthday meal…' : 'e.g. Paris, Beach holiday…'}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: tokens.radiusSm,
                  background: tokens.surface, border: `1px solid ${tokens.border}`,
                  color: tokens.text, fontSize: '14px', outline: 'none'
                }}
              />
            )}
            <Button variant="primary" onClick={handleSetOverride}>
              {overrideType === 'normal' ? '✅ Clear Override' : `Set ${overrideType === 'cheat' ? 'Cheat' : 'Holiday'} Day`}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: '#1a2a1e', border: `1px solid ${tokens.border}`, borderRadius: tokens.radius,
        width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: `1px solid ${tokens.border}` }}>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', fontWeight: '400' }}>{title}</h3>
          <button onClick={onClose} style={{ fontSize: '20px', color: tokens.textMuted, lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

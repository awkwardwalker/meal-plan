import { useLocation, Link } from 'react-router-dom';

export const tokens = {
  bg: '#0d1a14',
  surface: 'rgba(255,255,255,0.04)',
  surfaceHover: 'rgba(255,255,255,0.07)',
  border: 'rgba(255,255,255,0.08)',
  borderActive: 'rgba(255,255,255,0.2)',
  green: '#7eb87e',
  greenDim: 'rgba(126,184,126,0.15)',
  gold: '#d4a843',
  goldDim: 'rgba(212,168,67,0.15)',
  pink: '#d47eb8',
  pinkDim: 'rgba(212,126,184,0.15)',
  blue: '#7ea8d4',
  blueDim: 'rgba(126,168,212,0.15)',
  red: '#d47e7e',
  redDim: 'rgba(212,126,126,0.15)',
  text: '#e8e4dc',
  textMuted: '#8a9e8a',
  textDim: '#5a6e5a',
  radius: '14px',
  radiusSm: '8px',
};

const NAV_ITEMS = [
  { path: '/', label: 'This Week', icon: '📅' },
  { path: '/meal-bank', label: 'Meal Bank', icon: '🍽️' },
  { path: '/shopping', label: 'Shopping', icon: '🛒' },
];

export function Nav() {
  const { pathname } = useLocation();
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(13,26,20,0.92)', backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${tokens.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: '60px', gap: '8px'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, textDecoration: 'none' }}>
        <span style={{ fontSize: '20px' }}>🥦</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: tokens.green }}>Family Meals</span>
      </Link>
      <div style={{ display: 'flex', gap: '4px' }}>
        {NAV_ITEMS.map(({ path, label, icon }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '40px',
              background: active ? tokens.greenDim : 'transparent',
              border: `1px solid ${active ? tokens.green : 'transparent'}`,
              color: active ? tokens.green : tokens.textMuted,
              fontSize: '13px', fontWeight: active ? '600' : '400',
              transition: 'all 0.15s', textDecoration: 'none'
            }}>
              <span>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{ background: tokens.surface, border: `1px solid ${tokens.border}`, borderRadius: tokens.radius, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

export function Badge({ children, color = 'green' }) {
  const colors = { green: [tokens.green, tokens.greenDim], gold: [tokens.gold, tokens.goldDim], pink: [tokens.pink, tokens.pinkDim], red: [tokens.red, tokens.redDim], blue: [tokens.blue, tokens.blueDim] };
  const [fg, bg] = colors[color] || colors.green;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: '20px', background: bg, color: fg, fontSize: '11px', fontWeight: '600', letterSpacing: '0.3px' }}>
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant = 'default', small = false, disabled = false, style = {} }) {
  const variants = {
    default: { bg: tokens.surface, color: tokens.textMuted, border: `1px solid ${tokens.border}` },
    primary: { bg: tokens.greenDim, color: tokens.green, border: `1px solid ${tokens.green}` },
    gold: { bg: tokens.goldDim, color: tokens.gold, border: `1px solid ${tokens.gold}` },
    danger: { bg: tokens.redDim, color: tokens.red, border: `1px solid ${tokens.red}` },
    ghost: { bg: 'transparent', color: tokens.textMuted, border: '1px solid transparent' },
  };
  const v = variants[variant] || variants.default;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: small ? '6px 12px' : '9px 18px', borderRadius: '40px',
      background: v.bg, color: v.color, border: v.border,
      fontSize: small ? '12px' : '13px', fontWeight: '500',
      opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s', ...style
    }}>
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: tokens.textDim, fontSize: '14px' }}>
      Loading…
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ padding: '36px 24px 24px', borderBottom: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: tokens.green, fontWeight: '600', marginBottom: '6px' }}>Family Meal Planner</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '400', color: tokens.text, lineHeight: '1.2' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '14px', color: tokens.textMuted, marginTop: '6px', fontStyle: 'italic' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
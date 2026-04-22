import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Nav, tokens } from './components/ui';
import MealChat from './components/MealChat';
import WeekPlanner from './pages/WeekPlanner';
import MealBank from './pages/MealBank';
import Shopping from './pages/Shopping';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        minHeight: '100vh',
        background: tokens.bg,
        color: tokens.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <Nav />
        <Routes>
          <Route path="/" element={<WeekPlanner />} />
          <Route path="/meal-bank" element={<MealBank />} />
          <Route path="/shopping" element={<Shopping />} />
        </Routes>
        <MealChat />
      </div>
    </BrowserRouter>
  );
}
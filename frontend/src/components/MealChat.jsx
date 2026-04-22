import { useState, useRef, useEffect } from 'react';
import { api } from '../api';
import { tokens } from './ui';

const QUICK_QUESTIONS = [
  {
    id: 'meal_type',
    question: 'What meal are you planning?',
    options: ['🌅 Breakfast', '☀️ Lunch', '🌙 Dinner', '🍿 Snack']
  },
  {
    id: 'who_for',
    question: "Who's it for?",
    options: ['👨 Just me', '👩 Just Kim', '👫 Both of us']
  },
  {
    id: 'appetite',
    question: 'How hungry are you?',
    options: ['🥗 Something light', '🍽️ Normal meal', '🔥 Something hearty']
  },
  {
    id: 'time',
    question: 'How much time do you have?',
    options: ['⚡ Under 10 mins', '🕐 Up to 20 mins', '🕑 30+ mins, no rush']
  }
];

export default function MealChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionStep, setQuestionStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [mealBank, setMealBank] = useState([]);
  const [phase, setPhase] = useState('questions'); // 'questions' | 'chat'
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.getMeals().then(setMealBank).catch(() => {});
  }, []);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: QUICK_QUESTIONS[0].question,
        options: QUICK_QUESTIONS[0].options
      }]);
      setQuestionStep(0);
      setAnswers({});
      setPhase('questions');
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleClose = () => {
    setOpen(false);
    setMessages([]);
    setInput('');
    setAnswers({});
    setQuestionStep(0);
    setPhase('questions');
  };

  const handleOptionClick = async (option) => {
    const currentQ = QUICK_QUESTIONS[questionStep];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    setMessages(prev => [...prev, { role: 'user', content: option }]);

    const nextStep = questionStep + 1;
    if (nextStep < QUICK_QUESTIONS.length) {
      setQuestionStep(nextStep);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: QUICK_QUESTIONS[nextStep].question,
          options: QUICK_QUESTIONS[nextStep].options
        }]);
      }, 300);
    } else {
      setPhase('chat');
      setQuestionStep(QUICK_QUESTIONS.length);
      await getSuggestions(newAnswers);
    }
  };

  const getSuggestions = async (collectedAnswers) => {
    setLoading(true);
    try {
      const mealBankSummary = mealBank.map(m =>
        `- ${m.name} (${m.meal_type}, ${m.time_minutes || '?'} mins): ${m.desc || ''}`
      ).join('\n');

      const systemPrompt = `You are a friendly meal planning assistant for a family with specific dietary needs.

DIETARY RULES — always respect these:
- The husband has Type 2 diabetes: focus on low-GI, high-protein meals, limit refined carbs
- Kim (wife) has PCOS and is on Wegovy: high-protein, anti-inflammatory, no pasta
- No tomatoes for either person
- No avocado or salmon for either person  
- No white or red fish for either (husband cannot have tuna)
- No peanut butter for the husband
- No cucumber for Kim
- No pasta for Kim

EXISTING MEAL BANK:
${mealBankSummary || 'No meals in bank yet.'}

When suggesting meals:
1. First check if any meals in the bank match — if so, recommend those by name
2. If nothing matches well, suggest a NEW meal idea with full recipe
3. Keep responses warm, concise and practical
4. For new meal suggestions, always include: ingredients list and step-by-step method
5. End with asking if they'd like to add a new suggestion to their meal bank`;

      const userMessage = `Please suggest a meal based on these preferences:
- Meal type: ${collectedAnswers.meal_type}
- Who it's for: ${collectedAnswers.who_for}
- Appetite level: ${collectedAnswers.appetite}
- Time available: ${collectedAnswers.time}

Check the meal bank first, then suggest something new if nothing fits well.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, I had trouble generating a suggestion. Try again!';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t connect right now. Try again in a moment!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const mealBankSummary = mealBank.map(m =>
        `- ${m.name} (${m.meal_type}, ${m.time_minutes || '?'} mins): ${m.desc || ''}`
      ).join('\n');

      const systemPrompt = `You are a friendly meal planning assistant for a family with specific dietary needs.

DIETARY RULES — always respect these:
- The husband has Type 2 diabetes: focus on low-GI, high-protein meals, limit refined carbs
- Kim (wife) has PCOS and is on Wegovy: high-protein, anti-inflammatory, no pasta
- No tomatoes for either person
- No avocado or salmon for either person
- No white or red fish for either (husband cannot have tuna)
- No peanut butter for the husband
- No cucumber for Kim
- No pasta for Kim

EXISTING MEAL BANK:
${mealBankSummary || 'No meals in bank yet.'}

Keep responses warm, concise and practical. For new meal suggestions always include ingredients and method.`;

      const conversationHistory = messages
        .filter(m => !m.options)
        .map(m => ({ role: m.role, content: m.content }));

      conversationHistory.push({ role: 'user', content: userMsg });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: conversationHistory
        })
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Sorry, something went wrong!';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error — please try again.'
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => open ? handleClose() : setOpen(true)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 300,
          width: '56px', height: '56px', borderRadius: '50%',
          background: open ? tokens.redDim : `linear-gradient(135deg, ${tokens.green}, #4a8a4a)`,
          border: `2px solid ${open ? tokens.red : tokens.green}`,
          color: open ? tokens.red : '#0d1a14',
          fontSize: '22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 20px ${open ? tokens.red + '40' : tokens.green + '60'}`,
          transition: 'all 0.25s',
        }}
        title="Meal suggestions"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '92px', right: '24px', zIndex: 299,
          width: 'min(420px, calc(100vw - 32px))',
          height: 'min(580px, calc(100vh - 120px))',
          background: '#0f1f14',
          border: `1px solid ${tokens.border}`,
          borderRadius: '20px',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
          overflow: 'hidden',
          animation: 'slideUp 0.2s ease-out'
        }}>
          <style>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .chat-bubble-user {
              background: ${tokens.greenDim};
              border: 1px solid ${tokens.green}40;
              color: ${tokens.text};
              border-radius: 16px 16px 4px 16px;
              padding: 10px 14px;
              font-size: 14px;
              line-height: 1.5;
              max-width: 85%;
              align-self: flex-end;
              white-space: pre-wrap;
            }
            .chat-bubble-assistant {
              background: rgba(255,255,255,0.04);
              border: 1px solid ${tokens.border};
              color: ${tokens.text};
              border-radius: 16px 16px 16px 4px;
              padding: 10px 14px;
              font-size: 14px;
              line-height: 1.6;
              max-width: 92%;
              align-self: flex-start;
              white-space: pre-wrap;
            }
            .option-btn:hover {
              border-color: ${tokens.green} !important;
              background: ${tokens.greenDim} !important;
              color: ${tokens.green} !important;
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${tokens.border}`,
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: tokens.greenDim, border: `1px solid ${tokens.green}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
            }}>🥦</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: tokens.text }}>Meal Assistant</div>
              <div style={{ fontSize: '11px', color: tokens.textMuted }}>Powered by Claude</div>
            </div>
            <button onClick={handleClose} style={{
              marginLeft: 'auto', color: tokens.textMuted, fontSize: '18px',
              background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px'
            }}>×</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '10px'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                  {msg.content}
                </div>
                {msg.options && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingLeft: '4px' }}>
                    {msg.options.map(opt => (
                      <button
                        key={opt}
                        className="option-btn"
                        onClick={() => handleOptionClick(opt)}
                        disabled={questionStep > QUICK_QUESTIONS.findIndex(q => q.question === msg.content) || phase === 'chat'}
                        style={{
                          padding: '7px 12px', borderRadius: '20px', fontSize: '13px',
                          background: 'transparent',
                          border: `1px solid ${tokens.border}`,
                          color: tokens.textMuted, cursor: 'pointer',
                          transition: 'all 0.15s',
                          opacity: (phase === 'chat' || questionStep > QUICK_QUESTIONS.findIndex(q => q.question === msg.content)) ? 0.4 : 1,
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-assistant" style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '12px 16px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: tokens.green, opacity: 0.6,
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
                <style>{`
                  @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                  }
                `}</style>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {phase === 'chat' && (
            <div style={{
              padding: '12px 16px',
              borderTop: `1px solid ${tokens.border}`,
              display: 'flex', gap: '8px', alignItems: 'flex-end',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything about meals…"
                rows={1}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: '12px',
                  background: tokens.surface, border: `1px solid ${tokens.border}`,
                  color: tokens.text, fontSize: '14px', outline: 'none',
                  resize: 'none', lineHeight: '1.4', maxHeight: '100px',
                  overflowY: 'auto', fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: input.trim() && !loading ? tokens.greenDim : 'transparent',
                  border: `1px solid ${input.trim() && !loading ? tokens.green : tokens.border}`,
                  color: input.trim() && !loading ? tokens.green : tokens.textDim,
                  cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', transition: 'all 0.15s'
                }}
              >↑</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

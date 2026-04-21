const express = require('express');
const cors = require('cors');
const { db, init } = require('./db/database');

const app = express();
app.use(cors());
app.use(express.json());

// Init DB
init();

// ── Routes ──
app.use('/api/meals', require('./routes/meals'));
app.use('/api/plan', require('./routes/plan'));
app.use('/api/shopping', require('./routes/shopping'));
app.use('/api/overrides', require('./routes/overrides'));

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on :${PORT}`));

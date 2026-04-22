const express = require('express');
const cors = require('cors');
const { init } = require('./db/database');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialise DB then start server
init().then(() => {
  app.use('/api/meals', require('./routes/meals'));
  app.use('/api/plan', require('./routes/plan'));
  app.use('/api/shopping', require('./routes/shopping'));
  app.use('/api/overrides', require('./routes/overrides'));

  app.get('/api/health', (_, res) => res.json({ ok: true }));

  app.listen(PORT, () => console.log(`API running on :${PORT}`));
}).catch(err => {
  console.error('Failed to initialise database:', err);
  process.exit(1);
});

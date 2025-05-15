require('dotenv').config();
const express = require('express');
const cors = require('cors');        // <<–– import cors
const mongoose = require('mongoose');
const path = require('path');
const statesRouter = require('./routes/states');

const app = express();

app.use(cors());                    // <<–– enable CORS globally
app.use(express.json());

// ——— Connect to MongoDB ———
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ——— Middleware ———
app.use(express.json());

// ——— Routes ———
// 1) Root HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 2) API under /states
app.use('/states', statesRouter);

// 3) Catch-all 404
app.all('*', (req, res) => {
  if (req.accepts('html')) {
    return res
      .status(404)
      .sendFile(path.join(__dirname, 'views', '404.html'));
  }
  if (req.accepts('json')) {
    return res.status(404).json({ error: '404 Not Found' });
  }
  res.status(404).type('txt').send('404 Not Found');
});

// ——— Start server ———
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// ——— Connect to MongoDB ———
mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
mongoose.connection.once('open', () =>
  console.log('Connected to MongoDB')
);

// ——— Middleware ———
// Parse JSON bodies
app.use(express.json());

// ——— Routes ———

// GET / → Serve your index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// All API endpoints under /states
app.use('/states', require('./routes/states'));

// ——— Catch‐all 404 ———
app.all('*', (req, res) => {
  if (req.accepts('html')) {
    // HTML 404 page
    return res
      .status(404)
      .sendFile(path.join(__dirname, 'views', '404.html'));
  }
  if (req.accepts('json')) {
    // JSON 404 error
    return res
      .status(404)
      .json({ error: '404 Not Found' });
  }
  // Plain‐text fallback
  res
    .status(404)
    .type('txt')
    .send('404 Not Found');
});

// ——— Start Server ———
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

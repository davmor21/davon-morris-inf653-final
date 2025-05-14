require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
});

// Parse JSON request bodies
app.use(express.json());

// Serve static index.html at root
app.use(express.static(path.join(__dirname)));

// API routes under /states
app.use('/states', require('./routes/states'));

// Catch-all 404 handler
app.all('*', (req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.status(404).json({ error: '404 Not Found' });
  } else {
    res.status(404).type('txt').send('404 Not Found');
  }
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

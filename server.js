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

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/states', require('./routes/states'));

// Catch-all 404
app.all('*', (req, res) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.status(404).json({ error: '404 Not Found' });
    } else {
        res.status(404).type('txt').send('404 Not Found');
    }
});

const path = require('path');

// Serve root HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});


const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
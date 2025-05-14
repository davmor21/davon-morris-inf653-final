// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const State = require('./models/States');

const app = express();

// ——— Mongoose setup ———
mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.DATABASE_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');
    return seedFunFacts();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// ——— Seed function ———
async function seedFunFacts() {
  // Minimum 3 facts per required state (no duplicates)
  const seedData = [
    { stateCode: 'KS', funfacts: [
        'Dodge City was once the cattle capital of the world.',
        'Smith County is the geographic center of the contiguous U.S.',
        'The first American rodeo took place in 1883 in Wichita.'
      ]
    },
    { stateCode: 'MO', funfacts: [
        'The ice cream cone was popularized at the 1904 St. Louis World’s Fair.',
        'Missouri is home to the world’s largest rocking chair in Fanning.',
        'The Pony Express began in St. Joseph in 1860.'
      ]
    },
    { stateCode: 'OK', funfacts: [
        'Oklahoma has the largest Native American population percentage of any state.',
        'Beaver, OK is known as the Cow Chip Throwing Capital of the World.',
        'The world’s first parking meter was installed in Oklahoma City in 1935.'
      ]
    },
    { stateCode: 'NE', funfacts: [
        'Nebraska has more miles of river than any other state.',
        'Omaha’s Henry Doorly Zoo has the world’s largest indoor desert and rainforest.',
        'Nebraska is the only state with a unicameral (one-house) legislature.'
      ]
    },
    { stateCode: 'CO', funfacts: [
        'Denver rejected hosting the 1976 Winter Olympics, the only city ever to do so.',
        'Colorado’s Four Corners is the only point in the U.S. where four states meet.',
        'The world’s largest flat-top mountain, Grand Mesa, is in Colorado.'
      ]
    }
  ];

  for (const entry of seedData) {
    await State.findOneAndUpdate(
      { stateCode: entry.stateCode },
      { 
        $setOnInsert: { stateCode: entry.stateCode },
        $addToSet: { funfacts: { $each: entry.funfacts } }
      },
      { upsert: true }
    );
  }
  console.log('🔧 Seeded required fun facts');
}

// ——— Middleware ———
app.use(express.json());

// ——— Routes ———

// 1) GET / → serve your index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 2) API under /states
app.use('/states', require('./routes/states'));

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

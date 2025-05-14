// scripts/seedFunFacts.js
require('dotenv').config();
const mongoose = require('mongoose');
const State = require('../models/States');

// NOTE: these fun facts do _not_ duplicate anything in statesData.json
const seedData = [
  {
    stateCode: 'KS',
    funfacts: [
      'Dodge City was once the cattle capital of the world.',
      'Smith County is the geographic center of the contiguous U.S.',
      'The first American rodeo took place in 1883 in Wichita.'
    ]
  },
  {
    stateCode: 'MO',
    funfacts: [
      'The ice cream cone was popularized at the 1904 St. Louis World’s Fair.',
      'Missouri is home to the world’s largest rocking chair in Fanning.',
      'The Pony Express began in St. Joseph in 1860.'
    ]
  },
  {
    stateCode: 'OK',
    funfacts: [
      'Oklahoma has the largest Native American population percentage of any state.',
      'Beaver, OK is known as the Cow Chip Throwing Capital of the World.',
      'The world’s first parking meter was installed in Oklahoma City in 1935.'
    ]
  },
  {
    stateCode: 'NE',
    funfacts: [
      'Nebraska has more miles of river than any other state.',
      'Omaha’s Henry Doorly Zoo has the world’s largest indoor desert and indoor rainforest.',
      'Nebraska is the only state with a unicameral legislature.'
    ]
  },
  {
    stateCode: 'CO',
    funfacts: [
      'Denver rejected hosting the 1976 Winter Olympics, the only city ever to do so.',
      'Colorado’s Four Corners is the only point in the U.S. where four states meet.',
      'The world’s largest flat-top mountain, Grand Mesa, is in Colorado.'
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    for (const entry of seedData) {
      // upsert: create or append
      await State.findOneAndUpdate(
        { stateCode: entry.stateCode },
        { $set: { stateCode: entry.stateCode }, $addToSet: { funfacts: { $each: entry.funfacts } } },
        { upsert: true }
      );
      console.log(`Seeded fun facts for ${entry.stateCode}`);
    }

    console.log('All done.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();

const State = require('../models/States');
const statesData = require('../statesData.json');

// Helper to fetch static data by code or name
function getStateData(codeOrName) {
  if (!codeOrName) return null;
  const input = codeOrName.toUpperCase();
  let state = statesData.find(st => st.code === input);
  if (state) return state;
  const nameInput = codeOrName.toLowerCase();
  return statesData.find(
    st => st.slug === nameInput || st.state.toLowerCase() === nameInput
  ) || null;
}

// GET /states
async function getAllStates(req, res) {
  const contig = req.query.contig;
  let list = [...statesData];
  if (contig === 'true') {
    list = list.filter(st => st.code !== 'AK' && st.code !== 'HI');
  } else if (contig === 'false') {
    list = list.filter(st => st.code === 'AK' || st.code === 'HI');
  }
  try {
    const codes = list.map(st => st.code);
    const docs = await State.find({ stateCode: { $in: codes } });
    const funMap = {};
    docs.forEach(d => funMap[d.stateCode] = d.funfacts);
    const merged = list.map(st =>
      funMap[st.code]
        ? { ...st, funfacts: funMap[st.code] }
        : { ...st }
    );
    return res.json(merged);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /states/:state
async function getState(req, res) {
  const data = getStateData(req.params.state);
  if (!data) return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  try {
    const doc = await State.findOne({ stateCode: data.code });
    const result = { ...data };
    if (doc && doc.funfacts.length) result.funfacts = doc.funfacts;
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /states/:state/funfact
async function getRandomFunFact(req, res) {
  const data = getStateData(req.params.state);
  if (!data) return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  try {
    const doc = await State.findOne({ stateCode: data.code });
    if (!doc || !doc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${data.state}` });
    }
    const fact = doc.funfacts[Math.floor(Math.random() * doc.funfacts.length)];
    return res.json({ funfact: fact });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET field-specific
function getCapital(req, res) {
  const data = getStateData(req.params.state);
  if (!data) return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  return res.json({ state: data.state, capital: data.capital_city });
}

function getNickname(req, res) {
  const data = getStateData(req.params.state);
  if (!data) return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  return res.json({ state: data.state, nickname: data.nickname });
}

function getPopulation(req, res) {
  const data = getStateData(req.params.state);
  if (!data) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  // Format as comma-separated string
  const popStr = data.population.toLocaleString('en-US');
  return res.json({ state: data.state, population: popStr });
}

function getAdmission(req, res) {
  const data = getStateData(req.params.state);
  if (!data) {
    return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  }
  // Use the key “admitted”
  return res.json({ state: data.state, admitted: data.admission_date });
}

// POST /states/:state/funfact
async function createFunFact(req, res) {
  const data = getStateData(req.params.state);
  if (!data) return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  const funfacts = req.body.funfacts;
  if (!Array.isArray(funfacts) || funfacts.length === 0) {
    return res.status(400).json({ message: 'State fun facts value required and must be a non-empty array' });
  }
  try {
    const updated = await State.findOneAndUpdate(
      { stateCode: data.code },
      { $push: { funfacts: { $each: funfacts } } },
      { new: true, upsert: true }
    );
    return res.status(201).json({ state: data.state, funfacts: updated.funfacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /states/:state/funfact
async function updateFunFact(req, res) {
  const data = getStateData(req.params.state);
  if (!data) return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  const { index, funfact } = req.body;
  if (index === undefined || !funfact) {
    return res.status(400).json({ message: 'Both index and funfact are required' });
  }
  try {
    const doc = await State.findOne({ stateCode: data.code });
    if (!doc || !doc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${data.state}` });
    }
    const idx = index - 1;
    if (idx < 0 || idx >= doc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${data.state}` });
    }
    doc.funfacts[idx] = funfact;
    await doc.save();
    return res.json({ state: data.state, funfacts: doc.funfacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /states/:state/funfact
async function deleteFunFact(req, res) {
  const data = getStateData(req.params.state);
  if (!data) return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
  const { index } = req.body;
  if (index === undefined) {
    return res.status(400).json({ message: 'State fun fact index value required' });
  }
  try {
    const doc = await State.findOne({ stateCode: data.code });
    if (!doc || !doc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Facts found for ${data.state}` });
    }
    const idx = index - 1;
    if (idx < 0 || idx >= doc.funfacts.length) {
      return res.status(404).json({ message: `No Fun Fact found at that index for ${data.state}` });
    }
    doc.funfacts.splice(idx, 1);
    await doc.save();
    return res.json({ state: data.state, funfacts: doc.funfacts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getAllStates,
  getState,
  getRandomFunFact,
  getCapital,
  getNickname,
  getPopulation,
  getAdmission,
  createFunFact,
  updateFunFact,
  deleteFunFact
};

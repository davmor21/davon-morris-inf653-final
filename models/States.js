const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stateSchema = new Schema({
  stateCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    maxlength: 2
  },
  funfacts: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('State', stateSchema);

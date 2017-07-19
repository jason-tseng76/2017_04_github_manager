const mongoose = require('mongoose');

const schema = mongoose.Schema({
  repo: { type: String, index: true },
  ref: String,
  head: String,
  commitmessage: String,
}, {
  timestamps: true,
});

module.exports = schema;

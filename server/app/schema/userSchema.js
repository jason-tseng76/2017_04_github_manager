const mongoose = require('mongoose');

const schema = mongoose.Schema({
  login: { type: String, index: true, unique: true },
  email: { type: String, index: true, unique: true },
  role: { type: String, default: 'user' },
  avatar_url: { type: String, default: 'https://github.com/github.png?size=40' },
  active: { type: Number, default: 1 }, // 0=停權, 1=正常
  loginDate: { type: Date, default: Date.now },
  token: { type: String, default: '', index: true },
  gittoken: { type: String, default: '' },
});

module.exports = schema;

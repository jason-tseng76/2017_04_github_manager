const mongoose = require('mongoose');

const schema = mongoose.Schema({
  captcha: { type: String, index: true },
  cDate: { type: Date, default: Date.now, expires: 60 * 10 }, // 10分鐘後失效
});

module.exports = schema;

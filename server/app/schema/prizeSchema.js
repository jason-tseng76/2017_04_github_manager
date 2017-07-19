const mongoose = require('mongoose');

const schema = mongoose.Schema({
  foo: { type: String, index: true, unique: true },
  name: { type: String, index: true },
  email: { type: String, index: true },
  appkey: { type: String, index: true },
  phone: String,
  address: String,
  cdate: { type: Date, default: Date.now },
});
module.exports = schema;

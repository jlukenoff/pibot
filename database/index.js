const mongoose = require('mongoose').connect('mongodb://127.0.0.1/db');

const { Schema } = mongoose;

const ModelSchema = new Schema({
  _id: Number,
  name: String,
  created: { type: Date, default: Date.now },
});

module.exports = { Model: mongoose.model('Model', ModelSchema) };

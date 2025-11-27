const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  filename: String,
  predictedClass: String,
  confidence: String,
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);

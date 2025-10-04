const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  complaintId: String,
  lat: Number,
  lng: Number,
  ts: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Location', LocationSchema);

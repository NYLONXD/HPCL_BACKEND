const mongoose = require('mongoose');

const OtpSub = new mongoose.Schema({
  hash: String,
  expiresAt: Date,
  verified: { type: Boolean, default: false }
}, { _id: false });

const JobSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true }, // e.g. CMP102
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  issue: String,
  images: [String],
  status: { type: String, default: 'assigned' }, // assigned, in_progress, completed
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  otp: OtpSub,
  meetLink: String,
  checklist: {
    ppeWorn: Boolean,
    powerSwitchedOff: Boolean,
    areaClear: Boolean
  },
  lastLocation: {
    lat: Number,
    lng: Number,
    ts: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);

//complaint.model.js 

const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  dealer: { type: String, required: true },

  complaintType: {
    type: String,
    enum: ["DU - Mech", "DU - Electronic", "DU - Others", "DT Plus Terminal", "Automation",
           "Non DU - Electrical", "Non DU - Civil", "Non DU - Others", "VSAT"],
    required: true,
  },

  assetDU: {
    type: String,
    enum: ["DU - Mech", "DU - Electronic", "DU - Others", "DT Plus Terminal", "Automation",
           "Non DU - Electrical", "Non DU - Civil", "Non DU - Others", "VSAT"],
    required: true,
  },

  model: { type: String },

  isDUDown: { type: Boolean, required: true },
  isUPSConnected: { type: Boolean, required: true },
  isPowerLEDGlowing: { type: Boolean, required: true },

  shortDescription: { type: String, maxlength: 250 },

  natureOfComplaint: {
    type: String,
    enum: ["Mechanical", "Electrical", "Software", "Other"],
    required: true,
  },

  make: { type: String },
  nozzles: [{ type: String }],

  totalizerReading: { type: Number, required: true },
  glowingLEDCount: { type: Number, required: true },

  // ADDED FIELDS FOR VENDOR ASSIGNMENT
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',  // or 'Vendor' if you have a separate Vendor model
    default: null 
  },

  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },

  complaintId: { 
    type: String, 
    unique: true,
    sparse: true  // allows null values but unique when set
  },

  // For OTP-based job acceptance
  otp: {
    hash: String,
    ts: Date
  },

  // For safety checklist
  checklist: {
    ppeWorn: Boolean,
    powerSwitchedOff: Boolean,
    areaClear: Boolean
  },

  // For location tracking
  location: {
    lat: Number,
    lng: Number
  },

  lastLocation: {
    lat: Number,
    lng: Number,
    ts: Date
  },

  // For video meetings
  meetLink: String

}, { timestamps: true });

// Auto-generate complaintId before saving if not exists
ComplaintSchema.pre('save', function(next) {
  if (!this.complaintId) {
    this.complaintId = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
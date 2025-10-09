const mongoose= require("mongoose");

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

}, { timestamps: true });


module.exports = mongoose.model("Complaint", ComplaintSchema);
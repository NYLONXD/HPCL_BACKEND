// backend/src/models/user.model.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userType: { type: String, required: true }, // e.g., admin, dealer, vendor
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ["admin", "dealer", "vendor"], default: "vendor" },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Optional: remove sensitive fields before sending response
UserSchema.methods.safe = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Users", UserSchema);

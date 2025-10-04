const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String,
     required: true,
      unique: true },
    passwordHash: { type: String,
     required: true },
  name: String,
  role: { type: String, 
          default: 'vendor' 
        },
  email: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// optional: remove sensitive fields when toJSON
UserSchema.methods.safe = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);

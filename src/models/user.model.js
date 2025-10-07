const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    name: String,
    role: { type: String, default: "vendor" },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// UserSchema.methods.hashPassword = function (password) {
//   const saltRounds = 10;
//   this.passwordHash = bcrypt.hashSync(password, saltRounds);
// }

UserSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash"))
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});


// optional: remove sensitive fields when toJSON
UserSchema.methods.safe = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);

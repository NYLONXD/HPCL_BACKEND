// const bcrypt = require("bcryptjs");
// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema(
//   {
//     username: { type: String, required: true, unique: true },
//     passwordHash: { type: String, required: true },
//     name: String,
//     role: { type: String, enum:["admin", "dealer", "vendor"], default: "vendor" },
//     email: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // UserSchema.methods.hashPassword = function (password) {
// //   const saltRounds = 10;
// //   this.passwordHash = bcrypt.hashSync(password, saltRounds);
// // }

// UserSchema.pre("save", async function (next) {
//   if (this.isModified("passwordHash"))
//     this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
//   next();
// });


// // optional: remove sensitive fields when toJSON
// UserSchema.methods.safe = function () {
//   const obj = this.toObject();
//   delete obj.passwordHash;
//   return obj;
// };

// module.exports = mongoose.model("User", UserSchema);





// =====================================================================================================
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userType: { type: String, required: true  ,  unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
   role: { type: String, enum:["admin", "dealer", "vendor"], default: "vendor" },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
}, { timestamps: true });


// optional: remove sensitive fields when toJSON  
UserSchema.methods.safe = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model("Users", UserSchema)
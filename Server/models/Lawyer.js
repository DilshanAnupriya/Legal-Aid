const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const lawyerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    specialization: { type: String, required: true },
    contactNumber: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    experience: { type: Number, required: true },
    isApproved: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

lawyerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

lawyerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Lawyer", lawyerSchema); // ✅ CommonJS export

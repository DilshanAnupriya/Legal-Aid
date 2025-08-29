import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const lawyerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    specialization: { type: String },
    contactNumber: { type: String },
  },
  { timestamps: true }
);

// Encrypt password before save
lawyerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
lawyerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Lawyer = mongoose.model("Lawyer", lawyerSchema);
export default Lawyer;

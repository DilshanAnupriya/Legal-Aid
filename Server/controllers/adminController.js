import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import Lawyer from "../models/Lawyer.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new admin
// @route   POST /api/admins/register
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: "Email already exists" });

    // Create new admin
    const admin = await Admin.create({ fullName, email, password });

    res.status(201).json({
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/admins/login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/admins/profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all  lawyers
export const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({}).select("-password");
    if (!lawyers || lawyers.length === 0) {
      return res.status(404).json({ message: "No approved lawyers found" });
    }

    res.json(lawyers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//approve lawyer
export const approveLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.id;
    const { isApproved } = req.body; // boolean

    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });

    lawyer.isApproved = isApproved; // update approval status
    await lawyer.save();

    res.json({
      message: `Lawyer has been ${isApproved ? "approved" : "disapproved"}`,
      lawyer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

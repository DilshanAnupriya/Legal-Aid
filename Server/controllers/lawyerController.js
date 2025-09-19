import Lawyer from "../models/Lawyer.js";

import jwt from "jsonwebtoken";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register new lawyer
// @route   POST /api/lawyers
export const registerLawyer = async (req, res) => {
  try {
    const { firstName,lastName, email, password, specialization, contactNumber } = req.body;

    const lawyerExists = await Lawyer.findOne({ email });
    if (lawyerExists) return res.status(400).json({ message: "Email already exists" });

    const lawyer = await Lawyer.create({
      firstName,
      lastName,
      email,
      password,
      specialization,
      contactNumber,
    });

    res.status(201).json({
      _id: lawyer._id,
      fullName: lawyer.fullName,
      email: lawyer.email,
      token: generateToken(lawyer._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login lawyer
// @route   POST /api/lawyers/login
export const loginLawyer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const lawyer = await Lawyer.findOne({ email });

    if (lawyer && (await lawyer.matchPassword(password))) {
      res.json({
        _id: lawyer._id,
        fullName: lawyer.fullName,
        email: lawyer.email,
        token: generateToken(lawyer._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lawyer profile
// @route   GET /api/lawyers/profile
export const getLawyerProfile = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.user.userId).select("-password");
    if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });

    res.json(lawyer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all lawyers
export const getAllLawyers = async (req, res) => {
  try {
    const lawyer = await Lawyer.find({}).select("-password");
    if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });

    res.json(lawyer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

